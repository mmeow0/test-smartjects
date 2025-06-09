import { getSupabaseBrowserClient } from "../supabase";

export const negotiationService = {
  // Get negotiation data for the negotiate page
  async getNegotiationData(matchId: string, proposalId: string) {
    const supabase = getSupabaseBrowserClient();

    try {
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

      // Get smartject owner (needer) info
      const { data: neederData, error: neederError } = await supabase
        .from("users")
        .select("id, name, avatar_url")
        .eq("id", proposalData.user_id)
        .single();

      if (neederError) {
        console.error("Error fetching needer data:", neederError);
      }

      // Get negotiation messages
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
        matchId: matchId as string,
        proposalId: proposalId as string,
        smartjectTitle: (proposalData.smartjects?.title as string) || "",
        provider: {
          id: (proposalData.users?.id as string) || "",
          name: (proposalData.users?.name as string) || "",
          avatar: (proposalData.users?.avatar_url as string) || "",
          rating: 4.8 as number, // Default rating - you may want to add this to users table
        },
        needer: {
          id: (neederData?.id as string) || "",
          name: (neederData?.name as string) || "",
          avatar: (neederData?.avatar_url as string) || "",
          rating: 4.6 as number, // Default rating - you may want to add this to users table
        },
        currentProposal: {
          budget: (proposalData.budget as string) || "",
          timeline: (proposalData.timeline as string) || "",
          scope: (proposalData.scope as string) || "",
          deliverables: proposalData.deliverables ? 
            (proposalData.deliverables as string).split('\n').filter((d: string) => d.trim()) : [] as string[],
        },
        milestones: proposalData.proposal_milestones?.map((milestone: any) => ({
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
          sender: (message.sender_id === proposalData.user_id ? "provider" : "needer") as "provider" | "needer",
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
};