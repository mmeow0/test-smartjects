import { getSupabaseBrowserClient } from "@/lib/supabase";
import { blockchainService } from "@/lib/services/blockchain.service";
import {
  marketplaceService,
  AgreementStatus,
} from "@/lib/services/marketplace.service";
import { notificationService } from "./notification.service";
import type { ContractListType } from "../types";
import { getDeploymentAmount } from "@/lib/config/blockchain-features.config";

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

      // Check if both parties have signed
      const bothSigned = data.provider_signed && data.needer_signed;

      if (bothSigned) {
        console.log("Both parties have signed the contract");

        // Update contract status to ready for funding
        await supabase
          .from("contracts")
          .update({
            status: "pending_funding",
            updated_at: new Date().toISOString(),
          })
          .eq("id", contractId);

        // Send notification about next steps
        if (!isProvider) {
          await this.sendContractMessage(
            contractId,
            "✅ Contract has been signed by both parties! The client can now fund the contract to create the smart contract agreement.",
          );
        }
      }

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

      let smartjectId = "none";
      let smartjectTitle = "Unknown Project";
      if (matchData) {
        const { data: smartjectData } = await supabase
          .from("smartjects")
          .select("title")
          .eq("id", matchData.smartject_id)
          .single();

        if (smartjectData) {
          smartjectTitle = smartjectData.title;
          smartjectId = matchData.smartject_id;
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
        smartjectId: smartjectId,
        smartjectTitle: smartjectTitle,
        status: status,
        role: role,
        createdAt: contractData.created_at,
        startDate: contractData.start_date,
        endDate: contractData.end_date,
        blockchain_address: contractData.blockchain_address,
        blockchain_status: contractData.blockchain_status,
        blockchain_deployed_at: contractData.blockchain_deployed_at,
        escrow_funded: contractData.escrow_funded,
        escrow_funded_at: contractData.escrow_funded_at,
        escrow_amount: contractData.escrow_amount,
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
          needer:users!contracts_needer_id_fkey(id, name, email),
          matches!contracts_match_id_fkey(smartject_id)
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
          matchId: contract.match_id,
          smartjectId: contract.matches?.smartject_id || contract.match_id,
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
          uploaded_by_user:users!contract_documents_uploaded_by_fkey(id, name)
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
          uploadedById: (doc.uploaded_by_user as any)?.id || "",
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
          uploader:users!uploaded_by(id, name)
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
            uploadedById: (file.uploader as any)?.id || "",
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

      // If approving and blockchain is enabled, check wallet connection first
      if (approved && contractData.blockchain_address) {
        const isWalletConnected = await blockchainService.isWalletConnected();
        if (!isWalletConnected) {
          throw new Error(
            "Wallet not connected. Please connect your wallet to complete the contract and release escrow funds.",
          );
        }
      }

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
        uploader:users!uploaded_by(id, name)
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
          uploadedById: (file.uploader as any)?.id || "",
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

  // Fund contract and create smart contract agreement (for needer/client)
  async fundContract(
    contractId: string,
  ): Promise<{ success: boolean; message?: string }> {
    const supabase = getSupabaseBrowserClient();

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error("No authenticated user");
      }

      // Get contract data
      const { data: contractData, error: contractError } = await supabase
        .from("contracts")
        .select("*")
        .eq("id", contractId)
        .single();

      if (contractError || !contractData) {
        throw new Error("Contract not found");
      }

      // Check if user is the needer (client)
      if (contractData.needer_id !== currentUser.id) {
        throw new Error("Only the client can fund the contract");
      }

      // Check if contract is fully signed
      if (!contractData.provider_signed || !contractData.needer_signed) {
        throw new Error("Contract must be fully signed before funding");
      }

      // Check if already funded
      if (contractData.blockchain_address) {
        return { success: true, message: "Contract is already funded" };
      }

      // Get user wallet addresses
      const { data: providerWallet } = await supabase
        .from("users")
        .select("wallet_address")
        .eq("id", contractData.provider_id)
        .single();

      const { data: neederWallet } = await supabase
        .from("users")
        .select("wallet_address")
        .eq("id", contractData.needer_id)
        .single();

      if (!providerWallet?.wallet_address || !neederWallet?.wallet_address) {
        throw new Error("Both parties must have connected wallets");
      }

      console.log("🔍 Original contract budget:", contractData.budget);
      console.log("🔍 Contract budget type:", typeof contractData.budget);

      // Calculate deployment amount
      const deploymentAmount = await getDeploymentAmount(
        contractData.budget || 0,
      );

      console.log("💰 Escrow amount for agreement:", deploymentAmount, "ETH");
      console.log("📋 Creating agreement with escrow");

      // Create agreement on marketplace with escrow
      const marketplaceAddress = await blockchainService.deployEscrowContract({
        contractId: contractId,
        clientAddress: neederWallet.wallet_address,
        providerAddress: providerWallet.wallet_address,
        amount: deploymentAmount, // Escrow amount included in creation
      });

      if (marketplaceAddress) {
        // Update contract with blockchain address and funding info
        const { error: updateError } = await supabase
          .from("contracts")
          .update({
            blockchain_address: marketplaceAddress,
            blockchain_deployed_at: new Date().toISOString(),
            blockchain_status: "pending_acceptance",
            escrow_funded: true,
            escrow_funded_at: new Date().toISOString(),
            escrow_amount: parseFloat(deploymentAmount),
            status: "pending_acceptance",
            updated_at: new Date().toISOString(),
          })
          .eq("id", contractId);

        if (updateError) {
          console.error(
            "Error updating contract after deployment:",
            updateError,
          );
          throw new Error("Failed to update contract status after deployment");
        }

        console.log("Agreement created on marketplace at:", marketplaceAddress);
        console.log("📋 Agreement status: Created with escrow included");
        console.log("💾 Database updated with funding info:", {
          blockchain_status: "pending_acceptance",
          escrow_funded: true,
          escrow_amount: deploymentAmount,
        });

        // Send notification about smart contract deployment
        await this.sendContractMessage(
          contractId,
          `💰 Smart contract agreement has been created and funded! Address: ${marketplaceAddress}\n\nThe provider can now accept the agreement to begin work.`,
        );

        return {
          success: true,
          message:
            "Contract funded successfully. The provider can now accept the agreement.",
        };
      } else {
        throw new Error("Failed to create smart contract agreement");
      }
    } catch (error: any) {
      console.error("Error funding contract:", error);
      return {
        success: false,
        message: error.message || "Failed to fund contract",
      };
    }
  },

  // Accept agreement (for provider)
  async acceptAgreement(
    contractId: string,
  ): Promise<{ success: boolean; message?: string }> {
    const supabase = getSupabaseBrowserClient();

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error("No authenticated user");
      }

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
        throw new Error("Only the provider can accept the agreement");
      }

      // Check if contract is funded
      if (!contractData.escrow_funded || !contractData.blockchain_address) {
        throw new Error("Contract must be funded before acceptance");
      }

      // Check if already accepted
      if (
        contractData.blockchain_status === "accepted" ||
        contractData.status === "active"
      ) {
        return { success: true, message: "Agreement is already accepted" };
      }

      // Save transaction state before acceptance
      await this.saveTransactionState(contractId, "acceptance", "processing", {
        providerId: currentUser.id,
        contractStatus: contractData.status,
        blockchainStatus: contractData.blockchain_status,
      });

      // Call acceptAgreement on smart contract
      console.log("📋 Provider accepting agreement for contract:", contractId);

      // Import marketplaceService if not already imported
      const { marketplaceService } = await import(
        "@/lib/services/marketplace.service"
      );

      const success = await marketplaceService.acceptAgreement(contractId);

      if (success) {
        // Update contract status in database
        const { error: updateError } = await supabase
          .from("contracts")
          .update({
            blockchain_status: "accepted",
            status: "pending_start",
            updated_at: new Date().toISOString(),
          })
          .eq("id", contractId);

        if (updateError) {
          console.error(
            "Error updating contract after acceptance:",
            updateError,
          );
          throw new Error("Failed to update contract status after acceptance");
        }

        console.log("✅ Agreement accepted successfully");
        console.log("💾 Database updated with acceptance info:", {
          blockchain_status: "accepted",
          status: "pending_start",
        });

        // Clear transaction state on success
        await this.clearTransactionState(contractId, "acceptance");

        // Send notification
        await this.sendContractMessage(
          contractId,
          "✅ Provider has accepted the agreement! Work can now begin on the contract.",
        );

        return {
          success: true,
          message: "Agreement accepted successfully. You can now start work.",
        };
      } else {
        // Update transaction state to failed
        await this.saveTransactionState(contractId, "acceptance", "failed");
        throw new Error("Failed to accept agreement on blockchain");
      }
    } catch (error: any) {
      console.error("Error accepting agreement:", error);

      // Update transaction state to failed
      await this.saveTransactionState(contractId, "acceptance", "failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return {
        success: false,
        message: error.message || "Failed to accept agreement",
      };
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

  // Finalize blockchain contract and release escrow funds
  async finalizeBlockchainContract(
    contractId: string,
    blockchainContractId: number,
    completionMessage?: string,
  ): Promise<boolean> {
    try {
      console.log(
        `💰 Finalizing blockchain contract ${blockchainContractId} to release escrow funds`,
      );

      // Add diagnostic checks before finalizing
      try {
        console.log("🔍 Running finalization diagnostics...");

        // Get contract details for diagnostics
        const contractDetails =
          await marketplaceService.getContractDetails(blockchainContractId);
        console.log("📋 Contract finalization diagnostics completed");

        // Check if funds can be released
        const canRelease =
          await marketplaceService.canReleaseFunds(blockchainContractId);
        if (!canRelease) {
          console.error("❌ Cannot finalize: fund release not allowed");
          return false;
        }

        console.log("✅ Finalization checks passed, proceeding...");
      } catch (diagnosticError: any) {
        console.error("❌ Finalization diagnostic failed:", diagnosticError);
        return false;
      }

      // According to documentation: releaseContractFunds can only be called by neederId
      // This releases funds to provider (minus 2.5% platform fee) and sets status to COMPLETED
      console.log(
        "💰 Calling releaseContractFunds (neederId releases funds to provider)",
      );
      const success = await marketplaceService.releaseContractFunds(contractId);

      if (success) {
        console.log(
          "✅ Funds successfully released to provider via releaseContractFunds",
        );
        console.log("📋 Contract status changed to COMPLETED on blockchain");
        console.log("💰 Provider received funds minus 2.5% platform fee");

        // Update blockchain status in database
        const supabase = getSupabaseBrowserClient();
        await supabase
          .from("contracts")
          .update({
            blockchain_completed_at: new Date().toISOString(),
            blockchain_status: "completed",
            escrow_released: true,
            escrow_released_at: new Date().toISOString(),
          })
          .eq("id", contractId);

        return true;
      } else {
        console.error(
          "❌ Failed to release contract funds via releaseContractFunds",
        );
        return false;
      }
    } catch (error) {
      console.error("Error finalizing blockchain contract:", error);
      return false;
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

      // Status will be determined after blockchain operation

      // If approved and blockchain is enabled, provider can now withdraw escrow
      if (approved && contractData.blockchain_address) {
        // Check if wallet is connected
        const isWalletConnected = await blockchainService.isWalletConnected();
        if (!isWalletConnected) {
          throw new Error(
            "Wallet not connected. Please connect your wallet to approve the contract.",
          );
        }

        // If blockchain is enabled, call completeAgreement on blockchain
        if (contractData.blockchain_address) {
          // Check if wallet is connected
          const isWalletConnected = await blockchainService.isWalletConnected();
          if (!isWalletConnected) {
            throw new Error(
              "Wallet not connected. Please connect your wallet to submit contract completion.",
            );
          }

          try {
            console.log(
              "📋 Calling completeAgreement for contract:",
              contractId,
            );

            // Save transaction state before blockchain call
            await this.saveTransactionState(contractId, "completion");

            // Import marketplaceService if not already imported
            const { marketplaceService } = await import(
              "@/lib/services/marketplace.service"
            );

            // Needer marks agreement as completed
            const success =
              await marketplaceService.completeAgreement(contractId);

            if (success) {
              console.log("✅ Agreement marked as completed on blockchain");
              console.log(
                "💡 Next step: needer should approve to enable fund withdrawal",
              );

              // Clear transaction state on successful completion
              await this.clearTransactionState(contractId, "completion");
            } else {
              console.error(
                "Failed to mark agreement as completed on blockchain",
              );
              throw new Error("Failed to complete agreement on blockchain");
            }
          } catch (blockchainError) {
            console.error(
              "Error marking agreement as completed on blockchain:",
              blockchainError,
            );
            throw blockchainError;
          }
        }

        try {
          console.log(
            "📋 Contract approved - provider can now withdraw escrow",
          );

          // The needer's approval allows the provider to withdraw
          // The actual withdrawal will be initiated by the provider
          await this.sendContractMessage(
            contractId,
            "✅ Contract has been approved! The provider can now withdraw the escrow funds from the smart contract.",
          );
        } catch (error: any) {
          console.error("Error notifying about approval:", error);
        }
      }

      // Determine final status based on approval and blockchain success
      const newStatus = approved ? "completed" : "active";

      // Update contract in database
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
        ? `✅ Contract has been approved and completed on the blockchain.${reviewComments ? "\n\n📝 Client comments: " + reviewComments : ""}${contractData.blockchain_address ? "\n\n💰 Provider can now withdraw the escrow funds from the smart contract." : ""}`
        : `❌ Contract has been rejected and returned for revision.${reviewComments ? "\n\n📝 Client comments: " + reviewComments : ""}`;

      await this.sendContractMessage(contractId, message);

      return { success: true };
    } catch (error) {
      console.error("Error reviewing contract:", error);
      throw error;
    }
  },

  // Withdraw escrow funds (for provider after needer approval)
  async withdrawEscrow(
    contractId: string,
  ): Promise<{ success: boolean; message?: string }> {
    const supabase = getSupabaseBrowserClient();

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error("No authenticated user");
      }

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
        throw new Error("Only the provider can withdraw escrow funds");
      }

      // Check if contract is completed
      if (contractData.status !== "completed") {
        throw new Error("Contract must be completed before withdrawing funds");
      }

      // Check if funds already withdrawn
      if (contractData.escrow_released) {
        return { success: true, message: "Escrow funds already withdrawn" };
      }

      console.log("💰 Provider withdrawing escrow for contract:", contractId);

      // Import marketplaceService if not already imported
      const { marketplaceService } = await import(
        "@/lib/services/marketplace.service"
      );

      // Save transaction state before blockchain call
      await this.saveTransactionState(contractId, "withdrawal");

      // Provider withdraws escrow
      const success = await marketplaceService.withdrawEscrow(contractId);

      if (success) {
        // Update contract status in database
        await supabase
          .from("contracts")
          .update({
            escrow_released: true,
            escrow_released_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", contractId);

        console.log("✅ Escrow funds withdrawn successfully");

        // Clear transaction state on successful withdrawal
        await this.clearTransactionState(contractId, "withdrawal");

        // Send notification
        await this.sendContractMessage(
          contractId,
          "💰 Escrow funds have been successfully withdrawn! Thank you for using our platform.",
        );

        return {
          success: true,
          message: "Escrow funds withdrawn successfully",
        };
      } else {
        throw new Error("Failed to withdraw escrow from blockchain");
      }
    } catch (error: any) {
      console.error("Error withdrawing escrow:", error);
      return {
        success: false,
        message: error.message || "Failed to withdraw escrow",
      };
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

      // Handle new workflow states
      let canStartWork = false;
      let canSubmitForReview = false;
      let canReview = false;

      // Check various status conditions
      if (!hasMilestones) {
        // For contracts without milestones
        if (contractData.status === "pending_funding") {
          // Contract is signed, waiting for funding
          canStartWork = false;
          canSubmitForReview = false;
          canReview = false;
        } else if (contractData.status === "pending_acceptance") {
          // Contract is funded, waiting for provider acceptance
          canStartWork = false;
          canSubmitForReview = false;
          canReview = false;
        } else if (contractData.status === "pending_start") {
          // Contract is accepted, provider can start work
          canStartWork = userRole === "provider";
          canSubmitForReview = false;
          canReview = false;
        } else if (contractData.status === "active") {
          // Work is in progress, provider can submit for review
          canStartWork = false;
          canSubmitForReview = userRole === "provider";
          canReview = false;
        } else if (contractData.status === "pending_review") {
          // Work submitted, needer can review
          canStartWork = false;
          canSubmitForReview = false;
          canReview = userRole === "needer";
        }
      }

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

  // Complete contract and release funds (for needer/client)
  async completeContractAndReleaseFunds(
    contractId: string,
  ): Promise<{ success: boolean; message?: string }> {
    const supabase = getSupabaseBrowserClient();

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error("No authenticated user");
      }

      // Get contract data
      const { data: contractData, error: contractError } = await supabase
        .from("contracts")
        .select("*")
        .eq("id", contractId)
        .single();

      if (contractError || !contractData) {
        throw new Error("Contract not found");
      }

      // Check if user is the needer (client)
      if (contractData.needer_id !== currentUser.id) {
        throw new Error(
          "Only the client can complete the contract and release funds",
        );
      }

      // Check if contract is funded
      if (!contractData.escrow_funded) {
        throw new Error("Contract must be funded before completion");
      }

      // Check if contract is already completed
      if (contractData.blockchain_status === "completed") {
        return { success: true, message: "Contract is already completed" };
      }

      // In new contract: completeAgreement marks as completed, then provider withdraws
      console.log("💰 Completing agreement for contract:", contractId);
      console.log("📋 Needer completes agreement, then provider can withdraw");

      // Add diagnostic checks before releasing funds
      try {
        console.log("🔍 Running pre-release diagnostics...");

        // Check if agreement exists and can be completed
        const agreementExists =
          await marketplaceService.contractExists(contractId);
        console.log("📋 Agreement existence check completed");

        if (!agreementExists) {
          throw new Error("Agreement does not exist on blockchain");
        }

        console.log(
          "✅ Pre-release checks passed, proceeding with fund release...",
        );
      } catch (diagnosticError: any) {
        console.error("❌ Pre-release diagnostic failed:", diagnosticError);
        throw new Error(`Diagnostic check failed: ${diagnosticError.message}`);
      }

      // Complete agreement (needer action), which allows provider to withdraw
      const releaseSuccess =
        await marketplaceService.releaseContractFunds(contractId);

      if (!releaseSuccess) {
        throw new Error("Failed to release funds on blockchain");
      }

      // Update contract status in database
      const { error: updateError } = await supabase
        .from("contracts")
        .update({
          blockchain_status: "completed",
          status: "completed",
          escrow_released: true,
          escrow_released_at: new Date().toISOString(),
          blockchain_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", contractId);

      if (updateError) {
        console.error("Error updating contract status:", updateError);
        // Don't throw - blockchain transaction was successful
      }

      // Send completion message according to new workflow
      await this.sendContractMessage(
        contractId,
        "✅ Agreement has been completed! The provider can now withdraw the escrow funds from the smart contract. Thank you for using our platform!",
      );

      return {
        success: true,
        message:
          "Contract completed successfully - funds released to provider via releaseContractFunds",
      };
    } catch (error: any) {
      console.error("Error completing contract and releasing funds:", error);
      return {
        success: false,
        message: error.message || "Failed to complete contract",
      };
    }
  },

  async getUserContractsForSmartject(
    userId: string,
    smartjectId: string,
  ): Promise<{
    activeContracts: ContractListType[];
    completedContracts: ContractListType[];
  }> {
    const supabase = getSupabaseBrowserClient();

    try {
      // First get match IDs for this smartject
      const { data: matchIds, error: matchError } = await supabase
        .from("matches")
        .select("id")
        .eq("smartject_id", smartjectId);

      if (matchError || !matchIds || matchIds.length === 0) {
        return { activeContracts: [], completedContracts: [] };
      }

      const matchIdList = matchIds.map((m) => m.id);

      // Get contracts where user is either provider or needer for those matches
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
        .in("match_id", matchIdList)
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
          matchId: contract.match_id,
          smartjectId: smartjectId,
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
      console.error("Error in getUserContractsForSmartject:", error);
      return { activeContracts: [], completedContracts: [] };
    }
  },

  // Save transaction state for recovery
  async saveTransactionState(
    contractId: string,
    transactionType: string,
    status: string,
    data?: any,
  ): Promise<void> {
    const supabase = getSupabaseBrowserClient();

    try {
      await supabase.from("contract_transactions").upsert(
        {
          contract_id: contractId,
          transaction_type: transactionType,
          status: status,
          transaction_data: data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "contract_id,transaction_type",
        },
      );

      console.log(`💾 Transaction state saved: ${transactionType} - ${status}`);
    } catch (error) {
      console.error("Error saving transaction state:", error);
    }
  },

  // Load pending transactions for recovery
  async loadPendingTransactions(contractId: string): Promise<any[]> {
    const supabase = getSupabaseBrowserClient();

    try {
      const { data, error } = await supabase
        .from("contract_transactions")
        .select("*")
        .eq("contract_id", contractId)
        .in("status", ["pending", "processing"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error loading pending transactions:", error);
      return [];
    }
  },

  // Clear transaction state
  async clearTransactionState(
    contractId: string,
    transactionType: string,
  ): Promise<void> {
    const supabase = getSupabaseBrowserClient();

    try {
      await supabase
        .from("contract_transactions")
        .delete()
        .eq("contract_id", contractId)
        .eq("transaction_type", transactionType);

      console.log(`🗑️ Transaction state cleared: ${transactionType}`);
    } catch (error) {
      console.error("Error clearing transaction state:", error);
    }
  },

  // Retry blockchain deployment for fully signed contracts
  async retryBlockchainDeployment(contractId: string): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    try {
      console.log(
        "🔄 Retrying blockchain deployment for contract:",
        contractId,
      );

      // Get contract data
      const { data: contractData, error: contractError } = await supabase
        .from("contracts")
        .select("*")
        .eq("id", contractId)
        .single();

      if (contractError || !contractData) {
        console.error("Contract not found:", contractError);
        return false;
      }

      // Check if contract is fully signed
      if (!contractData.provider_signed || !contractData.needer_signed) {
        console.error("Contract is not fully signed yet");
        return false;
      }

      // Check if contract already has blockchain address
      if (contractData.blockchain_address) {
        console.log(
          "Contract already has blockchain address:",
          contractData.blockchain_address,
        );
        return true;
      }

      // Get user wallet addresses
      const { data: providerWallet } = await supabase
        .from("users")
        .select("wallet_address")
        .eq("id", contractData.provider_id)
        .single();

      const { data: neederWallet } = await supabase
        .from("users")
        .select("wallet_address")
        .eq("id", contractData.needer_id)
        .single();

      if (!providerWallet?.wallet_address || !neederWallet?.wallet_address) {
        console.error("Wallet addresses not found for users");
        await this.sendContractMessage(
          contractId,
          "Unable to deploy smart contract: wallet addresses not found for both parties. Please ensure both parties have connected their wallets.",
        );
        return false;
      }

      console.log("🔍 Original contract budget:", contractData.budget);
      console.log("🔍 Contract budget type:", typeof contractData.budget);

      // Deploy escrow smart contract
      const deploymentAmount = await getDeploymentAmount(
        contractData.budget || 0,
      );

      console.log("💰 Calculated deployment amount:", deploymentAmount);
      console.log("🔍 Deployment params:", {
        contractId: contractId,
        clientAddress: neederWallet.wallet_address,
        providerAddress: providerWallet.wallet_address,
        originalBudget: contractData.budget,
        deploymentAmount: deploymentAmount,
      });

      // Save transaction state before deployment
      await this.saveTransactionState(contractId, "deployment", "processing", {
        deploymentAmount,
        clientAddress: neederWallet.wallet_address,
        providerAddress: providerWallet.wallet_address,
        originalBudget: contractData.budget,
      });

      const escrowAddress = await blockchainService.deployEscrowContract({
        contractId: contractId,
        clientAddress: neederWallet.wallet_address,
        providerAddress: providerWallet.wallet_address,
        amount: deploymentAmount,
      });

      console.log("escrowAddress", escrowAddress);

      if (escrowAddress) {
        console.log(`📝 Agreement created for contract ${contractId}`);

        // Update contract with blockchain address and funding info
        const { error: updateError } = await supabase
          .from("contracts")
          .update({
            blockchain_address: escrowAddress,
            blockchain_deployed_at: new Date().toISOString(),
            blockchain_status: "pending_acceptance",
            escrow_funded: true,
            escrow_funded_at: new Date().toISOString(),
            escrow_amount: parseFloat(deploymentAmount),
            status: "pending_acceptance",
            updated_at: new Date().toISOString(),
          })
          .eq("id", contractId);

        if (updateError) {
          console.error(
            "Error updating contract after deployment:",
            updateError,
          );
          throw new Error("Failed to update contract status after deployment");
        }

        console.log("Agreement created at marketplace:", escrowAddress);
        console.log("💾 Database updated with funding info:", {
          blockchain_status: "pending_acceptance",
          escrow_funded: true,
          escrow_amount: deploymentAmount,
        });

        // Clear transaction state on success
        await this.clearTransactionState(contractId, "deployment");

        // Send notification about smart contract deployment
        const deploymentMessage = `Smart contract agreement has been successfully created and funded! The agreement is now secured on the blockchain at address: ${escrowAddress}\n\nThe provider can now accept the agreement to begin work.`;
        await this.sendContractMessage(contractId, deploymentMessage);

        return true;
      } else {
        console.error("Failed to deploy smart contract");

        // Update transaction state to failed
        await this.saveTransactionState(contractId, "deployment", "failed");

        await this.sendContractMessage(
          contractId,
          "Smart contract deployment failed. Please try again or contact support if the issue persists.",
        );
        return false;
      }
    } catch (error) {
      console.error("Error in retryBlockchainDeployment:", error);

      // Update transaction state to failed
      await this.saveTransactionState(contractId, "deployment", "failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });

      await this.sendContractMessage(
        contractId,
        "Smart contract deployment failed due to an error. Please try again or contact support.",
      );
      return false;
    }
  },

  // Check for and recover from interrupted transactions
  async checkInterruptedTransactions(contractId: string): Promise<{
    hasInterrupted: boolean;
    transactionType?: string;
    message: string;
  }> {
    try {
      const pendingTransactions =
        await this.loadPendingTransactions(contractId);

      if (pendingTransactions.length === 0) {
        return {
          hasInterrupted: false,
          message: "No interrupted transactions found",
        };
      }

      const latestTransaction = pendingTransactions[0];
      console.log("🔄 Found interrupted transaction:", latestTransaction);

      // Check if the transaction actually succeeded on blockchain
      if (latestTransaction.transaction_type === "deployment") {
        const agreementExists =
          await blockchainService.agreementExists(contractId);

        if (agreementExists) {
          console.log(
            "✅ Found successful deployment on blockchain, recovering state...",
          );

          const recoveryResult = await this.recoverContractState(contractId);
          if (recoveryResult.recovered) {
            return {
              hasInterrupted: true,
              transactionType: "deployment",
              message:
                "Deployment transaction was interrupted but completed successfully on blockchain. State has been recovered.",
            };
          }
        }
      } else if (latestTransaction.transaction_type === "acceptance") {
        const isAccepted =
          await blockchainService.isAgreementAccepted(contractId);

        if (isAccepted) {
          console.log(
            "✅ Found successful acceptance on blockchain, recovering state...",
          );

          const recoveryResult = await this.recoverAcceptanceState(contractId);
          if (recoveryResult.recovered) {
            return {
              hasInterrupted: true,
              transactionType: "acceptance",
              message:
                "Acceptance transaction was interrupted but completed successfully on blockchain. State has been recovered.",
            };
          }
        }
      } else if (latestTransaction.transaction_type === "completion") {
        const isCompleted =
          await blockchainService.isAgreementCompleted(contractId);

        if (isCompleted) {
          console.log(
            "✅ Found successful completion on blockchain, recovering state...",
          );

          const recoveryResult = await this.recoverCompletionState(contractId);
          if (recoveryResult.recovered) {
            return {
              hasInterrupted: true,
              transactionType: "completion",
              message:
                "Completion transaction was interrupted but completed successfully on blockchain. State has been recovered.",
            };
          }
        }
      } else if (latestTransaction.transaction_type === "withdrawal") {
        const isWithdrawn =
          await blockchainService.isEscrowWithdrawn(contractId);

        if (isWithdrawn) {
          console.log(
            "✅ Found successful withdrawal on blockchain, recovering state...",
          );

          const recoveryResult = await this.recoverWithdrawalState(contractId);
          if (recoveryResult.recovered) {
            return {
              hasInterrupted: true,
              transactionType: "withdrawal",
              message:
                "Withdrawal transaction was interrupted but completed successfully on blockchain. State has been recovered.",
            };
          }
        }
      }

      return {
        hasInterrupted: true,
        transactionType: latestTransaction.transaction_type,
        message: `Found interrupted ${latestTransaction.transaction_type} transaction. You may need to retry the operation.`,
      };
    } catch (error) {
      console.error("Error checking interrupted transactions:", error);
      return {
        hasInterrupted: false,
        message: "Error checking for interrupted transactions",
      };
    }
  },

  // Recover contract state from blockchain (for interrupted deployments)
  async recoverContractState(contractId: string): Promise<{
    recovered: boolean;
    message: string;
  }> {
    const supabase = getSupabaseBrowserClient();

    try {
      console.log("🔄 Attempting to recover contract state for:", contractId);

      // Get current contract data
      const { data: contractData, error: contractError } = await supabase
        .from("contracts")
        .select("*")
        .eq("id", contractId)
        .single();

      if (contractError || !contractData) {
        return {
          recovered: false,
          message: "Contract not found in database",
        };
      }

      // Skip if contract already has blockchain address
      if (contractData.blockchain_address) {
        return {
          recovered: false,
          message: "Contract already has blockchain address",
        };
      }

      // Check if contract is fully signed
      if (!contractData.provider_signed || !contractData.needer_signed) {
        return {
          recovered: false,
          message: "Contract is not fully signed",
        };
      }

      // Check if agreement exists on blockchain
      const agreementExists =
        await blockchainService.agreementExists(contractId);
      if (!agreementExists) {
        return {
          recovered: false,
          message: "No agreement found on blockchain",
        };
      }

      console.log("✅ Found existing agreement on blockchain");

      // Get agreement details
      const escrowDetails =
        await blockchainService.getEscrowDetails(contractId);
      if (!escrowDetails) {
        return {
          recovered: false,
          message: "Could not retrieve agreement details",
        };
      }

      console.log(
        "💰 Agreement escrow amount:",
        escrowDetails.balance.toString(),
      );

      const marketplaceAddress = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS;
      // Update database with recovered blockchain information
      const { error: updateError } = await supabase
        .from("contracts")
        .update({
          blockchain_address: marketplaceAddress, // Marketplace address
          blockchain_deployed_at: new Date().toISOString(),
          blockchain_status:
            escrowDetails.state === 0
              ? "pending_acceptance"
              : escrowDetails.state === 1
                ? "accepted"
                : "completed",
          escrow_funded: escrowDetails.balance > BigInt(0),
          escrow_funded_at: new Date().toISOString(),
          escrow_amount: Number(escrowDetails.balance) / 1e18, // Convert from wei to ETH
          status:
            escrowDetails.state === 0
              ? "pending_acceptance"
              : escrowDetails.state === 1
                ? "pending_start"
                : "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", contractId);

      if (updateError) {
        console.error("Error updating contract state:", updateError);
        return {
          recovered: false,
          message: "Failed to update database",
        };
      }

      console.log("✅ Database synchronized with blockchain state");

      // Send recovery notification
      const statusMessage =
        escrowDetails.state === 0
          ? "🔄 Contract state recovered! Smart contract agreement found on blockchain and is ready for provider acceptance."
          : escrowDetails.state === 1
            ? "🔄 Contract state recovered! Smart contract agreement is already accepted and ready for work to begin."
            : "🔄 Contract state recovered! Smart contract agreement is completed.";

      await this.sendContractMessage(contractId, statusMessage);

      // Clear any pending transaction states on successful recovery
      await this.clearTransactionState(contractId, "deployment");

      return {
        recovered: true,
        message: "Contract state successfully recovered from blockchain",
      };
    } catch (error) {
      console.error("Error recovering contract state:", error);
      return {
        recovered: false,
        message: `Recovery failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },

  // Recover acceptance state from blockchain (for interrupted acceptance)
  async recoverAcceptanceState(contractId: string): Promise<{
    recovered: boolean;
    message: string;
  }> {
    const supabase = getSupabaseBrowserClient();

    try {
      console.log("🔄 Attempting to recover acceptance state for:", contractId);
      console.log("📋 Starting acceptance recovery process...");

      // Get current contract data
      const { data: contractData, error: contractError } = await supabase
        .from("contracts")
        .select("*")
        .eq("id", contractId)
        .single();

      if (contractError || !contractData) {
        console.log("❌ Contract not found in database:", contractError);
        return {
          recovered: false,
          message: "Contract not found in database",
        };
      }

      console.log("📋 Current contract data:");
      console.log("   - Status:", contractData.status);
      console.log("   - Blockchain status:", contractData.blockchain_status);
      console.log("   - Blockchain address:", contractData.blockchain_address);

      // Always check blockchain state regardless of current database status
      console.log(
        "📋 Checking blockchain state regardless of current DB status",
      );

      // Check if contract has blockchain address
      if (!contractData.blockchain_address) {
        return {
          recovered: false,
          message: "Contract is not deployed on blockchain",
        };
      }

      // Check if agreement is accepted on blockchain
      console.log("🔍 Checking if agreement is accepted on blockchain...");
      const isAccepted =
        await blockchainService.isAgreementAccepted(contractId);

      console.log(
        "📋 Agreement acceptance status from blockchain:",
        isAccepted,
      );
      if (!isAccepted) {
        console.log(
          "❌ Agreement is not accepted on blockchain, no recovery needed",
        );
        return {
          recovered: false,
          message: "Agreement is not accepted on blockchain",
        };
      }

      console.log("✅ Found accepted agreement on blockchain");
      console.log("💾 Updating database with acceptance information...");
      console.log("📋 Current contract status:", contractData.status);
      console.log(
        "📋 Current blockchain status:",
        contractData.blockchain_status,
      );

      // Update database with acceptance information
      const { error: updateError } = await supabase
        .from("contracts")
        .update({
          blockchain_status: "accepted",
          status: "pending_start",
          updated_at: new Date().toISOString(),
        })
        .eq("id", contractId);

      if (updateError) {
        console.error(
          "❌ Error updating contract acceptance state:",
          updateError,
        );
        return {
          recovered: false,
          message: "Failed to update database",
        };
      }

      console.log("✅ Database synchronized with blockchain acceptance state");
      console.log("📋 New status: pending_start");
      console.log("📋 New blockchain_status: accepted");

      // Send recovery notification
      await this.sendContractMessage(
        contractId,
        "🔄 Acceptance state recovered! Agreement has been accepted on blockchain and is ready for work to begin.",
      );

      // Clear any pending transaction states on successful recovery
      await this.clearTransactionState(contractId, "acceptance");

      return {
        recovered: true,
        message: "Acceptance state successfully recovered from blockchain",
      };
    } catch (error) {
      console.error("Error recovering acceptance state:", error);
      return {
        recovered: false,
        message: `Acceptance recovery failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },

  // Recover completion state from blockchain (for interrupted completion)
  async recoverCompletionState(contractId: string): Promise<{
    recovered: boolean;
    message: string;
  }> {
    const supabase = getSupabaseBrowserClient();

    try {
      console.log("🔄 Attempting to recover completion state for:", contractId);
      console.log("📋 Starting completion recovery process...");

      // Get current contract data
      const { data: contractData, error: contractError } = await supabase
        .from("contracts")
        .select("*")
        .eq("id", contractId)
        .single();

      if (contractError || !contractData) {
        console.log("❌ Contract not found in database:", contractError);
        return {
          recovered: false,
          message: "Contract not found in database",
        };
      }

      console.log("📋 Current contract data:");
      console.log("   - Status:", contractData.status);
      console.log("   - Blockchain status:", contractData.blockchain_status);
      console.log("   - Blockchain address:", contractData.blockchain_address);

      // Check if contract has blockchain address
      if (!contractData.blockchain_address) {
        return {
          recovered: false,
          message: "Contract is not deployed on blockchain",
        };
      }

      // Check if agreement is completed on blockchain
      console.log("🔍 Checking if agreement is completed on blockchain...");
      const isCompleted =
        await blockchainService.isAgreementCompleted(contractId);

      console.log(
        "📋 Agreement completion status from blockchain:",
        isCompleted,
      );
      if (!isCompleted) {
        console.log(
          "❌ Agreement is not completed on blockchain, no recovery needed",
        );
        return {
          recovered: false,
          message: "Agreement is not completed on blockchain",
        };
      }

      // Check if database already reflects completion
      if (
        contractData.status === "completed" &&
        contractData.blockchain_status === "completed"
      ) {
        console.log("ℹ️ Database already shows completed status");
        return {
          recovered: false,
          message: "Contract is already marked as completed",
        };
      }

      console.log("✅ Found completed agreement on blockchain");
      console.log("💾 Updating database with completion information...");

      // Update database with completion information
      const { error: updateError } = await supabase
        .from("contracts")
        .update({
          blockchain_status: "completed",
          status: "completed",
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", contractId);

      if (updateError) {
        console.error(
          "❌ Error updating contract completion state:",
          updateError,
        );
        return {
          recovered: false,
          message: "Failed to update database",
        };
      }

      console.log("✅ Database synchronized with blockchain completion state");
      console.log("📋 New status: completed");
      console.log("📋 New blockchain_status: completed");

      // Send recovery notification
      await this.sendContractMessage(
        contractId,
        "🔄 Completion state recovered! Agreement has been completed on blockchain and the provider can now withdraw escrow funds.",
      );

      // Clear any pending transaction states on successful recovery
      await this.clearTransactionState(contractId, "completion");

      return {
        recovered: true,
        message: "Completion state successfully recovered from blockchain",
      };
    } catch (error) {
      console.error("Error recovering completion state:", error);
      return {
        recovered: false,
        message: `Completion recovery failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },

  // Recover withdrawal state from blockchain (for interrupted withdrawal)
  async recoverWithdrawalState(contractId: string): Promise<{
    recovered: boolean;
    message: string;
  }> {
    const supabase = getSupabaseBrowserClient();

    try {
      console.log("🔄 Attempting to recover withdrawal state for:", contractId);
      console.log("📋 Starting withdrawal recovery process...");

      // Get current contract data
      const { data: contractData, error: contractError } = await supabase
        .from("contracts")
        .select("*")
        .eq("id", contractId)
        .single();

      if (contractError || !contractData) {
        console.log("❌ Contract not found in database:", contractError);
        return {
          recovered: false,
          message: "Contract not found in database",
        };
      }

      console.log("📋 Current contract data:");
      console.log("   - Status:", contractData.status);
      console.log("   - Blockchain status:", contractData.blockchain_status);
      console.log("   - Blockchain address:", contractData.blockchain_address);
      console.log("   - Escrow released:", contractData.escrow_released);

      // Check if contract has blockchain address
      if (!contractData.blockchain_address) {
        return {
          recovered: false,
          message: "Contract is not deployed on blockchain",
        };
      }

      // Check if escrow is withdrawn on blockchain
      console.log("🔍 Checking if escrow is withdrawn on blockchain...");
      const isWithdrawn = await blockchainService.isEscrowWithdrawn(contractId);

      console.log("📋 Escrow withdrawal status from blockchain:", isWithdrawn);
      if (!isWithdrawn) {
        console.log(
          "❌ Escrow is not withdrawn on blockchain, no recovery needed",
        );
        return {
          recovered: false,
          message: "Escrow is not withdrawn on blockchain",
        };
      }

      // Check if database already reflects withdrawal
      if (contractData.escrow_released) {
        console.log("ℹ️ Database already shows withdrawal status");
        return {
          recovered: false,
          message: "Escrow withdrawal is already recorded in database",
        };
      }

      console.log("✅ Found withdrawn escrow on blockchain");
      console.log("💾 Updating database with withdrawal information...");

      // Update database with withdrawal information
      const { error: updateError } = await supabase
        .from("contracts")
        .update({
          escrow_released: true,
          escrow_released_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", contractId);

      if (updateError) {
        console.error(
          "❌ Error updating contract withdrawal state:",
          updateError,
        );
        return {
          recovered: false,
          message: "Failed to update database",
        };
      }

      console.log("✅ Database synchronized with blockchain withdrawal state");
      console.log("📋 Escrow released: true");

      // Send recovery notification
      await this.sendContractMessage(
        contractId,
        "🔄 Withdrawal state recovered! Escrow funds have been successfully withdrawn from the blockchain.",
      );

      // Clear any pending transaction states on successful recovery
      await this.clearTransactionState(contractId, "withdrawal");

      return {
        recovered: true,
        message: "Withdrawal state successfully recovered from blockchain",
      };
    } catch (error) {
      console.error("Error recovering withdrawal state:", error);
      return {
        recovered: false,
        message: `Withdrawal recovery failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },

  // Update contract funding status after successful blockchain funding
  async updateContractFundingStatus(contractId: string): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    try {
      const { error } = await supabase
        .from("contracts")
        .update({
          escrow_funded: true,
          blockchain_status: "funded",
          escrow_funded_at: new Date().toISOString(),
        })
        .eq("id", contractId);

      if (error) {
        console.error("Error updating funding status:", error);
        return false;
      }

      console.log("✅ Contract funding status updated:", contractId);

      // Send notification about funding
      await this.sendContractMessage(
        contractId,
        "💰 Escrow contract has been funded! The funds are now securely held and work can begin.",
      );

      return true;
    } catch (error) {
      console.error("Error in updateContractFundingStatus:", error);
      return false;
    }
  },

  // Additional Marketplace Methods (keeping for backward compatibility)

  // Create marketplace proposal from existing contract
  async createMarketplaceProposal(
    contractId: string,
    proposalType: ProposalType = ProposalType.NEED,
  ): Promise<number | null> {
    const supabase = getSupabaseBrowserClient();

    try {
      // Get contract details
      const { data: contract } = await supabase
        .from("contracts")
        .select("*, proposals(*)")
        .eq("id", contractId)
        .single();

      if (!contract) {
        throw new Error("Contract not found");
      }

      const proposal = contract.proposals as any;

      // Create proposal on marketplace
      const txHash = await marketplaceService.createProposal(
        contractId,
        proposalType,
        contract.budget?.toString() || "0",
        proposal?.title || "Contract Work",
        proposal?.requirements || "See contract details",
      );

      if (txHash) {
        // In production, extract proposal ID from transaction events
        // For now, return a placeholder
        return 1;
      }

      return null;
    } catch (error) {
      console.error("Error creating marketplace proposal:", error);
      return null;
    }
  },

  // Accept marketplace proposal and create contract
  async acceptMarketplaceProposal(
    proposalId: number,
    counterpartyAddress: string,
    paymentAmount?: string,
  ): Promise<string | null> {
    try {
      const txHash = await marketplaceService.acceptProposal(
        proposalId,
        counterpartyAddress,
        paymentAmount,
      );

      return txHash;
    } catch (error) {
      console.error("Error accepting marketplace proposal:", error);
      return null;
    }
  },

  // Fund marketplace contract
  async fundMarketplaceContract(
    contractId: number,
    amount: string,
  ): Promise<boolean> {
    try {
      return await marketplaceService.fundContract(contractId, amount);
    } catch (error) {
      console.error("Error funding marketplace contract:", error);
      return false;
    }
  },

  // Complete marketplace contract
  async completeMarketplaceContract(
    contractId: number,
    deliverables: string,
  ): Promise<boolean> {
    try {
      return await marketplaceService.completeContract(
        contractId,
        deliverables,
      );
    } catch (error) {
      console.error("Error completing marketplace contract:", error);
      return false;
    }
  },

  // Get marketplace contract details
  async getMarketplaceContract(contractId: number) {
    try {
      const contract = await marketplaceService.getContract(contractId);
      return contract;
    } catch (error) {
      console.error("Error getting marketplace contract:", error);
      return null;
    }
  },

  // Sync database with marketplace contract
  async syncWithMarketplace(
    dbContractId: string,
    blockchainContractId: number,
  ): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    try {
      // Get blockchain contract details
      const blockchainContract =
        await marketplaceService.getContract(blockchainContractId);

      if (!blockchainContract) {
        console.error("Blockchain contract not found");
        return false;
      }

      // Map blockchain status to database status
      const statusMap: { [key: number]: string } = {
        [ContractStatus.PENDING]: "pending",
        [ContractStatus.ACTIVE]: "active",
        [ContractStatus.COMPLETED]: "completed",
        [ContractStatus.CANCELLED]: "cancelled",
        [ContractStatus.DISPUTED]: "disputed",
      };

      // Update database contract
      const { error } = await supabase
        .from("contracts")
        .update({
          blockchain_contract_status:
            statusMap[blockchainContract.status] || "unknown",
          escrow_amount: Number(blockchainContract.escrowAmount) / 1e18, // Convert from wei
          escrow_funded: blockchainContract.escrowAmount > BigInt(0),
          updated_at: new Date().toISOString(),
        })
        .eq("id", dbContractId);

      if (error) {
        console.error("Error updating contract:", error);
        return false;
      }

      console.log("✅ Contract synced with marketplace");
      return true;
    } catch (error) {
      console.error("Error syncing with marketplace:", error);
      return false;
    }
  },
};
