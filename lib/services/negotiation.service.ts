import { getSupabaseBrowserClient } from "../supabase";

export const negotiationService = {
  // Get negotiation data for the negotiate page
  async getNegotiationData(matchId: string, proposalId: string, otherUserId?: string) {
    const supabase = getSupabaseBrowserClient();

    try {
      // Handle "new" matchId case
      const isNewMatch = matchId === "new";
      
      // Get the proposal with related data
      const { data: proposalData, error: proposalError } = await supabase
        .from("proposals")
        .select(`
          *,
          smartjects (
            id,
            title
          ),
          users (
            id,
            name,
            avatar_url
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
          )
        `)
        .eq("id", proposalId)
        .single();
        
      if (proposalError) {
        console.error("Error fetching proposal data:", proposalError);
        return null;
      }

      // Determine provider and needer based on proposal type
      let providerId: string;
      let neederId: string;
      
      if (proposalData.type === "provide") {
        // Proposal owner is providing the service
        providerId = proposalData.user_id as string;
        neederId = ""; // Will be determined from messages
      } else {
        // Proposal owner needs the service  
        neederId = proposalData.user_id as string;
        providerId = ""; // Will be determined from messages
      }

      // Get negotiation messages to find the other party
      const { data: messagesData, error: messagesError } = await supabase
        .from("negotiation_messages")
        .select(`
          id,
          sender_id,
          content,
          is_counter_offer,
          counter_offer_budget,
          counter_offer_timeline,
          created_at,
          users (
            name
          )
        `)
        .eq("proposal_id", proposalId)
        .order("created_at", { ascending: true });

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
      }

      // Determine the other party ID
      let otherPartyId: string | null = null;
      
      if (otherUserId) {
        // Other party ID provided explicitly (for new negotiations)
        otherPartyId = otherUserId;
      } else {
        // Find the other party from messages (for existing negotiations)
        const otherPartyMessage = messagesData?.find(msg => msg.sender_id !== proposalData.user_id);
        otherPartyId = otherPartyMessage?.sender_id as string || null;
      }

      // Handle case where no other party is determined yet (new negotiation)
      let providerData = null;
      let neederData = null;

      if (otherPartyId) {
        // Complete the provider/needer determination
        if (proposalData.type === "provide") {
          neederId = otherPartyId as string;
        } else {
          providerId = otherPartyId as string;
        }

        // Get provider and needer user data
        const { data: pData, error: providerError } = await supabase
          .from("users")
          .select("id, name, avatar_url")
          .eq("id", providerId)
          .single();

        const { data: nData, error: neederError } = await supabase
          .from("users")
          .select("id, name, avatar_url")
          .eq("id", neederId)
          .single();

        if (providerError) {
          console.error("Error fetching provider data:", providerError);
        }

        if (neederError) {
          console.error("Error fetching needer data:", neederError);
        }

        providerData = pData;
        neederData = nData;
      } else {
        // New negotiation - create placeholder data based on proposal owner
        const proposalOwnerData = {
          id: proposalData.user_id as string,
          name: (proposalData.users as any)?.name || "Unknown User",
          avatar_url: (proposalData.users as any)?.avatar_url || ""
        };

        if (proposalData.type === "provide") {
          // Proposal owner is provider, no needer yet
          providerId = proposalData.user_id as string;
          providerData = proposalOwnerData;
          neederId = "";
          neederData = null;
        } else {
          // Proposal owner is needer, no provider yet
          neederId = proposalData.user_id as string;
          neederData = proposalOwnerData;
          providerId = "";
          providerData = null;
        }
      }

      // Get negotiation files
      const { data: filesData, error: filesError } = await supabase
        .from("negotiation_files")
        .select("*")
        .eq("negotiation_id", proposalId)
        .order("created_at", { ascending: false });

      if (filesError) {
        console.error("Error fetching files:", filesError);
      }

      // Transform the data to match the expected format
      const negotiationData = {
        matchId: isNewMatch ? "" : (matchId as string),
        proposalId: proposalId as string,
        smartjectTitle: (proposalData.smartjects as any)?.title || "",
        provider: {
          id: (providerData?.id as string) || "",
          name: (providerData?.name as string) || "TBD",
          avatar: (providerData?.avatar_url as string) || "",
          rating: 4.8 as number, // Default rating - you may want to add this to users table
        },
        needer: {
          id: (neederData?.id as string) || "",
          name: (neederData?.name as string) || "TBD",
          avatar: (neederData?.avatar_url as string) || "",
          rating: 4.6 as number, // Default rating - you may want to add this to users table
        },
        proposalAuthor: {
          id: (proposalData.user_id as string) || "",
          name: (proposalData.users as any)?.name || "Unknown User",
          avatar: (proposalData.users as any)?.avatar_url || "",
          rating: 4.5 as number, // Default rating - you may want to add this to users table
        },
        currentProposal: {
          budget: (proposalData.budget as string) || "",
          timeline: (proposalData.timeline as string) || "",
          scope: (proposalData.scope as string) || "",
          deliverables: proposalData.deliverables ? 
            (proposalData.deliverables as string).split('\n').filter((d: string) => d.trim()) : [] as string[],
        },
        milestones: (proposalData.proposal_milestones as any)?.map((milestone: any) => ({
          id: (milestone.id as string) || "",
          name: (milestone.name as string) || "",
          description: (milestone.description as string) || "",
          percentage: (milestone.percentage as number) || 0,
          amount: (milestone.amount as string) || "",
          deliverables: milestone.proposal_deliverables?.map((deliverable: any) => ({
            id: (deliverable.id as string) || "",
            description: (deliverable.description as string) || "",
            completed: (deliverable.completed as boolean) || false,
          })) || [],
        })) || [],
        messages: messagesData?.map((message: any) => ({
          id: (message.id as string) || "",
          sender: (providerId && message.sender_id === providerId ? "provider" : "needer") as "provider" | "needer",
          senderName: (message.users?.name as string) || "",
          content: (message.content as string) || "",
          timestamp: (message.created_at as string) || "",
          isCounterOffer: (message.is_counter_offer as boolean) || false,
          counterOffer: message.is_counter_offer ? {
            budget: (message.counter_offer_budget as string) || "",
            timeline: (message.counter_offer_timeline as string) || "",
          } : undefined,
        })) || [],
        files: filesData?.map((file: any) => ({
          id: file.id,
          file_name: file.file_name,
          file_url: file.file_url,
          file_type: file.file_type,
          file_size: file.file_size,
          uploaded_by: file.uploaded_by,
          created_at: file.created_at
        })) || [],
      };

      return negotiationData;
    } catch (error) {
      console.error("Error in getNegotiationData:", error);
      return null;
    }
  },

  // Get negotiation data with explicit other user ID (for new negotiations)
  async getNegotiationDataWithOtherUser(matchId: string, proposalId: string, otherUserId: string) {
    return this.getNegotiationData(matchId, proposalId, otherUserId);
  },

  // Add a negotiation message
  async addNegotiationMessage(
    proposalId: string,
    senderId: string,
    content: string,
    isCounterOffer: boolean = false,
    counterOfferBudget?: string,
    counterOfferTimeline?: string
  ): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if(!user){
       console.error("Error user:", userError);
      return false;
    }

    try {
      // Get proposal data to determine who should be provider/needer
      const { data: proposalData, error: proposalError } = await supabase
        .from("proposals")
        .select("id, user_id, smartject_id, type")
        .eq("id", proposalId)
        .single();

      if (proposalError || !proposalData) {
        console.error("Error fetching proposal for match creation:", proposalError);
        return false;
      }

      // Check if this is the first message between these two users
      const { data: existingMessages, error: messagesError } = await supabase
        .from("negotiation_messages")
        .select("sender_id")
        .eq("proposal_id", proposalId)
        .in("sender_id", [user.id, proposalData.user_id]);

      if (messagesError) {
        console.error("Error checking existing messages:", messagesError);
        return false;
      }

      // If this is the first message from the non-proposal-owner, create/update match
      const isFirstMessage = !existingMessages || existingMessages.length === 0;
      const isProposalOwner = user.id === proposalData.user_id;
      
      if (isFirstMessage && !isProposalOwner) {
        // This is the first response to the proposal - need to create/update match
        let providerId: string;
        let neederId: string;

        if (proposalData.type === "provide") {
          // Proposal owner provides service, current user needs it
          providerId = proposalData.user_id as string;
          neederId = user.id;
        } else {
          // Proposal owner needs service, current user provides it
          neederId = proposalData.user_id as string;
          providerId = user.id;
        }

        // Check if match already exists
        const { data: existingMatch, error: matchError } = await supabase
          .from("matches")
          .select("id")
          .eq("smartject_id", proposalData.smartject_id as string)
          .eq("provider_id", providerId)
          .eq("needer_id", neederId)
          .maybeSingle();

        if (matchError) {
          console.error("Error checking existing match:", matchError);
          return false;
        }

        // Create match if it doesn't exist
        if (!existingMatch) {
          const { error: createMatchError } = await supabase
            .from("matches")
            .insert({
              smartject_id: proposalData.smartject_id as string,
              provider_id: providerId,
              needer_id: neederId,
              status: 'negotiating'
            });

          if (createMatchError) {
            console.error("Error creating match:", createMatchError);
            return false;
          }
        }
      }
    } catch (error) {
      console.error("Error in match creation logic:", error);
      // Continue with message sending even if match creation fails
    }

    // Add the negotiation message
    const { error } = await supabase
      .from("negotiation_messages")
      .insert({
        proposal_id: proposalId,
        sender_id: user.id,
        content,
        is_counter_offer: isCounterOffer,
        counter_offer_budget: counterOfferBudget,
        counter_offer_timeline: counterOfferTimeline,
      });

    if (error) {
      console.error("Error adding negotiation message:", error);
      return false;
    }

    return true;
  },

  async updateNegotiationStatus(matchId: string, status: 'new' | 'negotiating' | 'terms_agreed' | 'contract_created' | 'cancelled'): Promise<boolean> {
    const supabase = getSupabaseBrowserClient();

    try {
      const { error } = await supabase
        .from("matches")
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq("id", matchId);

      if (error) {
        console.error("Error updating negotiation status:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in updateNegotiationStatus:", error);
      return false;
    }
  },

  // Get or create match by proposal and other user
  async getOrCreateMatchByProposal(proposalId: string, otherUserId: string): Promise<string | null> {
    const supabase = getSupabaseBrowserClient();

    try {
      // Get proposal data to determine roles
      const { data: proposalData, error: proposalError } = await supabase
        .from("proposals")
        .select("id, user_id, smartject_id, type")
        .eq("id", proposalId)
        .single();

      if (proposalError || !proposalData) {
        console.error("Error fetching proposal:", proposalError);
        return null;
      }

      // Determine provider and needer based on proposal type
      let providerId: string;
      let neederId: string;

      if (proposalData.type === "provide") {
        // Proposal owner provides service
        providerId = proposalData.user_id as string;
        neederId = otherUserId;
      } else {
        // Proposal owner needs service
        neederId = proposalData.user_id as string;
        providerId = otherUserId;
      }

      // Check if match already exists
      const { data: existingMatch, error: matchError } = await supabase
        .from("matches")
        .select("id")
        .eq("smartject_id", proposalData.smartject_id as string)
        .eq("provider_id", providerId)
        .eq("needer_id", neederId)
        .maybeSingle();

      if (matchError) {
        console.error("Error checking existing match:", matchError);
        return null;
      }

      // Return existing match ID if found
      if (existingMatch) {
        return existingMatch.id as string;
      }

      // Create new match
      const { data: newMatch, error: createError } = await supabase
        .from("matches")
        .insert({
          smartject_id: proposalData.smartject_id as string,
          provider_id: providerId,
          needer_id: neederId,
          status: 'new'
        })
        .select("id")
        .single();

      if (createError || !newMatch) {
        console.error("Error creating match:", createError);
        return null;
      }

      return newMatch.id as string;
    } catch (error) {
      console.error("Error in getOrCreateMatchByProposal:", error);
      return null;
    }
  },
};