"use client"

import { useEffect, useState, useMemo, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRequirePaidAccount } from "@/hooks/use-auth-guard"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  DollarSign,
  FileText,
  Handshake,
  MessageSquare,
  Send,
  ThumbsUp,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { contractService, negotiationService } from "@/lib/services"

interface Deliverable {
  id: string
  description: string
  completed: boolean
}

interface Milestone {
  id: string
  name: string
  description: string
  percentage: number
  amount: string
  deliverables: Deliverable[]
}

interface CounterOffer {
  budget: string
  timeline: string
}

interface Message {
  id: string
  sender: "provider" | "needer"
  senderName: string
  content: string
  timestamp: string
  isCounterOffer: boolean
  counterOffer?: CounterOffer
  files?: {
    id: string
    file_name: string
    file_url: string
    file_type: string
    file_size: number
  }[]
}

interface User {
  id: string
  name: string
  avatar: string
  rating: number
}

interface CurrentProposal {
  budget: string
  timeline: string
  scope: string
  deliverables: string[]
}

interface IndividualNegotiationData {
  matchId: string
  proposalId: string
  otherUserId: string
  smartjectTitle: string
  provider: User
  needer: User
  otherUser: User
  currentProposal: CurrentProposal
  milestones: Milestone[]
  messages: Message[]
}

