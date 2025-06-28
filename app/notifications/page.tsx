"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Bell,
  MessageSquare,
  Users,
  FileText,
  CheckCircle,
  Heart,
  Trash2,
  Mail,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRequirePaidAccount } from "@/hooks/use-auth-guard";
import { useNotifications } from "@/hooks/use-notifications";
import { useToast } from "@/hooks/use-toast";
import type { Notification } from "@/lib/services/notification.service";

export default function NotificationsPage() {
  const router = useRouter();
  const { isLoading: authLoading, canAccess } = useRequirePaidAccount();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  } = useNotifications();

  if (authLoading || !canAccess) {
    return null;
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "proposal_interest":
        return <Heart className="h-5 w-5 text-pink-500" />;
      case "proposal_message":
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case "match_update":
        return <Users className="h-5 w-5 text-green-500" />;
      case "contract_update":
        return <FileText className="h-5 w-5 text-purple-500" />;
      case "nda_request":
      case "nda_approved":
      case "nda_rejected":
        return <CheckCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
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
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.readAt) {
      await markAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleDeleteNotification = async (
    e: React.MouseEvent,
    notificationId: string,
  ) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const handleMarkAsRead = async (
    e: React.MouseEvent,
    notificationId: string,
  ) => {
    e.stopPropagation();
    await markAsRead(notificationId);
  };

  const filteredNotifications = notifications.filter((notification) => {
    switch (activeTab) {
      case "unread":
        return !notification.readAt;
      case "read":
        return notification.readAt;
      default:
        return true;
    }
  });

  const unreadNotifications = notifications.filter((n) => !n.readAt);
  const readNotifications = notifications.filter((n) => n.readAt);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated with your proposal activities
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <Mail className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="read">
              Read ({readNotifications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <NotificationsList
              notifications={filteredNotifications}
              onNotificationClick={handleNotificationClick}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDeleteNotification}
              getNotificationIcon={getNotificationIcon}
              getRelativeTime={getRelativeTime}
            />
          </TabsContent>

          <TabsContent value="unread" className="mt-6">
            <NotificationsList
              notifications={filteredNotifications}
              onNotificationClick={handleNotificationClick}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDeleteNotification}
              getNotificationIcon={getNotificationIcon}
              getRelativeTime={getRelativeTime}
            />
          </TabsContent>

          <TabsContent value="read" className="mt-6">
            <NotificationsList
              notifications={filteredNotifications}
              onNotificationClick={handleNotificationClick}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDeleteNotification}
              getNotificationIcon={getNotificationIcon}
              getRelativeTime={getRelativeTime}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface NotificationsListProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (e: React.MouseEvent, id: string) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  getNotificationIcon: (type: string) => React.ReactNode;
  getRelativeTime: (timestamp: string) => string;
}

function NotificationsList({
  notifications,
  onNotificationClick,
  onMarkAsRead,
  onDelete,
  getNotificationIcon,
  getRelativeTime,
}: NotificationsListProps) {
  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No notifications</h3>
          <p className="text-muted-foreground text-center">
            You're all caught up! New notifications will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification, index) => (
        <Card
          key={notification.id}
          className={`cursor-pointer transition-all hover:shadow-md ${
            !notification.readAt
              ? "border-l-4 border-l-blue-500 bg-blue-50/30"
              : ""
          }`}
          onClick={() => onNotificationClick(notification)}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>{getRelativeTime(notification.createdAt)}</span>
                      {notification.senderName && (
                        <>
                          <span>•</span>
                          <span>From: {notification.senderName}</span>
                        </>
                      )}
                      {!notification.readAt && (
                        <>
                          <span>•</span>
                          <Badge variant="secondary" className="text-xs">
                            New
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!notification.readAt && (
                        <DropdownMenuItem
                          onClick={(e) => onMarkAsRead(e, notification.id)}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Mark as read
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={(e) => onDelete(e, notification.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
