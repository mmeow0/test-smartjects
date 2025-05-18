"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Paperclip, Send } from "lucide-react"

export default function ContractMessagesPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState("")

  // Redirect if not authenticated or not a paid user
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login")
    } else if (user?.accountType !== "paid") {
      router.push("/upgrade")
    } else {
      // Simulate loading data
      setTimeout(() => {
        setIsLoading(false)
      }, 1000)
    }
  }, [isAuthenticated, router, user])

  if (!isAuthenticated || user?.accountType !== "paid" || isLoading) {
    return null
  }

  // Mock messages data
  const messages = [
    {
      id: "msg-1",
      sender: {
        id: "user-101",
        name: "Tech Solutions Inc.",
        avatar: "",
      },
      content:
        "We've started work on the data integration framework. Do you have any specific requirements for the data sources?",
      timestamp: "2024-01-20T10:30:00",
      attachments: [],
    },
    {
      id: "msg-2",
      sender: {
        id: "user-201",
        name: "Global Logistics Corp",
        avatar: "",
      },
      content:
        "Yes, we'll need integration with our SAP system and the warehouse management system. I'll send you the API documentation.",
      timestamp: "2024-01-20T14:15:00",
      attachments: [],
    },
    {
      id: "msg-3",
      sender: {
        id: "user-101",
        name: "Tech Solutions Inc.",
        avatar: "",
      },
      content: "Great, thanks! We'll review the documentation and incorporate it into our integration plan.",
      timestamp: "2024-01-21T09:45:00",
      attachments: [],
    },
    {
      id: "msg-4",
      sender: {
        id: "user-201",
        name: "Global Logistics Corp",
        avatar: "",
      },
      content:
        "Here's the API documentation for both systems. Let me know if you need any clarification or have questions about the endpoints.",
      timestamp: "2024-01-21T11:30:00",
      attachments: [
        {
          name: "SAP_API_Documentation.pdf",
          size: "2.4 MB",
        },
        {
          name: "WMS_Integration_Guide.pdf",
          size: "1.8 MB",
        },
      ],
    },
    {
      id: "msg-5",
      sender: {
        id: "user-101",
        name: "Tech Solutions Inc.",
        avatar: "",
      },
      content:
        "Thanks for the documentation. We've reviewed it and have a few questions about the authentication mechanism for the SAP API. Could you clarify if we should use OAuth 2.0 or the legacy authentication method?",
      timestamp: "2024-01-22T14:20:00",
      attachments: [],
    },
    {
      id: "msg-6",
      sender: {
        id: "user-201",
        name: "Global Logistics Corp",
        avatar: "",
      },
      content:
        "Please use OAuth 2.0 for the SAP API. The legacy authentication is being deprecated next quarter. I've attached the OAuth configuration guide.",
      timestamp: "2024-01-22T16:45:00",
      attachments: [
        {
          name: "SAP_OAuth_Configuration.pdf",
          size: "1.2 MB",
        },
      ],
    },
  ]

  // Contract info
  const contract = {
    id: params.id,
    title: "AI-Powered Supply Chain Optimization Implementation",
    provider: {
      id: "user-101",
      name: "Tech Solutions Inc.",
      avatar: "",
    },
    needer: {
      id: "user-201",
      name: "Global Logistics Corp",
      avatar: "",
    },
  }

  const handleSendMessage = () => {
    if (!message.trim()) return

    // In a real app, we would call an API to send the message
    toast({
      title: "Message sent",
      description: "Your message has been sent successfully.",
    })

    // Clear the message input
    setMessage("")
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
                    <p className="mb-2">{msg.content}</p>
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
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="w-full">
            <Textarea
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-between mt-2">
              <Button variant="outline" size="sm">
                <Paperclip className="h-4 w-4 mr-2" />
                Attach File
              </Button>
              <Button size="sm" onClick={handleSendMessage} disabled={!message.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
