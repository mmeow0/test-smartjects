import { getSupabaseBrowserClient } from "@/lib/supabase";
import { notificationService } from "./notification.service";
import type { ContractListType } from "../types";

export const contractService = {
  // Get contract data by match ID and proposal ID
  async getContractData(matchId: string, proposalId: string) {
    const supabase = getSupabaseBrowserClient();

    try {
      console.log("🔍 getContractData called with:", { matchId, proposalId });

      // Get current user
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        console.error("No authenticated user");
        return null;
      }

      // First, try to get real contract data by match_id
      console.log("📋 Searching for existing contract with match_id:", matchId);
      const { data: realContractData, error: contractError } = await supabase
        .from("contracts")
        .select(
          `
          *,
          provider:users!provider_id(id, name, email),
          needer:users!needer_id(id, name, email),
          contract_deliverables(description),
          contract_milestones(name, description, percentage, amount, status)
        `,
        )
        .eq("match_id", matchId)
        .single();

      // If we found a real contract, use it
      if (realContractData && !contractError) {
        console.log("✅ Found existing contract:", realContractData.id);
        // Get smartject title
        const { data: proposalData } = await supabase
          .from("proposals")
          .select(
            `
            smartject_id,
            title,
            description,
            scope,
            timeline,
            budget,
            deliverables,
            requirements,
            expertise,
            approach,
            team,
            additional_info,
            proposal_milestones (
              id,
              name,
              description,
              percentage,
              amount
            )
          `,
          )
          .eq("id", proposalId)
          .single();

        const { data: smartjectData } = await supabase
          .from("smartjects")
          .select("title")
          .eq("id", proposalData?.smartject_id)
          .single();

        const smartjectTitle =
          (smartjectData as any)?.title ||
          (proposalData as any)?.title ||
          "Unknown Project";

        // Transform real contract data
        const contract = {
          id: realContractData.id,
          matchId: realContractData.match_id,
          proposalId: proposalId,
          smartjectTitle: smartjectTitle,
          provider: {
            id: (realContractData.provider as any)?.id || "",
            name: (realContractData.provider as any)?.name || "",
            email: (realContractData.provider as any)?.email || "",
          },
          needer: {
            id: (realContractData.needer as any)?.id || "",
            name: (realContractData.needer as any)?.name || "",
            email: (realContractData.needer as any)?.email || "",
          },
          terms: {
            budget: realContractData.budget,
            timeline: contractService.calculateTimeline(
              realContractData.start_date,
              realContractData.end_date,
            ),
            startDate: realContractData.start_date,
            endDate: realContractData.end_date,
            paymentSchedule:
              (realContractData.contract_milestones as any)?.length > 0
                ? (realContractData.contract_milestones as any).map(
                    (m: any) => ({
                      milestone: m.name,
                      percentage: m.percentage,
                      amount: m.amount,
                    }),
                  )
                : (proposalData?.proposal_milestones as any)?.length > 0
                  ? (proposalData.proposal_milestones as any).map((m: any) => ({
                      milestone: m.name,
                      percentage: m.percentage,
                      amount: m.amount,
                    }))
                  : [],
            scope: realContractData.scope,
            deliverables:
              (realContractData.contract_deliverables as any)?.map(
                (d: any) => d.description,
              ) || [],
            requirements: (proposalData as any)?.requirements || "",
            expertise: (proposalData as any)?.expertise || "",
            approach: (proposalData as any)?.approach || "",
            team: (proposalData as any)?.team || "",
            additionalInfo: (proposalData as any)?.additional_info || "",
          },
          status: {
            providerSigned: realContractData.provider_signed || false,
            neederSigned: realContractData.needer_signed || false,
            contractActive: realContractData.status === "active",
          },
          exclusivity: {
            clause:
              "Upon signing this contract, both parties agree to an exclusivity period for this specific smartject implementation. The provider agrees not to offer similar implementation services for this smartject to other parties, and the needer agrees not to engage other providers for this smartject implementation, for the duration of this contract plus 30 days after completion.",
            duration: `Contract period + 30 days (until ${new Date(realContractData.exclusivity_ends as string).toLocaleDateString()})`,
          },

          async startMilestone(milestoneId: string) {
            const supabase = getSupabaseBrowserClient();

            try {
              const {
                data: { user: currentUser },
              } = await supabase.auth.getUser();
              if (!currentUser) {
                throw new Error("No authenticated user");
              }

              // Get milestone and verify user is the provider
              const { data: milestoneData } = await supabase
                .from("contract_milestones")
                .select(
                  `
                  *,
                  contracts!inner(provider_id, needer_id, title)
                `,
                )
                .eq("id", milestoneId)
                .single();

              if (
                !milestoneData ||
                milestoneData.contracts.provider_id !== currentUser.id
              ) {
                throw new Error(
                  "Access denied - only provider can start milestone",
                );
              }

              if (milestoneData.status !== "pending") {
                throw new Error("Milestone must be pending to start work");
              }

              // Update milestone status to in_progress
              const { error: updateError } = await supabase
                .from("contract_milestones")
                .update({
                  status: "in_progress",
                  updated_at: new Date().toISOString(),
                })
                .eq("id", milestoneId);

              if (updateError) {
                throw updateError;
              }

              // Add status history entry
              await supabase.from("contract_milestone_status_history").insert({
                milestone_id: milestoneId,
                changed_by: currentUser.id,
                old_status: milestoneData.status,
                new_status: "in_progress",
                action_type: "start",
                comments: "Work started on milestone",
              });

              // Send system message
              await this.sendMilestoneMessage(
                milestoneId,
                "Work has started on this milestone",
                "system",
              );

              return { success: true };
            } catch (error) {
              console.error("Error starting milestone:", error);
              throw error;
            }
          },
        };

        return contract;
      }

      console.log("❌ No existing contract found, creating new one");
      console.log("Contract error:", contractError);

      // No real contract exists, create one from the proposal data
      // First, get the match to determine provider and needer
      const { data: matchInfo, error: matchInfoError } = await supabase
        .from("matches")
        .select("provider_id, needer_id, smartject_id")
        .eq("id", matchId)
        .single();

      if (matchInfoError || !matchInfo) {
        console.error("Error fetching match info:", matchInfoError);
        return null;
      }

      // Get the proposal data
      const { data: proposalData, error: proposalError } = await supabase
        .from("proposals")
        .select(
          `
          *,
          proposal_milestones (
            id,
            name,
            description,
            percentage,
            amount
          )
        `,
        )
        .eq("id", proposalId)
        .single();

      if (proposalError || !proposalData) {
        console.error("Error fetching proposal:", proposalError);
        return null;
      }

      // Create contract terms from proposal data
      const contractTerms = {
        budget: proposalData.budget || "$0",
        timeline: proposalData.timeline || "3 months",
        scope: proposalData.scope || proposalData.description || "",
        deliverables: (proposalData.deliverables as string)
          ?.split("\n")
          .filter((d) => d.trim()) || ["Project completion"],
        requirements: (proposalData as any).requirements || "",
        expertise: (proposalData as any).expertise || "",
        approach: (proposalData as any).approach || "",
        team: (proposalData as any).team || "",
        additionalInfo: (proposalData as any).additional_info || "",
        milestones:
          (proposalData.proposal_milestones as any)?.length > 0
            ? (proposalData.proposal_milestones as any).map((m: any) => ({
                name: m.name,
                description: m.description,
                percentage: m.percentage,
                amount: m.amount,
              }))
            : [],
      };

      // Create the real contract
      console.log("🏗️ Creating new contract with terms:", contractTerms);
      const newContractId = await contractService.createContractFromNegotiation(
        matchId,
        proposalId,
        matchInfo.provider_id,
        matchInfo.needer_id,
        contractTerms,
      );

      if (!newContractId) {
        console.error("❌ Failed to create contract");
        return null;
      }

      console.log("✅ Created new contract with ID:", newContractId);

      // Now fetch the newly created contract data
      const { data: newContractData, error: newContractError } = await supabase
        .from("contracts")
        .select(
          `
          *,
          provider:users!provider_id(id, name, email),
          needer:users!needer_id(id, name, email),
          contract_deliverables(description),
          contract_milestones(name, description, percentage, amount, status)
        `,
        )
        .eq("id", newContractId)
        .single();

      if (newContractError || !newContractData) {
        console.error(
          "Error fetching newly created contract:",
          newContractError,
        );
        return null;
      }

      // Get smartject title
      const { data: smartjectData } = await supabase
        .from("smartjects")
        .select("title")
        .eq("id", matchInfo.smartject_id)
        .single();

      const smartjectTitle =
        smartjectData?.title || proposalData.title || "Unknown Project";

      // Transform the newly created contract data
      const contract = {
        id: newContractData.id,
        matchId: newContractData.match_id,
        proposalId: proposalId,
        smartjectTitle: smartjectTitle,
        provider: {
          id: (newContractData.provider as any)?.id || "",
          name: (newContractData.provider as any)?.name || "",
          email: (newContractData.provider as any)?.email || "",
        },
        needer: {
          id: (newContractData.needer as any)?.id || "",
          name: (newContractData.needer as any)?.name || "",
          email: (newContractData.needer as any)?.email || "",
        },
        terms: {
          budget: newContractData.budget,
          timeline: contractService.calculateTimeline(
            newContractData.start_date,
            newContractData.end_date,
          ),
          startDate: newContractData.start_date,
          endDate: newContractData.end_date,
          paymentSchedule:
            (newContractData.contract_milestones as any)?.length > 0
              ? (newContractData.contract_milestones as any).map((m: any) => ({
                  milestone: m.name,
                  percentage: m.percentage,
                  amount: m.amount,
                }))
              : contractTerms.milestones.map((m) => ({
                  milestone: m.name,
                  percentage: m.percentage,
                  amount: m.amount,
                })),
          scope: newContractData.scope,
          deliverables:
            (newContractData.contract_deliverables as any)?.map(
              (d: any) => d.description,
            ) || contractTerms.deliverables,
          requirements: contractTerms.requirements,
          expertise: contractTerms.expertise,
          approach: contractTerms.approach,
          team: contractTerms.team,
          additionalInfo: contractTerms.additionalInfo,
        },
        status: {
          providerSigned: newContractData.provider_signed || false,
          neederSigned: newContractData.needer_signed || false,
          contractActive: newContractData.status === "active",
        },
        exclusivity: {
          clause:
            "Upon signing this contract, both parties agree to an exclusivity period for this specific smartject implementation. The provider agrees not to offer similar implementation services for this smartject to other parties, and the needer agrees not to engage other providers for this smartject implementation, for the duration of this contract plus 30 days after completion.",
          duration: `Contract period + 30 days (until ${new Date(newContractData.exclusivity_ends as string).toLocaleDateString()})`,
        },
      };

      console.log("🎉 Returning contract data:", contract);
      return contract;
    } catch (error) {
      console.error("❌ Error in getContractData:", error);
      return null;
    }
  },

  // Возвращает строку вида "15 months" или "1 year 3 months"
  calculateTimeline(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // годовая и помесячная разница
    let years = end.getUTCFullYear() - start.getUTCFullYear();
    let months = end.getUTCMonth() - start.getUTCMonth();
    let days = end.getUTCDate() - start.getUTCDate();

    // если в конце месяца число меньше, чем в начале ─ вычитаем месяц
    if (days < 0) {
      months -= 1;
      // добавляем количество дней в предыдущем месяце, чтобы days был положительный (опционально)
      const daysInPrevMonth = new Date(
        end.getUTCFullYear(),
        end.getUTCMonth(),
        0,
      ).getUTCDate();
      days += daysInPrevMonth;
    }

    // если месяцы ушли в минус после коррекции дней ─ вычитаем год
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Собираем красивую строку
    const parts: string[] = [];
    if (years) parts.push(`${years} year${years > 1 ? "s" : ""}`);
    if (months) parts.push(`${months} month${months > 1 ? "s" : ""}`);
    if (!years && !months)
      // когда меньше месяца
      parts.push(`${days} day${days > 1 ? "s" : ""}`);

    return parts.join(" ");
  },

  // Sign contract by updating the appropriate signing status in the database
  async signContract(
    contractId: string,
    userId: string,
    isProvider: boolean,
  ): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    try {
      // Get contract details including both parties' information
      const { data: contractData, error: fetchError } = await supabase
        .from("contracts")
        .select(
          `
          *,
          provider:users!provider_id(id, name, email),
          needer:users!needer_id(id, name, email)
        `,
        )
        .eq("id", contractId)
        .single();

      if (fetchError || !contractData) {
        console.error("Error fetching contract details:", fetchError);
        return false;
      }

      // Get proposal details for notification
      const { data: proposalData } = await supabase
        .from("proposals")
        .select("title, smartject_id")
        .eq("id", contractData.proposal_id)
        .single();

      // Get smartject title if proposal doesn't have one
      let proposalTitle = proposalData?.title;
      if (!proposalTitle && proposalData?.smartject_id) {
        const { data: smartjectData } = await supabase
          .from("smartjects")
          .select("title")
          .eq("id", proposalData.smartject_id)
          .single();
        proposalTitle = smartjectData?.title;
      }
      proposalTitle = proposalTitle || "Unknown Project";

      // Get signer details
      const { data: signerData } = await supabase
        .from("users")
        .select("name")
        .eq("id", userId)
        .single();

      const signerName = signerData?.name || "Unknown User";

      // Determine which column to update based on user role
      const updateColumn = isProvider ? "provider_signed" : "needer_signed";
      const updateData = { [updateColumn]: true };

      // Update the contract signing status
      const { data, error } = await supabase
        .from("contracts")
        .update(updateData)
        .eq("id", contractId)
        .select()
        .single();

      if (error) {
        console.error("Error signing contract:", error);
        return false;
      }

      if (!data) {
        console.error("Contract not found:", contractId);
        return false;
      }

      // Send notification to the other party
      const otherPartyId = isProvider
        ? (contractData.needer as any)?.id
        : (contractData.provider as any)?.id;

      if (otherPartyId && contractData.match_id && contractData.proposal_id) {
        try {
          await notificationService.createContractSignedNotification(
            contractData.proposal_id,
            proposalTitle,
            otherPartyId,
            userId,
            signerName,
            contractData.match_id,
            isProvider,
            contractData.id,
          );
        } catch (notificationError) {
          console.error(
            "Error sending contract signed notification:",
            notificationError,
          );
          // Don't fail the contract signing if notification fails
        }
      }

      console.log(
        `Contract ${contractId} signed by user ${userId} as ${isProvider ? "provider" : "needer"}`,
      );
      return true;
    } catch (error) {
      console.error("Error in signContract:", error);
      return false;
    }
  },

  async isContractFullySigned(contractId: string): Promise<{
    isSigned: boolean;
    matchId?: string;
    proposalId?: string;
  }> {
    const supabase = getSupabaseBrowserClient();

    try {
      // Получить данные контракта, включая matchId и proposalId
      const { data: contractData, error } = await supabase
        .from("contracts")
        .select("provider_signed, needer_signed, match_id, proposal_id")
        .eq("id", contractId)
        .single();

      if (error || !contractData) {
        console.error("Error checking contract signing status:", error);
        return { isSigned: false };
      }

      const isSigned =
        contractData.provider_signed && contractData.needer_signed;

      return {
        isSigned,
        matchId: contractData.match_id as string,
        proposalId: contractData.proposal_id as string,
      };
    } catch (error) {
      console.error("Error in isContractFullySigned:", error);
      return { isSigned: false };
    }
  },

  getContractNavigationUrl(
    matchId: string,
    proposalId: string,
    contractId: string,
    isSigned: boolean,
  ): string {
    if (isSigned) {
      // Contract is fully signed - go to final contract page
      return `/contracts/${contractId}`;
    } else {
      // Contract is still in signing phase - go to contract signing page
      return `/matches/${matchId}/contract/${proposalId}`;
    }
  },

  // Get contract by ID with full details
  async getContractById(contractId: string) {
    const supabase = getSupabaseBrowserClient();

    try {
      // Get current user
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        console.error("No authenticated user");
        return null;
      }

      // Get contract data with related information
      const { data: contractData, error: contractError } = await supabase
        .from("contracts")
        .select(
          `
          *,
          provider:users!contracts_provider_id_fkey(id, name, email),
          needer:users!contracts_needer_id_fkey(id, name, email),
          contract_deliverables(id, description)
        `,
        )
        .eq("id", contractId)
        .single();

      if (contractError || !contractData) {
        console.error("Error fetching contract:", contractError);
        return null;
      }

      // Check if user has access to this contract
      if (
        contractData.provider_id !== currentUser.id &&
        contractData.needer_id !== currentUser.id
      ) {
        console.error("User does not have access to this contract");
        return null;
      }

      // Get smartject title from match
      const { data: matchData } = await supabase
        .from("matches")
        .select("smartject_id")
        .eq("id", contractData.match_id)
        .single();

      let smartjectTitle = "Unknown Project";
      if (matchData) {
        const { data: smartjectData } = await supabase
          .from("smartjects")
          .select("title")
          .eq("id", matchData.smartject_id)
          .single();

        if (smartjectData) {
          smartjectTitle = smartjectData.title;
        }
      }

      // Get contract milestones for this contract
      let paymentSchedule: any[] = [];
      const { data: contractMilestones } = await supabase
        .from("contract_milestones")
        .select("*")
        .eq("contract_id", contractData.id)
        .order("percentage", { ascending: true });

      if (contractMilestones && contractMilestones.length > 0) {
        // Get user data for submitted_by and reviewed_by
        const userIds = contractMilestones
          .flatMap((m) => [m.submitted_by, m.reviewed_by])
          .filter(Boolean);

        let usersData: any[] = [];
        if (userIds.length > 0) {
          const { data: users } = await supabase
            .from("users")
            .select("id, name")
            .in("id", userIds);
          usersData = users || [];
        }

        paymentSchedule = contractMilestones.map((milestone: any) => {
          const submittedByUser = milestone.submitted_by
            ? usersData.find((u) => u.id === milestone.submitted_by)
            : null;
          const reviewedByUser = milestone.reviewed_by
            ? usersData.find((u) => u.id === milestone.reviewed_by)
            : null;

          return {
            id: milestone.id,
            name: milestone.name,
            description: milestone.description,
            percentage: milestone.percentage,
            amount: milestone.amount,
            status: milestone.status,
            completedDate: milestone.completed_date,
            dueDate: milestone.due_date,
            submittedForReview: milestone.submitted_for_review || false,
            submittedAt: milestone.submitted_at || null,
            submittedBy: submittedByUser
              ? {
                  id: submittedByUser.id,
                  name: submittedByUser.name,
                }
              : null,
            reviewedAt: milestone.reviewed_at || null,
            reviewedBy: reviewedByUser
              ? {
                  id: reviewedByUser.id,
                  name: reviewedByUser.name,
                }
              : null,
            reviewStatus: milestone.review_status || null,
            reviewComments: milestone.review_comments || null,
            deliverables: [`${milestone.name} deliverables`],
            comments: [],
          };
        });
      } else if (contractData.proposal_id) {
        // Fallback to proposal milestones if no contract milestones exist
        const { data: proposalMilestones } = await supabase
          .from("contract_milestones")
          .select("*")
          .eq("contract_id", contractData.id)
          .order("percentage", { ascending: true });

        console.log("proposalMilestones");
        console.log(proposalMilestones);

        paymentSchedule = (proposalMilestones || []).map((milestone: any) => ({
          id: milestone.id,
          name: milestone.name,
          description: milestone.description,
          percentage: milestone.percentage,
          amount: milestone.amount,
          status: "pending",
          completedDate: null,
          dueDate: null,
          submittedForReview: false,
          submittedAt: null,
          submittedBy: null,
          reviewedAt: null,
          reviewedBy: null,
          reviewStatus: null,
          reviewComments: null,
          deliverables: [`${milestone.name} deliverables`],
          comments: [],
        }));
      }

      // Determine user role
      const isProvider = currentUser.id === contractData.provider_id;
      const role = isProvider ? "provider" : "needer";

      // Calculate status
      let status = contractData.status;
      if (
        contractData.provider_signed &&
        contractData.needer_signed &&
        status === "pending_start"
      ) {
        status = "active";
      }

      // Transform contract data
      const contract = {
        id: contractData.id,
        title: contractData.title || smartjectTitle,
        smartjectId: contractData.match_id,
        smartjectTitle: smartjectTitle,
        status: status,
        role: role,
        createdAt: contractData.created_at,
        startDate: contractData.start_date,
        endDate: contractData.end_date,
        exclusivityEnds: contractData.exclusivity_ends,
        budget: contractData.budget,
        provider: {
          id: (contractData.provider as any)?.id || "",
          name: (contractData.provider as any)?.name || "",
          email: (contractData.provider as any)?.email || "",
          avatar: "",
        },
        needer: {
          id: (contractData.needer as any)?.id || "",
          name: (contractData.needer as any)?.name || "",
          email: (contractData.needer as any)?.email || "",
          avatar: "",
        },
        scope: contractData.scope,
        deliverables: (contractData.contract_deliverables as any)?.map(
          (d: any) => d.description,
        ) || [
          "Project implementation",
          "Documentation and training",
          "Testing and quality assurance",
        ],
        paymentSchedule: paymentSchedule,
        documents: await (async () => {
          const { data: contractDocuments } = await supabase
            .from("contract_documents")
            .select("*")
            .eq("contract_id", contractData.id as string);

          return (
            contractDocuments?.map((doc) => ({
              name: doc.name,
              type: doc.type || "pdf",
              size: doc.size || "Unknown",
              uploadedAt: doc.created_at,
            })) || [
              {
                name: "Contract Agreement.pdf",
                type: "pdf",
                size: "1.2 MB",
                uploadedAt: contractData.created_at,
              },
            ]
          );
        })(),
        activity: await (async () => {
          const { data: contractActivity } = await supabase
            .from("contract_activities")
            .select(
              `
              *,
              user:users(name)
            `,
            )
            .eq("contract_id", contractData.id as string)
            .order("created_at", { ascending: false });

          return (
            contractActivity?.map((activity) => ({
              id: activity.id,
              type: activity.type,
              date: activity.created_at,
              description: activity.description,
              user: (activity.user as any)?.name || "System",
            })) || [
              {
                id: "activity-1",
                type: "contract_created",
                date: contractData.created_at,
                description: "Contract created",
                user: "System",
              },
            ]
          );
        })(),
        messages: await (async () => {
          const { data: contractMessages } = await supabase
            .from("contract_messages")
            .select(
              `
              *,
              user:users(name)
            `,
            )
            .eq("contract_id", contractData.id as string)
            .order("created_at", { ascending: true });

          return (
            contractMessages?.map((message) => ({
              id: message.id,
              sender: (message.user as any)?.name || "Unknown User",
              content: message.content,
              timestamp: message.created_at,
            })) || [
              {
                id: "msg-1",
                sender: isProvider
                  ? (contractData.needer as any)?.name
                  : (contractData.provider as any)?.name,
                content: "Looking forward to working together on this project!",
                timestamp: contractData.created_at,
              },
            ]
          );
        })(),
        documentVersions: await (async () => {
          const { data: docVersions } = await supabase
            .from("document_versions")
            .select(
              `
              *,
              author:users(name),
              document:contract_documents!inner(contract_id)
            `,
            )
            .eq("document.contract_id", contractData.id as string)
            .order("version_number", { ascending: false });

          return (
            docVersions?.map((version) => ({
              id: version.id,
              versionNumber: version.version_number,
              date: version.created_at,
              author: (version.author as any)?.name || "System",
              changes: Array.isArray(version.changes)
                ? version.changes
                : ["Version created"],
            })) || [
              {
                id: "version-1",
                versionNumber: 1,
                date: contractData.created_at,
                author: "System",
                changes: ["Initial contract creation"],
              },
            ]
          );
        })(),
      };

      return contract;
    } catch (error) {
      console.error("Error in getContractById:", error);
      return null;
    }
  },

  // Create contract from negotiation
  async createContractFromNegotiation(
    matchId: string,
    proposalId: string,
    providerId: string,
    neederId: string,
    terms: {
      budget: string;
      timeline: string;
      scope: string;
      deliverables: string[];
      requirements: string;
      expertise: string;
      approach: string;
      team: string;
      additionalInfo: string;
      milestones: Array<{
        name: string;
        description: string;
        percentage: number;
        amount: string;
      }>;
    },
  ): Promise<string | null> {
    const supabase = getSupabaseBrowserClient();

    try {
      console.log("🏗️ createContractFromNegotiation called with:", {
        matchId,
        proposalId,
        providerId,
        neederId,
        terms,
      });

      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("provider_id, needer_id")
        .eq("id", matchId)
        .single();

      if (matchError || !matchData) {
        console.error("❌ Error fetching match data:", matchError);
        return null;
      }

      console.log("✅ Match data found:", matchData);

      // Use provider and needer IDs from the match table
      const finalProviderId = matchData.provider_id || providerId;
      const finalNeederId = matchData.needer_id || neederId;
      // Calculate dates
      const startDate = new Date();
      const timelineMatch = terms.timeline.match(/(\d+(\.\d+)?)/);
      const timelineMonths = timelineMatch ? parseFloat(timelineMatch[1]) : 3;

      // console.log("🔍 Current user ID:", currentUser?.id);
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      console.log("🔍 Current user ID:", currentUser?.id);
      console.log("🔍 Final provider ID:", finalProviderId);
      console.log("🔍 Final needer ID:", finalNeederId);
      console.log("🔍 Real Match ID:", matchId);
      console.log("🔍 Proposal ID:", proposalId);

      // Проверяем данные proposal
      const { data: proposalCheck } = await supabase
        .from("proposals")
        .select("user_id, id, smartject_id")
        .eq("id", proposalId)
        .single();
      console.log("🔍 Proposal data:", proposalCheck);

      // Получаем название смартджекта
      let smartjectTitle = `Contract for Proposal ${proposalId}`;
      if (proposalCheck?.smartject_id) {
        const { data: smartjectData } = await supabase
          .from("smartjects")
          .select("title")
          .eq("id", proposalCheck.smartject_id)
          .single();

        if (smartjectData?.title) {
          smartjectTitle = smartjectData.title;
        }
      }
      console.log("🔍 Smartject title:", smartjectTitle);

      // Проверяем данные match
      const { data: matchCheck } = await supabase
        .from("matches")
        .select("provider_id, needer_id, id")
        .eq("id", matchId)
        .single();
      console.log("🔍 Match data:", matchCheck);

      // Проверяем условия RLS вручную
      console.log(
        "🔍 Is user proposal author?",
        currentUser?.id === proposalCheck?.user_id,
      );
      console.log(
        "🔍 Is user match provider?",
        currentUser?.id === matchCheck?.provider_id,
      );
      console.log("🔍 Is user match needer?", currentUser?.id === matchCheck);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + Math.floor(timelineMonths));
      const remainingDays = Math.round((timelineMonths % 1) * 30);
      endDate.setDate(endDate.getDate() + remainingDays);

      const exclusivityEndDate = new Date(endDate);
      exclusivityEndDate.setDate(exclusivityEndDate.getDate() + 30);

      // Create contract
      console.log("💾 Creating contract with data:", {
        match_id: matchId,
        provider_id: finalProviderId,
        needer_id: finalNeederId,
        proposal_id: proposalId,
        title: smartjectTitle,
        budget: terms.budget,
        scope: terms.scope,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        exclusivity_ends: exclusivityEndDate.toISOString(),
        status: "pending_start",
      });

      const { data: contractData, error: contractError } = await supabase
        .from("contracts")
        .insert({
          match_id: matchId,
          provider_id: finalProviderId,
          needer_id: finalNeederId,
          proposal_id: proposalId,
          title: smartjectTitle,
          budget: terms.budget,
          scope: terms.scope,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          exclusivity_ends: exclusivityEndDate.toISOString(),
          status: "pending_start",
        })
        .select()
        .single();

      if (contractError || !contractData) {
        console.error("❌ Error creating contract:", contractError);
        return null;
      }

      console.log("✅ Contract created successfully:", contractData.id);

      const contractId = contractData.id;

      // Create contract deliverables
      if (terms.deliverables.length > 0) {
        console.log("📦 Creating deliverables:", terms.deliverables);
        const deliverableInserts = terms.deliverables.map((deliverable) => ({
          contract_id: contractId,
          description: deliverable,
        }));

        const { error: deliverablesError } = await supabase
          .from("contract_deliverables")
          .insert(deliverableInserts);

        if (deliverablesError) {
          console.error("❌ Error creating deliverables:", deliverablesError);
        } else {
          console.log("✅ Deliverables created successfully");
        }
      }

      // Create contract milestones from proposal milestones
      console.log("🎯 Loading milestones from proposal:", proposalId);
      const { data: proposalMilestones, error: proposalMilestonesError } =
        await supabase
          .from("proposal_milestones")
          .select("*")
          .eq("proposal_id", proposalId)
          .order("percentage", { ascending: true });

      if (proposalMilestonesError) {
        console.error(
          "❌ Error fetching proposal milestones:",
          proposalMilestonesError,
        );
      } else if (proposalMilestones && proposalMilestones.length > 0) {
        console.log("✅ Found proposal milestones:", proposalMilestones);

        const milestoneInserts = proposalMilestones.map((milestone, index) => {
          // Calculate due date for each milestone
          const totalMilestones = proposalMilestones.length;
          const milestoneInterval =
            (endDate.getTime() - startDate.getTime()) / totalMilestones;
          const dueDate = new Date(
            startDate.getTime() + milestoneInterval * (index + 1),
          );

          return {
            contract_id: contractId,
            name: milestone.name,
            description: milestone.description,
            percentage: milestone.percentage,
            amount: milestone.amount,
            due_date: dueDate.toISOString(),
            status: "pending",
          };
        });

        console.log("💾 Milestone inserts:", milestoneInserts);
        const { error: milestonesError } = await supabase
          .from("contract_milestones")
          .insert(milestoneInserts);

        if (milestonesError) {
          console.error("❌ Error creating milestones:", milestonesError);
        } else {
          console.log("✅ Milestones created successfully");
        }
      } else {
        // Fallback to terms.milestones if no proposal milestones found
        console.log("⚠️ No proposal milestones found, using terms milestones");
        if (terms.milestones.length > 0) {
          const milestoneInserts = terms.milestones.map((milestone, index) => {
            // Calculate due date for each milestone
            const totalMilestones = terms.milestones.length;
            const milestoneInterval =
              (endDate.getTime() - startDate.getTime()) / totalMilestones;
            const dueDate = new Date(
              startDate.getTime() + milestoneInterval * (index + 1),
            );

            return {
              contract_id: contractId,
              name: milestone.name,
              description: milestone.description,
              percentage: milestone.percentage,
              amount: milestone.amount,
              due_date: dueDate.toISOString(),
              status: "pending",
            };
          });

          const { error: milestonesError } = await supabase
            .from("contract_milestones")
            .insert(milestoneInserts);

          if (milestonesError) {
            console.error(
              "❌ Error creating milestones from terms:",
              milestonesError,
            );
          } else {
            console.log("✅ Milestones from terms created successfully");
          }
        }
      }

      console.log("🎉 Contract creation completed, returning ID:", contractId);
      return contractId as string;
    } catch (error) {
      console.error("❌ Error in createContractFromNegotiation:", error);
      return null;
    }
  },

  // Get user's contracts
  async getUserContracts(userId: string): Promise<{
    activeContracts: ContractListType[];
    completedContracts: ContractListType[];
  }> {
    const supabase = getSupabaseBrowserClient();

    try {
      // Get contracts where user is either provider or needer
      const { data: contractsData, error: contractsError } = await supabase
        .from("contracts")
        .select(
          `
          *,
          provider:users!contracts_provider_id_fkey(id, name, email),
          needer:users!contracts_needer_id_fkey(id, name, email)
        `,
        )
        .or(`provider_id.eq.${userId},needer_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (contractsError) {
        console.error("Error fetching contracts:", contractsError);
        return { activeContracts: [], completedContracts: [] };
      }

      const contracts = contractsData || [];

      // Get contract milestones for all contracts
      const contractIds = contracts.map((c) => c.id);

      let contractMilestonesData: any[] = [];
      if (contractIds.length > 0) {
        const { data } = await supabase
          .from("contract_milestones")
          .select("*")
          .in("contract_id", contractIds);
        contractMilestonesData = data || [];
      }

      // Transform contracts to match the expected format
      const transformedContracts = contracts.map((contract) => {
        const isProvider = contract.provider_id === userId;
        const otherParty = isProvider
          ? contract.needer?.name
          : contract.provider?.name;
        const role = isProvider ? "provider" : "needer";

        // Find contract milestones for this contract
        const milestones =
          contractMilestonesData?.filter(
            (m) => m.contract_id === contract.id,
          ) || [];

        // Find next milestone (in_progress or pending)
        const nextMilestone = milestones
          .filter((m) => m.status === "in_progress" || m.status === "pending")
          .sort(
            (a: any, b: any) => (a.percentage || 0) - (b.percentage || 0),
          )[0];

        // For completed contracts, show the last completed milestone
        const finalMilestone =
          contract.status === "completed" && milestones.length > 0
            ? milestones
                .filter((m) => m.status === "completed")
                .sort(
                  (a: any, b: any) => (b.percentage || 0) - (a.percentage || 0),
                )[0]
            : null;

        return {
          id: contract.id,
          smartjectId: contract.match_id,
          smartjectTitle: contract.title || "Unknown Project",
          otherParty: otherParty || "Unknown Party",
          role: role,
          startDate: contract.start_date,
          endDate: contract.end_date,
          status: contract.status,
          budget: contract.budget,
          nextMilestone: nextMilestone
            ? nextMilestone.name
            : milestones.length === 0
              ? "No milestones defined"
              : "All milestones completed",
          nextMilestoneId: nextMilestone ? nextMilestone.id : undefined,
          nextMilestoneDate: nextMilestone
            ? nextMilestone.due_date
            : contract.end_date,
          finalMilestone: finalMilestone
            ? finalMilestone.name
            : contract.status === "completed" && milestones.length === 0
              ? "Contract completed"
              : undefined,
          completionDate:
            contract.status === "completed" ? contract.end_date : undefined,
          exclusivityEnds: contract.exclusivity_ends,
        };
      });

      // Separate active and completed contracts
      const activeContracts = transformedContracts.filter(
        (contract) => contract.status !== "completed",
      );

      const completedContracts = transformedContracts.filter(
        (contract) => contract.status === "completed",
      );

      return {
        activeContracts,
        completedContracts,
      };
    } catch (error) {
      console.error("Error in getUserContracts:", error);
      return { activeContracts: [], completedContracts: [] };
    }
  },

  // Get contract messages
  async getContractMessages(contractId: string) {
    const supabase = getSupabaseBrowserClient();

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        console.error("No authenticated user");
        return [];
      }

      // Verify user has access to this contract
      const { data: contractData } = await supabase
        .from("contracts")
        .select("provider_id, needer_id")
        .eq("id", contractId)
        .single();

      if (
        !contractData ||
        (contractData.provider_id !== currentUser.id &&
          contractData.needer_id !== currentUser.id)
      ) {
        console.error("User does not have access to this contract");
        return [];
      }

      const { data: messages, error } = await supabase
        .from("contract_messages")
        .select(
          `
          *,
          user:users(id, name),
          contract_message_attachments(id, name, type, size, url)
        `,
        )
        .eq("contract_id", contractId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching contract messages:", error);
        return [];
      }

      return (
        messages?.map((message) => ({
          id: message.id,
          sender: {
            id: (message.user as any)?.id || "",
            name: (message.user as any)?.name || "Unknown User",
            avatar: "",
          },
          content: message.content,
          timestamp: message.created_at,
          attachments:
            (message.contract_message_attachments as any)?.map(
              (attachment: any) => ({
                name: attachment.name,
                type: attachment.type,
                size: attachment.size,
                url: attachment.url,
              }),
            ) || [],
        })) || []
      );
    } catch (error) {
      console.error("Error in getContractMessages:", error);
      return [];
    }
  },

  // Send contract message
  async sendContractMessage(contractId: string, content: string) {
    const supabase = getSupabaseBrowserClient();

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error("No authenticated user");
      }

      // Verify user has access to this contract
      const { data: contractData } = await supabase
        .from("contracts")
        .select("provider_id, needer_id")
        .eq("id", contractId)
        .single();

      if (
        !contractData ||
        (contractData.provider_id !== currentUser.id &&
          contractData.needer_id !== currentUser.id)
      ) {
        throw new Error("User does not have access to this contract");
      }

      const { data, error } = await supabase
        .from("contract_messages")
        .insert({
          contract_id: contractId,
          user_id: currentUser.id,
          content: content,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error sending contract message:", error);
      throw error;
    }
  },

  // Get contract documents
  async getContractDocuments(contractId: string) {
    const supabase = getSupabaseBrowserClient();

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        console.error("No authenticated user");
        return [];
      }

      // Verify user has access to this contract
      const { data: contractData } = await supabase
        .from("contracts")
        .select("provider_id, needer_id")
        .eq("id", contractId)
        .single();

      if (
        !contractData ||
        (contractData.provider_id !== currentUser.id &&
          contractData.needer_id !== currentUser.id)
      ) {
        console.error("User does not have access to this contract");
        return [];
      }

      const { data: documents, error } = await supabase
        .from("contract_documents")
        .select(
          `
          *,
          uploaded_by_user:users!contract_documents_uploaded_by_fkey(name)
        `,
        )
        .eq("contract_id", contractId)
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.error("Error fetching contract documents:", error);
        return [];
      }

      return (
        documents?.map((doc) => ({
          id: doc.id,
          name: doc.name,
          type: doc.type,
          size: doc.size,
          url: doc.url,
          uploadedAt: doc.uploaded_at,
          uploadedBy: (doc.uploaded_by_user as any)?.name || "Unknown User",
        })) || []
      );
    } catch (error) {
      console.error("Error in getContractDocuments:", error);
      return [];
    }
  },

  // Submit contract modification request
  async submitModificationRequest(
    contractId: string,
    modificationType: string,
    reason: string,
    details: string,
    urgency: string,
  ) {
    const supabase = getSupabaseBrowserClient();

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error("No authenticated user");
      }

      // Verify user has access to this contract
      const { data: contractData } = await supabase
        .from("contracts")
        .select(
          "provider_id, needer_id, provider:users!contracts_provider_id_fkey(name), needer:users!contracts_needer_id_fkey(name)",
        )
        .eq("id", contractId)
        .single();

      if (
        !contractData ||
        (contractData.provider_id !== currentUser.id &&
          contractData.needer_id !== currentUser.id)
      ) {
        throw new Error("User does not have access to this contract");
      }

      // Insert modification request into database
      const { data: modificationRequest, error: modificationError } =
        await supabase
          .from("contract_modification_requests")
          .insert({
            contract_id: contractId,
            requested_by: currentUser.id,
            modification_type: modificationType,
            reason: reason,
            details: details,
            urgency: urgency,
          })
          .select()
          .single();

      if (modificationError) {
        throw modificationError;
      }

      // Log the modification request as an activity
      const description = `Contract modification requested: ${modificationType} - ${reason}`;

      const { error: activityError } = await supabase
        .from("contract_activities")
        .insert({
          contract_id: contractId,
          type: "modification_requested",
          description: description,
          user_id: currentUser.id,
        });

      if (activityError) {
        console.error("Error logging modification activity:", activityError);
      }

      // Send a message about the modification request
      const isProvider = currentUser.id === contractData.provider_id;
      const otherPartyName = isProvider
        ? (contractData.needer as any)?.name
        : (contractData.provider as any)?.name;

      const messageContent = `I have submitted a contract modification request for ${modificationType}.\n\nReason: ${reason}\n\nDetails: ${details}\n\nUrgency: ${urgency}\n\nPlease review and let me know your thoughts.`;

      await this.sendContractMessage(contractId, messageContent);

      return modificationRequest;
    } catch (error) {
      console.error("Error submitting modification request:", error);
      throw error;
    }
  },

  // Submit timeline extension request
  async submitTimelineExtensionRequest(
    contractId: string,
    newEndDate: Date,
    reason: string,
    details: string,
  ) {
    const supabase = getSupabaseBrowserClient();

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error("No authenticated user");
      }

      // Verify user has access to this contract
      const { data: contractData } = await supabase
        .from("contracts")
        .select(
          "provider_id, needer_id, end_date, provider:users!contracts_provider_id_fkey(name), needer:users!contracts_needer_id_fkey(name)",
        )
        .eq("id", contractId)
        .single();

      if (
        !contractData ||
        (contractData.provider_id !== currentUser.id &&
          contractData.needer_id !== currentUser.id)
      ) {
        throw new Error("User does not have access to this contract");
      }

      const currentEndDate = new Date(contractData.end_date);
      const extensionDays = Math.round(
        (newEndDate.getTime() - currentEndDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      // Insert extension request into database
      const { data: extensionRequest, error: extensionError } = await supabase
        .from("contract_extension_requests")
        .insert({
          contract_id: contractId,
          requested_by: currentUser.id,
          current_end_date: contractData.end_date,
          new_end_date: newEndDate.toISOString(),
          extension_days: extensionDays,
          reason: reason,
          details: details,
        })
        .select()
        .single();

      if (extensionError) {
        throw extensionError;
      }

      // Log the extension request as an activity
      const description = `Timeline extension requested: ${extensionDays} days (new end date: ${newEndDate.toDateString()})`;

      const { error: activityError } = await supabase
        .from("contract_activities")
        .insert({
          contract_id: contractId,
          type: "timeline_extension_requested",
          description: description,
          user_id: currentUser.id,
        });

      if (activityError) {
        console.error("Error logging extension activity:", activityError);
      }

      // Send a message about the extension request
      const isProvider = currentUser.id === contractData.provider_id;
      const otherPartyName = isProvider
        ? (contractData.needer as any)?.name
        : (contractData.provider as any)?.name;

      const messageContent = `I have submitted a timeline extension request.\n\nNew End Date: ${newEndDate.toDateString()}\nExtension: ${extensionDays} days\n\nReason: ${reason}\n\nDetails: ${details}\n\nPlease review and let me know if you approve this extension.`;

      await this.sendContractMessage(contractId, messageContent);

      return extensionRequest;
    } catch (error) {
      console.error("Error submitting timeline extension request:", error);
      throw error;
    }
  },

  // Get milestone details by ID
  async getMilestoneById(contractId: string, milestoneId: string) {
    const supabase = getSupabaseBrowserClient();

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        console.error("No authenticated user");
        return null;
      }

      // Verify user has access to this contract
      const { data: contractData } = await supabase
        .from("contracts")
        .select("provider_id, needer_id, title")
        .eq("id", contractId)
        .single();

      if (
        !contractData ||
        (contractData.provider_id !== currentUser.id &&
          contractData.needer_id !== currentUser.id)
      ) {
        console.error("User does not have access to this contract");
        return null;
      }

      // Get milestone data with deliverables
      // Get milestone data with enhanced fields
      const { data: milestoneData, error: milestoneError } = await supabase
        .from("contract_milestones")
        .select(
          `
          *,
          contract_milestone_deliverables(id, description, completed, created_at, updated_at)
        `,
        )
        .eq("id", milestoneId)
        .eq("contract_id", contractId)
        .single();

      if (milestoneError || !milestoneData) {
        console.error("Error fetching milestone:", milestoneError);
        return null;
      }

      // Get milestone comments
      const { data: comments } = await supabase
        .from("contract_milestone_comments")
        .select(
          `
          *,
          user:users(name)
        `,
        )
        .eq("milestone_id", milestoneId)
        .order("created_at", { ascending: true });

      // Get milestone documents (if any exist)
      const { data: documents } = await supabase
        .from("contract_documents")
        .select("*")
        .eq("contract_id", contractId)
        .ilike("name", `%milestone%${milestoneData.name}%`);

      // Get milestone files
      const { data: milestoneFiles } = await supabase
        .from("contract_milestone_files")
        .select(
          `
          *,
          uploader:users!uploaded_by(name)
        `,
        )
        .eq("milestone_id", milestoneId)
        .order("created_at", { ascending: true });

      // Transform milestone data
      const milestone = {
        id: milestoneData.id,
        contractId: contractId,
        contractTitle: contractData.title,
        name: milestoneData.name,
        description: milestoneData.description,
        percentage: milestoneData.percentage,
        amount: milestoneData.amount,
        dueDate: milestoneData.due_date,
        status: milestoneData.status,
        completedDate: milestoneData.completed_date,
        deliverables:
          (milestoneData.contract_milestone_deliverables as any)?.map(
            (deliverable: any) => ({
              id: deliverable.id,
              name: deliverable.description,
              description: deliverable.description,
              status: deliverable.completed ? "completed" : "pending",
              completedDate: deliverable.completed
                ? deliverable.updated_at
                : null,
            }),
          ) || [],
        comments:
          comments?.map((comment) => ({
            id: comment.id,
            user: (comment.user as any)?.name || "Unknown User",
            content: comment.content,
            date: comment.created_at,
          })) || [],
        documents:
          documents?.map((doc) => ({
            id: doc.id,
            name: doc.name,
            type: doc.type,
            size: doc.size,
            url: doc.url,
            uploadedAt: doc.uploaded_at,
          })) || [],
        files:
          milestoneFiles?.map((file) => ({
            id: file.id,
            name: file.name,
            type: file.file_type,
            size: file.file_size,
            url: file.url,
            uploadedAt: file.created_at,
            uploadedBy: (file.uploader as any)?.name || "Unknown User",
          })) || [],
        canReview:
          currentUser.id === contractData.provider_id ||
          currentUser.id === contractData.needer_id,
        userRole:
          currentUser.id === contractData.provider_id ? "provider" : "needer",
        canStartWork:
          currentUser.id === contractData.provider_id &&
          milestoneData.status === "pending",
      };

      return milestone;
    } catch (error) {
      console.error("Error in getMilestoneById:", error);
      return null;
    }
  },

  // Add comment to milestone
  async addMilestoneComment(milestoneId: string, content: string) {
    const supabase = getSupabaseBrowserClient();

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error("No authenticated user");
      }

      const { data, error } = await supabase
        .from("contract_milestone_comments")
        .insert({
          milestone_id: milestoneId,
          user_id: currentUser.id,
          content: content,
        })
        .select(
          `
          *,
          user:users(name)
        `,
        )
        .single();

      if (error) {
        throw error;
      }

      return {
        id: data.id,
        user: (data.user as any)?.name || "Unknown User",
        content: data.content,
        date: data.created_at,
      };
    } catch (error) {
      console.error("Error adding milestone comment:", error);
      throw error;
    }
  },

  // Update milestone status
  async updateMilestoneStatus(milestoneId: string, status: string) {
    const supabase = getSupabaseBrowserClient();

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error("No authenticated user");
      }

      const updateData: any = {
        status: status,
        updated_at: new Date().toISOString(),
      };

      // If marking as completed, set completed_date
      if (status === "completed") {
        updateData.completed_date = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("contract_milestones")
        .update(updateData)
        .eq("id", milestoneId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error updating milestone status:", error);
      throw error;
    }
  },

  // Start milestone work
  async startMilestone(milestoneId: string) {
    const supabase = getSupabaseBrowserClient();

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error("No authenticated user");
      }

      // Get milestone and verify user is the provider
      const { data: milestoneData } = await supabase
        .from("contract_milestones")
        .select(
          `
          *,
          contracts!inner(provider_id, needer_id, title)
        `,
        )
        .eq("id", milestoneId)
        .single();

      if (
        !milestoneData ||
        milestoneData.contracts.provider_id !== currentUser.id
      ) {
        throw new Error("Access denied - only provider can start milestone");
      }

      if (milestoneData.status !== "pending") {
        throw new Error("Milestone must be pending to start work");
      }

      // Update milestone status to in_progress
      const { error: updateError } = await supabase
        .from("contract_milestones")
        .update({
          status: "in_progress",
          updated_at: new Date().toISOString(),
        })
        .eq("id", milestoneId);

      if (updateError) {
        throw updateError;
      }

      // Update contract status from pending_start to active if needed
      const { data: contractData } = await supabase
        .from("contracts")
        .select("status")
        .eq("id", milestoneData.contract_id)
        .single();

      if (contractData && contractData.status === "pending_start") {
        const { error: contractUpdateError } = await supabase
          .from("contracts")
          .update({
            status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("id", milestoneData.contract_id);

        if (contractUpdateError) {
          console.error("Error updating contract status:", contractUpdateError);
          // Don't throw here as milestone was already updated successfully
        } else {
          // Send contract activation message
          await this.sendContractMessage(
            milestoneData.contract_id,
            "Contract has been activated - work has begun on the first milestone",
          );
        }
      }

      // Add status history entry
      await supabase.from("contract_milestone_status_history").insert({
        milestone_id: milestoneId,
        changed_by: currentUser.id,
        old_status: milestoneData.status,
        new_status: "in_progress",
        action_type: "start",
        comments: "Work started on milestone",
      });

      // Send system message
      await this.sendMilestoneMessage(
        milestoneId,
        "Work has started on this milestone",
        "system",
      );

      return { success: true };
    } catch (error) {
      console.error("Error starting milestone:", error);
      throw error;
    }
  },

  // Get milestone messages
  async getMilestoneMessages(milestoneId: string) {
    const supabase = getSupabaseBrowserClient();

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error("No authenticated user");
      }

      // Verify user has access to this milestone
      const { data: milestoneData } = await supabase
        .from("contract_milestones")
        .select(
          `
          id,
          contract_id,
          contracts!inner(provider_id, needer_id)
        `,
        )
        .eq("id", milestoneId)
        .single();

      if (
        !milestoneData ||
        (milestoneData.contracts.provider_id !== currentUser.id &&
          milestoneData.contracts.needer_id !== currentUser.id)
      ) {
        throw new Error("Access denied");
      }

      const { data: messages, error } = await supabase
        .from("contract_milestone_messages")
        .select("*")
        .eq("milestone_id", milestoneId)
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      if (!messages || messages.length === 0) {
        return [];
      }

      // Get all unique sender IDs
      const senderIds = [...new Set(messages.map((m) => m.sender_id))];

      // Get user data for all senders
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, name, avatar_url")
        .in("id", senderIds);

      return messages.map((message) => {
        const sender = usersData?.find((u) => u.id === message.sender_id);
        return {
          id: message.id,
          content: message.content,
          messageType: message.message_type,
          sender: {
            id: message.sender_id,
            name: sender?.name || "Unknown User",
            avatar: sender?.avatar_url || null,
          },
          createdAt: message.created_at,
          isOwnMessage: message.sender_id === currentUser.id,
        };
      });
    } catch (error) {
      console.error("Error fetching milestone messages:", error);
      throw error;
    }
  },

  // Send milestone message
  async sendMilestoneMessage(
    milestoneId: string,
    content: string,
    messageType: string = "general",
  ) {
    const supabase = getSupabaseBrowserClient();

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error("No authenticated user");
      }

      // Verify user has access to this milestone
      const { data: milestoneData } = await supabase
        .from("contract_milestones")
        .select(
          `
          id,
          contract_id,
          contracts!inner(provider_id, needer_id)
        `,
        )
        .eq("id", milestoneId)
        .single();

      if (
        !milestoneData ||
        (milestoneData.contracts.provider_id !== currentUser.id &&
          milestoneData.contracts.needer_id !== currentUser.id)
      ) {
        throw new Error("Access denied");
      }

      const { data, error } = await supabase
        .from("contract_milestone_messages")
        .insert({
          milestone_id: milestoneId,
          sender_id: currentUser.id,
          content: content,
          message_type: messageType,
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      // Get sender data separately
      const { data: sender } = await supabase
        .from("users")
        .select("id, name, avatar_url")
        .eq("id", currentUser.id)
        .single();

      return {
        id: data.id,
        content: data.content,
        messageType: data.message_type,
        sender: {
          id: currentUser.id,
          name: sender?.name || "Unknown User",
          avatar: sender?.avatar_url || null,
        },
        createdAt: data.created_at,
        isOwnMessage: true,
      };
    } catch (error) {
      console.error("Error sending milestone message:", error);
      throw error;
    }
  },

  // Submit milestone for review (by provider)
  async submitMilestoneForReview(
    milestoneId: string,
    submissionMessage?: string,
  ) {
    const supabase = getSupabaseBrowserClient();

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error("No authenticated user");
      }

      // Get milestone and verify user is the provider
      const { data: milestoneData } = await supabase
        .from("contract_milestones")
        .select(
          `
          *,
          contracts!inner(provider_id, needer_id, title)
        `,
        )
        .eq("id", milestoneId)
        .single();

      if (
        !milestoneData ||
        milestoneData.contracts.provider_id !== currentUser.id
      ) {
        throw new Error(
          "Access denied - only provider can submit milestone for review",
        );
      }

      if (milestoneData.status !== "in_progress") {
        throw new Error("Milestone must be in progress to submit for review");
      }

      // Update milestone status
      const { error: updateError } = await supabase
        .from("contract_milestones")
        .update({
          submitted_for_review: true,
          submitted_at: new Date().toISOString(),
          submitted_by: currentUser.id,
          status: "pending_review",
          updated_at: new Date().toISOString(),
        })
        .eq("id", milestoneId);

      if (updateError) {
        throw updateError;
      }

      // Add status history entry
      await supabase.from("contract_milestone_status_history").insert({
        milestone_id: milestoneId,
        changed_by: currentUser.id,
        old_status: milestoneData.status,
        new_status: "pending_review",
        action_type: "submit",
        comments: submissionMessage || "Milestone submitted for review",
      });

      // Send system message
      if (submissionMessage) {
        await this.sendMilestoneMessage(
          milestoneId,
          submissionMessage,
          "submission",
        );
      } else {
        await this.sendMilestoneMessage(
          milestoneId,
          "Milestone has been submitted for review",
          "system",
        );
      }

      return { success: true };
    } catch (error) {
      console.error("Error submitting milestone for review:", error);
      throw error;
    }
  },

  // Review milestone (by client/needer)
  async reviewMilestone(
    milestoneId: string,
    approved: boolean,
    reviewComments?: string,
  ) {
    const supabase = getSupabaseBrowserClient();

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error("No authenticated user");
      }

      // Get milestone and verify user is the needer
      const { data: milestoneData } = await supabase
        .from("contract_milestones")
        .select(
          `
          *,
          contracts!inner(provider_id, needer_id, title)
        `,
        )
        .eq("id", milestoneId)
        .single();

      if (
        !milestoneData ||
        milestoneData.contracts.needer_id !== currentUser.id
      ) {
        throw new Error("Access denied - only client can review milestone");
      }

      if (milestoneData.status !== "pending_review") {
        throw new Error("Milestone must be submitted for review");
      }

      const newStatus = approved ? "completed" : "in_progress";
      const reviewStatus = approved ? "approved" : "rejected";

      // Update milestone
      const updateData: any = {
        reviewed_at: new Date().toISOString(),
        reviewed_by: currentUser.id,
        review_status: reviewStatus,
        review_comments: reviewComments,
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (approved) {
        updateData.completed_date = new Date().toISOString();
      } else {
        // Reset submission fields if rejected
        updateData.submitted_for_review = false;
        updateData.submitted_at = null;
        updateData.submitted_by = null;
      }

      const { error: updateError } = await supabase
        .from("contract_milestones")
        .update(updateData)
        .eq("id", milestoneId);

      if (updateError) {
        throw updateError;
      }

      // Add status history entry
      await supabase.from("contract_milestone_status_history").insert({
        milestone_id: milestoneId,
        changed_by: currentUser.id,
        old_status: milestoneData.status,
        new_status: newStatus,
        action_type: approved ? "approve" : "reject",
        comments:
          reviewComments ||
          (approved
            ? "Milestone approved"
            : "Milestone rejected - needs revision"),
      });

      // Send system message
      const systemMessage = approved
        ? "Milestone has been approved and marked as completed"
        : "Milestone has been rejected and returned for revision";

      await this.sendMilestoneMessage(milestoneId, systemMessage, "system");

      if (reviewComments) {
        await this.sendMilestoneMessage(milestoneId, reviewComments, "review");
      }

      // Check if all milestones are completed after approval
      if (approved) {
        const allCompleted = await this.checkAllMilestonesCompleted(
          milestoneData.contract_id,
        );
        if (allCompleted) {
          // Auto-submit contract for final review
          await this.submitContractForFinalReview(milestoneData.contract_id);
        }
      }

      return { success: true, approved };
    } catch (error) {
      console.error("Error reviewing milestone:", error);
      throw error;
    }
  },

  // Check if all milestones in a contract are completed
  async checkAllMilestonesCompleted(contractId: string): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();
    try {
      const { data: milestones, error } = await supabase
        .from("contract_milestones")
        .select("id, status")
        .eq("contract_id", contractId);

      if (error || !milestones || milestones.length === 0) {
        return false;
      }

      return milestones.every((milestone) => milestone.status === "completed");
    } catch (error) {
      console.error("Error checking milestones completion:", error);
      return false;
    }
  },

  // Submit contract for final review after all milestones are completed
  async submitContractForFinalReview(
    contractId: string,
  ): Promise<{ success: boolean }> {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    if (!currentUser) {
      throw new Error("No authenticated user");
    }

    try {
      // Update contract status to pending_review
      const { error: updateError } = await supabase
        .from("contracts")
        .update({
          status: "pending_review",
          submitted_for_review: true,
          submitted_at: new Date().toISOString(),
          submitted_by: currentUser.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", contractId);

      if (updateError) {
        throw updateError;
      }

      // Send notification message
      await this.sendContractMessage(
        contractId,
        "🎉 All milestones have been completed! The contract is now ready for final review and closure.",
      );

      return { success: true };
    } catch (error) {
      console.error("Error submitting contract for final review:", error);
      throw error;
    }
  },

  // Review and complete contract (final approval)
  async reviewContractCompletion(
    contractId: string,
    approved: boolean,
    reviewComments?: string,
  ): Promise<{ success: boolean }> {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    if (!currentUser) {
      throw new Error("No authenticated user");
    }

    try {
      // Get contract data
      const { data: contractData, error: contractError } = await supabase
        .from("contracts")
        .select("*")
        .eq("id", contractId)
        .single();

      if (contractError || !contractData) {
        throw new Error("Contract not found");
      }

      // Check if user is the client (needer)
      if (contractData.needer_id !== currentUser.id) {
        throw new Error("Only the client can review contract completion");
      }

      // Check current status
      if (contractData.status !== "pending_review") {
        throw new Error("Contract must be pending review");
      }

      const newStatus = approved ? "completed" : "active";

      // Update contract
      const { error: updateError } = await supabase
        .from("contracts")
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          reviewed_by: currentUser.id,
          review_comments: reviewComments,
          updated_at: new Date().toISOString(),
        })
        .eq("id", contractId);

      if (updateError) {
        throw updateError;
      }

      // Send notification message
      const message = approved
        ? `✅ Contract has been approved and marked as completed!${reviewComments ? "\n\nClient comments: " + reviewComments : ""}\n\n🎊 Congratulations on successfully completing this project!`
        : `❌ Contract completion has been rejected and returned to active status.${reviewComments ? "\n\nClient comments: " + reviewComments : ""}\n\nPlease address any remaining issues.`;

      await this.sendContractMessage(contractId, message);

      return { success: true };
    } catch (error) {
      console.error("Error reviewing contract completion:", error);
      throw error;
    }
  },

  // Get contract completion workflow status
  async getContractCompletionStatus(contractId: string): Promise<{
    allMilestonesCompleted: boolean;
    canSubmitForFinalReview: boolean;
    canReviewCompletion: boolean;
    isAwaitingFinalReview: boolean;
    isCompleted: boolean;
    userRole: "provider" | "needer" | null;
  }> {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return {
        allMilestonesCompleted: false,
        canSubmitForFinalReview: false,
        canReviewCompletion: false,
        isAwaitingFinalReview: false,
        isCompleted: false,
        userRole: null,
      };
    }

    try {
      // Get contract data
      const { data: contractData, error: contractError } = await supabase
        .from("contracts")
        .select("*")
        .eq("id", contractId)
        .single();

      if (contractError || !contractData) {
        throw new Error("Contract not found");
      }

      // Determine user role
      let userRole: "provider" | "needer" | null = null;
      if (contractData.provider_id === currentUser.id) {
        userRole = "provider";
      } else if (contractData.needer_id === currentUser.id) {
        userRole = "needer";
      }

      // Check if all milestones are completed
      const allMilestonesCompleted =
        await this.checkAllMilestonesCompleted(contractId);

      const isCompleted = contractData.status === "completed";
      const isAwaitingFinalReview = contractData.status === "pending_review";
      const canSubmitForFinalReview =
        userRole === "provider" &&
        allMilestonesCompleted &&
        contractData.status === "active";
      const canReviewCompletion =
        userRole === "needer" && isAwaitingFinalReview;

      return {
        allMilestonesCompleted,
        canSubmitForFinalReview,
        canReviewCompletion,
        isAwaitingFinalReview,
        isCompleted,
        userRole,
      };
    } catch (error) {
      console.error("Error getting contract completion status:", error);
      return {
        allMilestonesCompleted: false,
        canSubmitForFinalReview: false,
        canReviewCompletion: false,
        isAwaitingFinalReview: false,
        isCompleted: false,
        userRole: null,
      };
    }
  },

  // Get milestone status history
  async getMilestoneStatusHistory(milestoneId: string) {
    const supabase = getSupabaseBrowserClient();

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error("No authenticated user");
      }

      // Verify user has access to this milestone
      const { data: milestoneData } = await supabase
        .from("contract_milestones")
        .select(
          `
          id,
          contract_id,
          contracts!inner(provider_id, needer_id)
        `,
        )
        .eq("id", milestoneId)
        .single();

      if (
        !milestoneData ||
        (milestoneData.contracts.provider_id !== currentUser.id &&
          milestoneData.contracts.needer_id !== currentUser.id)
      ) {
        throw new Error("Access denied");
      }

      const { data: history, error } = await supabase
        .from("contract_milestone_status_history")
        .select("*")
        .eq("milestone_id", milestoneId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (!history || history.length === 0) {
        return [];
      }

      // Get user data separately
      const userIds = [...new Set(history.map((h) => h.changed_by))];
      const { data: usersData } = await supabase
        .from("users")
        .select("id, name")
        .in("id", userIds);

      return history.map((entry) => {
        const changedByUser = usersData?.find((u) => u.id === entry.changed_by);
        return {
          id: entry.id,
          oldStatus: entry.old_status,
          newStatus: entry.new_status,
          actionType: entry.action_type,
          comments: entry.comments,
          changedBy: {
            id: changedByUser?.id || entry.changed_by,
            name: changedByUser?.name || "Unknown User",
          },
          createdAt: entry.created_at,
        };
      });
    } catch (error) {
      console.error("Error fetching milestone status history:", error);
      throw error;
    }
  },

  // Get milestone with enhanced data including messages and status
  async getMilestoneByIdEnhanced(contractId: string, milestoneId: string) {
    const supabase = getSupabaseBrowserClient();

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        console.error("No authenticated user");
        return null;
      }

      // Проверяем доступ пользователя к контракту
      const { data: contractData } = await supabase
        .from("contracts")
        .select("provider_id, needer_id, title")
        .eq("id", contractId)
        .single();

      if (
        !contractData ||
        (contractData.provider_id !== currentUser.id &&
          contractData.needer_id !== currentUser.id)
      ) {
        console.error("User does not have access to this contract");
        return null;
      }

      // Получаем данные milestone без связей на пользователей
      const { data: milestoneData, error: milestoneError } = await supabase
        .from("contract_milestones")
        .select(
          `
        *,
        contract_milestone_deliverables(id, description, completed, created_at, updated_at)
      `,
        )
        .eq("id", milestoneId)
        .eq("contract_id", contractId)
        .single();

      if (milestoneError || !milestoneData) {
        console.error("Error fetching milestone:", milestoneError);
        return null;
      }

      // Функция для получения пользователя по id из public.users (view на auth.users)
      async function getUserById(userId: string | null) {
        if (!userId) return null;
        const { data: user, error } = await supabase
          .from("users")
          .select("id, name")
          .eq("id", userId)
          .single();
        if (error) {
          console.warn("Error fetching user", userId, error);
          return null;
        }
        return user;
      }

      // Получаем отправителей и ревьюеров, если есть
      const submittedByUser = await getUserById(milestoneData.submitted_by);
      const reviewedByUser = await getUserById(milestoneData.reviewed_by);

      // Получаем сообщения и статус истории (как у тебя)
      const messages = await this.getMilestoneMessages(milestoneId);
      const statusHistory = await this.getMilestoneStatusHistory(milestoneId);

      // Документы
      const { data: documents } = await supabase
        .from("contract_documents")
        .select("*")
        .eq("contract_id", contractId)
        .ilike("name", `%milestone%${milestoneData.name}%`);

      // Get milestone files
      const { data: milestoneFiles } = await supabase
        .from("contract_milestone_files")
        .select(
          `
        *,
        uploader:users!uploaded_by(name)
      `,
        )
        .eq("milestone_id", milestoneId)
        .order("created_at", { ascending: true });

      const isProvider = currentUser.id === contractData.provider_id;
      const isNeeder = currentUser.id === contractData.needer_id;

      console.log("isProvider", isProvider);
      console.log("isNeeder", isNeeder);

      // Формируем результат
      return {
        id: milestoneData.id,
        contractId,
        contractTitle: contractData.title,
        name: milestoneData.name,
        description: milestoneData.description,
        percentage: milestoneData.percentage,
        amount: milestoneData.amount,
        dueDate: milestoneData.due_date,
        status: milestoneData.status,
        completedDate: milestoneData.completed_date,

        submittedForReview: milestoneData.submitted_for_review || false,
        submittedAt: milestoneData.submitted_at || null,
        submittedBy: submittedByUser
          ? {
              id: submittedByUser.id,
              name: submittedByUser.name,
            }
          : null,

        reviewedAt: milestoneData.reviewed_at || null,
        reviewedBy: reviewedByUser
          ? {
              id: reviewedByUser.id,
              name: reviewedByUser.name,
            }
          : null,
        reviewStatus: milestoneData.review_status || null,
        reviewComments: milestoneData.review_comments || null,

        deliverables: (milestoneData.contract_milestone_deliverables || []).map(
          (d: any) => ({
            id: d.id,
            name: d.description,
            description: d.description,
            status: d.completed ? "completed" : "pending",
            completedDate: d.completed ? d.updated_at : null,
          }),
        ),

        messages,
        statusHistory,

        documents: (documents || []).map((doc) => ({
          id: doc.id,
          name: doc.name,
          type: doc.type,
          size: doc.size,
          url: doc.url,
          uploadedAt: doc.uploaded_at,
        })),

        files: (milestoneFiles || []).map((file) => ({
          id: file.id,
          name: file.name,
          type: file.file_type,
          size: file.file_size,
          url: file.url,
          uploadedAt: file.created_at,
          uploadedBy: (file.uploader as any)?.name || "Unknown User",
        })),

        userRole: isProvider ? "provider" : "needer",
        canReview: isNeeder && milestoneData.status === "pending_review",
        canSendMessage: true,
        canStartWork: isProvider && milestoneData.status === "pending",
      };
    } catch (error) {
      console.error("Error in getMilestoneByIdEnhanced:", error);
      return null;
    }
  },

  async uploadMilestoneFiles(milestoneId: string, files: File[]) {
    const supabase = getSupabaseBrowserClient();

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error("No authenticated user");
      }

      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${milestoneId}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `milestone-files/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("contract-files")
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("contract-files").getPublicUrl(filePath);

        // Save file record to database
        const { data: fileRecord, error: insertError } = await supabase
          .from("contract_milestone_files")
          .insert({
            milestone_id: milestoneId,
            name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
            url: publicUrl,
            uploaded_by: currentUser.id,
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        return fileRecord;
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      return uploadedFiles;
    } catch (error) {
      console.error("Error uploading milestone files:", error);
      throw error;
    }
  },

  async updateMilestoneDeliverables(
    milestoneId: string,
    completedDeliverableIds: string[],
  ) {
    const supabase = getSupabaseBrowserClient();

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error("No authenticated user");
      }

      // Get all deliverables for this milestone
      const { data: deliverables } = await supabase
        .from("contract_milestone_deliverables")
        .select("*")
        .eq("milestone_id", milestoneId);

      if (!deliverables) {
        return;
      }

      // Update each deliverable
      const updatePromises = deliverables.map(async (deliverable) => {
        const shouldBeCompleted = completedDeliverableIds.includes(
          deliverable.id,
        );

        if (deliverable.completed !== shouldBeCompleted) {
          const { error } = await supabase
            .from("contract_milestone_deliverables")
            .update({
              completed: shouldBeCompleted,
              updated_at: new Date().toISOString(),
            })
            .eq("id", deliverable.id);

          if (error) {
            throw error;
          }
        }
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error updating milestone deliverables:", error);
      throw error;
    }
  },

  async completeMilestone(
    milestoneId: string,
    completionData: {
      completionNotes: string;
      deliverableNotes?: string;
      completedDeliverableIds: string[];
      uploadedFiles?: File[];
    },
  ) {
    const supabase = getSupabaseBrowserClient();

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error("No authenticated user");
      }

      // Get milestone and verify user is the provider
      const { data: milestoneData } = await supabase
        .from("contract_milestones")
        .select(
          `
          *,
          contracts!inner(provider_id, needer_id, title)
        `,
        )
        .eq("id", milestoneId)
        .single();

      if (
        !milestoneData ||
        milestoneData.contracts.provider_id !== currentUser.id
      ) {
        throw new Error("Access denied - only provider can complete milestone");
      }

      if (milestoneData.status !== "in_progress") {
        throw new Error("Milestone must be in progress to complete");
      }

      // Upload files if any
      if (
        completionData.uploadedFiles &&
        completionData.uploadedFiles.length > 0
      ) {
        await this.uploadMilestoneFiles(
          milestoneId,
          completionData.uploadedFiles,
        );
      }

      // Update deliverables
      await this.updateMilestoneDeliverables(
        milestoneId,
        completionData.completedDeliverableIds,
      );

      // Submit milestone for review
      await this.submitMilestoneForReview(
        milestoneId,
        completionData.completionNotes,
      );

      // Add completion comment
      await this.addMilestoneComment(
        milestoneId,
        completionData.completionNotes,
      );

      // Send completion message
      let completionMessage = `MILESTONE COMPLETION SUBMITTED

Milestone: ${milestoneData.name}
Status: Pending Review

Completion Notes:
${completionData.completionNotes}`;

      if (completionData.deliverableNotes) {
        completionMessage += `

Deliverable Notes:
${completionData.deliverableNotes}`;
      }

      const deliverableCount = completionData.completedDeliverableIds.length;
      if (deliverableCount > 0) {
        completionMessage += `

Completed Deliverables: ${deliverableCount} item(s)`;
      }

      const fileCount = completionData.uploadedFiles?.length || 0;
      if (fileCount > 0) {
        completionMessage += `

Uploaded Files: ${fileCount} file(s)`;
      }

      completionMessage += `

This milestone is now ready for review and approval.`;

      await this.sendContractMessage(
        milestoneData.contract_id,
        completionMessage,
      );

      return { success: true };
    } catch (error) {
      console.error("Error completing milestone:", error);
      throw error;
    }
  },

  // Contract workflow functions (for contracts without milestones)
  async startContractWork(contractId: string): Promise<{ success: boolean }> {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    try {
      // Get contract data
      const { data: contractData, error: contractError } = await supabase
        .from("contracts")
        .select("*")
        .eq("id", contractId)
        .single();

      if (contractError || !contractData) {
        throw new Error("Contract not found");
      }

      // Check if user is the provider
      if (contractData.provider_id !== currentUser.id) {
        throw new Error("Only the provider can start contract work");
      }

      // Check current status
      if (contractData.status !== "pending_start") {
        throw new Error(
          "Contract must be in pending_start status to begin work",
        );
      }

      // Update contract status
      const { error: updateError } = await supabase
        .from("contracts")
        .update({
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", contractId);

      if (updateError) {
        throw updateError;
      }

      // Send notification message
      await this.sendContractMessage(
        contractId,
        "Work has been started on this contract.",
      );

      return { success: true };
    } catch (error) {
      console.error("Error starting contract work:", error);
      throw error;
    }
  },

  async submitContractForReview(
    contractId: string,
    submissionMessage?: string,
  ): Promise<{ success: boolean }> {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    try {
      // Get contract data
      const { data: contractData, error: contractError } = await supabase
        .from("contracts")
        .select("*")
        .eq("id", contractId)
        .single();

      if (contractError || !contractData) {
        throw new Error("Contract not found");
      }

      // Check if user is the provider
      if (contractData.provider_id !== currentUser.id) {
        throw new Error("Only the provider can submit contract for review");
      }

      // Check current status
      if (contractData.status !== "active") {
        throw new Error("Contract must be active to submit for review");
      }

      // Update contract
      const { error: updateError } = await supabase
        .from("contracts")
        .update({
          submitted_for_review: true,
          submitted_at: new Date().toISOString(),
          submitted_by: currentUser.id,
          status: "pending_review",
          updated_at: new Date().toISOString(),
        })
        .eq("id", contractId);

      if (updateError) {
        throw updateError;
      }

      // Send notification message
      if (submissionMessage) {
        await this.sendContractMessage(contractId, submissionMessage);
      } else {
        await this.sendContractMessage(
          contractId,
          "Contract has been submitted for review",
        );
      }

      return { success: true };
    } catch (error) {
      console.error("Error submitting contract for review:", error);
      throw error;
    }
  },

  async reviewContract(
    contractId: string,
    approved: boolean,
    reviewComments?: string,
  ): Promise<{ success: boolean }> {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    try {
      // Get contract data
      const { data: contractData, error: contractError } = await supabase
        .from("contracts")
        .select("*")
        .eq("id", contractId)
        .single();

      if (contractError || !contractData) {
        throw new Error("Contract not found");
      }

      // Check if user is the client (needer)
      if (contractData.needer_id !== currentUser.id) {
        throw new Error("Only the client can review contract");
      }

      // Check current status
      if (contractData.status !== "pending_review") {
        throw new Error("Contract must be submitted for review");
      }

      const newStatus = approved ? "completed" : "active";

      // Update contract
      const { error: updateError } = await supabase
        .from("contracts")
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          reviewed_by: currentUser.id,
          review_comments: reviewComments,
          updated_at: new Date().toISOString(),
        })
        .eq("id", contractId);

      if (updateError) {
        throw updateError;
      }

      // Send notification message
      const message = approved
        ? `Contract has been approved and marked as completed.${reviewComments ? "\n\nClient comments: " + reviewComments : ""}`
        : `Contract has been rejected and returned for revision.${reviewComments ? "\n\nClient comments: " + reviewComments : ""}`;

      await this.sendContractMessage(contractId, message);

      return { success: true };
    } catch (error) {
      console.error("Error reviewing contract:", error);
      throw error;
    }
  },

  async getContractWorkflowStatus(contractId: string): Promise<{
    canStartWork: boolean;
    canSubmitForReview: boolean;
    canReview: boolean;
    isCompleted: boolean;
    hasMilestones: boolean;
    userRole: "provider" | "needer" | null;
  }> {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    if (!currentUser) {
      return {
        canStartWork: false,
        canSubmitForReview: false,
        canReview: false,
        isCompleted: false,
        hasMilestones: false,
        userRole: null,
      };
    }

    try {
      // Get contract data
      const { data: contractData, error: contractError } = await supabase
        .from("contracts")
        .select("*")
        .eq("id", contractId)
        .single();

      if (contractError || !contractData) {
        throw new Error("Contract not found");
      }

      // Check if contract has milestones
      const { data: milestones, error: milestonesError } = await supabase
        .from("contract_milestones")
        .select("id")
        .eq("contract_id", contractId)
        .limit(1);

      const hasMilestones =
        !milestonesError && milestones && milestones.length > 0;

      // Determine user role
      let userRole: "provider" | "needer" | null = null;
      if (contractData.provider_id === currentUser.id) {
        userRole = "provider";
      } else if (contractData.needer_id === currentUser.id) {
        userRole = "needer";
      }

      const isCompleted = contractData.status === "completed";
      const canStartWork =
        userRole === "provider" &&
        contractData.status === "pending_start" &&
        !hasMilestones;
      const canSubmitForReview =
        userRole === "provider" &&
        contractData.status === "active" &&
        !hasMilestones;
      const canReview =
        userRole === "needer" &&
        contractData.status === "pending_review" &&
        !hasMilestones;

      return {
        canStartWork,
        canSubmitForReview,
        canReview,
        isCompleted,
        hasMilestones,
        userRole,
      };
    } catch (error) {
      console.error("Error getting contract workflow status:", error);
      return {
        canStartWork: false,
        canSubmitForReview: false,
        canReview: false,
        isCompleted: false,
        hasMilestones: false,
        userRole: null,
      };
    }
  },
};
