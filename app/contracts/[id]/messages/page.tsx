"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth-provider"
import { useRequirePaidAccount } from "@/hooks/use-auth-guard"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Paperclip, Send, Loader2, MessageSquare } from "lucide-react"
import { contractService } from "@/lib/services"

interface Message {
  id: string
  sender: {
    id: string
    name: string
    avatar: string
  }
  content: string
  timestamp: string
  attachments?: Array<{
    name: string
    size: string
  }>
}

export default function ContractMessagesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const router = useRouter()
  const { isLoading: authLoading, user, canAccess } = useRequirePaidAccount()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState("")
  const [contract, setContract] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<string | null>(null)

  // Load contract and messages data
  // Load contract data and check access
  useEffect(() => {
    const loadContract = async () => {
      if (authLoading || !canAccess) {
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Load contract data
        const contractData = await contractService.getContractById(id)
        if (!contractData) {
          setError("Contract not found or access denied")
          setIsLoading(false)
          return
        }

        setContract(contractData)

        // Load messages
        const messagesData = await contractService.getContractMessages(id)
        setMessages(messagesData)

        setIsLoading(false)
      } catch (error) {
        console.error("Error loading contract messages:", error)
        setError("Failed to load contract messages")
        setIsLoading(false)
      }
    }

    loadContract()
  }, [authLoading, canAccess, user, id, router])

  // Redirect if not authenticated or not paid
  if (authLoading || !canAccess) {
    return null
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Card className="w-full max-w-3xl">
            <CardHeader className="text-center">
              <CardTitle>Loading...</CardTitle>
              <CardDescription>Please wait while we load your contract messages.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !contract) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Card className="w-full max-w-3xl">
            <CardHeader className="text-center">
              <CardTitle>Error</CardTitle>
              <CardDescription>{error || "Contract not found"}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-4">
              <Button onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return

    setIsSending(true)

    try {
      await contractService.sendContractMessage(id, message.trim())
      
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      })

      // Clear the message input
      setMessage("")

      // Reload messages to show the new message
      const updatedMessages = await contractService.getContractMessages(id)
      setMessages(updatedMessages)

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

  const isCurrentUser = (senderId: string) => {
    return user?.id === senderId
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Contract Messages</h1>
          <p className="text-muted-foreground">
            For contract: <span className="font-medium">{contract.title}</span>
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Message History</CardTitle>
          <CardDescription>
            Communication between {contract.provider.name} and {contract.needer.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[600px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${isCurrentUser(msg.sender.id) ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex max-w-[80%] ${
                      isCurrentUser(msg.sender.id) ? "flex-row-reverse" : "flex-row"
                    } items-start gap-2`}
                  >
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src={msg.sender.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{msg.sender.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div
                      className={`rounded-lg p-3 ${
                        isCurrentUser(msg.sender.id) ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium">{msg.sender.name}</span>
                        <span className="text-xs opacity-70">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-background/20">
                          <p className="text-xs font-medium mb-1">Attachments:</p>
                          <div className="space-y-1">
                            {msg.attachments.map((attachment, index) => (
                              <div key={index} className="flex items-center gap-1 text-xs">
                                <Paperclip className="h-3 w-3" />
                                <span>{attachment.name}</span>
                                <span className="opacity-70">({attachment.size})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="w-full">
            <Textarea
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
              disabled={isSending}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
            <div className="flex justify-between mt-2">
              <Button variant="outline" size="sm" disabled>
                <Paperclip className="h-4 w-4 mr-2" />
                Attach File
              </Button>
              <Button 
                size="sm" 
                onClick={handleSendMessage} 
                disabled={!message.trim() || isSending}
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {isSending ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}