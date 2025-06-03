"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import {
  MessageSquare,
  Calendar,
  ArrowRight,
  Handshake,
} from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase"

interface UserConversation {
  id: string
  otherParty: {
    id: string
    name: string
    avatar: string
  }
  totalMessages: number
  lastActivity: string
  activeNegotiations: {
    proposalId: string
    smartjectId: string
    smartjectTitle: string
    budget: string
    timeline: string
    messageCount: number
    isProposalOwner: boolean
  }[]
  status: 'active' | 'pending' | 'completed'
}

export default function NegotiationsPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()

  const [conversations, setConversations] = useState<UserConversation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }
    
    if (user?.accountType !== "paid") {
      router.push("/upgrade")
      return
    }

    fetchNegotiations()
  }, [isAuthenticated, user, router])

  const getUserNegotiations = async (userId: string) => {
    const supabase = getSupabaseBrowserClient();

    try {
      // Get all proposals created by the user that have messages
      const { data: userProposals, error: userProposalsError } = await supabase
        .from("proposals")
        .select("id, user_id, smartject_id, title, budget, timeline")
        .eq("user_id", userId);

      if (userProposalsError) {
        console.error("Error fetching user proposals:", userProposalsError);
        return [];
      }

      // Get all messages involving the user
      const { data: allMessages, error: messagesError } = await supabase
        .from("negotiation_messages")
        .select("proposal_id, sender_id, created_at");

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        return [];
      }

      const userConversations: { [userId: string]: UserConversation } = {};

      // Process user's own proposals
      if (userProposals) {
        for (const proposal of userProposals) {
          const proposalMessages = allMessages?.filter(msg => msg.proposal_id === proposal.id) || [];
          
          if (proposalMessages.length === 0) continue;

          // Find other party (someone who messaged about this proposal)
          const otherMessage = proposalMessages.find(msg => msg.sender_id !== userId);
          const otherPartyId = otherMessage?.sender_id;

          if (!otherPartyId) continue;

          // Get smartject title
          let smartjectTitle = (proposal.title as string) || "Unknown Smartject";
          const { data: smartjectData } = await supabase
            .from("smartjects")
            .select("title")
            .eq("id", proposal.smartject_id as string)
            .single();
          
          if (smartjectData) {
            smartjectTitle = (smartjectData.title as string) || proposal.title as string;
          }

          const lastActivity = proposalMessages.length > 0 
            ? proposalMessages.sort((a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime())[0].created_at as string
            : new Date().toISOString();

          // Group by other party
          if (!userConversations[otherPartyId as string]) {
            // Get other party info
            let otherPartyName = "Unknown User";
            const { data: userData } = await supabase
              .from("users")
              .select("name, avatar_url")
              .eq("id", otherPartyId)
              .single();
            
            if (userData) {
              otherPartyName = (userData.name as string) || "Unknown User";
            }

            userConversations[otherPartyId as string] = {
              id: `conversation-${otherPartyId}`,
              otherParty: {
                id: otherPartyId as string,
                name: otherPartyName,
                avatar: "",
              },
              totalMessages: 0,
              lastActivity: lastActivity,
              activeNegotiations: [],
              status: 'active'
            };
          }

          // Add this negotiation to the conversation
          userConversations[otherPartyId as string].activeNegotiations.push({
            proposalId: proposal.id as string,
            smartjectId: proposal.smartject_id as string,
            smartjectTitle,
            budget: (proposal.budget as string) || "",
            timeline: (proposal.timeline as string) || "",
            messageCount: proposalMessages.length,
            isProposalOwner: true,
          });

          // Update total messages and last activity for this conversation
          userConversations[otherPartyId as string].totalMessages += proposalMessages.length;
          
          if (new Date(lastActivity).getTime() > new Date(userConversations[otherPartyId as string].lastActivity).getTime()) {
            userConversations[otherPartyId as string].lastActivity = lastActivity;
          }
        }
      }

      // Convert to array and sort by last activity
      const conversations = Object.values(userConversations);
      return conversations.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());

    } catch (error) {
      console.error("Error in getUserNegotiations:", error);
      return [];
    }
  }

  const fetchNegotiations = async () => {
    setIsLoading(true)
    try {
      if (!user?.id) return
      
      const userConversations = await getUserNegotiations(user.id)
      setConversations(userConversations)
    } catch (error) {
      console.error("Error fetching negotiations:", error)
      toast({
        title: "Error",
        description: "Failed to load negotiations",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "completed":
        return <Badge variant="outline">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (!isAuthenticated || user?.accountType !== "paid") {
    return null
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Your Negotiations</h1>
        <p className="text-muted-foreground mt-2">
          Manage your active proposal negotiations and discussions
        </p>
      </div>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Active Conversations</h3>
            <p className="text-muted-foreground text-center mb-4">
              You don't have any active negotiation conversations at the moment.
            </p>
            <Button onClick={() => router.push("/smartjects")}>
              Browse Smartjects
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation) => (
            <Card key={conversation.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-lg">
                        {conversation.otherParty.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">
                        {conversation.otherParty.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Handshake className="h-4 w-4" />
                        {conversation.activeNegotiations.length} active negotiation{conversation.activeNegotiations.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(conversation.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Messages</p>
                      <p className="font-medium">{conversation.totalMessages}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Last Activity</p>
                      <p className="font-medium">{formatDate(conversation.lastActivity)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Handshake className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Negotiations</p>
                      <p className="font-medium">{conversation.activeNegotiations.length}</p>
                    </div>
                  </div>
                </div>
                
                {/* Show active negotiations for this user */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Active Projects:</h4>
                  <div className="space-y-2">
                    {conversation.activeNegotiations.map((negotiation) => (
                      <div key={negotiation.proposalId} className="bg-muted/30 rounded-md p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium">{negotiation.smartjectTitle}</h5>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span>💰 {negotiation.budget}</span>
                              <span>⏰ {negotiation.timeline}</span>
                              <span>💬 {negotiation.messageCount} messages</span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/matches/match-${negotiation.smartjectId}-${negotiation.proposalId}/negotiate/${negotiation.proposalId}`)}
                          >
                            Open
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Negotiating on {conversation.activeNegotiations.length} project{conversation.activeNegotiations.length !== 1 ? 's' : ''} with this user
                  </div>
                  <Button
                    onClick={() => {
                      // Navigate to the most recent negotiation
                      const mostRecent = conversation.activeNegotiations[0];
                      router.push(`/matches/match-${mostRecent.smartjectId}-${mostRecent.proposalId}/negotiate/${mostRecent.proposalId}`);
                    }}
                    className="ml-4"
                  >
                    Continue Conversation
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}