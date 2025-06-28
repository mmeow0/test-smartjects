"use client";

import { useEffect, useState, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRequirePaidAccount } from "@/hooks/use-auth-guard";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  DollarSign,
  FileText,
  Handshake,
  MessageSquare,
  Send,
  ThumbsUp,
  CheckCircle2,
  Circle,
  ListChecks,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useProposal } from "@/hooks/use-proposal";
import { negotiationService } from "@/lib/services/negotiation.service";
import { getSupabaseBrowserClient } from "@/lib/supabase";

// Define deliverable type
interface Deliverable {
  id: string;
  description: string;
  completed: boolean;
}

// Update milestone type to include deliverables
interface Milestone {
  id: string;
  name: string;
  description: string;
  percentage: number;
  amount: string;
  deliverables: Deliverable[];
}

interface Message {
  id: string;
  sender: "provider" | "needer";
  senderName: string;
  content: string;
  timestamp: string;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  rating: number;
}

interface CurrentProposal {
  budget: string;
  timeline: string;
  scope: string;
  deliverables: string[];
}

interface NegotiationFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
}

interface NegotiationData {
  matchId: string;
  proposalId: string;
  smartjectTitle: string;
  provider: User;
  needer: User;
  proposalAuthor: User;
  currentProposal: CurrentProposal;
  milestones: Milestone[];
  messages: Message[];
  files: NegotiationFile[];
}

