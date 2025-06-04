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
    matchId: string;
    proposalId: string
    smartjectId: string
    smartjectTitle: string
    budget: string
    timeline: string
    messageCount: number
    isProposalOwner: boolean
    status?: string
  }[]
  status: 'active' | 'pending' | 'completed' | 'contract_created' | 'cancelled'
}

export default function NegotiationsPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()

  const [conversations, setConversations] = useState<UserConversation[]>([])
  const [completedConversations, setCompletedConversations] = useState<UserConversation[]>([])
  const [showCompleted, setShowCompleted] = useState(false)
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
    // 1. Получаем все пропозалы, где пользователь — владелец
    const { data: ownedProposals, error: ownedProposalsError } = await supabase
      .from("proposals")
      .select("id, user_id, smartject_id, title, budget, timeline")
      .eq("user_id", userId);

    if (ownedProposalsError) {
      console.error("Error fetching owned proposals:", ownedProposalsError);
      return [];
    }

    // 2. Получаем все сообщения, отправленные этим пользователем
    const { data: sentMessages, error: sentMessagesError } = await supabase
      .from("negotiation_messages")
      .select("proposal_id, sender_id, created_at")
      .eq("sender_id", userId);

    if (sentMessagesError) {
      console.error("Error fetching sent messages:", sentMessagesError);
      return [];
    }

    // 3. Получаем все сообщения, адресованные пользователю (по owned proposals)
    const { data: receivedMessages, error: receivedMessagesError } = await supabase
      .from("negotiation_messages")
      .select("proposal_id, sender_id, created_at")
      .in("proposal_id", ownedProposals.map(p => p.id));

    if (receivedMessagesError) {
      console.error("Error fetching received messages:", receivedMessagesError);
      return [];
    }

    // 4. Объединяем все сообщения, где участвует пользователь
    const allMessages = [...sentMessages, ...receivedMessages];

    // 5. Группируем по proposal_id
    const uniqueProposalIds = [...new Set(allMessages.map(msg => msg.proposal_id))];

    const userConversations: { [conversationId: string]: UserConversation } = {};

    
    for (const proposalId of uniqueProposalIds) {
      // Получаем пропозал
      const { data: proposal, error: proposalError } = await supabase
        .from("proposals")
        .select("id, user_id, smartject_id, title, budget, timeline")
        .eq("id", proposalId)
        .single();

      if (proposalError || !proposal) continue;

      const isProposalOwner = proposal.user_id === userId;

      // Получаем все сообщения по пропозалу
      const { data: proposalMessages } = await supabase
        .from("negotiation_messages")
        .select("id, proposal_id, sender_id, created_at")
        .eq("proposal_id", proposalId);

      if (!proposalMessages || proposalMessages.length === 0) continue;

      // Находим ID второй стороны
      const otherPartyMessage = proposalMessages.find(msg => msg.sender_id !== userId);
      const otherPartyId = isProposalOwner
        ? otherPartyMessage?.sender_id
        : proposal.user_id;

      if (!otherPartyId) continue;

      // Определяем provider и needer
      const providerId = proposal.user_id; // Тот кто создал proposal всегда provider
      const neederId = isProposalOwner ? otherPartyId : userId;

      console.log(`Looking for match with smartject_id: ${proposal.smartject_id}, provider: ${providerId}, needer: ${neederId}`);

      // Получаем или создаем match по smartject_id, provider_id и needer_id
      let matchId = null;
      
      // Сначала пытаемся найти существующий match
      const { data: existingMatch, error: matchError } = await supabase
        .from("matches")
        .select("id, status")
        .eq("smartject_id", proposal.smartject_id)
        .eq("provider_id", providerId)
        .eq("needer_id", neederId)
        .maybeSingle();

      if (matchError) {
        console.error("Error looking up match:", matchError);
        continue; // Пропускаем этот proposal если не можем найти match
      }

      if (existingMatch) {
        matchId = existingMatch.id;
        console.log(`Found existing match: ${matchId} for smartject: ${proposal.smartject_id} between provider: ${providerId} and needer: ${neederId}`);
      } else {
        console.log(`No existing match found for smartject: ${proposal.smartject_id} between provider: ${providerId} and needer: ${neederId}, creating new match...`);
        
        // Если match не найден, создаем новый
        const { data: newMatch, error: createError } = await supabase
          .from("matches")
          .insert({
            smartject_id: proposal.smartject_id,
            provider_id: providerId,
            needer_id: neederId,
            status: 'new'
          })
          .select("id")
          .single();

        if (newMatch && !createError) {
          matchId = newMatch.id;
          console.log(`Created new match: ${matchId} for smartject: ${proposal.smartject_id} between provider: ${providerId} and needer: ${neederId}`);
        } else {
          console.error(`Error creating match for smartject ${proposal.smartject_id} between provider: ${providerId} and needer: ${neederId}:`, createError);
          console.error("Proposal data:", proposal);
          continue; // Пропускаем этот proposal если не можем создать match
        }
      }

      if (!matchId) {
        console.error(`Failed to get matchId for proposal ${proposalId} with smartject ${proposal.smartject_id} between provider: ${providerId} and needer: ${neederId}`);
        continue;
      }

      // Получаем данные другой стороны
      const { data: userData } = await supabase
        .from("users")
        .select("name, avatar_url")
        .eq("id", otherPartyId)
        .single();

      const otherPartyName = userData?.name || "Unknown User";
      const otherPartyAvatar = userData?.avatar_url || "";

      // Получаем smartject
      const { data: smartjectData } = await supabase
        .from("smartjects")
        .select("title")
        .eq("id", proposal.smartject_id)
        .single();

      const smartjectTitle = smartjectData?.title || "Unknown Smartject";

      const lastActivity = proposalMessages
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
        .created_at;

      const conversationKey = `${proposalId}-${otherPartyId}`;

      if (!userConversations[conversationKey]) {
        userConversations[conversationKey] = {
          id: conversationKey,
          otherParty: {
            id: otherPartyId,
            name: otherPartyName,
            avatar: otherPartyAvatar,
          },
          totalMessages: 0,
          lastActivity,
          activeNegotiations: [],
          status: 'active'
        };
      }

      userConversations[conversationKey].activeNegotiations.push({
        proposalId: proposal.id,
        smartjectId: proposal.smartject_id,
        matchId,
        smartjectTitle,
        budget: proposal.budget || "",
        timeline: proposal.timeline || "",
        messageCount: proposalMessages.length,
        isProposalOwner,
        status: existingMatch?.status || 'new',
      });

      userConversations[conversationKey].totalMessages += proposalMessages.length;
    }

    const allConversations = Object.values(userConversations);
    
    // Separate active and completed conversations
    const activeConversations: UserConversation[] = [];
    const completedConversations: UserConversation[] = [];
    
    allConversations.forEach(conversation => {
      const activeNegotiations = conversation.activeNegotiations.filter(neg => 
        neg.status !== 'contract_created' && neg.status !== 'cancelled'
      );
      const completedNegotiations = conversation.activeNegotiations.filter(neg => 
        neg.status === 'contract_created' || neg.status === 'cancelled'
      );
      
      if (activeNegotiations.length > 0) {
        activeConversations.push({
          ...conversation,
          activeNegotiations,
          status: 'active'
        });
      }
      
      if (completedNegotiations.length > 0) {
        completedConversations.push({
          ...conversation,
          activeNegotiations: completedNegotiations,
          status: completedNegotiations[0].status === 'contract_created' ? 'completed' : 'cancelled'
        });
      }
    });
    
    return {
      active: activeConversations.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()),
      completed: completedConversations.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
    };
  } catch (error) {
    console.error("Error in getUserNegotiations:", error);
    return {
      active: [],
      completed: []
    };
  }
};

  const fetchNegotiations = async () => {
    setIsLoading(true)
    try {
      if (!user?.id) return
      
      const result = await getUserNegotiations(user.id)
      setConversations(result.active)
      setCompletedConversations(result.completed)
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
        return <Badge variant="outline" className="text-green-600 border-green-600">Completed</Badge>
      case "cancelled":
        return <Badge variant="outline" className="text-red-600 border-red-600">Cancelled</Badge>
      case "contract_created":
        return <Badge variant="outline" className="text-green-600 border-green-600">Contract Created</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getNegotiationStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="secondary" className="text-xs">New</Badge>
      case "negotiating":
        return <Badge variant="default" className="text-xs">Negotiating</Badge>
      case "terms_agreed":
        return <Badge variant="outline" className="text-xs text-blue-600 border-blue-600">Terms Agreed</Badge>
      case "contract_created":
        return <Badge variant="outline" className="text-xs text-green-600 border-green-600">Contract Created</Badge>
      case "cancelled":
        return <Badge variant="outline" className="text-xs text-red-600 border-red-600">Cancelled</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>
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
          Manage your proposal negotiations and discussions
        </p>
        <div className="flex gap-2 mt-4">
          <Button 
            variant={!showCompleted ? "default" : "outline"} 
            onClick={() => setShowCompleted(false)}
          >
            Active ({conversations.length})
          </Button>
          <Button 
            variant={showCompleted ? "default" : "outline"} 
            onClick={() => setShowCompleted(true)}
          >
            Completed ({completedConversations.length})
          </Button>
        </div>
      </div>

      {(!showCompleted && conversations.length === 0) || (showCompleted && completedConversations.length === 0) ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {showCompleted ? "No Completed Conversations" : "No Active Conversations"}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {showCompleted 
                ? "You don't have any completed negotiation conversations yet."
                : "You don't have any active negotiation conversations at the moment."
              }
            </p>
            <Button onClick={() => router.push("/smartjects")}>
              Browse Smartjects
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {(showCompleted ? completedConversations : conversations).map((conversation) => (
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
                              {negotiation.status && getNegotiationStatusBadge(negotiation.status)}
                            </div>
                          </div>
                          {showCompleted ? (
                            <div className="flex gap-2">
                              {negotiation.status === 'contract_created' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/matches/${negotiation.matchId}/contract/${negotiation.proposalId}`)}
                                >
                                  View Contract
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/matches/${negotiation.matchId}/negotiate/${negotiation.proposalId}/${conversation.otherParty.id}`)}
                              >
                                View History
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/matches/${negotiation.matchId}/negotiate/${negotiation.proposalId}/${conversation.otherParty.id}`)}
                            >
                              Open
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {showCompleted 
                      ? `${conversation.activeNegotiations.length} completed negotiation${conversation.activeNegotiations.length !== 1 ? 's' : ''} with this user`
                      : `Negotiating on ${conversation.activeNegotiations.length} project${conversation.activeNegotiations.length !== 1 ? 's' : ''} with this user`
                    }
                  </div>
                  {!showCompleted && (
                    <Button
                      onClick={() => {
                        // Navigate to the most recent negotiation
                        const mostRecent = conversation.activeNegotiations[0];
                        router.push(`/matches/${mostRecent.matchId}/negotiate/${mostRecent.proposalId}/${conversation.otherParty.id}`);
                      }}
                      className="ml-4"
                    >
                      Continue Conversation
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}