export default function IndividualNegotiatePage({
  params,
}: {
  params: Promise<{ id: string; proposalId: string; otherUserId: string }>;
}) {
  const { id, proposalId, otherUserId } = use(params);
  
  const router = useRouter()
  const { isLoading: authLoading, user, canAccess } = useRequirePaidAccount()
  const { toast } = useToast()

  const [negotiation, setNegotiation] = useState<IndividualNegotiationData | null>(null)
  const [negotiationLoading, setNegotiationLoading] = useState(true)

  const [message, setMessage] = useState("")
  const [isCounterOffer, setIsCounterOffer] = useState(false)
  const [counterOffer, setCounterOffer] = useState({
    budget: "",
    timeline: "",
  })
  const [useMilestones, setUseMilestones] = useState(false)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [totalPercentage, setTotalPercentage] = useState(0)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [acceptingTerms, setAcceptingTerms] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [messageFiles, setMessageFiles] = useState<File[]>([])

  const currentTimelineStr = useMemo(() => {
    if (!negotiation) return ""
    const lastMessage = negotiation.messages?.[negotiation.messages.length - 1]
    return lastMessage?.isCounterOffer ? lastMessage.counterOffer?.timeline : negotiation.currentProposal?.timeline
  }, [negotiation])

  useEffect(() => {
    const fetchIndividualNegotiationData = async () => {
      if (authLoading || !canAccess) {
        return
      }
      
      setNegotiationLoading(true)
      try {
        const supabase = getSupabaseBrowserClient()
        
        // Get proposal data
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
            )
          `)
          .eq("id", proposalId)
          .single();
          
        if (proposalError || !proposalData) {
          console.error("Error fetching proposal data:", proposalError);
          return;
        }

        // Get other user data
        const { data: otherUserData, error: otherUserError } = await supabase
          .from("users")
          .select("id, name, avatar_url")
          .eq("id", otherUserId)
          .single();

        if (otherUserError || !otherUserData) {
          console.error("Error fetching other user data:", otherUserError);
          return;
        }

        // Get messages only between current user and specific other user
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
            ),
            negotiation_files (
              id,
              file_name,
              file_url,
              file_type,
              file_size
            )
          `)
          .eq("proposal_id", proposalId)
          .or(`sender_id.eq.${user?.id},sender_id.eq.${otherUserId}`)
          .order("created_at", { ascending: true });

        if (messagesError) {
          console.error("Error fetching messages:", messagesError);
        }

        // Filter messages to only include conversation between these two users
        const filteredMessages = messagesData?.filter(msg => 
          (msg.sender_id === user?.id || msg.sender_id === otherUserId)
        ) || [];

        const isProposalOwner = proposalData.user_id === user?.id;
        const smartjectOwnerId = "mock-smartject-owner"; // Would get from smartjects table

        const negotiationData: IndividualNegotiationData = {
          matchId: id,
          proposalId: proposalId,
          otherUserId: otherUserId,
          smartjectTitle: ((proposalData.smartjects as any)?.title as string) || "",
          provider: {
            id: ((proposalData.users as any)?.id as string) || "",
            name: ((proposalData.users as any)?.name as string) || "",
            avatar: ((proposalData.users as any)?.avatar_url as string) || "",
            rating: 4.8,
          },
          needer: {
            id: smartjectOwnerId,
            name: "Smartject Owner",
            avatar: "",
            rating: 4.6,
          },
          otherUser: {
            id: (otherUserData.id as string),
            name: (otherUserData.name as string) || "Unknown User",
            avatar: (otherUserData.avatar_url as string) || "",
            rating: 4.5,
          },
          currentProposal: {
            budget: (proposalData.budget as string) || "",
            timeline: (proposalData.timeline as string) || "",
            scope: (proposalData.scope as string) || "",
            deliverables: proposalData.deliverables ? 
              (proposalData.deliverables as string).split('\n').filter((d: string) => d.trim()) : [],
          },
          milestones: [],
          messages: filteredMessages.map((message: any) => ({
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
            files: message.negotiation_files?.map((file: any) => ({
              id: file.id,
              file_name: file.file_name,
              file_url: file.file_url,
              file_type: file.file_type,
              file_size: file.file_size
            })) || []
          })),
        };

        setNegotiation(negotiationData)
        
      } catch (error) {
        console.error("Error fetching individual negotiation data:", error)
        toast({
          title: "Error",
          description: "Failed to load negotiation data",
          variant: "destructive",
        })
      } finally {
        setNegotiationLoading(false)
      }
    }

    fetchIndividualNegotiationData()
  }, [id, proposalId, otherUserId, authLoading, canAccess, user, toast])

  // Load negotiation data when authenticated
  useEffect(() => {
    if (authLoading || !canAccess) {
      return
    }
  }, [authLoading, canAccess])

  useEffect(() => {
    const total = milestones.reduce((sum, milestone) => sum + milestone.percentage, 0)
    setTotalPercentage(total)
  }, [milestones])

  if (authLoading || !canAccess || negotiationLoading || !negotiation) {
    return null
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setMessageFiles(Array.from(files))
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() && (!isCounterOffer || (!counterOffer.budget && !counterOffer.timeline)) && messageFiles.length === 0) {
      toast({
        title: "Missing information",
        description: "Please provide a message, counter offer terms, or attach files.",
        variant: "destructive",
      })
      return
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      })
      return
    }

    setSendingMessage(true)
    
    try {
      const success = await negotiationService.addNegotiationMessage(
        proposalId,
        user.id,
        message,
        isCounterOffer,
        isCounterOffer ? counterOffer.budget : undefined,
        isCounterOffer ? counterOffer.timeline : undefined
      )

      if (success) {
        // Загружаем файлы, если они есть
        if (messageFiles.length > 0) {
          const supabase = getSupabaseBrowserClient()
          
          // Получаем последнее сообщение переговоров
          const { data: lastMessage } = await supabase
            .from('negotiation_messages')
            .select('id')
            .eq('proposal_id', proposalId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          if (lastMessage) {
            for (const file of messageFiles) {
              const fileExt = file.name.split('.').pop()
              const fileName = `${Math.random()}.${fileExt}`
              const filePath = `negotiation-files/${proposalId}/${fileName}`

              const { error: uploadError } = await supabase.storage
                .from('negotiation-files')
                .upload(filePath, file)

              if (uploadError) throw uploadError

              const { data: { publicUrl } } = supabase.storage
                .from('negotiation-files')
                .getPublicUrl(filePath)

              const { error: dbError } = await supabase
                .from('negotiation_files')
                .insert({
                  negotiation_id: lastMessage.id,
                  file_name: file.name,
                  file_url: publicUrl,
                  file_type: file.type,
                  file_size: file.size,
                  uploaded_by: user.id
                })

              if (dbError) throw dbError
            }
          }
        }

        toast({
          title: isCounterOffer ? "Counter offer sent" : "Message sent",
          description: `Your ${isCounterOffer ? "counter offer" : "message"} has been sent successfully.`,
        })

        // Clear the inputs
        setMessage("")
        setCounterOffer({
          budget: "",
          timeline: "",
        })
        setIsCounterOffer(false)
        setMessageFiles([])

        // Refetch negotiation data to show the new message
        const supabase = getSupabaseBrowserClient()

        // Получаем обновленные сообщения с файлами
        const { data: messagesData } = await supabase
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
            ),
            negotiation_files (
              id,
              file_name,
              file_url,
              file_type,
              file_size
            )
          `)
          .eq("proposal_id", proposalId)
          .or(`sender_id.eq.${user?.id},sender_id.eq.${otherUserId}`)
          .order("created_at", { ascending: true });

        // Получаем данные о другом пользователе
        const { data: otherUserData } = await supabase
          .from("users")
          .select("id, name, avatar_url")
          .eq("id", otherUserId)
          .single()

        if (otherUserData && messagesData) {
          // Фильтруем сообщения только между текущим пользователем и другим пользователем
          const filteredMessages = messagesData.filter(msg => 
            (msg.sender_id === user?.id || msg.sender_id === otherUserId)
          );

          setNegotiation(prev => {
            if (!prev) return null;
            return {
              ...prev,
              messages: filteredMessages.map((message: any) => ({
                id: (message.id as string) || "",
                sender: (message.sender_id === prev.provider.id ? "provider" : "needer") as "provider" | "needer",
                senderName: (message.users?.name as string) || "",
                content: (message.content as string) || "",
                timestamp: (message.created_at as string) || "",
                isCounterOffer: (message.is_counter_offer as boolean) || false,
                counterOffer: message.is_counter_offer ? {
                  budget: (message.counter_offer_budget as string) || "",
                  timeline: (message.counter_offer_timeline as string) || "",
                } : undefined,
                files: message.negotiation_files?.map((file: any) => ({
                  id: file.id,
                  file_name: file.file_name,
                  file_url: file.file_url,
                  file_type: file.file_type,
                  file_size: file.file_size
                })) || []
              }))
            };
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSendingMessage(false)
    }
  }

  const handleAcceptTerms = async () => {
    if (useMilestones) {
      if (milestones.length === 0) {
        toast({
          title: "No milestones defined",
          description: "Please add at least one milestone before accepting terms.",
          variant: "destructive",
        })
        return
      }

      if (totalPercentage !== 100) {
        toast({
          title: "Invalid milestone percentages",
          description: "The total percentage of all milestones must equal 100%.",
          variant: "destructive",
        })
        return
      }
    }

    if (!negotiation || !user?.id) {
      toast({
        title: "Error",
        description: "Missing negotiation data or user information.",
        variant: "destructive",
      })
      return
    }

    setAcceptingTerms(true)

    try {
      // Get the latest terms from messages or current proposal
      const lastMessage = negotiation.messages?.[negotiation.messages.length - 1]
      const currentBudget = lastMessage?.isCounterOffer ? lastMessage.counterOffer?.budget : negotiation.currentProposal?.budget
      const currentTimeline = lastMessage?.isCounterOffer ? lastMessage.counterOffer?.timeline : negotiation.currentProposal?.timeline

      // Create contract terms
      const terms = {
        budget: currentBudget || "",
        timeline: currentTimeline || "",
        scope: negotiation.currentProposal.scope,
        deliverables: negotiation.currentProposal.deliverables,
        milestones: useMilestones ? milestones.map(m => ({
          name: m.name,
          description: m.description,
          percentage: m.percentage,
          amount: m.amount
        })) : []
      }

      // Create contract - provider and needer IDs will be fetched from the match table
      const contractId = await contractService.createContractFromNegotiation(
        id,
        proposalId,
        "", // providerId - will be fetched from match
        "", // neederId - will be fetched from match
        terms
      )

      if (!contractId) {
        toast({
          title: "Error",
          description: "Failed to create contract. Please try again.",
          variant: "destructive",
        })
        return
      }

      // Update match status to indicate contract has been created
      try {
        const statusUpdated = await negotiationService.updateNegotiationStatus(id, 'contract_created')
        if (!statusUpdated) {
          console.error("Failed to update match status to contract_created")
          // Don't block the flow if status update fails
        }
      } catch (error) {
        console.error("Error updating match status:", error)
      }

      toast({
        title: "Terms accepted",
        description: `Contract created successfully! You've accepted the terms for negotiation with ${negotiation.otherUser?.name}.`,
      })

      router.push(`/matches/${id}/contract/${proposalId}`)

    } catch (error) {
      console.error("Error creating contract:", error)
      toast({
        title: "Error",
        description: "Failed to create contract. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAcceptingTerms(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button variant="outline" onClick={() => router.push('/negotiations')} className="mr-4">
          <Handshake className="h-4 w-4 mr-2" />
          All Negotiations
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Negotiate with {negotiation.otherUser?.name}</h1>
          <p className="text-muted-foreground">
            For smartject: <span className="font-medium">{negotiation.smartjectTitle}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Conversation with {negotiation.otherUser?.name}</CardTitle>
              <CardDescription>Individual negotiation discussion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 mb-4 p-3 bg-muted/30 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{negotiation.otherUser?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{negotiation.otherUser?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    This conversation contains only messages between you and this user
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Discussion</CardTitle>
                <CardDescription>Private conversation between you and {negotiation.otherUser?.name}</CardDescription>
              </div>
              <Badge variant="outline" className="ml-2">
                {negotiation.messages.length} messages
              </Badge>
            </CardHeader>

            <CardContent>
              <div className="space-y-6 mb-6">
                {negotiation.messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No messages yet with {negotiation.otherUser?.name}</p>
                    <p className="text-sm">Start the conversation below</p>
                  </div>
                ) : (
                  negotiation.messages.map((msg: Message) => {
                    const isCurrentUser = msg.sender === (user?.id === negotiation.provider.id ? "provider" : "needer")
                    return (
                      <div key={msg.id} className="flex gap-4 p-4 border rounded-lg bg-card">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold">{msg.senderName}</h4>
                            <span className="text-xs text-muted-foreground">{formatDate(msg.timestamp)}</span>
                          </div>
                          <p className="mb-3">{msg.content}</p>

                          {msg.isCounterOffer && msg.counterOffer && (
                            <div className="bg-muted p-3 rounded-md mb-2">
                              <p className="text-sm font-medium mb-2">Counter Offer:</p>
                              <div className="grid grid-cols-2 gap-4">
                                {msg.counterOffer.budget && (
                                  <div>
                                    <span className="text-xs text-muted-foreground">Budget:</span>
                                    <p className="font-medium">{msg.counterOffer.budget}</p>
                                  </div>
                                )}
                                {msg.counterOffer.timeline && (
                                  <div>
                                    <span className="text-xs text-muted-foreground">Timeline:</span>
                                    <p className="font-medium">{msg.counterOffer.timeline}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {msg.files && msg.files.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {msg.files.map((file) => (
                                <div key={file.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                  <div className="flex items-center space-x-2">
                                    <FileText className="h-4 w-4" />
                                    <a 
                                      href={file.file_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      {file.file_name}
                                    </a>
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    {(file.file_size / 1024).toFixed(1)} KB
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <div className="space-y-4 pt-4 border-t">
                <Textarea
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[100px]"
                />

                <div className="flex items-center gap-2">
                  <Switch id="counter-offer" checked={isCounterOffer} onCheckedChange={setIsCounterOffer} />
                  <Label htmlFor="counter-offer">Include counter offer</Label>
                </div>

                {isCounterOffer && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-md bg-muted/30">
                    <div>
                      <Label htmlFor="budget">Budget</Label>
                      <Input
                        id="budget"
                        placeholder="e.g. $16,000"
                        value={counterOffer.budget}
                        onChange={(e) => setCounterOffer({ ...counterOffer, budget: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="timeline">Timeline</Label>
                      <Input
                        id="timeline"
                        placeholder="e.g. 2.5 months"
                        value={counterOffer.timeline}
                        onChange={(e) => setCounterOffer({ ...counterOffer, timeline: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      onChange={handleFileSelect}
                      multiple
                      className="flex-1"
                    />
                  </div>
                  {messageFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {messageFiles.map((file, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {file.name}
                          <button
                            onClick={() => setMessageFiles(files => files.filter((_, i) => i !== index))}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSendMessage} disabled={sendingMessage}>
                    <Send className="h-4 w-4 mr-2" />
                    {sendingMessage ? "Sending..." : (isCounterOffer ? "Send Counter Offer" : "Send Message")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Current Terms</CardTitle>
              <CardDescription>Terms for this specific conversation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center text-sm text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4 mr-1" /> Budget
                  </div>
                  <p className="font-medium">
                    {negotiation.messages && negotiation.messages.length > 0 && negotiation.messages[negotiation.messages.length - 1]?.isCounterOffer
                      ? negotiation.messages[negotiation.messages.length - 1]?.counterOffer?.budget
                      : negotiation.currentProposal?.budget}
                  </p>
                </div>
                <div>
                  <div className="flex items-center text-sm text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4 mr-1" /> Timeline
                  </div>
                  <p className="font-medium">{currentTimelineStr}</p>
                </div>
                <Separator />
                <div>
                  <div className="flex items-center text-sm text-muted-foreground mb-1">
                    <FileText className="h-4 w-4 mr-1" /> Scope
                  </div>
                  <p className="text-sm">{negotiation.currentProposal.scope}</p>
                </div>
                <div>
                  <div className="flex items-center text-sm text-muted-foreground mb-1">
                    <Check className="h-4 w-4 mr-1" /> Deliverables
                  </div>
                  <ul className="text-sm list-disc pl-5">
                    {negotiation.currentProposal.deliverables.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleAcceptTerms} disabled={acceptingTerms}>
                <ThumbsUp className="h-4 w-4 mr-2" />
                {acceptingTerms ? "Creating Contract..." : `Accept Terms with ${negotiation.otherUser?.name}`}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversation Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Started</span>
                  </div>
                  <span className="text-sm">
                    {negotiation.messages.length > 0 
                      ? new Date(negotiation.messages[0]?.timestamp).toLocaleDateString()
                      : "No messages yet"
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Messages</span>
                  </div>
                  <span className="text-sm">{negotiation.messages.length}</span>
                </div>
                {negotiation.messages.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Last Activity</span>
                    </div>
                    <span className="text-sm">
                      {new Date(negotiation.messages[negotiation.messages.length - 1]?.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}