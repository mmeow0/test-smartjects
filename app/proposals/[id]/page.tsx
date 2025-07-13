"use client";

import { use, useState, useEffect } from "react";
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
import { useRequirePaidAccount } from "@/hooks/use-auth-guard";
import { useToast } from "@/hooks/use-toast";
import { ProposalDocumentPreview } from "@/components/proposal-document-preview";
import { ProposalNegotiations } from "@/components/proposal-negotiations";
import { NDARequestForm } from "@/components/nda-request-form";
import { NDARequestsManager } from "@/components/nda-requests-manager";
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Pencil,
  CheckCircle,
  XCircle,
  Shield,
  Users,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { ndaService } from "@/lib/services/nda.service";
import { userService } from "@/lib/services/user.service";
import { useProposal } from "@/hooks/use-proposal";
import { useProposalNegotiations } from "@/hooks/use-proposal-negotiations";
import { useInterest } from "@/hooks/use-interest";
import type { UserType, NDARequest } from "@/lib/types";

export default function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const router = useRouter();
  const { isLoading: authLoading, user, canAccess } = useRequirePaidAccount();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("details");
  const [ndaSignaturesWithUsers, setNdaSignaturesWithUsers] = useState<
    Array<any>
  >([]);
  const [loadingNdaSignatures, setLoadingNdaSignatures] = useState(false);
  const [approvedNdaRequests, setApprovedNdaRequests] = useState<Array<any>>(
    [],
  );
  const [loadingApprovedRequests, setLoadingApprovedRequests] = useState(false);
  const [proposalOwner, setProposalOwner] = useState<UserType | null>(null);
  const [loadingOwner, setLoadingOwner] = useState(false);
  const [userNdaRequest, setUserNdaRequest] = useState<NDARequest | null>(null);
  const [loadingUserRequest, setLoadingUserRequest] = useState(false);
  const [databaseError, setDatabaseError] = useState<string | null>(null);
  const { proposal, isLoading, refetch } = useProposal(id);
  const { conversations, completedConversations } = useProposalNegotiations(id);

  // Interest functionality
  const {
    hasExpressedInterest,
    isExpressingInterest,
    expressInterest,
  } = useInterest({
    proposalId: id,
    isProposalOwner: proposal?.userId === user?.id,
  });

  // Fetch NDA signatures when proposal loads
  useEffect(() => {
    if (proposal?.ndaSignatures && proposal.ndaSignatures.length > 0) {
      fetchNdaSignaturesWithUsers();
    }
  }, [proposal?.ndaSignatures]);

  // Fetch approved NDA requests when proposal loads
  useEffect(() => {
    if (proposal?.id) {
      fetchApprovedNdaRequests();
    }
  }, [proposal?.id]);

  // Fetch proposal owner when proposal loads
  useEffect(() => {
    if (proposal?.userId) {
      fetchProposalOwner();
    }
  }, [proposal?.userId]);

  // Fetch user's NDA request when proposal loads
  useEffect(() => {
    if (proposal && user?.id) {
      fetchUserNdaRequest();
    }
  }, [proposal?.id, user?.id]);

  if (authLoading || !canAccess || isLoading) {
    return null;
  }

  if (!proposal) {
    return <div>Proposal not found.</div>;
  }

  // Helper function to display field value or "not specified"
  const displayField = (
    value: string | number | undefined | null,
    hideNotSpecified = false,
  ) => {
    if (!value || (typeof value === "string" && value.trim() === "")) {
      return hideNotSpecified ? null : (
        <span className="text-muted-foreground italic">not specified</span>
      );
    }
    return value;
  };

  // Helper function to display budget with proper formatting
  const displayBudget = (budget: number | undefined | null) => {
    if (!budget) {
      return (
        <span className="text-muted-foreground italic">not specified</span>
      );
    }
    return `${budget.toLocaleString()}`;
  };

  const isProposalOwner = proposal.userId === user.id;
  const hasNegotiations =
    conversations.length > 0 || completedConversations.length > 0;
  const showNegotiationsTab = isProposalOwner || hasNegotiations;

  // Check user's NDA request status
  const hasPendingRequest = userNdaRequest?.status === "pending";
  const hasRejectedRequest = userNdaRequest?.status === "rejected";
  const hasApprovedRequest = userNdaRequest?.status === "approved";

  // Check if user has approved NDA (either from signatures list OR from approved request)
  const hasApprovedNDA =
    proposal.ndaSignatures?.some(
      (signature) => signature.signerUserId === user.id,
    ) || hasApprovedRequest;
  const hasPrivateFields =
    proposal.privateFields && Object.keys(proposal.privateFields).length > 0;

  // Only allow access to private fields if user is owner OR has approved NDA
  const canViewPrivateFields = isProposalOwner || hasApprovedNDA;

  // Check if migration is needed based on database errors or missing NDA functionality
  const migrationNeeded = false;

  // User can request NDA if they're not owner, don't have approved NDA, don't have any pending/rejected request, AND migration is applied
  const canRequestNda =
    !isProposalOwner &&
    !hasApprovedNDA &&
    !userNdaRequest &&
    hasPrivateFields &&
    !migrationNeeded;

  // Debug NDA access logic
  console.log("=== NDA Access Debug Info ===");
  console.log("User ID:", user?.id);
  console.log("Is Proposal Owner:", isProposalOwner);
  console.log("Proposal NDA Signatures:", proposal.ndaSignatures);
  console.log("User NDA Request:", userNdaRequest);
  console.log("Has Pending Request:", hasPendingRequest);
  console.log("Has Rejected Request:", hasRejectedRequest);
  console.log("Has Approved Request:", hasApprovedRequest);
  console.log("Has Approved NDA (combined):", hasApprovedNDA);
  console.log("Can View Private Fields:", canViewPrivateFields);
  console.log("Can Request NDA:", canRequestNda);
  console.log("Has Private Fields:", hasPrivateFields);
  console.log("Migration Needed:", migrationNeeded);
  console.log("============================");

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

  const handleEdit = () => {
    router.push(`/proposals/edit/${id}`);
  };

  // Fetch NDA signatures with user details
  const fetchNdaSignaturesWithUsers = async () => {
    if (!proposal?.ndaSignatures || proposal.ndaSignatures.length === 0) {
      return;
    }

    setLoadingNdaSignatures(true);
    try {
      const signaturesWithUsers =
        await ndaService.getProposalSignaturesWithUsers(id);
      setNdaSignaturesWithUsers(signaturesWithUsers);
    } catch (error) {
      console.error("Error fetching NDA signatures with users:", error);
    } finally {
      setLoadingNdaSignatures(false);
    }
  };

  // Fetch approved NDA requests
  const fetchApprovedNdaRequests = async () => {
    if (!proposal?.id) return;

    setLoadingApprovedRequests(true);
    try {
      const approvedRequests = await ndaService.getApprovedNDARequests(id);
      setApprovedNdaRequests(approvedRequests);
    } catch (error) {
      console.error("Error fetching approved NDA requests:", error);
    } finally {
      setLoadingApprovedRequests(false);
    }
  };

  // Fetch user's NDA request status
  const fetchUserNdaRequest = async () => {
    if (!user?.id || isProposalOwner) return;

    setLoadingUserRequest(true);
    try {
      const request = await ndaService.getUserNDARequest(id, user.id);
      setUserNdaRequest(request);
      setDatabaseError(null); // Clear any previous errors
    } catch (error: any) {
      console.error("Error fetching user NDA request:", error);
      if (
        error?.message?.includes('column "status"') ||
        error?.message?.includes("migration required")
      ) {
        setDatabaseError(error.message);
      }
    } finally {
      setLoadingUserRequest(false);
    }
  };

  // Handle NDA request submission
  const handleNdaRequestSubmitted = () => {
    fetchUserNdaRequest();
    refetch();
    fetchNdaSignaturesWithUsers(); // Also refresh signatures list
    fetchApprovedNdaRequests(); // Also refresh approved requests list
    setDatabaseError(null); // Clear any previous errors on successful submission
  };

  // Handle NDA requests update (for proposal owner)
  const handleNdaRequestsUpdated = async () => {
    // Add delay to ensure database is updated before refreshing
    setTimeout(async () => {
      console.log("Refreshing all NDA data after approval/rejection...");
      await refetch();
      await fetchNdaSignaturesWithUsers();
      await fetchApprovedNdaRequests();
      await fetchUserNdaRequest(); // Also refresh user's NDA request status
      console.log("NDA data refresh completed");
    }, 1000); // 1 second delay for database consistency
  };

  // Fetch proposal owner information
  const fetchProposalOwner = async () => {
    if (!proposal?.userId) return;

    setLoadingOwner(true);
    try {
      const owner = await userService.getUserById(proposal.userId);
      setProposalOwner(owner);
    } catch (error) {
      console.error("Error fetching proposal owner:", error);
    } finally {
      setLoadingOwner(false);
    }
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
          {proposal.timeline && <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{displayField(proposal.timeline)}</span>
              </div>
            </CardContent>
          </Card>}

         {  proposal.budget && <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>{displayBudget(proposal.budget)}</span>
              </div>
            </CardContent>
          </Card>
}
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
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="details">Proposal Details</TabsTrigger>
              <TabsTrigger value="files">
                Files ({proposal.files.length})
              </TabsTrigger>
              {showNegotiationsTab && (
                <TabsTrigger value="negotiations">
                  {isProposalOwner ? "Inquiries" : "Negotiations"}
                </TabsTrigger>
              )}
              {hasPrivateFields && (
                <TabsTrigger value="nda-management">
                  NDA & Private Information
                </TabsTrigger>
              )}
            </TabsList>
            {proposal.userId !== user.id && proposal.status === "submitted" && (
              <div className="flex gap-2">
                {!hasExpressedInterest ? (
                  <Button
                    variant="outline"
                    onClick={expressInterest}
                    disabled={isExpressingInterest}
                  >
                    {isExpressingInterest
                      ? "Submitting..."
                      : "Accept proposal"}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {}}
                    disabled={isExpressingInterest}
                  >
                    {isExpressingInterest
                      ? "Removing..."
                      : "Proposal was accepted ✓"}
                  </Button>
                )}
                {proposal.type !== "provide" && (
                  <Button
                    onClick={() =>
                      router.push(`/matches/new/negotiate/${proposal.id}`)
                    }
                  >
                    Negotiate
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Migration Status Warning */}
          {migrationNeeded && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">
                    Database Migration Required
                  </p>
                  <p className="text-sm text-red-700">
                    The new NDA approval workflow requires database updates. NDA
                    request functionality is disabled until migrations are
                    applied. Please contact your administrator to apply the
                    required database migrations.
                    {databaseError && (
                      <span className="block mt-1 font-mono text-xs">
                        Error: {databaseError}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          <TabsContent value="details">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <DetailSection title="Submitted By">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={
                            isProposalOwner
                              ? user?.avatar || "/placeholder.svg"
                              : proposalOwner?.avatar || "/placeholder.svg"
                          }
                        />
                        <AvatarFallback>
                          {isProposalOwner
                            ? user?.name?.charAt(0) || "U"
                            : proposalOwner?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {loadingOwner
                            ? "Loading..."
                            : isProposalOwner
                              ? user?.name || "Unknown User"
                              : proposalOwner?.name || "Unknown User"}
                          {isProposalOwner && (
                            <span className="ml-2 text-xs text-blue-600">
                              (You)
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {loadingOwner
                            ? "Loading..."
                            : isProposalOwner
                              ? user?.email || "unknown@example.com"
                              : proposalOwner?.email || "Email not available"}
                        </p>
                      </div>
                    </div>
                  </DetailSection>

                  {/* Grid for compact info */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {!proposal.isCooperationProposal && (
                      <DetailSection title="Timeline">
                        {displayField(proposal.timeline)}
                      </DetailSection>
                    )}
                    {!proposal.isCooperationProposal && (
                      <DetailSection title="Budget">
                        {displayBudget(proposal.budget)}
                      </DetailSection>
                    )}
                    <DetailSection title="Submitted On">
                      {new Date(proposal.createdAt).toLocaleDateString()}
                    </DetailSection>
                  </div>

                  {/* Long Sections */}
                  { proposal.description && <DetailSection title="Description">
                    {displayField(
                      proposal.description,
                      proposal.isCooperationProposal,
                    )}
                  </DetailSection>}
                  {!proposal.isCooperationProposal && (
                    <DetailSection title="Project Scope">
                      {displayField(proposal.scope)}
                    </DetailSection>
                  )}
                  {!proposal.isCooperationProposal && (
                    <DetailSection title="Deliverables">
                      {proposal.deliverables &&
                      proposal.deliverables.toString().trim() !== "" ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {Array.isArray(proposal.deliverables) ? (
                            proposal.deliverables.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))
                          ) : (
                            <li>{proposal.deliverables}</li>
                          )}
                        </ul>
                      ) : (
                        <span className="text-muted-foreground italic">
                          not specified
                        </span>
                      )}
                    </DetailSection>
                  )}

                  {proposal.type === "need" &&
                    !proposal.isCooperationProposal && (
                      <DetailSection title="Requirements">
                        {displayField(proposal.requirements)}
                      </DetailSection>
                    )}

                  {proposal.type === "provide" &&
                    !proposal.isCooperationProposal && (
                      <>
                        <DetailSection title="Approach">
                          {displayField(proposal.approach)}
                        </DetailSection>
                        <DetailSection title="Expertise">
                          {displayField(proposal.expertise)}
                        </DetailSection>
                        <DetailSection title="Team">
                          {displayField(proposal.team)}
                        </DetailSection>
                      </>
                    )}

                  {!proposal.isCooperationProposal && (
                    <DetailSection title="Additional Info">
                      {displayField(
                        proposal.additionalInfo,
                        proposal.isCooperationProposal,
                      )}
                    </DetailSection>
                  )}
                  {/*
                    NDA Section - Comprehensive NDA Management and Private Fields Access Control

                    This section provides complete NDA (Non-Disclosure Agreement) functionality for proposals:

                    Features implemented:
                    1. NDA Overview Statistics - Shows count of private fields, signatures, and user access status
                    2. Proposal Owner Display - Shows owner information with avatar and contact details
                    3. NDA Signatures Management - Lists all users who have signed the NDA with timestamps
                    4. Access Control - Determines who can view private fields (owner or NDA signers)
                    5. Private Fields Display - Shows protected content only to authorized users
                    6. NDA Signing Interface - Allows eligible users to sign NDA to gain access
                    7. Activity Timeline - Tracks proposal creation, updates, and NDA signing history
                    8. Loading States - Smooth UX with loading indicators for async operations

                    Access Rules:
                    - Proposal owner: Full access to all private fields automatically
                    - Other users: Must sign NDA to view private fields
                    - Anonymous users: Cannot see private content

                    Private fields include: scope, timeline, budget, deliverables, requirements,
                    expertise, approach, team, and additional info (when marked as private)
                  */}

                  {proposal.milestones && proposal.milestones.length > 0 && (
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
                              {displayField(milestone.description)}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span>
                                <strong>Percentage:</strong>{" "}
                                {milestone.percentage}%
                              </span>
                              <span>
                                <strong>Amount:</strong>{" "}
                                {displayField(milestone.amount)}
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
                  budget={proposal.budget ? proposal.budget.toString() : ""}
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
                  milestones={proposal.milestones || []}
                  files={proposal.files?.map((f) => f.name) || []}
                  organizationName={user?.organizationName}
                  contactPhone={user?.phone}
                />
                {proposal.userId === user.id && (
                  <Button variant="outline" onClick={handleEdit}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Proposal
                  </Button>
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

          {showNegotiationsTab && (
            <TabsContent value="negotiations">
              <ProposalNegotiations
                proposalId={proposal.id}
                isProposalOwner={isProposalOwner}
              />
            </TabsContent>
          )}

          {hasPrivateFields && (
            <TabsContent value="nda-management">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {/* NDA Overview Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-4">
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-2xl font-bold text-blue-900">
                              {hasPrivateFields
                                ? Object.keys(proposal.privateFields || {})
                                    .length
                                : 0}
                            </p>
                            <p className="text-sm text-blue-700">
                              Private Fields
                            </p>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-2xl font-bold text-green-900">
                              {(proposal.ndaSignatures
                                ? proposal.ndaSignatures.length
                                : 0) + approvedNdaRequests.length}
                            </p>
                            <p className="text-sm text-green-700">
                              Users with Access
                            </p>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="flex items-center gap-2">
                          {canViewPrivateFields ? (
                            <Eye className="h-5 w-5 text-green-600" />
                          ) : (
                            <EyeOff className="h-5 w-5 text-orange-600" />
                          )}
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              {canViewPrivateFields ? "✓" : "✗"}
                            </p>
                            <p className="text-sm text-gray-700">Your Access</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                    {/* NDA Status Banner */}
                    {hasPrivateFields && (
                      <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-blue-100">
                            <Shield className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-blue-900">
                              NDA Protected Content
                            </p>
                            <p className="text-sm text-blue-700">
                              {Object.keys(proposal.privateFields || {}).length}{" "}
                              private fields •
                              {(proposal.ndaSignatures
                                ? proposal.ndaSignatures.length
                                : 0) + approvedNdaRequests.length}{" "}
                              users with access • Updated{" "}
                              {new Date(
                                proposal.updatedAt,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={
                              canViewPrivateFields ? "default" : "secondary"
                            }
                            className={
                              canViewPrivateFields
                                ? "bg-green-100 text-green-800"
                                : "bg-orange-100 text-orange-800"
                            }
                          >
                            {canViewPrivateFields
                              ? "Access Granted"
                              : "NDA Required"}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Access Control Section */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Access & Permissions
                      </h4>

                      {/* Proposal Owner */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            OWNER
                          </Badge>
                          <span className="font-medium">Proposal Owner</span>
                        </div>
                        <div className="p-3 rounded-lg border bg-blue-50 border-blue-200">
                          {loadingOwner ? (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-200 animate-pulse"></div>
                              <div>
                                <div className="w-24 h-4 bg-blue-200 rounded animate-pulse mb-1"></div>
                                <div className="w-32 h-3 bg-blue-100 rounded animate-pulse"></div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage
                                  src={
                                    isProposalOwner
                                      ? user?.avatar || "/placeholder.svg"
                                      : proposalOwner?.avatar ||
                                        "/placeholder.svg"
                                  }
                                />
                                <AvatarFallback>
                                  {isProposalOwner
                                    ? user?.name?.charAt(0) || "U"
                                    : proposalOwner?.name?.charAt(0) || "O"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-blue-900">
                                  {isProposalOwner
                                    ? user?.name || "Unknown User"
                                    : proposalOwner?.name || "Unknown User"}
                                  {isProposalOwner && (
                                    <span className="ml-2 text-xs">(You)</span>
                                  )}
                                </p>
                                <p className="text-xs text-blue-700">
                                  Proposal owner • Full access to all private
                                  fields
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* NDA Signatures & Approved Users */}
                      {(proposal.ndaSignatures &&
                        proposal.ndaSignatures.length > 0) ||
                      loadingNdaSignatures ||
                      loadingApprovedRequests ||
                      approvedNdaRequests.length > 0 ||
                      isProposalOwner ? (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className="text-xs">
                              ACCESS GRANTED
                            </Badge>
                            <span className="font-medium">
                              Users with NDA Access
                              {!loadingNdaSignatures &&
                                !loadingApprovedRequests &&
                                ` (${
                                  (proposal.ndaSignatures?.length || 0) +
                                  approvedNdaRequests.length +
                                  (isProposalOwner ? 1 : 0)
                                })`}
                              {(loadingNdaSignatures ||
                                loadingApprovedRequests) &&
                                " (Loading...)"}
                            </span>
                          </div>
                          {loadingNdaSignatures || loadingApprovedRequests ? (
                            <div className="flex items-center gap-2 p-3 rounded-lg border bg-gray-50">
                              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                              <span className="text-sm text-muted-foreground">
                                Loading signature details...
                              </span>
                            </div>
                          ) : (proposal.ndaSignatures &&
                              proposal.ndaSignatures.length > 0) ||
                            approvedNdaRequests.length > 0 ||
                            isProposalOwner ? (
                            <div className="space-y-2">
                              {/* Show proposal owner first */}
                              {isProposalOwner && (
                                <div className="flex items-center justify-between p-3 rounded-lg border bg-blue-50 border-blue-200">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="w-8 h-8">
                                      <AvatarImage
                                        src={user?.avatar || "/placeholder.svg"}
                                      />
                                      <AvatarFallback>
                                        {user?.name?.charAt(0) || "U"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-sm font-medium text-blue-900">
                                        {user?.name || "Unknown User"}
                                      </p>
                                      <p className="text-xs text-blue-700">
                                        Proposal Owner • Full Access
                                      </p>
                                    </div>
                                  </div>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-blue-200 text-blue-800"
                                  >
                                    Owner
                                  </Badge>
                                </div>
                              )}

                              {/* Show approved NDA requests */}
                              {approvedNdaRequests.map((request) => (
                                <div
                                  key={request.id}
                                  className="flex items-center justify-between p-3 rounded-lg border bg-green-50 border-green-200"
                                >
                                  <div className="flex items-center gap-3">
                                    {request.signerAvatar ? (
                                      <Avatar className="w-8 h-8">
                                        <AvatarImage
                                          src={request.signerAvatar}
                                        />
                                        <AvatarFallback>
                                          {request.signerName?.charAt(0) || "U"}
                                        </AvatarFallback>
                                      </Avatar>
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                      </div>
                                    )}
                                    <div>
                                      <p className="text-sm font-medium text-green-900">
                                        {request.signerName ||
                                          `User ${request.signerUserId}`}
                                      </p>
                                      <p className="text-xs text-green-700">
                                        Approved:{" "}
                                        {new Date(
                                          request.approvedAt,
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  {request.signerUserId === user.id && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs bg-green-200 text-green-800"
                                    >
                                      You
                                    </Badge>
                                  )}
                                </div>
                              ))}

                              {/* Show NDA signatures */}
                              {proposal.ndaSignatures &&
                                proposal.ndaSignatures.length > 0 &&
                                (ndaSignaturesWithUsers.length > 0
                                  ? ndaSignaturesWithUsers
                                  : proposal.ndaSignatures
                                ).map((signature) => (
                                  <div
                                    key={signature.id}
                                    className="flex items-center justify-between p-3 rounded-lg border bg-green-50 border-green-200"
                                  >
                                    <div className="flex items-center gap-3">
                                      {signature.signerAvatar ? (
                                        <Avatar className="w-8 h-8">
                                          <AvatarImage
                                            src={signature.signerAvatar}
                                          />
                                          <AvatarFallback>
                                            {signature.signerName?.charAt(0) ||
                                              "U"}
                                          </AvatarFallback>
                                        </Avatar>
                                      ) : (
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                          <CheckCircle className="h-4 w-4 text-green-600" />
                                        </div>
                                      )}
                                      <div>
                                        <p className="text-sm font-medium text-green-900">
                                          {signature.signerName ||
                                            `User ${signature.signerUserId}`}
                                        </p>
                                        <p className="text-xs text-green-700">
                                          Signed:{" "}
                                          {new Date(
                                            signature.signedAt,
                                          ).toLocaleDateString()}
                                        </p>
                                      </div>
                                    </div>
                                    {signature.signerUserId === user.id && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs bg-green-200 text-green-800"
                                      >
                                        You
                                      </Badge>
                                    )}
                                  </div>
                                ))}

                              {/* Show message if no signatures or approved requests but owner has access */}
                              {(!proposal.ndaSignatures ||
                                proposal.ndaSignatures.length === 0) &&
                                approvedNdaRequests.length === 0 &&
                                isProposalOwner && (
                                  <div className="p-3 rounded-lg border bg-gray-50">
                                    <p className="text-sm text-muted-foreground">
                                      No additional users have NDA access yet
                                    </p>
                                  </div>
                                )}
                            </div>
                          ) : (
                            <div className="p-3 rounded-lg border bg-gray-50">
                              <p className="text-sm text-muted-foreground">
                                No users with NDA access yet
                              </p>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>

                    {/* Your Access Status */}
                    <div>
                      <h4 className="text-lg font-semibold flex items-center gap-2 mb-4">
                        <Eye className="h-5 w-5" />
                        Your Access Status
                      </h4>

                      {canViewPrivateFields ? (
                        <div className="flex items-center gap-3 p-4 rounded-lg border-2 bg-green-50 border-green-200">
                          <Eye className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-900">
                              Access Granted
                            </p>
                            <p className="text-sm text-green-700">
                              {isProposalOwner
                                ? "You own this proposal and can view all private fields"
                                : "Your NDA request has been approved - you can view private fields"}
                            </p>
                          </div>
                        </div>
                      ) : hasPendingRequest ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-4 rounded-lg border-2 bg-yellow-50 border-yellow-200">
                            <Clock className="h-5 w-5 text-yellow-600" />
                            <div>
                              <p className="font-medium text-yellow-900">
                                Request Pending Review
                              </p>
                              <p className="text-sm text-yellow-700">
                                Your NDA request is awaiting approval from the
                                proposal owner
                              </p>
                            </div>
                          </div>
                          {userNdaRequest?.requestMessage && (
                            <div className="p-3 rounded-lg bg-gray-50 border">
                              <p className="text-sm font-medium mb-1">
                                Your Message:
                              </p>
                              <p className="text-sm text-gray-700">
                                {userNdaRequest.requestMessage}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : hasRejectedRequest ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-4 rounded-lg border-2 bg-red-50 border-red-200">
                            <XCircle className="h-5 w-5 text-red-600" />
                            <div>
                              <p className="font-medium text-red-900">
                                Request Rejected
                              </p>
                              <p className="text-sm text-red-700">
                                Your NDA request was rejected by the proposal
                                owner
                              </p>
                            </div>
                          </div>
                          {userNdaRequest?.rejectionReason && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                              <p className="text-sm font-medium text-red-900 mb-1">
                                Rejection Reason:
                              </p>
                              <p className="text-sm text-red-700">
                                {userNdaRequest.rejectionReason}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : migrationNeeded ? (
                        <div className="flex items-center gap-3 p-4 rounded-lg border-2 bg-red-50 border-red-200">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                          <div>
                            <p className="font-medium text-red-900">
                              Feature Unavailable
                            </p>
                            <p className="text-sm text-red-700">
                              NDA requests are disabled until database
                              migrations are applied. Please contact your
                              administrator.
                              {databaseError && (
                                <span className="block mt-1 font-mono text-xs">
                                  Database Error: {databaseError}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-4 rounded-lg border-2 border-dashed">
                          <div className="flex items-center gap-2">
                            <EyeOff className="h-4 w-4 text-orange-600" />
                            <div>
                              <p className="font-medium text-orange-900">
                                NDA Access Required
                              </p>
                              <p className="text-sm text-orange-700">
                                Submit an NDA request to view private proposal
                                details
                              </p>
                            </div>
                          </div>
                          {canRequestNda && !migrationNeeded && (
                            <div className="ml-4">
                              <NDARequestForm
                                proposalId={id}
                                proposalTitle={proposal.title}
                                onRequestSubmitted={handleNdaRequestSubmitted}
                                disabled={loadingUserRequest}
                              />
                            </div>
                          )}
                          {migrationNeeded && (
                            <div className="ml-4">
                              <Badge variant="destructive" className="text-xs">
                                Migration Required
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Private Fields Display */}
                    {hasPrivateFields && canViewPrivateFields && (
                      <div>
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Private Fields Content
                          <Badge variant="secondary" className="ml-2">
                            {Object.keys(proposal.privateFields || {}).length}{" "}
                            fields unlocked
                          </Badge>
                        </h4>
                        <div className="space-y-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
                          {proposal.privateFields?.scope && (
                            <div>
                              <p className="font-medium text-sm text-amber-900">
                                Private Scope:
                              </p>
                              <p className="text-sm text-amber-800">
                                {proposal.privateFields.scope}
                              </p>
                            </div>
                          )}
                          {proposal.privateFields?.timeline && (
                            <div>
                              <p className="font-medium text-sm text-amber-900">
                                Private Timeline:
                              </p>
                              <p className="text-sm text-amber-800">
                                {proposal.privateFields.timeline}
                              </p>
                            </div>
                          )}
                          {proposal.privateFields?.budget && (
                            <div>
                              <p className="font-medium text-sm text-amber-900">
                                Private Budget:
                              </p>
                              <p className="text-sm text-amber-800">
                                {typeof proposal.privateFields.budget ===
                                "number"
                                  ? `$${proposal.privateFields.budget.toLocaleString()}`
                                  : proposal.privateFields.budget}
                              </p>
                            </div>
                          )}
                          {proposal.privateFields?.deliverables && (
                            <div>
                              <p className="font-medium text-sm text-amber-900">
                                Private Deliverables:
                              </p>
                              <p className="text-sm text-amber-800">
                                {proposal.privateFields.deliverables}
                              </p>
                            </div>
                          )}
                          {proposal.privateFields?.requirements && (
                            <div>
                              <p className="font-medium text-sm text-amber-900">
                                Private Requirements:
                              </p>
                              <p className="text-sm text-amber-800">
                                {proposal.privateFields.requirements}
                              </p>
                            </div>
                          )}
                          {proposal.privateFields?.expertise && (
                            <div>
                              <p className="font-medium text-sm text-amber-900">
                                Private Expertise:
                              </p>
                              <p className="text-sm text-amber-800">
                                {proposal.privateFields.expertise}
                              </p>
                            </div>
                          )}
                          {proposal.privateFields?.approach && (
                            <div>
                              <p className="font-medium text-sm text-amber-900">
                                Private Approach:
                              </p>
                              <p className="text-sm text-amber-800">
                                {proposal.privateFields.approach}
                              </p>
                            </div>
                          )}
                          {proposal.privateFields?.team && (
                            <div>
                              <p className="font-medium text-sm text-amber-900">
                                Private Team:
                              </p>
                              <p className="text-sm text-amber-800">
                                {proposal.privateFields.team}
                              </p>
                            </div>
                          )}
                          {proposal.privateFields?.additionalInfo && (
                            <div>
                              <p className="font-medium text-sm text-amber-900">
                                Private Additional Info:
                              </p>
                              <p className="text-sm text-amber-800">
                                {proposal.privateFields.additionalInfo}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* NDA Activity Timeline */}
                    {((proposal.ndaSignatures &&
                      proposal.ndaSignatures.length > 0) ||
                      approvedNdaRequests.length > 0) && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-medium">NDA Activity Timeline</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="p-3 rounded-lg border bg-amber-50 border-amber-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="h-4 w-4 text-amber-600" />
                              <span className="text-sm font-medium text-amber-900">
                                Proposal Created
                              </span>
                            </div>
                            <p className="text-xs text-amber-700 ml-6">
                              {new Date(
                                proposal.createdAt,
                              ).toLocaleDateString()}{" "}
                              at{" "}
                              {new Date(
                                proposal.createdAt,
                              ).toLocaleTimeString()}
                            </p>
                          </div>

                          {hasPrivateFields && (
                            <div className="p-3 rounded-lg border bg-purple-50 border-purple-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Shield className="h-4 w-4 text-purple-600" />
                                <span className="text-sm font-medium text-purple-900">
                                  Private Fields Last Updated
                                </span>
                              </div>
                              <p className="text-xs text-purple-700 ml-6">
                                {new Date(
                                  proposal.updatedAt,
                                ).toLocaleDateString()}{" "}
                                at{" "}
                                {new Date(
                                  proposal.updatedAt,
                                ).toLocaleTimeString()}
                              </p>
                            </div>
                          )}

                          {/* Show approved NDA requests */}
                          {approvedNdaRequests
                            .sort(
                              (a, b) =>
                                new Date(a.approvedAt).getTime() -
                                new Date(b.approvedAt).getTime(),
                            )
                            .map((request) => (
                              <div
                                key={`approved-${request.id}`}
                                className="p-3 rounded-lg border bg-green-50 border-green-200"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span className="text-sm font-medium text-green-900">
                                    NDA Access Approved for{" "}
                                    {request.signerName ||
                                      `User ${request.signerUserId}`}
                                    {request.signerUserId === user.id &&
                                      " (You)"}
                                  </span>
                                </div>
                                <p className="text-xs text-green-700 ml-6">
                                  {new Date(
                                    request.approvedAt,
                                  ).toLocaleDateString()}{" "}
                                  at{" "}
                                  {new Date(
                                    request.approvedAt,
                                  ).toLocaleTimeString()}
                                </p>
                              </div>
                            ))}

                          {/* Show NDA signatures */}
                          {proposal.ndaSignatures &&
                            proposal.ndaSignatures.length > 0 &&
                            (ndaSignaturesWithUsers.length > 0
                              ? ndaSignaturesWithUsers
                              : proposal.ndaSignatures
                            )
                              .sort(
                                (a, b) =>
                                  new Date(a.signedAt).getTime() -
                                  new Date(b.signedAt).getTime(),
                              )
                              .map((signature, index) => (
                                <div
                                  key={`signature-${signature.id}`}
                                  className="p-3 rounded-lg border bg-green-50 border-green-200"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-900">
                                      NDA Signed by{" "}
                                      {signature.signerName ||
                                        `User ${signature.signerUserId}`}
                                      {signature.signerUserId === user.id &&
                                        " (You)"}
                                    </span>
                                  </div>
                                  <p className="text-xs text-green-700 ml-6">
                                    {new Date(
                                      signature.signedAt,
                                    ).toLocaleDateString()}{" "}
                                    at{" "}
                                    {new Date(
                                      signature.signedAt,
                                    ).toLocaleTimeString()}
                                  </p>
                                </div>
                              ))}
                        </div>
                      </div>
                    )}

                    {/* Show private fields count when access denied */}
                    {hasPrivateFields &&
                      !canViewPrivateFields &&
                      !hasPendingRequest && (
                        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-gray-600" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {
                                    Object.keys(proposal.privateFields || {})
                                      .length
                                  }{" "}
                                  Private Field(s) Available
                                </p>
                                <p className="text-xs text-gray-600">
                                  Submit an NDA request to unlock detailed
                                  proposal information
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Last updated:{" "}
                                  {new Date(
                                    proposal.updatedAt,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            {canRequestNda && (
                              <div className="ml-4">
                                <NDARequestForm
                                  proposalId={id}
                                  proposalTitle={proposal.title}
                                  onRequestSubmitted={handleNdaRequestSubmitted}
                                  disabled={loadingUserRequest}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    {/* NDA Management for Proposal Owners */}
                    {isProposalOwner && (
                      <div>
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          NDA Request Management
                        </h4>
                        <NDARequestsManager
                          proposalId={proposal.id}
                          proposalTitle={proposal.title}
                          isProposalOwner={isProposalOwner}
                          onRequestsUpdated={handleNdaRequestsUpdated}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
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
