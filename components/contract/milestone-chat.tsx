"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  MessageSquare,
  Send,
  Loader2,
  CheckCircle,
  AlertTriangle,
  User,
  Clock,
} from "lucide-react"
import { contractService } from "@/lib/services"

interface MilestoneMessage {
  id: string
  content: string
  messageType: string
  sender: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: string
  isOwnMessage: boolean
}

interface MilestoneChatProps {
  milestoneId: string
  milestoneName: string
  userRole: "provider" | "needer"
  currentUser?: {
    id: string
    name?: string
    avatar?: string
  }
  className?: string
}

export function MilestoneChat({
  milestoneId,
  milestoneName,
  userRole,
  currentUser,
  className = "",
}: MilestoneChatProps) {
  const [messages, setMessages] = useState<MilestoneMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const messagesData = await contractService.getMilestoneMessages(milestoneId)
        setMessages(messagesData)
      } catch (error) {
        console.error("Error loading messages:", error)
        setError("Failed to load messages")
      } finally {
        setIsLoading(false)
      }
    }

    loadMessages()
  }, [milestoneId])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setIsSending(true)
    try {
      const message = await contractService.sendMilestoneMessage(milestoneId, newMessage.trim())
      setMessages(prev => [...prev, message])
      setNewMessage("")
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getMessageTypeIcon = (messageType: string) => {
    switch (messageType) {
      case "submission":
        return <CheckCircle className="h-3 w-3 text-blue-600" />
      case "review":
        return <User className="h-3 w-3 text-purple-600" />
      case "system":
        return <AlertTriangle className="h-3 w-3 text-amber-600" />
      default:
        return <MessageSquare className="h-3 w-3 text-gray-600" />
    }
  }

  const getMessageTypeBadge = (messageType: string) => {
    switch (messageType) {
      case "submission":
        return <Badge variant="secondary" className="text-xs">Submission</Badge>
      case "review":
        return <Badge variant="secondary" className="text-xs">Review</Badge>
      case "system":
        return <Badge variant="outline" className="text-xs">System</Badge>
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className={`border rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading chat...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`border rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <AlertTriangle className="h-6 w-6 text-destructive mx-auto mb-2" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      {/* Chat header */}
      <div className="bg-muted/50 p-3 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-medium text-sm">Chat: {milestoneName}</h4>
          <Badge variant="outline" className="text-xs">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Messages area */}
      <ScrollArea className="h-64 p-3">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">No messages yet</p>
              <p className="text-xs text-muted-foreground">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex gap-2 ${message.isOwnMessage ? "justify-end" : ""}`}>
                {!message.isOwnMessage && (
                  <Avatar className="h-6 w-6 mt-1">
                    <AvatarImage src={message.sender.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">
                      {message.sender.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[75%] ${message.isOwnMessage ? "text-right" : ""}`}>
                  <div className={`rounded-lg p-2 text-sm ${
                    message.isOwnMessage 
                      ? "bg-primary text-primary-foreground" 
                      : message.messageType === "system"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-muted"
                  }`}>
                    {/* Message header */}
                    <div className="flex items-center gap-1 mb-1">
                      {getMessageTypeIcon(message.messageType)}
                      <span className="text-xs font-medium opacity-90">
                        {message.isOwnMessage ? "You" : message.sender.name}
                      </span>
                      {getMessageTypeBadge(message.messageType)}
                    </div>
                    
                    {/* Message content */}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  
                  {/* Timestamp */}
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>

                {message.isOwnMessage && (
                  <Avatar className="h-6 w-6 mt-1">
                    <AvatarImage src={currentUser?.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">
                      {currentUser?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message input */}
      <div className="p-3 border-t bg-background">
        <div className="flex gap-2">
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            className="min-h-[60px] resize-none text-sm"
            rows={2}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!newMessage.trim() || isSending}
            size="sm"
            className="self-end px-3"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {userRole === "provider" && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              Provider
            </span>
          )}
          {userRole === "needer" && (
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Client
            </span>
          )}
        </div>
      </div>
    </div>
  )
}