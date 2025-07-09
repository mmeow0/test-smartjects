"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  MessageSquare,
  Users,
  FileText,
  CheckCircle,
  Heart,
  Trash2,
  ThumbsUp,
} from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";

export function NotificationBadge() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const handleNotificationClick = async (notification: any) => {
    if (!notification.readAt) {
      await markAsRead(notification.id);
    }
    setIsOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "proposal_interest":
        return <Heart className="h-4 w-4 text-pink-500" />;
      case "proposal_message":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "match_update":
        return <Users className="h-4 w-4 text-green-500" />;
      case "contract_update":
        return <FileText className="h-4 w-4 text-purple-500" />;
      case "terms_accepted":
        return <ThumbsUp className="h-4 w-4 text-green-600" />;
      case "contract_signed":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "nda_request":
      case "nda_approved":
      case "nda_rejected":
        return <CheckCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 1) {
      return "Just now";
    } else if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    }
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" className="relative" disabled>
        <Bell className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-96 sm:max-w-none p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 pb-4">
            <SheetTitle>Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs w-fit"
                onClick={markAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </SheetHeader>
          <Separator />
          <div className="flex-1 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      !notification.readAt ? "bg-muted/30" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex-shrink-0 mt-1 mr-3">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm truncate pr-2">
                          {notification.title}
                        </span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {getRelativeTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1 line-clamp-2">
                        {notification.message}
                      </p>
                      {notification.senderName && (
                        <p className="text-xs text-muted-foreground mb-1">
                          From: {notification.senderName}
                        </p>
                      )}
                      {!notification.readAt && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                No notifications
              </div>
            )}
          </div>
          <Separator />
          <div className="p-4">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                setIsOpen(false);
                router.push("/notifications");
              }}
            >
              View all notifications
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
