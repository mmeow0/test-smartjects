import { getSupabaseBrowserClient } from "../supabase";
import type { ProposalType, MilestoneType, DeliverableType } from "../types";

export const proposalService = {
  // Get proposals by user ID
  async getProposalsByUserId(userId: string): Promise<ProposalType[]> {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("proposals")
      .select(
        `
        *,
        smartjects (
          title
        ),
        proposal_nda_signatures (
          id,
          signer_user_id,
          signed_at,
          created_at
        )
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`Error fetching proposals for user ${userId}:`, error);
      return [];
    }

    return data.map((proposal: any) => ({
      id: proposal.id,
      smartjectId: proposal.smartject_id,
      userId: proposal.user_id,
      type: proposal.type,
      title: proposal.title,
      description: proposal.description || "",
      isCooperationProposal: proposal.is_cooperation_proposal || false,
      budget: proposal.budget,
      timeline: proposal.timeline,
      scope: proposal.scope,
      deliverables: proposal.deliverables,
      requirements: proposal.requirements,
      expertise: proposal.expertise,
      approach: proposal.approach,
      team: proposal.team,
      additionalInfo: proposal.additional_info,
      privateFields: proposal.private_fields || {},
      ndaSignatures:
        proposal.proposal_nda_signatures
          ?.filter(
            (sig: any) =>
              sig.hasOwnProperty("status") && sig.status === "approved",
          )
          .map((sig: any) => ({
            id: sig.id,
            proposalId: proposal.id,
            signerUserId: sig.signer_user_id,
            signedAt: sig.approved_at || sig.signed_at,
            createdAt: sig.created_at,
          })) || [],
      status: proposal.status,
      createdAt: proposal.created_at,
      updatedAt: proposal.updated_at,
    }));
  },

  // Get proposals by smartject ID
  async getProposalsBySmartjectId(
    smartjectId: string,
  ): Promise<ProposalType[]> {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("proposals")
      .select(
        `
        *,
        users (
          name,
          avatar_url
        ),
        proposal_nda_signatures (
          id,
          signer_user_id,
          signed_at,
          created_at
        )
      `,
      )
      .eq("smartject_id", smartjectId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        `Error fetching proposals for smartject ${smartjectId}:`,
        error,
      );
      return [];
    }

    return data.map((proposal: any) => ({
      id: proposal.id,
      smartjectId: proposal.smartject_id,
      userId: proposal.user_id,
      type: proposal.type,
      title: proposal.title,
      description: proposal.description || "",
      isCooperationProposal: proposal.is_cooperation_proposal || false,
      budget: proposal.budget,
      timeline: proposal.timeline,
      scope: proposal.scope,
      deliverables: proposal.deliverables,
      requirements: proposal.requirements,
      expertise: proposal.expertise,
      approach: proposal.approach,
      team: proposal.team,
      additionalInfo: proposal.additional_info,
      privateFields: proposal.private_fields || {},
      ndaSignatures:
        proposal.proposal_nda_signatures
          ?.filter(
            (sig: any) =>
              sig.hasOwnProperty("status") && sig.status === "approved",
          )
          .map((sig: any) => ({
            id: sig.id,
            proposalId: proposal.id,
            signerUserId: sig.signer_user_id,
            signedAt: sig.approved_at || sig.signed_at,
            createdAt: sig.created_at,
          })) || [],
      status: proposal.status,
      createdAt: proposal.created_at,
      updatedAt: proposal.updated_at,
      user: {
        name: proposal.users.name,
        avatar: proposal.users.avatar_url,
      },
    }));
  },

  // Get a proposal by ID
  async getProposalById(id: string): Promise<ProposalType | null> {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("proposals")
      .select(
        `
        *,
        smartjects (
          title
        ),
        proposal_files!proposal_files_proposal_id_fkey (
          id,
          name,
          size,
          type,
          path
        ),
        proposal_milestones (
          id,
          name,
          description,
          percentage,
          amount,
          proposal_deliverables (
            id,
            description,
            completed
          )
        ),
        proposal_nda_signatures (
          id,
          signer_user_id,
          signed_at,
          created_at
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching proposal with ID ${id}:`, error);
      return null;
    }

    return {
      id: data.id,
      smartjectId: data.smartject_id,
      userId: data.user_id,
      type: data.type,
      title: data.title,
      description: data.description || "",
      isCooperationProposal: data.is_cooperation_proposal || false,
      budget: data.budget,
      timeline: data.timeline,
      scope: data.scope,
      deliverables: data.deliverables,
      requirements: data.requirements,
      expertise: data.expertise,
      approach: data.approach,
      team: data.team,
      additionalInfo: data.additional_info,
      privateFields: data.private_fields || {},
      ndaSignatures:
        data.proposal_nda_signatures
          ?.filter(
            (sig: any) =>
              sig.hasOwnProperty("status") && sig.status === "approved",
          )
          .map((sig: any) => ({
            id: sig.id,
            proposalId: data.id,
            signerUserId: sig.signer_user_id,
            signedAt: sig.approved_at || sig.signed_at,
            createdAt: sig.created_at,
          })) || [],
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      milestones:
        data.proposal_milestones?.map((milestone: any) => ({
          id: milestone.id,
          name: milestone.name,
          description: milestone.description,
          percentage: milestone.percentage,
          amount: milestone.amount,
          deliverables:
            milestone.proposal_deliverables?.map((deliverable: any) => ({
              id: deliverable.id,
              description: deliverable.description,
              completed: deliverable.completed,
            })) ?? [],
        })) ?? [],

      // Новые поля:
      smartjectTitle: data.smartjects?.title ?? null,

      files:
        data.proposal_files?.map((file: any) => ({
          id: file.id,
          name: file.name,
          size: file.size,
          type: file.type,
          path: file.path,
        })) ?? [],
    };
  },

  // Create a new proposal
  async createProposal(
    proposal: Partial<ProposalType>,
  ): Promise<string | null> {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("proposals")
      .insert({
        user_id: proposal.userId,
        smartject_id: proposal.smartjectId,
        type: proposal.type,
        title: proposal.title,
        description: proposal.description,
        is_cooperation_proposal: proposal.isCooperationProposal || false,
        budget: proposal.budget,
        timeline: proposal.timeline,
        scope: proposal.scope,
        deliverables: proposal.deliverables,
        requirements: proposal.requirements,
        expertise: proposal.expertise,
        approach: proposal.approach,
        team: proposal.team,
        additional_info: proposal.additionalInfo,
        private_fields: proposal.privateFields || {},
        status: proposal.status || "draft",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating proposal:", error);
      return null;
    }

    return data.id;
  },

  // Update a proposal
  async updateProposal(
    id: string,
    proposal: Partial<ProposalType>,
  ): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    try {
      // Начинаем транзакцию
      const { error: proposalError } = await supabase
        .from("proposals")
        .update({
          title: proposal.title || "",
          description: proposal.description || "",
          is_cooperation_proposal: proposal.isCooperationProposal || false,
          budget: proposal.budget || "",
          timeline: proposal.timeline || "",
          scope: proposal.scope || "",
          deliverables: proposal.deliverables || "",
          requirements: proposal.requirements || "",
          expertise: proposal.expertise || "",
          approach: proposal.approach || "",
          team: proposal.team || "",
          additional_info: proposal.additionalInfo || "",
          private_fields: proposal.privateFields || {},
          status: proposal.status || "draft",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (proposalError) {
        console.error("Error updating proposal:", proposalError);
        return false;
      }

      // Если есть вехи, обновляем их
      if (proposal.milestones && proposal.milestones.length > 0) {
        // Получаем существующие вехи
        const { data: existingMilestones, error: fetchError } = await supabase
          .from("proposal_milestones")
          .select("id")
          .eq("proposal_id", id);

        if (fetchError) {
          console.error("Error fetching existing milestones:", fetchError);
          return false;
        }

        // Удаляем старые deliverables
        if (existingMilestones && existingMilestones.length > 0) {
          const { error: deliverablesError } = await supabase
            .from("proposal_deliverables")
            .delete()
            .in(
              "milestone_id",
              existingMilestones.map((m) => m.id),
            );

          if (deliverablesError) {
            console.error(
              "Error deleting old deliverables:",
              deliverablesError,
            );
            return false;
          }
        }

        // Удаляем старые milestones
        const { error: milestonesError } = await supabase
          .from("proposal_milestones")
          .delete()
          .eq("proposal_id", id);

        if (milestonesError) {
          console.error("Error deleting old milestones:", milestonesError);
          return false;
        }

        // Создаем новые milestones
        const { data: newMilestones, error: createMilestonesError } =
          await supabase
            .from("proposal_milestones")
            .insert(
              proposal.milestones.map((milestone) => ({
                proposal_id: id,
                name: milestone.name,
                description: milestone.description,
                percentage: milestone.percentage,
                amount: milestone.amount,
              })),
            )
            .select("id, name");

        if (createMilestonesError) {
          console.error("Error creating milestones:", createMilestonesError);
          return false;
        }

        // Создаем deliverables для каждого milestone
        for (let i = 0; i < proposal.milestones.length; i++) {
          const milestone = proposal.milestones[i];
          const newMilestoneId = newMilestones?.[i]?.id;

          if (
            newMilestoneId &&
            milestone.deliverables &&
            milestone.deliverables.length > 0
          ) {
            const { error: deliverablesError } = await supabase
              .from("proposal_deliverables")
              .insert(
                milestone.deliverables.map((deliverable) => ({
                  milestone_id: newMilestoneId,
                  description: deliverable.description,
                  completed: deliverable.completed,
                })),
              );

            if (deliverablesError) {
              console.error("Error creating deliverables:", deliverablesError);
              return false;
            }
          }
        }
      }

      return true;
    } catch (error) {
      console.error("Error in updateProposal:", error);
      return false;
    }
  },

  async createMilestones(
    proposalId: string,
    milestones: Partial<MilestoneType>[],
  ): Promise<{ id: string; name: string }[] | null> {
    const supabase = getSupabaseBrowserClient();

    const milestonesData = milestones.map((milestone) => ({
      proposal_id: proposalId,
      name: milestone.name,
      description: milestone.description,
      percentage: milestone.percentage,
      amount: milestone.amount,
    }));

    const { data, error } = await supabase
      .from("proposal_milestones")
      .insert(milestonesData)
      .select("id, name");

    if (error || !data) {
      console.error("Error creating milestones:", error);
      return null;
    }

    return data; // [{id, name}, ...]
  },

  // Create deliverables for a milestone
  async createDeliverables(
    milestoneId: string,
    deliverables: Partial<DeliverableType>[],
  ): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    // Prepare deliverable data for insertion
    const deliverablesData = deliverables.map((deliverable) => ({
      milestone_id: milestoneId,
      description: deliverable.description,
      completed: deliverable.completed || false,
    }));

    const { error } = await supabase
      .from("proposal_deliverables")
      .insert(deliverablesData);

    if (error) {
      console.error("Error creating deliverables:", error);
      return false;
    }

    return true;
  },

  // Upload file to Supabase storage
  async uploadFile(proposalId: string, file: File): Promise<string | null> {
    const supabase = getSupabaseBrowserClient();

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `proposals/${proposalId}/${fileName}`;

    const { error } = await supabase.storage
      .from("proposal-uploads")
      .upload(filePath, file);

    if (error) {
      console.error("Error uploading file:", error);
      return null;
    }

    // Get public URL for the file
    const { data } = supabase.storage
      .from("proposal-uploads")
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  // Save file reference to database
  async saveFileReference(
    proposalId: string,
    file: File,
    filePath: string,
  ): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("proposal_files").insert({
      proposal_id: proposalId,
      name: file.name,
      path: filePath,
      type: file.type,
      size: file.size,
      user_id: user?.id,
    });

    if (error) {
      console.error("Error saving file reference:", error);
      return false;
    }

    return true;
  },

  // Get all negotiations for a user (simplified version)
  async getUserNegotiations(userId: string) {
    const supabase = getSupabaseBrowserClient();

    try {
      // Get all proposals created by the user that have messages
      const { data: userProposals, error: userProposalsError } = await supabase
        .from("proposals")
        .select("id, user_id, smartject_id, title, budget, timeline")
        .eq("user_id", userId);

      if (userProposalsError) {
        console.error("Error fetching user proposals:", userProposalsError);
        return [];
      }

      // Get all messages involving the user
      const { data: allMessages, error: messagesError } = await supabase
        .from("negotiation_messages")
        .select("proposal_id, sender_id, created_at");

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        return [];
      }

      const negotiations: any[] = [];

      // Process user's own proposals
      if (userProposals) {
        for (const proposal of userProposals) {
          const proposalMessages =
            allMessages?.filter((msg) => msg.proposal_id === proposal.id) || [];

          if (proposalMessages.length === 0) continue;

          // Find other party (someone who messaged about this proposal)
          const otherMessage = proposalMessages.find(
            (msg) => msg.sender_id !== userId,
          );
          const otherPartyId = otherMessage?.sender_id;

          let otherPartyName = "Unknown User";
          if (otherPartyId) {
            const { data: userData } = await supabase
              .from("users")
              .select("name, avatar_url")
              .eq("id", otherPartyId)
              .single();

            if (userData) {
              otherPartyName = userData.name || "Unknown User";
            }
          }

          // Get smartject title
          let smartjectTitle = proposal.title;
          const { data: smartjectData } = await supabase
            .from("smartjects")
            .select("title")
            .eq("id", proposal.smartject_id)
            .single();

          if (smartjectData) {
            smartjectTitle = smartjectData.title;
          }

          const lastActivity =
            proposalMessages.length > 0
              ? proposalMessages.sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime(),
                )[0].created_at
              : new Date().toISOString();

          negotiations.push({
            id: `match-${proposal.smartject_id}-${proposal.id}`,
            proposalId: proposal.id,
            smartjectId: proposal.smartject_id,
            smartjectTitle,
            otherParty: {
              id: otherPartyId || "",
              name: otherPartyName,
              avatar: "",
            },
            budget: proposal.budget || "",
            timeline: proposal.timeline || "",
            messageCount: proposalMessages.length,
            lastActivity,
            isProposalOwner: true,
            status: "active" as const,
          });
        }
      }

      // Sort by last activity
      return negotiations.sort(
        (a, b) =>
          new Date(b.lastActivity).getTime() -
          new Date(a.lastActivity).getTime(),
      );
    } catch (error) {
      console.error("Error in getUserNegotiations:", error);
      // Return empty array instead of mock data for real implementation
      return [];
    }
  },

  async deleteProposal(id: string, userId: string): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    try {
      // First verify the proposal belongs to the user
      const { data: proposal, error: fetchError } = await supabase
        .from("proposals")
        .select("user_id")
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error("Error fetching proposal for deletion:", fetchError);
        return false;
      }

      if (proposal.user_id !== userId) {
        console.error("User not authorized to delete this proposal");
        return false;
      }

      // Delete related milestones first (if any)
      await supabase.from("proposal_milestones").delete().eq("proposal_id", id);

      // Delete related deliverables (if any)
      await supabase
        .from("proposal_deliverables")
        .delete()
        .eq("proposal_id", id);

      // Delete related files (if any)
      await supabase.from("proposal_files").delete().eq("proposal_id", id);

      // Finally delete the proposal
      const { error: deleteError } = await supabase
        .from("proposals")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error("Error deleting proposal:", deleteError);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteProposal:", error);
      return false;
    }
  },
};
