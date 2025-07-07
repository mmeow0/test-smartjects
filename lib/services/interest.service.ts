import { getSupabaseBrowserClient } from "@/lib/supabase";
import { notificationService } from "@/lib/services/notification.service";

export interface InterestExpression {
  id: string;
  proposalId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
}

class InterestService {
  private supabase = getSupabaseBrowserClient();

  /**
   * Express interest in a proposal
   */
  async expressInterest(
    proposalId: string,
    userId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user already expressed interest
      const { data: existingInterest } = await this.supabase
        .from("negotiation_messages")
        .select("id")
        .eq("proposal_id", proposalId)
        .eq("sender_id", userId)
        .eq("message_type", "interest_expression")
        .single();

      if (existingInterest) {
        return {
          success: false,
          error: "You have already expressed interest in this proposal",
        };
      }

      // Get proposal details and user details for notification
      const [proposalResult, userResult] = await Promise.all([
        this.supabase
          .from("proposals")
          .select("id, title, user_id")
          .eq("id", proposalId)
          .single(),
        this.supabase
          .from("users")
          .select("id, name")
          .eq("id", userId)
          .single(),
      ]);

      if (proposalResult.error || !proposalResult.data) {
        console.error("Error fetching proposal:", proposalResult.error);
        return { success: false, error: "Proposal not found" };
      }

      if (userResult.error || !userResult.data) {
        console.error("Error fetching user:", userResult.error);
        return { success: false, error: "User not found" };
      }

      const proposal = proposalResult.data;
      const user = userResult.data;

      // Create interest expression record
      const { error } = await this.supabase
        .from("negotiation_messages")
        .insert({
          proposal_id: proposalId,
          sender_id: userId,
          content: "", // Empty content for interest expressions
          message_type: "interest_expression",
          is_counter_offer: false,
        });

      if (error) {
        console.error("Error expressing interest:", error);
        return { success: false, error: "Failed to accept proposal" };
      }

      // Create notification for proposal owner
      if (proposal.user_id !== userId) {
        await notificationService.createProposalInterestNotification(
          proposal.id,
          proposal.title,
          proposal.user_id,
          user.id,
          user.name,
        );
      }

      return { success: true };
    } catch (error) {
      console.error("Error in expressInterest:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Check if user has expressed interest in a proposal
   */
  async hasExpressedInterest(
    proposalId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from("negotiation_messages")
        .select("id")
        .eq("proposal_id", proposalId)
        .eq("sender_id", userId)
        .eq("message_type", "interest_expression")
        .single();

      return !!data && !error;
    } catch (error) {
      console.error("Error checking interest:", error);
      return false;
    }
  }

  /**
   * Get all users who expressed interest in a proposal
   */
  async getInterestedUsers(proposalId: string): Promise<InterestExpression[]> {
    try {
      const { data, error } = await this.supabase
        .from("negotiation_messages")
        .select(
          `
          id,
          proposal_id,
          sender_id,
          created_at,
          users!negotiation_messages_sender_id_fkey (
            name,
            avatar_url
          )
        `,
        )
        .eq("proposal_id", proposalId)
        .eq("message_type", "interest_expression")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching interested users:", error);
        return [];
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        proposalId: item.proposal_id,
        userId: item.sender_id,
        userName: item.users?.name || "Unknown User",
        userAvatar: item.users?.avatar_url,
        createdAt: item.created_at,
      }));
    } catch (error) {
      console.error("Error in getInterestedUsers:", error);
      return [];
    }
  }

  /**
   * Remove interest expression (if user wants to withdraw)
   */
  async removeInterest(
    proposalId: string,
    userId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from("negotiation_messages")
        .delete()
        .eq("proposal_id", proposalId)
        .eq("sender_id", userId)
        .eq("message_type", "interest_expression");

      if (error) {
        console.error("Error removing interest:", error);
        return { success: false, error: "Failed to remove interest" };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in removeInterest:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }
}

export const interestService = new InterestService();
