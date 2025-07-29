import { getSupabaseBrowserClient } from "@/lib/supabase";

export interface Notification {
  id: string;
  recipientUserId: string;
  senderUserId?: string;
  type:
    | "proposal_interest"
    | "proposal_message"
    | "match_update"
    | "contract_update"
    | "contract_signed"
    | "nda_request"
    | "nda_approved"
    | "nda_rejected"
    | "terms_accepted";
  title: string;
  message: string;
  link?: string;
  relatedProposalId?: string;
  relatedMatchId?: string;
  readAt?: string;
  createdAt: string;
  senderName?: string;
  senderAvatar?: string;
}

export interface CreateNotificationParams {
  recipientUserId: string;
  senderUserId?: string;
  type: Notification["type"];
  title: string;
  message: string;
  link?: string;
  relatedProposalId?: string;
  relatedMatchId?: string;
}

class NotificationService {
  private supabase = getSupabaseBrowserClient();

  /**
   * Create a new notification
   */
  async createNotification(
    params: CreateNotificationParams,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Don't create notification if sender is the same as recipient
      if (params.senderUserId === params.recipientUserId) {
        return { success: true };
      }

      const { error } = await this.supabase.from("notifications").insert({
        recipient_user_id: params.recipientUserId,
        sender_user_id: params.senderUserId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link,
        related_proposal_id: params.relatedProposalId,
        related_match_id: params.relatedMatchId,
      });

      if (error) {
        console.error("Error creating notification:", error);
        return { success: false, error: "Failed to create notification" };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in createNotification:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Get notifications for a user
   */
  async getNotifications(
    userId: string,
    limit: number = 50,
  ): Promise<Notification[]> {
    try {
      const { data, error } = await this.supabase
        .from("notifications")
        .select(
          `
          id,
          recipient_user_id,
          sender_user_id,
          type,
          title,
          message,
          link,
          related_proposal_id,
          related_match_id,
          read_at,
          created_at,
          sender:users!notifications_sender_user_id_fkey (
            name,
            avatar_url
          )
        `,
        )
        .eq("recipient_user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching notifications:", error);
        return [];
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        recipientUserId: item.recipient_user_id,
        senderUserId: item.sender_user_id,
        type: item.type,
        title: item.title,
        message: item.message,
        link: item.link,
        relatedProposalId: item.related_proposal_id,
        relatedMatchId: item.related_match_id,
        readAt: item.read_at,
        createdAt: item.created_at,
        senderName: item.sender?.name,
        senderAvatar: item.sender?.avatar_url,
      }));
    } catch (error) {
      console.error("Error in getNotifications:", error);
      return [];
    }
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("recipient_user_id", userId)
        .is("read_at", null);

      if (error) {
        console.error("Error fetching unread count:", error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error("Error in getUnreadCount:", error);
      return 0;
    }
  }

  /**
   * Get unread notifications count for a specific proposal
   */
  async getUnreadCountByProposalId(
    proposalId: string,
    userId: string,
  ): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("recipient_user_id", userId)
        .eq("related_proposal_id", proposalId)
        .is("read_at", null);

      if (error) {
        console.error("Error fetching unread count by proposal:", error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error("Error in getUnreadCountByProposalId:", error);
      return 0;
    }
  }

  /**
   * Get unread notifications count for a specific contract/match
   */
  async getUnreadCountByMatchId(
    matchId: string,
    userId: string,
  ): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("recipient_user_id", userId)
        .eq("related_match_id", matchId)
        .is("read_at", null);

      if (error) {
        console.error("Error fetching unread count by match:", error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error("Error in getUnreadCountByMatchId:", error);
      return 0;
    }
  }

  /**
   * Get unread notifications counts for multiple proposals
   */
  async getUnreadCountsByProposalIds(
    proposalIds: string[],
    userId: string,
  ): Promise<{ [proposalId: string]: number }> {
    try {
      const { data, error } = await this.supabase
        .from("notifications")
        .select("related_proposal_id")
        .eq("recipient_user_id", userId)
        .in("related_proposal_id", proposalIds)
        .is("read_at", null);

      if (error) {
        console.error("Error fetching unread counts by proposals:", error);
        return {};
      }

      // Count notifications per proposal
      const counts: { [proposalId: string]: number } = {};
      proposalIds.forEach((id) => (counts[id] = 0));

      (data || []).forEach((item: any) => {
        if (
          item.related_proposal_id &&
          counts.hasOwnProperty(item.related_proposal_id)
        ) {
          counts[item.related_proposal_id]++;
        }
      });

      return counts;
    } catch (error) {
      console.error("Error in getUnreadCountsByProposalIds:", error);
      return {};
    }
  }