export default function NegotiatePage({
  params,
}: {
  params: Promise<{ id: string; proposalId: string }>;
}) {
  const { id, proposalId } = use(params);

  const { proposal, isLoading, refetch } = useProposal(proposalId);

  const router = useRouter();
  const { isLoading: authLoading, user, canAccess } = useRequirePaidAccount();
  const { toast } = useToast();

  // State for negotiation data
  const [negotiation, setNegotiation] = useState<NegotiationData | null>(null);
  const [negotiationLoading, setNegotiationLoading] = useState(true);
  const [otherUsers, setOtherUsers] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [showUserSelection, setShowUserSelection] = useState(false);

  const [message, setMessage] = useState("");
  const [useMilestones, setUseMilestones] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [messageFiles, setMessageFiles] = useState<File[]>([]);

  // Extract the timeline string once to avoid recalculations
  const currentTimelineStr = useMemo(() => {
    if (!negotiation) return "";
    return negotiation.currentProposal?.timeline;
  }, [negotiation]);

  // Fetch negotiation data and check for multiple users
  useEffect(() => {
    const fetchNegotiationData = async () => {
      if (authLoading || !canAccess) {
        return;
      }

      setNegotiationLoading(true);
      try {
        // First, check how many different users have sent messages for this proposal
        const supabase = getSupabaseBrowserClient();

        const { data: messagesData, error: messagesError } = await supabase
          .from("negotiation_messages")
          .select("sender_id, users(id, name)")
          .eq("proposal_id", proposalId)
          .neq("sender_id", user?.id || "");

        if (messagesError) {
          console.error("Error fetching messages:", messagesError);
        }

        // Get unique other users
        const uniqueOtherUsers =
          messagesData?.reduce(
            (acc: Array<{ id: string; name: string }>, msg: any) => {
              const userId = msg.sender_id;
              const userName = msg.users?.name || "Unknown User";
              if (!acc.find((u) => u.id === userId)) {
                acc.push({ id: userId, name: userName });
              }
              return acc;
            },
            [],
          ) || [];

        setOtherUsers(uniqueOtherUsers);

        // If there's more than one other user, show selection interface
        if (uniqueOtherUsers.length > 1) {
          setShowUserSelection(true);
          setNegotiationLoading(false);
          return;
        }

        // If there's exactly one other user, redirect to individual page
        if (uniqueOtherUsers.length === 1) {
          router.push(
            `/matches/${id}/negotiate/${proposalId}/${uniqueOtherUsers[0].id}`,
          );
          return;
        }

        // If no other users, continue with original logic
        const data = await negotiationService.getNegotiationData(
          id,
          proposalId,
        );

        // Получаем файлы для переговоров
        const { data: filesData } = await supabase
          .from("negotiation_files")
          .select("*")
          .eq("negotiation_id", proposalId)
          .order("created_at", { ascending: false });

        const files = (filesData || []).map((file: any) => ({
          id: file.id,
          file_name: file.file_name,
          file_url: file.file_url,
          file_type: file.file_type,
          file_size: file.file_size,
          uploaded_by: file.uploaded_by,
          created_at: file.created_at,
        })) as NegotiationFile[];

        if (data) {
          setNegotiation({
            matchId: data.matchId,
            proposalId: data.proposalId,
            smartjectTitle: data.smartjectTitle,
            provider: data.provider,
            needer: data.needer,
            proposalAuthor: data.proposalAuthor,
            currentProposal: data.currentProposal,
            milestones: data.milestones,
            messages: data.messages,
            files,
          });
        }

        // Set milestones from the negotiation data
        if (data?.milestones && data.milestones.length > 0) {
          setMilestones(data.milestones);
          setUseMilestones(true);
        }
      } catch (error) {
        console.error("Error fetching negotiation data:", error);
        toast({
          title: "Error",
          description: "Failed to load negotiation data",
          variant: "destructive",
        });
      } finally {
        setNegotiationLoading(false);
      }
    };

    if (authLoading || !canAccess) {
      return;
    }

    fetchNegotiationData();
  }, [id, proposalId, authLoading, canAccess, user, toast, router]);

  // Calculate total percentage whenever milestones change
  useEffect(() => {
    const total = milestones.reduce(
      (sum, milestone) => sum + milestone.percentage,
      0,
    );
    setTotalPercentage(total);
  }, [milestones]);

  // Calculate project timeline based on current proposal - only run once on initial render
  useEffect(() => {
    // Set project start date to today
    const start = new Date();

    // Extract number of months from timeline string (e.g., "3 months" -> 3)
    const durationMatch = currentTimelineStr?.match(/(\d+(\.\d+)?)/);
    const durationMonths = durationMatch
      ? Number.parseFloat(durationMatch[1])
      : 3;

    // Calculate end date
    const end = new Date(start);
    end.setMonth(end.getMonth() + Math.floor(durationMonths));
    // Handle partial months
    const remainingDays = Math.round((durationMonths % 1) * 30);
    end.setDate(end.getDate() + remainingDays);

    // Only run this effect once on component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (authLoading || !canAccess || isLoading || negotiationLoading) {
    return null;
  }

  // Show user selection interface if multiple users
  if (showUserSelection) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/negotiations")}
            className="mr-4"
          >
            <Handshake className="h-4 w-4 mr-2" />
            All Negotiations
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Select Conversation</h1>
            <p className="text-muted-foreground">
              Multiple users are interested in this proposal. Choose who to
              negotiate with:
            </p>
          </div>
        </div>

        <div className="grid gap-4 max-w-2xl">
          {otherUsers.map((otherUser) => (
            <Card
              key={otherUser.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() =>
                router.push(
                  `/matches/${id}/negotiate/${proposalId}/${otherUser.id}`,
                )
              }
            >
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{otherUser.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Click to start individual negotiation
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!negotiation) {
    return null;
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setMessageFiles(Array.from(files));
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() && messageFiles.length === 0) {
      toast({
        title: "Missing information",
        description: "Please provide a message or attach files.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    setSendingMessage(true);

    try {
      const success = await negotiationService.addNegotiationMessage(
        proposalId,
        user.id,
        message,
        false,
        undefined,
        undefined,
      );

      if (success) {
        // Загружаем файлы, если они есть
        if (messageFiles.length > 0) {
          const supabase = getSupabaseBrowserClient();

          // Получаем последнее сообщение переговоров
          const { data: lastMessage } = await supabase
            .from("negotiation_messages")
            .select("id")
            .eq("proposal_id", proposalId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (!lastMessage) throw new Error("No negotiation message found");

          const messageId = (lastMessage as { id: string }).id;
          if (messageId) {
            for (const file of messageFiles) {
              const fileExt = file.name.split(".").pop();
              const fileName = `${Math.random()}.${fileExt}`;
              const filePath = `negotiation-files/${proposalId}/${fileName}`;

              const { error: uploadError } = await supabase.storage
                .from("negotiation-files")
                .upload(filePath, file);

              if (uploadError) throw uploadError;

              const {
                data: { publicUrl },
              } = supabase.storage
                .from("negotiation-files")
                .getPublicUrl(filePath);

              const { error: dbError } = await supabase
                .from("negotiation_files")
                .insert({
                  negotiation_id: messageId,
                  file_name: file.name,
                  file_url: publicUrl,
                  file_type: file.type,
                  file_size: file.size,
                  uploaded_by: user.id,
                });

              if (dbError) throw dbError;
            }
          }
        }

        toast({
          title: "Message sent",
          description: "Your message has been sent successfully.",
        });

        // Clear the inputs
        setMessage("");
        setMessageFiles([]);

        // Refetch negotiation data to show the new message
        const updatedData = await negotiationService.getNegotiationData(
          id,
          proposalId,
        );
        if (updatedData) {
          setNegotiation(updatedData);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleAcceptTerms = () => {
    // Validate milestones if they're being used
    if (useMilestones) {
      if (milestones.length === 0) {
        toast({
          title: "No milestones defined",
          description:
            "Please add at least one milestone before accepting terms.",
          variant: "destructive",
        });
        return;
      }

      if (totalPercentage !== 100) {
        toast({
          title: "Invalid milestone percentages",
          description:
            "The total percentage of all milestones must equal 100%.",
          variant: "destructive",
        });
        return;
      }
    }

    // In a real app, we would call an API to accept the terms
    toast({
      title: "Terms accepted",
      description: "You've accepted the terms. A contract will be generated.",
    });

    // Redirect to the contract page
    router.push(`/matches/${id}/contract/${proposalId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !negotiation) return;

    setUploadingFile(true);
    try {
      const supabase = getSupabaseBrowserClient();

      // Загружаем файл в storage
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `negotiation-files/${negotiation.proposalId}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("negotiation-files")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Получаем публичный URL файла
      const {
        data: { publicUrl },
      } = supabase.storage.from("negotiation-files").getPublicUrl(filePath);

      // Получаем последнее сообщение переговоров
      const { data: lastMessage } = await supabase
        .from("negotiation_messages")
        .select("id")
        .eq("proposal_id", negotiation.proposalId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!lastMessage) throw new Error("No negotiation message found");

      const messageId = (lastMessage as { id: string }).id;

      // Сохраняем информацию о файле в базе данных
      const { error: dbError } = await supabase
        .from("negotiation_files")
        .insert({
          negotiation_id: messageId,
          file_name: selectedFile.name,
          file_url: publicUrl,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
          uploaded_by: user?.id,
        });

      if (dbError) throw dbError;

      toast({
        title: "Успех",
        description: "Файл успешно загружен",
      });

      // Обновляем список файлов
      const { data: filesData } = await supabase
        .from("negotiation_files")
        .select("*")
        .eq("negotiation_id", messageId)
        .order("created_at", { ascending: false });

      const files = (filesData || []).map((file: any) => ({
        id: file.id,
        file_name: file.file_name,
        file_url: file.file_url,
        file_type: file.file_type,
        file_size: file.file_size,
        uploaded_by: file.uploaded_by,
        created_at: file.created_at,
      })) as NegotiationFile[];

      setNegotiation((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          files,
        };
      });
      setSelectedFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить файл",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  // Добавляем компонент для отображения файлов в UI
  const renderFiles = () => {
    if (!negotiation?.files?.length) return null;

    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Прикрепленные файлы</h3>
        <div className="space-y-2">
          {negotiation.files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
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
              <span className="text-sm text-gray-500">
                {(file.file_size / 1024).toFixed(1)} KB
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Добавляем компонент загрузки файла в UI
  const renderFileUpload = () => (
    <div className="mt-4">
      <div className="flex items-center space-x-2">
        <Input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          disabled={uploadingFile}
        />
        <Button
          onClick={handleFileUpload}
          disabled={!selectedFile || uploadingFile}
        >
          {uploadingFile ? "Загрузка..." : "Загрузить"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <div className="flex items-center gap-2 mr-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/negotiations")}
          >
            <Handshake className="h-4 w-4 mr-2" />
            All Negotiations
          </Button>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Negotiate Terms</h1>
          <p className="text-muted-foreground">
            For smartject:{" "}
            <span className="font-medium">
              {negotiation?.smartjectTitle || "Loading..."}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Proposal Creator Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Proposal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {negotiation?.proposalAuthor?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {negotiation?.proposalAuthor?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Submitted this proposal
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">Proposal Creator</Badge>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                {user?.id === negotiation?.proposalAuthor?.id
                  ? "You submitted this proposal. The smartject owner can accept or negotiate terms."
                  : "This proposal was submitted for your smartject. You can accept or negotiate terms."}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Discussion</CardTitle>
                <CardDescription>
                  Negotiate terms and conditions
                </CardDescription>
              </div>
              <Badge variant="outline" className="ml-2">
                {negotiation?.messages?.length || 0} messages
              </Badge>
            </CardHeader>

            <CardContent>
              {/* Comments-like interface for messages */}
              <div className="space-y-6 mb-6">
                {negotiation?.messages?.map((msg: Message) => {
                  const isCurrentUser =
                    msg.sender ===
                    (user?.id === negotiation.provider.id
                      ? "provider"
                      : "needer");
                  return (
                    <div
                      key={msg.id}
                      className="flex gap-4 p-4 border rounded-lg bg-card"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {msg.senderName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold">{msg.senderName}</h4>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(msg.timestamp)}
                          </span>
                        </div>
                        <p className="mb-3">{msg.content}</p>
                      </div>
                    </div>
                  );
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
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <FileText className="h-3 w-3" />
                          {file.name}
                          <button
                            onClick={() =>
                              setMessageFiles((files) =>
                                files.filter((_, i) => i !== index),
                              )
                            }
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
                    {sendingMessage ? "Sending..." : "Send Message"}
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
                    {negotiation?.currentProposal?.budget}
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
                    {negotiation?.currentProposal?.deliverables?.map(
                      (item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ),
                    ) || []}
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {user?.id === negotiation?.needer?.id ? (
                <Button className="w-full" onClick={handleAcceptTerms}>
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Accept Current Terms
                </Button>
              ) : (
                <div className="w-full text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Only the smartject owner can accept terms
                  </p>
                  <Button className="w-full" disabled>
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Accept Current Terms
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Payment Milestones</CardTitle>
              <CardDescription>
                Review payment schedule for the project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="use-milestones"
                    className="flex items-center gap-2"
                  >
                    <span>Use payment milestones</span>
                    {useMilestones && totalPercentage !== 100 && (
                      <span className="text-xs text-red-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Total must be 100%
                      </span>
                    )}
                  </Label>
                  <Switch
                    id="use-milestones"
                    checked={useMilestones}
                    onCheckedChange={setUseMilestones}
                    disabled={user?.id !== negotiation?.needer?.id}
                  />
                </div>

                {useMilestones && (
                  <>
                    <div className="border rounded-md p-3 bg-muted/30">
                      <p className="text-sm">
                        These milestones were defined in the proposal. You can
                        review them before accepting the terms.
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
                          <div
                            key={milestone.id}
                            className="border rounded-md p-3"
                          >
                            <div className="w-full">
                              <div className="font-medium">
                                {milestone.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {milestone.description}
                              </div>
                              <div className="mt-1 flex gap-3 text-sm">
                                <span>{milestone.percentage}%</span>
                                <span>{milestone.amount}</span>
                              </div>

                              {/* Display deliverables if any */}
                              {milestone.deliverables &&
                                milestone.deliverables.length > 0 && (
                                  <div className="mt-2 pt-2 border-t">
                                    <div className="flex items-center text-xs text-muted-foreground mb-1">
                                      <ListChecks className="h-3 w-3 mr-1" />{" "}
                                      Deliverables
                                    </div>
                                    <ul className="text-sm space-y-1 mt-1">
                                      {milestone.deliverables.map(
                                        (deliverable) => (
                                          <li
                                            key={deliverable.id}
                                            className="flex items-start gap-2"
                                          >
                                            <span className="mt-0.5">
                                              {deliverable.completed ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                              ) : (
                                                <Circle className="h-4 w-4 text-muted-foreground" />
                                              )}
                                            </span>
                                            <span className="flex-1">
                                              {deliverable.description}
                                            </span>
                                          </li>
                                        ),
                                      )}
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
                        <p className="text-sm">
                          The proposal did not include payment milestones
                        </p>
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
                  <span className="text-sm">
                    {new Date(
                      negotiation.messages[0]?.timestamp,
                    ).toLocaleDateString()}
                  </span>
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
                    {new Date(
                      negotiation.messages[
                        negotiation.messages.length - 1
                      ]?.timestamp,
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
