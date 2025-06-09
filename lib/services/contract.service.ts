import { getSupabaseBrowserClient } from "../supabase";
import type { ContractListType } from "../types";

export const contractService = {
  // Get contract data by match ID and proposal ID
  async getContractData(matchId: string, proposalId: string) {
    const supabase = getSupabaseBrowserClient();

    try {
      console.log("🔍 getContractData called with:", { matchId, proposalId });
      
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        console.error("No authenticated user");
        return null;
      }

      // First, try to get real contract data by match_id
      console.log("📋 Searching for existing contract with match_id:", matchId);
      const { data: realContractData, error: contractError } = await supabase
        .from("contracts")
        .select(`
          *,
          provider:users!provider_id(id, name, email),
          needer:users!needer_id(id, name, email),
          contract_deliverables(description),
          contract_milestones(name, description, percentage, amount, status)
        `)
        .eq("match_id", matchId)
        .single();

      // If we found a real contract, use it
      if (realContractData && !contractError) {
        console.log("✅ Found existing contract:", realContractData.id);
        // Get smartject title
        const { data: proposalData } = await supabase
          .from("proposals")
          .select("smartject_id, title")
          .eq("id", proposalId)
          .single();

        const { data: smartjectData } = await supabase
          .from("smartjects")
          .select("title")
          .eq("id", proposalData?.smartject_id)
          .single();

        const smartjectTitle = smartjectData?.title || proposalData?.title || "Unknown Project";

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
            timeline: contractService.calculateTimeline(realContractData.start_date, realContractData.end_date),
            startDate: realContractData.start_date,
            endDate: realContractData.end_date,
            paymentSchedule: (realContractData.contract_milestones as any)?.length > 0 
              ? (realContractData.contract_milestones as any).map((m: any) => ({
                  milestone: m.name,
                  percentage: m.percentage,
                  amount: m.amount,
                }))
              : [
                  {
                    milestone: "Project Start",
                    percentage: 50,
                    amount: "50% of total budget",
                  },
                  {
                    milestone: "Project Completion",
                    percentage: 50,
                    amount: "50% of total budget",
                  },
                ],
            scope: realContractData.scope,
            deliverables: (realContractData.contract_deliverables as any)?.map((d: any) => d.description) || [],
          },
          status: {
            providerSigned: realContractData.provider_signed || false,
            neederSigned: realContractData.needer_signed || false,
            contractActive: realContractData.status === "active",
          },
          exclusivity: {
            clause: "Upon signing this contract, both parties agree to an exclusivity period for this specific smartject implementation. The provider agrees not to offer similar implementation services for this smartject to other parties, and the needer agrees not to engage other providers for this smartject implementation, for the duration of this contract plus 30 days after completion.",
            duration: `Contract period + 30 days (until ${new Date(realContractData.exclusivity_ends as string).toLocaleDateString()})`,
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
        .select("*")
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
        deliverables: (proposalData.deliverables as string)?.split('\n').filter(d => d.trim()) || ["Project completion"],
        milestones: [
          {
            name: "Project Start",
            description: "Initial setup and project kickoff",
            percentage: 50,
            amount: "50% of total budget",
          },
          {
            name: "Project Completion",
            description: "Final delivery and project completion",
            percentage: 50,
            amount: "50% of total budget",
          },
        ]
      };

      // Create the real contract
      console.log("🏗️ Creating new contract with terms:", contractTerms);
      const newContractId = await contractService.createContractFromNegotiation(
        matchId,
        proposalId,
        matchInfo.provider_id,
        matchInfo.needer_id,
        contractTerms
      );

      if (!newContractId) {
        console.error("❌ Failed to create contract");
        return null;
      }
      
      console.log("✅ Created new contract with ID:", newContractId);

      // Now fetch the newly created contract data
      const { data: newContractData, error: newContractError } = await supabase
        .from("contracts")
        .select(`
          *,
          provider:users!provider_id(id, name, email),
          needer:users!needer_id(id, name, email),
          contract_deliverables(description),
          contract_milestones(name, description, percentage, amount, status)
        `)
        .eq("id", newContractId)
        .single();

      if (newContractError || !newContractData) {
        console.error("Error fetching newly created contract:", newContractError);
        return null;
      }

      // Get smartject title
      const { data: smartjectData } = await supabase
        .from("smartjects")
        .select("title")
        .eq("id", matchInfo.smartject_id)
        .single();

      const smartjectTitle = smartjectData?.title || proposalData.title || "Unknown Project";

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
          timeline: contractService.calculateTimeline(newContractData.start_date, newContractData.end_date),
          startDate: newContractData.start_date,
          endDate: newContractData.end_date,
          paymentSchedule: (newContractData.contract_milestones as any)?.length > 0 
            ? (newContractData.contract_milestones as any).map((m: any) => ({
                milestone: m.name,
                percentage: m.percentage,
                amount: m.amount,
              }))
            : contractTerms.milestones.map(m => ({
                milestone: m.name,
                percentage: m.percentage,
                amount: m.amount,
              })),
          scope: newContractData.scope,
          deliverables: (newContractData.contract_deliverables as any)?.map((d: any) => d.description) || contractTerms.deliverables,
        },
        status: {
          providerSigned: newContractData.provider_signed || false,
          neederSigned: newContractData.needer_signed || false,
          contractActive: newContractData.status === "active",
        },
        exclusivity: {
          clause: "Upon signing this contract, both parties agree to an exclusivity period for this specific smartject implementation. The provider agrees not to offer similar implementation services for this smartject to other parties, and the needer agrees not to engage other providers for this smartject implementation, for the duration of this contract plus 30 days after completion.",
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

  // Helper function to calculate timeline
  calculateTimeline(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMonths >= 1) {
      const remainingDays = diffDays % 30;
      if (remainingDays === 0) {
        return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
      } else {
        return `${diffMonths}.${Math.floor((remainingDays / 30) * 10)} months`;
      }
    } else if (diffWeeks >= 1) {
      return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''}`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }
  },

  // Sign contract by updating the appropriate signing status in the database
  async signContract(contractId: string, userId: string, isProvider: boolean): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    try {
      // Determine which column to update based on user role
      const updateColumn = isProvider ? 'provider_signed' : 'needer_signed';
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

      console.log(`Contract ${contractId} signed by user ${userId} as ${isProvider ? 'provider' : 'needer'}`);
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

      const isSigned = contractData.provider_signed && contractData.needer_signed;

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

  getContractNavigationUrl(matchId: string, proposalId: string, contractId: string, isSigned: boolean): string {
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
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        console.error("No authenticated user");
        return null;
      }

      // Get contract data with related information
      const { data: contractData, error: contractError } = await supabase
        .from("contracts")
        .select(`
          *,
          provider:users!contracts_provider_id_fkey(id, name, email),
          needer:users!contracts_needer_id_fkey(id, name, email),
          contract_deliverables(id, description),
          contract_milestones(id, name, description, percentage, amount, status, completed_date)
        `)
        .eq("id", contractId)
        .single();

      if (contractError || !contractData) {
        console.error("Error fetching contract:", contractError);
        return null;
      }

      // Check if user has access to this contract
      if (contractData.provider_id !== currentUser.id && contractData.needer_id !== currentUser.id) {
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

      // Get milestone comments
      const { data: milestoneComments } = await supabase
        .from("contract_milestone_comments")
        .select(`
          *,
          user:users(name)
        `)
        .in("milestone_id", (contractData.contract_milestones as any)?.map((m: any) => m.id) || []);

      // Transform milestones data
      const paymentSchedule = (contractData.contract_milestones as any)?.map((milestone: any) => ({
        id: milestone.id,
        name: milestone.name,
        description: milestone.description,
        percentage: milestone.percentage,
        amount: milestone.amount,
        status: milestone.status,
        completedDate: milestone.completed_date,
        deliverables: [`${milestone.name} deliverables`], // Mock deliverables for now
        comments: milestoneComments?.filter(c => c.milestone_id === milestone.id).map(c => ({
          user: (c.user as any)?.name || "Unknown User",
          date: c.created_at,
          content: c.content
        })) || []
      })) || [
        {
          id: "milestone-1",
          name: "Project Kickoff",
          description: "Initial setup, requirements gathering, and project planning",
          percentage: 30,
          amount: "30% of total budget",
          status: "pending",
          deliverables: ["Project plan", "Requirements document"],
          comments: []
        },
        {
          id: "milestone-2", 
          name: "Midpoint Delivery",
          description: "Core development and implementation",
          percentage: 40,
          amount: "40% of total budget", 
          status: "pending",
          deliverables: ["Core functionality", "Testing results"],
          comments: []
        },
        {
          id: "milestone-3",
          name: "Final Delivery", 
          description: "Complete system with documentation and training",
          percentage: 30,
          amount: "30% of total budget",
          status: "pending", 
          deliverables: ["Complete system", "Documentation", "Training materials"],
          comments: []
        }
      ];

      // Determine user role
      const isProvider = currentUser.id === contractData.provider_id;
      const role = isProvider ? "provider" : "needer";

      // Calculate status
      let status = contractData.status;
      if (contractData.provider_signed && contractData.needer_signed && status === "pending_start") {
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
        deliverables: (contractData.contract_deliverables as any)?.map((d: any) => d.description) || [
          "Project implementation",
          "Documentation and training",
          "Testing and quality assurance"
        ],
        paymentSchedule: paymentSchedule,
        documents: await (async () => {
          const { data: contractDocuments } = await supabase
            .from("contract_documents")
            .select("*")
            .eq("contract_id", contractData.id as string);
          
          return contractDocuments?.map(doc => ({
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
            }
          ];
        })(),
        activity: await (async () => {
          const { data: contractActivity } = await supabase
            .from("contract_activities")
            .select(`
              *,
              user:users(name)
            `)
            .eq("contract_id", contractData.id as string)
            .order("created_at", { ascending: false });
          
          return contractActivity?.map(activity => ({
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
            }
          ];
        })(),
        messages: await (async () => {
          const { data: contractMessages } = await supabase
            .from("contract_messages")
            .select(`
              *,
              user:users(name)
            `)
            .eq("contract_id", contractData.id as string)
            .order("created_at", { ascending: true });
          
          return contractMessages?.map(message => ({
            id: message.id,
            sender: (message.user as any)?.name || "Unknown User",
            content: message.content,
            timestamp: message.created_at,
          })) || [
            {
              id: "msg-1",
              sender: isProvider ? (contractData.needer as any)?.name : (contractData.provider as any)?.name,
              content: "Looking forward to working together on this project!",
              timestamp: contractData.created_at,
            }
          ];
        })(),
        documentVersions: await (async () => {
          const { data: docVersions } = await supabase
            .from("document_versions")
            .select(`
              *,
              author:users(name),
              document:contract_documents!inner(contract_id)
            `)
            .eq("document.contract_id", contractData.id as string)
            .order("version_number", { ascending: false });
          
          return docVersions?.map(version => ({
            id: version.id,
            versionNumber: version.version_number,
            date: version.created_at,
            author: (version.author as any)?.name || "System",
            changes: Array.isArray(version.changes) ? version.changes : ["Version created"],
          })) || [
            {
              id: "version-1",
              versionNumber: 1,
              date: contractData.created_at,
              author: "System",
              changes: ["Initial contract creation"],
            }
          ];
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
      milestones: Array<{
        name: string;
        description: string;
        percentage: number;
        amount: string;
      }>;
    }
  ): Promise<string | null> {
    const supabase = getSupabaseBrowserClient();

    try {
      console.log("🏗️ createContractFromNegotiation called with:", { matchId, proposalId, providerId, neederId, terms });
      // Verify match exists and get provider/needer IDs from it
      console.log("📋 Fetching match data for matchId:", matchId);
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
        title: `Contract for Proposal ${proposalId}`,
        budget: terms.budget,
        scope: terms.scope,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        exclusivity_ends: exclusivityEndDate.toISOString(),
        status: 'pending_start'
      });
      
      const { data: contractData, error: contractError } = await supabase
        .from("contracts")
        .insert({
          match_id: matchId,
          provider_id: finalProviderId,
          needer_id: finalNeederId,
          proposal_id: proposalId,
          title: `Contract for Proposal ${proposalId}`,
          budget: terms.budget,
          scope: terms.scope,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          exclusivity_ends: exclusivityEndDate.toISOString(),
          status: 'pending_start'
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
        const deliverableInserts = terms.deliverables.map(deliverable => ({
          contract_id: contractId,
          description: deliverable
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

      // Create contract milestones
      if (terms.milestones.length > 0) {
        console.log("🎯 Creating milestones:", terms.milestones);
        const milestoneInserts = terms.milestones.map((milestone, index) => {
          // Calculate due date for each milestone
          const totalMilestones = terms.milestones.length;
          const milestoneInterval = (endDate.getTime() - startDate.getTime()) / totalMilestones;
          const dueDate = new Date(startDate.getTime() + (milestoneInterval * (index + 1)));
          
          return {
            contract_id: contractId,
            name: milestone.name,
            description: milestone.description,
            percentage: milestone.percentage,
            amount: milestone.amount,
            due_date: dueDate.toISOString(),
            status: 'pending'
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
        .select(`
          *,
          provider:users!contracts_provider_id_fkey(id, name, email),
          needer:users!contracts_needer_id_fkey(id, name, email)
        `)
        .or(`provider_id.eq.${userId},needer_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (contractsError) {
        console.error("Error fetching contracts:", contractsError);
        return { activeContracts: [], completedContracts: [] };
      }

      const contracts = contractsData || [];

      // Transform contracts to match the expected format
      const transformedContracts = contracts.map(contract => {
        const isProvider = contract.provider_id === userId;
        const otherParty = isProvider ? contract.needer?.name : contract.provider?.name;
        const role = isProvider ? "provider" : "needer";

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
          nextMilestone: contract.status === "active" ? "In Progress" : contract.status === "pending_start" ? "Project Kickoff" : "N/A",
          nextMilestoneDate: contract.status === "pending_start" ? contract.start_date : contract.end_date,
          finalMilestone: contract.status === "completed" ? "Final Delivery" : undefined,
          completionDate: contract.status === "completed" ? contract.end_date : undefined,
          exclusivityEnds: contract.exclusivity_ends,
        };
      });

      // Separate active and completed contracts
      const activeContracts = transformedContracts.filter(contract => 
        contract.status === "active" || contract.status === "pending_start"
      );
      
      const completedContracts = transformedContracts.filter(contract => 
        contract.status === "completed"
      );

      return {
        activeContracts,
        completedContracts
      };
    } catch (error) {
      console.error("Error in getUserContracts:", error);
      return { activeContracts: [], completedContracts: [] };
    }
  },
};
