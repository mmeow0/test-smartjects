import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/hooks/use-auth-guard";
import { useToast } from "@/hooks/use-toast";
import {
  notificationService,
  type Notification,
} from "@/lib/services/notification.service";

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const { user, canAccess } = useRequireAuth();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user?.id || !canAccess) {
      setIsLoading(false);
      return;
    }

    try {
      const [notificationsData, unreadCountData] = await Promise.all([
        notificationService.getNotifications(user.id),
        notificationService.getUnreadCount(user.id),
      ]);

      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, canAccess]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!user?.id) return;

      try {
        const result = await notificationService.markAsRead(notificationId);

        if (result.success) {
          // Update local state
          setNotifications((prev) =>
            prev.map((notif) =>
              notif.id === notificationId
                ? { ...notif, readAt: new Date().toISOString() }
                : notif,
            ),
          );

          // Update unread count
          setUnreadCount((prev) => Math.max(0, prev - 1));
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to mark notification as read",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
        toast({
          title: "Error",
          description: "Failed to mark notification as read",
          variant: "destructive",
        });
      }
    },
    [user?.id],
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      const result = await notificationService.markAllAsRead(user.id);

      if (result.success) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notif) => ({
            ...notif,
            readAt: notif.readAt || new Date().toISOString(),
          })),
        );

        setUnreadCount(0);

        toast({
          title: "Success",
          description: "All notifications marked as read",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to mark notifications as read",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    }
  }, [user?.id]);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      if (!user?.id) return;

      try {
        const result =
          await notificationService.deleteNotification(notificationId);

        if (result.success) {
          // Update local state
          setNotifications((prev) =>
            prev.filter((notif) => notif.id !== notificationId),
          );

          // Update unread count if the deleted notification was unread
          const deletedNotification = notifications.find(
            (n) => n.id === notificationId,
          );
          if (deletedNotification && !deletedNotification.readAt) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }

          toast({
            title: "Success",
            description: "Notification deleted",
          });
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to delete notification",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error deleting notification:", error);
        toast({
          title: "Error",
          description: "Failed to delete notification",
          variant: "destructive",
        });
      }
    },
    [user?.id],
  );

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id || !canAccess) return;

    const subscription = notificationService.subscribeToNotifications(
      user.id,
      (newNotification: Notification) => {
        // Add new notification to the beginning of the list
        setNotifications((prev) => [newNotification, ...prev]);

        // Increment unread count
        setUnreadCount((prev) => prev + 1);

        // Show toast for new notification
        toast({
          title: newNotification.title,
          description: newNotification.message,
        });
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, canAccess]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  };
};
