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
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  DollarSign,
  FileText,
  MessageSquare,
  Paperclip,
  Send,
  ThumbsUp,
  CheckCircle2,
  Circle,
  ListChecks,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useProposal } from "@/hooks/use-proposal"
import { negotiationService } from "@/lib/services"

// Define deliverable type
interface Deliverable {
  id: string
  description: string
  completed: boolean
}

// Update milestone type to include deliverables
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

interface NegotiationData {
  matchId: string
  proposalId: string
  smartjectTitle: string
  provider: User
  needer: User
  currentProposal: CurrentProposal
  milestones: Milestone[]
  messages: Message[]
}

// Define mock data outside the component to prevent recreation on each render


export default function NegotiatePage({
  params,
}: {
  params: Promise<{ id: string; proposalId: string }>;
}) {
  const { id, proposalId } = use(params);
  
  const { proposal, isLoading, refetch } = useProposal(proposalId);

  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()

  // State for negotiation data
  const [negotiation, setNegotiation] = useState<NegotiationData | null>(null)
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

  // Extract the timeline string once to avoid recalculations
  const currentTimelineStr = useMemo(() => {
    if (!negotiation) return ""
    const lastMessage = negotiation.messages?.[negotiation.messages.length - 1]
    return lastMessage?.isCounterOffer ? lastMessage.counterOffer?.timeline : negotiation.currentProposal?.timeline
  }, [negotiation])


  // Fetch negotiation data
  useEffect(() => {
    const fetchNegotiationData = async () => {
      if (!isAuthenticated || user?.accountType !== "paid") {
        return
      }
      
      setNegotiationLoading(true)
      try {
        const data = await negotiationService.getNegotiationData(id, proposalId)
        setNegotiation(data)
        
        // Set milestones from the negotiation data
        if (data?.milestones && data.milestones.length > 0) {
          setMilestones(data.milestones)
          setUseMilestones(true)
        }
      } catch (error) {
        console.error("Error fetching negotiation data:", error)
        toast({
          title: "Error",
          description: "Failed to load negotiation data",
          variant: "destructive",
        })
      } finally {
        setNegotiationLoading(false)
      }
    }

    fetchNegotiationData()
  }, [id, proposalId, isAuthenticated, user, toast])

  // Redirect if not authenticated or not a paid user
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login")
    } else if (user?.accountType !== "paid") {
      router.push("/upgrade")
    }
  }, [isAuthenticated, router, user])

  // Calculate total percentage whenever milestones change
  useEffect(() => {
    const total = milestones.reduce((sum, milestone) => sum + milestone.percentage, 0)
    setTotalPercentage(total)
  }, [milestones])

  // Calculate project timeline based on current proposal - only run once on initial render
  useEffect(() => {
    // Set project start date to today
    const start = new Date()

    // Extract number of months from timeline string (e.g., "3 months" -> 3)
    const durationMatch = currentTimelineStr?.match(/(\d+(\.\d+)?)/)
    const durationMonths = durationMatch ? Number.parseFloat(durationMatch[1]) : 3

    // Calculate end date
    const end = new Date(start)
    end.setMonth(end.getMonth() + Math.floor(durationMonths))
    // Handle partial months
    const remainingDays = Math.round((durationMonths % 1) * 30)
    end.setDate(end.getDate() + remainingDays)

    // Only run this effect once on component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!isAuthenticated || user?.accountType !== "paid" || isLoading || negotiationLoading || !negotiation) {
    return null
  }

  const handleSendMessage = async () => {
    if (!message.trim() && (!isCounterOffer || (!counterOffer.budget && !counterOffer.timeline))) {
      toast({
        title: "Missing information",
        description: "Please provide a message or counter offer terms.",
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

        // Refetch negotiation data to show the new message
        const updatedData = await negotiationService.getNegotiationData(id, proposalId)
        if (updatedData) {
          setNegotiation(updatedData)
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

  const handleAcceptTerms = () => {
    // Validate milestones if they're being used
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

    // In a real app, we would call an API to accept the terms
    toast({
      title: "Terms accepted",
      description: "You've accepted the terms. A contract will be generated.",
    })

    // Redirect to the contract page
    router.push(`/matches/${id}/contract/${proposalId}`)
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
        <div>
          <h1 className="text-2xl font-bold">Negotiate Terms</h1>
          <p className="text-muted-foreground">
            For smartject: <span className="font-medium">{negotiation?.smartjectTitle || 'Loading...'}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Discussion</CardTitle>
                <CardDescription>Negotiate terms and conditions</CardDescription>
              </div>
              <Badge variant="outline" className="ml-2">
                {negotiation?.messages?.length || 0} messages
              </Badge>
            </CardHeader>

            <CardContent>
              {/* Comments-like interface for messages */}
              <div className="space-y-6 mb-6">
                {negotiation?.messages?.map((msg: Message) => {
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
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* New message input */}
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

                <div className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attach File
                  </Button>
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
              <CardDescription>Latest agreed upon terms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center text-sm text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4 mr-1" /> Budget
                  </div>
                  <p className="font-medium">
                    {negotiation?.messages && negotiation.messages.length > 0 && negotiation.messages[negotiation.messages.length - 1]?.isCounterOffer
                      ? negotiation.messages[negotiation.messages.length - 1]?.counterOffer?.budget
                      : negotiation?.currentProposal?.budget}
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
                    {negotiation?.currentProposal?.deliverables?.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    )) || []}
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleAcceptTerms}>
                <ThumbsUp className="h-4 w-4 mr-2" />
                Accept Current Terms
              </Button>
            </CardFooter>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Payment Milestones</CardTitle>
              <CardDescription>Review payment schedule for the project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="use-milestones" className="flex items-center gap-2">
                    <span>Use payment milestones</span>
                    {useMilestones && totalPercentage !== 100 && (
                      <span className="text-xs text-red-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Total must be 100%
                      </span>
                    )}
                  </Label>
                  <Switch id="use-milestones" checked={useMilestones} onCheckedChange={setUseMilestones} />
                </div>

                {useMilestones && (
                  <>
                    <div className="border rounded-md p-3 bg-muted/30">
                      <p className="text-sm">
                        These milestones were defined in the proposal. You can review them before accepting the terms.
                      </p>
                      <div className="mt-2 text-sm flex justify-between">
                        <span>
                          Current total: <strong>{totalPercentage}%</strong>
                        </span>
                        <span>
                          Remaining: <strong>{100 - totalPercentage}%</strong>
                        </span>
                      </div>
                    </div>

                    {milestones.length > 0 ? (
                      <div className="space-y-2">
                        {milestones.map((milestone) => (
                          <div key={milestone.id} className="border rounded-md p-3">
                            <div className="w-full">
                              <div className="font-medium">{milestone.name}</div>
                              <div className="text-sm text-muted-foreground">{milestone.description}</div>
                              <div className="mt-1 flex gap-3 text-sm">
                                <span>{milestone.percentage}%</span>
                                <span>{milestone.amount}</span>
                      
                              </div>

                              {/* Display deliverables if any */}
                              {milestone.deliverables && milestone.deliverables.length > 0 && (
                                <div className="mt-2 pt-2 border-t">
                                  <div className="flex items-center text-xs text-muted-foreground mb-1">
                                    <ListChecks className="h-3 w-3 mr-1" /> Deliverables
                                  </div>
                                  <ul className="text-sm space-y-1 mt-1">
                                    {milestone.deliverables.map((deliverable) => (
                                      <li key={deliverable.id} className="flex items-start gap-2">
                                        <span className="mt-0.5">
                                          {deliverable.completed ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                          ) : (
                                            <Circle className="h-4 w-4 text-muted-foreground" />
                                          )}
                                        </span>
                                        <span className="flex-1">{deliverable.description}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center text-muted-foreground">
                        <FileText className="h-8 w-8 mb-2" />
                        <p>No milestones defined in the proposal</p>
                        <p className="text-sm">The proposal did not include payment milestones</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Negotiation Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Started</span>
                  </div>
                  <span className="text-sm">{new Date(negotiation.messages[0]?.timestamp).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Messages</span>
                  </div>
                  <span className="text-sm">{negotiation.messages.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Last Activity</span>
                  </div>
                  <span className="text-sm">
                    {new Date(negotiation.messages[negotiation.messages.length - 1]?.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
