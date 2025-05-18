"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface Notification {
  id: string
  type: "match" | "proposal" | "contract" | "message"
  title: string
  description: string
  timestamp: string
  read: boolean
  link: string
}

export function NotificationBadge() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Mock notifications data
  useEffect(() => {
    // In a real app, we would fetch notifications from an API
    const mockNotifications: Notification[] = [
      {
        id: "notif-1",
        type: "match",
        title: "New Match Found",
        description: "Your proposal for 'AI-Powered Supply Chain Optimization' has a new match!",
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutes ago
        read: false,
        link: "/matches/match-1",
      },
      {
        id: "notif-2",
        type: "message",
        title: "New Message",
        description: "Tech Solutions Inc. sent you a message regarding your proposal.",
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
        read: false,
        link: "/matches/match-1/negotiate/proposal-1",
      },
      {
        id: "notif-3",
        type: "contract",
        title: "Contract Ready",
        description: "A contract for 'Automated Customer Support Chatbot' is ready for your signature.",
        timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), // 1 day ago
        read: true,
        link: "/matches/match-3/contract/proposal-5",
      },
    ]

    setNotifications(mockNotifications)
  }, [])

  const unreadCount = notifications.filter((notif) => !notif.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    setIsOpen(false)
    router.push(notification.link)
  }

  const getRelativeTime = (timestamp: string) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.round(diffMs / 60000)
    const diffHours = Math.round(diffMs / 3600000)
    const diffDays = Math.round(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
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
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex flex-col items-start p-3 cursor-pointer ${!notification.read ? "bg-muted/50" : ""}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex justify-between w-full">
                <span className="font-medium">{notification.title}</span>
                <span className="text-xs text-muted-foreground">{getRelativeTime(notification.timestamp)}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="p-4 text-center text-muted-foreground">No notifications</div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center" asChild>
          <Button variant="ghost" size="sm" className="w-full" onClick={() => router.push("/notifications")}>
            View all notifications
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
