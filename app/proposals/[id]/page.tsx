"use client";

import { use, useEffect, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { ProposalDocumentPreview } from "@/components/proposal-document-preview";
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  MessageSquare,
  Pencil,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { ProposalType } from "@/lib/types";
import { proposalService } from "@/lib/services";
import { useProposal } from "@/hooks/use-proposal";

export default function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [newComment, setNewComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("details");
  const { proposal, isLoading, refetch } = useProposal(id);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    setIsPosting(true);

    try {
      const createdComment = await proposalService.addCommentToProposal(
        id,
        user?.id as string,
        newComment.trim()
      );

      // Обновляем локально список комментариев, чтобы отобразить сразу:
      refetch();
      setNewComment("");
      toast({
        title: "Comment posted",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to post comment", error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  if (!isAuthenticated || user?.accountType !== "paid" || isLoading) {
    return null;
  }

  if (!proposal) {
    return <div>Proposal not found.</div>;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Draft
          </Badge>
        );
      case "submitted":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <FileText className="h-3 w-3" /> Submitted
          </Badge>
        );
      case "accepted":
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" /> Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAccept = () => {
    toast({
      title: "Proposal accepted",
      description:
        "You have accepted this proposal. A smart contract will be generated.",
    });
  };

  const handleEdit = () => {
    router.push(`/proposals/edit/${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
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
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{proposal.title}</h1>
              {getStatusBadge(proposal.status)}
            </div>
            <p className="text-muted-foreground">
              {proposal.type === "need"
                ? "Request for Implementation"
                : "Implementation Offer"}{" "}
              for{" "}
              <a
                href={`/smartject/${proposal.smartjectId}`}
                className="text-primary hover:underline"
              >
                {proposal.smartjectTitle}
              </a>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{proposal.timeline}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{proposal.budget}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Last Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{new Date(proposal.updatedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="details">Proposal Details</TabsTrigger>
            <TabsTrigger value="files">
              Files ({proposal.files.length})
            </TabsTrigger>
            <TabsTrigger value="comments">
              Comments ({proposal.comments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <DetailSection title="Submitted By">
                    <div>
                      <p>{user?.name || "Unknown User"}</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.email || "unknown@example.com"}
                      </p>
                    </div>
                  </DetailSection>

                  {/* Grid for compact info */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {proposal.timeline && (
                      <DetailSection title="Timeline">
                        {proposal.timeline}
                      </DetailSection>
                    )}
                    {proposal.budget && (
                      <DetailSection title="Budget">
                        {proposal.budget}
                      </DetailSection>
                    )}
                    <DetailSection title="Submitted On">
                      {new Date(proposal.createdAt).toLocaleDateString()}
                    </DetailSection>
                  </div>

                  {/* Long Sections */}
                  <DetailSection title="Description">
                    {proposal.description}
                  </DetailSection>
                  <DetailSection title="Project Scope">
                    {proposal.scope}
                  </DetailSection>
                  <DetailSection title="Deliverables">
                    <ul className="list-disc pl-5 space-y-1">
                      {Array.isArray(proposal.deliverables) ? (
                        proposal.deliverables.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))
                      ) : (
                        <li>{proposal.deliverables}</li>
                      )}
                    </ul>
                  </DetailSection>

                  {proposal.type === "need" && proposal.requirements && (
                    <DetailSection title="Requirements">
                      {proposal.requirements}
                    </DetailSection>
                  )}

                  {proposal.type === "provide" && (
                    <>
                      <DetailSection title="Approach">
                        {proposal.approach}
                      </DetailSection>
                      <DetailSection title="Expertise">
                        {proposal.expertise}
                      </DetailSection>
                      <DetailSection title="Team">
                        {proposal.team}
                      </DetailSection>
                    </>
                  )}

                  {proposal.additionalInfo && (
                    <DetailSection title="Additional Info">
                      {proposal.additionalInfo}
                    </DetailSection>
                  )}
                  {proposal.milestones?.length > 0 && (
                    <DetailSection title="Milestones">
                      <div className="space-y-6">
                        {proposal.milestones.map((milestone, index) => (
                          <div
                            key={milestone.id}
                            className="border rounded-lg p-4 shadow-sm"
                          >
                            <h4 className="font-semibold text-lg">
                              {index + 1}. {milestone.name}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {milestone.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span>
                                <strong>Percentage:</strong>{" "}
                                {milestone.percentage}%
                              </span>
                              <span>
                                <strong>Amount:</strong> {milestone.amount}
                              </span>
                            </div>

                            {milestone.deliverables?.length > 0 && (
                              <div className="mt-3">
                                <p className="font-medium">Deliverables:</p>
                                <ul className="list-disc pl-5 text-sm space-y-1">
                                  {milestone.deliverables.map((d) => (
                                    <li key={d.id}>
                                      {d.description}
                                      {d.completed && (
                                        <span className="ml-2 text-green-600">
                                          (Completed)
                                        </span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </DetailSection>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <ProposalDocumentPreview
                  proposalId={proposal.id}
                  title={proposal.title}
                  smartjectTitle={proposal.smartjectTitle}
                  type={proposal.type}
                  description={proposal.description}
                  scope={proposal.scope || ""}
                  timeline={proposal.timeline || ""}
                  budget={proposal.budget || ""}
                  deliverables={proposal.deliverables ?? ""}
                  requirements={
                    proposal.type === "need" ? proposal.requirements : undefined
                  }
                  expertise={
                    proposal.type === "provide" ? proposal.expertise : undefined
                  }
                  approach={
                    proposal.type === "provide" ? proposal.approach : undefined
                  }
                  team={proposal.type === "provide" ? proposal.team : undefined}
                  additionalInfo={proposal.additionalInfo}
                  userName={user?.name || "User Name"}
                  userEmail={user?.email || "user@example.com"}
                  createdAt={proposal.createdAt}
                />
                {proposal.userId === user.id && (
                  <Button variant="outline" onClick={handleEdit}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Proposal
                  </Button>
                )}
                {proposal.userId !== user.id &&
                  proposal.status === "submitted" &&
                  proposal.type !== "provide" && (
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={handleAccept}>
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        onClick={() =>
                          router.push(`/matches/new/negotiate/${proposal.id}`)
                        }
                      >
                        Negotiate
                      </Button>
                    </div>
                  )}
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="files">
            <Card>
              <CardHeader>
                <CardTitle>Supporting Documents</CardTitle>
                <CardDescription>
                  Files attached to this proposal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {proposal.files.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-500" />
                        <span>{file.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-muted-foreground mr-4">
                          {file.size}
                        </span>
                        <Button variant="ghost" size="sm">
                          Download
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="versions">
            <Card>
              <CardHeader>
                <CardTitle>Version History</CardTitle>
                <CardDescription>
                  Track changes to this proposal over time
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="comments">
            <Card>
              <CardHeader>
                <CardTitle>Comments</CardTitle>
                <CardDescription>
                  Discussion about this proposal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {proposal.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex gap-4 p-4 border rounded-lg"
                    >
                      <Avatar>
                        <AvatarImage
                          src={comment.user.avatar || "/placeholder.svg"}
                        />
                        <AvatarFallback>
                          {comment.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold">{comment.user.name}</h4>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p>{comment.content}</p>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center gap-4 mt-6">
                    <Avatar>
                      <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <textarea
                        className="w-full border rounded-md p-2 min-h-[100px]"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={isPosting}
                      />
                      <div className="flex justify-end mt-2">
                        <Button
                          onClick={handlePostComment}
                          disabled={!newComment.trim() || isPosting}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          {isPosting ? "Posting..." : "Post Comment"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

const DetailSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-xl border p-4 bg-muted/40">
    <h3 className="text-base font-semibold text-muted-foreground mb-2">
      {title}
    </h3>
    <div className="text-sm text-foreground">{children}</div>
  </div>
);
