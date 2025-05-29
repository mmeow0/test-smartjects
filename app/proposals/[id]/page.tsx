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

export default function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const [proposal, setProposal] = useState<ProposalType | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    } else if (user?.accountType !== "paid") {
      router.push("/upgrade");
    } else {
      const fetchProposal = async () => {
        try {
          const proposalData = await proposalService.getProposalById(id);
          if (proposalData) {
            setProposal(proposalData);
          } else {
            toast({
              title: "Not found",
              description: "Proposal not found.",
              variant: "destructive",
            });
            router.push("/proposals");
          }
        } catch (error) {
          console.error("Error fetching proposal:", error);
          toast({
            title: "Error",
            description: "Failed to load proposal",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchProposal();
    }
  }, [id, isAuthenticated, user?.accountType, router, toast]);

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

        <Tabs defaultValue="details">
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
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Description</h3>
                    <p>{proposal.description}</p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">Project Scope</h3>
                    <p>{proposal.scope}</p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">Deliverables</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {proposal.deliverables}
                    </ul>
                  </div>

                  {proposal.type === "provide" && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-medium mb-2">Approach</h3>
                        <p>{proposal.approach}</p>
                      </div>

                      <Separator />
                      <div>
                        <h3 className="text-lg font-medium mb-2">Expertise</h3>
                        <p>{proposal.expertise}</p>
                      </div>

                      <Separator />
                      <div>
                        <h3 className="text-lg font-medium mb-2">Team</h3>
                        <p>{proposal.team}</p>
                      </div>
                    </>
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
                      ></textarea>
                      <div className="flex justify-end mt-2">
                        <Button>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Post Comment
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