  /**
   * Get unread notifications counts for multiple contracts/matches
   */
  async getUnreadCountsByMatchIds(
    matchIds: string[],
    userId: string,
  ): Promise<{ [matchId: string]: number }> {
    try {
      const { data, error } = await this.supabase
        .from("notifications")
        .select("related_match_id")
        .eq("recipient_user_id", userId)
        .in("related_match_id", matchIds)
        .is("read_at", null);

      if (error) {
        console.error("Error fetching unread counts by matches:", error);
        return {};
      }

      // Count notifications per match
      const counts: { [matchId: string]: number } = {};
      matchIds.forEach((id) => (counts[id] = 0));

      (data || []).forEach((item: any) => {
        if (
          item.related_match_id &&
          counts.hasOwnProperty(item.related_match_id)
        ) {
          counts[item.related_match_id]++;
        }
      });

      return counts;
    } catch (error) {
      console.error("Error in getUnreadCountsByMatchIds:", error);
      return {};
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(
    notificationId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", notificationId);

      if (error) {
        console.error("Error marking notification as read:", error);
        return { success: false, error: "Failed to mark notification as read" };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in markAsRead:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(
    userId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("recipient_user_id", userId)
        .is("read_at", null);

      if (error) {
        console.error("Error marking all notifications as read:", error);
        return {
          success: false,
          error: "Failed to mark notifications as read",
        };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in markAllAsRead:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Create notification for proposal interest
   */
  async createProposalInterestNotification(
    proposalId: string,
    proposalTitle: string,
    proposalOwnerId: string,
    interestedUserId: string,
    interestedUserName: string,
  ): Promise<{ success: boolean; error?: string }> {
    return this.createNotification({
      recipientUserId: proposalOwnerId,
      senderUserId: interestedUserId,
      type: "proposal_interest",
      title: "New Accept in Your Proposal",
      message: `${interestedUserName} has accept proposal "${proposalTitle}"`,
      link: `/proposals/${proposalId}`,
      relatedProposalId: proposalId,
    });
  }

  /**
   * Create notification for proposal message
   */
  async createProposalMessageNotification(
    proposalId: string,
    proposalTitle: string,
    proposalOwnerId: string,
    senderId: string,
    senderName: string,
    messagePreview: string,
  ): Promise<{ success: boolean; error?: string }> {
    return this.createNotification({
      recipientUserId: proposalOwnerId,
      senderUserId: senderId,
      type: "proposal_message",
      title: "New Message on Your Proposal",
      message: `${senderName} sent a message about "${proposalTitle}": ${messagePreview.substring(0, 100)}${messagePreview.length > 100 ? "..." : ""}`,
      link: `/proposals/${proposalId}`,
      relatedProposalId: proposalId,
    });
  }

  /**
   * Create notification for terms acceptance
   */
  async createTermsAcceptedNotification(
    proposalId: string,
    proposalTitle: string,
    recipientUserId: string,
    acceptorUserId: string,
    acceptorUserName: string,
    matchId: string,
  ): Promise<{ success: boolean; error?: string }> {
    return this.createNotification({
      recipientUserId: recipientUserId,
      senderUserId: acceptorUserId,
      type: "terms_accepted",
      title: "Terms Accepted!",
      message: `${acceptorUserName} has accepted the terms for your proposal "${proposalTitle}". A contract has been created.`,
      link: `/matches/${matchId}/contract/${proposalId}`,
      relatedProposalId: proposalId,
      relatedMatchId: matchId,
    });
  }

  /**
   * Create notification for contract signing
   */
  async createContractSignedNotification(
    proposalId: string,
    proposalTitle: string,
    recipientUserId: string,
    signerUserId: string,
    signerUserName: string,
    matchId: string,
    isProvider: boolean,
    contractId: string,
  ): Promise<{ success: boolean; error?: string }> {
    const signerRole = isProvider ? "Provider" : "Needer";
    return this.createNotification({
      recipientUserId: recipientUserId,
      senderUserId: signerUserId,
      type: "contract_signed",
      title: "Contract Signed!",
      message: `${signerUserName} (${signerRole}) has signed the contract for "${proposalTitle}". The contract is now waiting for your signature.`,
      link: `/contracts/${contractId}`,
      relatedProposalId: proposalId,
      relatedMatchId: matchId,
    });
  }

  /**
   * Delete notification
   */
  async deleteNotification(
    notificationId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) {
        console.error("Error deleting notification:", error);
        return { success: false, error: "Failed to delete notification" };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in deleteNotification:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Create notification for NDA request
   */
  async createNDARequestNotification(
    proposalId: string,
    proposalTitle: string,
    proposalOwnerId: string,
    requesterId: string,
    requesterName: string,
    requestMessage?: string,
  ): Promise<{ success: boolean; error?: string }> {
    const message = requestMessage
      ? `${requesterName} has requested access to private fields in "${proposalTitle}" with message: ${requestMessage.substring(0, 100)}${requestMessage.length > 100 ? "..." : ""}`
      : `${requesterName} has requested access to private fields in "${proposalTitle}"`;

    return this.createNotification({
      recipientUserId: proposalOwnerId,
      senderUserId: requesterId,
      type: "nda_request",
      title: "NDA Access Request",
      message: message,
      link: `/proposals/${proposalId}`,
      relatedProposalId: proposalId,
    });
  }

  /**
   * Create notification for NDA approval
   */
  async createNDAApprovedNotification(
    proposalId: string,
    proposalTitle: string,
    requesterId: string,
    approverId: string,
    approverName: string,
  ): Promise<{ success: boolean; error?: string }> {
    return this.createNotification({
      recipientUserId: requesterId,
      senderUserId: approverId,
      type: "nda_approved",
      title: "NDA Access Approved",
      message: `${approverName} has approved your request to access private fields in "${proposalTitle}"`,
      link: `/proposals/${proposalId}`,
      relatedProposalId: proposalId,
    });
  }

  /**
   * Create notification for NDA rejection
   */
  async createNDARejectNotification(
    proposalId: string,
    proposalTitle: string,
    requesterId: string,
    approverId: string,
    approverName: string,
    rejectionReason?: string,
  ): Promise<{ success: boolean; error?: string }> {
    const message = rejectionReason
      ? `${approverName} has rejected your request to access private fields in "${proposalTitle}". Reason: ${rejectionReason}`
      : `${approverName} has rejected your request to access private fields in "${proposalTitle}"`;

    return this.createNotification({
      recipientUserId: requesterId,
      senderUserId: approverId,
      type: "nda_rejected",
      title: "NDA Access Rejected",
      message: message,
      link: `/proposals/${proposalId}`,
      relatedProposalId: proposalId,
    });
  }

  /**
   * Subscribe to real-time notifications for a user
   */
  subscribeToNotifications(
    userId: string,
    callback: (notification: Notification) => void,
  ) {
    return this.supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_user_id=eq.${userId}`,
        },
        async (payload) => {
          // Fetch the complete notification with sender info
          const { data } = await this.supabase
            .from("notifications")
            .select(
              `
              id,
              recipient_user_id,
              sender_user_id,
              type,
              title,
              message,
              link,
              related_proposal_id,
              related_match_id,
              read_at,
              created_at,
              sender:users!notifications_sender_user_id_fkey (
                name,
                avatar_url
              )
            `,
            )
            .eq("id", payload.new.id)
            .single();

          if (data) {
            const notification: Notification = {
              id: (data as any).id,
              recipientUserId: (data as any).recipient_user_id,
              senderUserId: (data as any).sender_user_id,
              type: (data as any).type,
              title: (data as any).title,
              message: (data as any).message,
              link: (data as any).link,
              relatedProposalId: (data as any).related_proposal_id,
              relatedMatchId: (data as any).related_match_id,
              readAt: (data as any).read_at,
              createdAt: (data as any).created_at,
              senderName: (data as any).sender?.name,
              senderAvatar: (data as any).sender?.avatar_url,
            };
            callback(notification);
          }
        },
      )
      .subscribe();
  }
}

export const notificationService = new NotificationService();
