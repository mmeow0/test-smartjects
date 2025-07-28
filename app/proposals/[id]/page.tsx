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
  const { hasExpressedInterest, isExpressingInterest, expressInterest } =
    useInterest({
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
  const showNegotiationsTab =
    isProposalOwner || hasNegotiations || hasExpressedInterest;

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
          {proposal.timeline && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{displayField(proposal.timeline)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {proposal.budget && (
            <Card>
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
          )}
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
                <TabsTrigger value="negotiations">Negotiations</TabsTrigger>
              )}
              {hasPrivateFields && isProposalOwner && (
                <TabsTrigger value="nda-management">
                  NDA & Private Information
                </TabsTrigger>
              )}
            </TabsList>
            {proposal.userId !== user.id && proposal.status === "submitted" && (
              <div className="flex gap-2">
                {!hasExpressedInterest ? (
                  <Button
                    variant="default"
                    onClick={expressInterest}
                    disabled={isExpressingInterest}
                  >
                    {isExpressingInterest ? "Submitting..." : "Accept proposal"}
                  </Button>
                ) : (
                  <Button
                    className="flex-1 bg-yellow-300 hover:bg-yellow-400 text-black"
                    // onClick={() => handleNegotiate(proposal.id)}
                  >
                    Negotiate
                  </Button>
                )}
              </div>
            )}
          </div>
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
                      <DetailSection
                        title="Timeline"
                        hasPrivateVersion={!!proposal.privateFields?.timeline}
                        privateContent={
                          canViewPrivateFields
                            ? proposal.privateFields?.timeline
                            : null
                        }
                      >
                        {displayField(proposal.timeline)}
                      </DetailSection>
                    )}
                    {!proposal.isCooperationProposal && (
                      <DetailSection
                        title="Budget"
                        hasPrivateVersion={!!proposal.privateFields?.budget}
                        privateContent={
                          canViewPrivateFields && proposal.privateFields?.budget
                            ? typeof proposal.privateFields.budget === "number"
                              ? `$${proposal.privateFields.budget.toLocaleString()}`
                              : proposal.privateFields.budget
                            : null
                        }
                      >
                        {displayBudget(proposal.budget)}
                      </DetailSection>
                    )}
                    <DetailSection title="Submitted On">
                      {new Date(proposal.createdAt).toLocaleDateString()}
                    </DetailSection>
                  </div>

                  {/* Long Sections */}
                  {proposal.description && (
                    <DetailSection title="Description">
                      {displayField(
                        proposal.description,
                        proposal.isCooperationProposal,
                      )}
                    </DetailSection>
                  )}
                  {!proposal.isCooperationProposal && (
                    <DetailSection
                      title="Project Scope"
                      hasPrivateVersion={!!proposal.privateFields?.scope}
                      privateContent={
                        canViewPrivateFields
                          ? proposal.privateFields?.scope
                          : null
                      }
                    >
                      {displayField(proposal.scope)}
                    </DetailSection>
                  )}
                  {!proposal.isCooperationProposal && (
                    <DetailSection
                      title="Deliverables"
                      hasPrivateVersion={!!proposal.privateFields?.deliverables}
                      privateContent={
                        canViewPrivateFields
                          ? proposal.privateFields?.deliverables
                          : null
                      }
                    >
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
                      <DetailSection
                        title="Requirements"
                        hasPrivateVersion={
                          !!proposal.privateFields?.requirements
                        }
                        privateContent={
                          canViewPrivateFields
                            ? proposal.privateFields?.requirements
                            : null
                        }
                      >
                        {displayField(proposal.requirements)}
                      </DetailSection>
                    )}

                  {proposal.type === "provide" &&
                    !proposal.isCooperationProposal && (
                      <>
                        <DetailSection
                          title="Approach"
                          hasPrivateVersion={!!proposal.privateFields?.approach}
                          privateContent={
                            canViewPrivateFields
                              ? proposal.privateFields?.approach
                              : null
                          }
                        >
                          {displayField(proposal.approach)}
                        </DetailSection>
                        <DetailSection
                          title="Expertise"
                          hasPrivateVersion={
                            !!proposal.privateFields?.expertise
                          }
                          privateContent={
                            canViewPrivateFields
                              ? proposal.privateFields?.expertise
                              : null
                          }
                        >
                          {displayField(proposal.expertise)}
                        </DetailSection>
                        <DetailSection
                          title="Team"
                          hasPrivateVersion={!!proposal.privateFields?.team}
                          privateContent={
                            canViewPrivateFields
                              ? proposal.privateFields?.team
                              : null
                          }
                        >
                          {displayField(proposal.team)}
                        </DetailSection>
                      </>
                    )}

                  {!proposal.isCooperationProposal && (
                    <DetailSection
                      title="Additional Info"
                      hasPrivateVersion={
                        !!proposal.privateFields?.additionalInfo
                      }
                      privateContent={
                        canViewPrivateFields
                          ? proposal.privateFields?.additionalInfo
                          : null
                      }
                    >
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

                  {/* NDA Request Section */}
                  {hasPrivateFields &&
                    !canViewPrivateFields &&
                    !isProposalOwner && (
                      <div className="mt-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {
                                  Object.keys(proposal.privateFields || {})
                                    .length
                                }{" "}
                                Private Fields Available
                              </p>
                              <p className="text-sm text-gray-600">
                                Request NDA access to view additional private
                                information
                              </p>
                            </div>
                          </div>
                          {hasPendingRequest ? (
                            <Badge
                              variant="secondary"
                              className="bg-yellow-100 text-yellow-800"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          ) : hasRejectedRequest ? (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Rejected
                            </Badge>
                          ) : canRequestNda ? (
                            <NDARequestForm
                              proposalId={id}
                              proposalTitle={proposal.title}
                              onRequestSubmitted={handleNdaRequestSubmitted}
                              disabled={loadingUserRequest}
                              className="!w-auto"
                            />
                          ) : null}
                        </div>
                        {hasRejectedRequest &&
                          userNdaRequest?.rejectionReason && (
                            <p className="text-sm text-red-600 mt-2">
                              Reason: {userNdaRequest.rejectionReason}
                            </p>
                          )}
                      </div>
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
                <CardHeader>
                  <CardTitle>NDA & Private Information</CardTitle>
                  <CardDescription>
                    {isProposalOwner
                      ? "Manage access to your private proposal fields"
                      : "View private information protected by NDA"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Compact Stats - Only for owners */}
                    {isProposalOwner && (
                      <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">
                              {Object.keys(proposal.privateFields || {}).length}{" "}
                              Private Fields
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-medium text-green-900">
                              {(proposal.ndaSignatures?.length || 0) +
                                approvedNdaRequests.length}{" "}
                              Users with Access
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Last updated{" "}
                          {new Date(proposal.updatedAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    )}

                    {/* Private Fields Display */}
                    {canViewPrivateFields && (
                      <div>
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Private Information
                        </h4>
                        <div className="space-y-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
                          {proposal.privateFields?.scope && (
                            <div>
                              <p className="font-medium text-sm text-amber-900">
                                Scope:
                              </p>
                              <p className="text-sm text-amber-800">
                                {proposal.privateFields.scope}
                              </p>
                            </div>
                          )}
                          {proposal.privateFields?.timeline && (
                            <div>
                              <p className="font-medium text-sm text-amber-900">
                                Timeline:
                              </p>
                              <p className="text-sm text-amber-800">
                                {proposal.privateFields.timeline}
                              </p>
                            </div>
                          )}
                          {proposal.privateFields?.budget && (
                            <div>
                              <p className="font-medium text-sm text-amber-900">
                                Budget:
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
                                Deliverables:
                              </p>
                              <p className="text-sm text-amber-800">
                                {proposal.privateFields.deliverables}
                              </p>
                            </div>
                          )}
                          {proposal.privateFields?.requirements && (
                            <div>
                              <p className="font-medium text-sm text-amber-900">
                                Requirements:
                              </p>
                              <p className="text-sm text-amber-800">
                                {proposal.privateFields.requirements}
                              </p>
                            </div>
                          )}
                          {proposal.privateFields?.expertise && (
                            <div>
                              <p className="font-medium text-sm text-amber-900">
                                Expertise:
                              </p>
                              <p className="text-sm text-amber-800">
                                {proposal.privateFields.expertise}
                              </p>
                            </div>
                          )}
                          {proposal.privateFields?.approach && (
                            <div>
                              <p className="font-medium text-sm text-amber-900">
                                Approach:
                              </p>
                              <p className="text-sm text-amber-800">
                                {proposal.privateFields.approach}
                              </p>
                            </div>
                          )}
                          {proposal.privateFields?.team && (
                            <div>
                              <p className="font-medium text-sm text-amber-900">
                                Team:
                              </p>
                              <p className="text-sm text-amber-800">
                                {proposal.privateFields.team}
                              </p>
                            </div>
                          )}
                          {proposal.privateFields?.additionalInfo && (
                            <div>
                              <p className="font-medium text-sm text-amber-900">
                                Additional Info:
                              </p>
                              <p className="text-sm text-amber-800">
                                {proposal.privateFields.additionalInfo}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* NDA Requests Management - Only for owners */}
                    {isProposalOwner && (
                      <div>
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Access Requests
                        </h4>
                        <NDARequestsManager
                          proposalId={id}
                          proposalTitle={proposal.title}
                          isProposalOwner={isProposalOwner}
                          onRequestsUpdated={handleNdaRequestsUpdated}
                        />
                      </div>
                    )}

                    {/* Users with Access - Only for owners */}
                    {isProposalOwner &&
                      ((proposal.ndaSignatures?.length || 0) > 0 ||
                        approvedNdaRequests.length > 0) && (
                        <div>
                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Users with NDA Access
                          </h4>
                          <div className="space-y-2">
                            {approvedNdaRequests.map((request) => (
                              <div
                                key={request.id}
                                className="flex items-center justify-between p-2 rounded-lg border bg-green-50"
                              >
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage src={request.signerAvatar} />
                                    <AvatarFallback>
                                      {request.signerName?.charAt(0) || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-medium">
                                    {request.signerName}
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  Approved{" "}
                                  {new Date(
                                    request.approvedAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                            {ndaSignaturesWithUsers.map((signature) => (
                              <div
                                key={signature.id}
                                className="flex items-center justify-between p-2 rounded-lg border bg-green-50"
                              >
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage src={signature.signerAvatar} />
                                    <AvatarFallback>
                                      {signature.signerName?.charAt(0) || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-medium">
                                    {signature.signerName}
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  Signed{" "}
                                  {new Date(
                                    signature.signedAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
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
  hasPrivateVersion = false,
  privateContent = null,
}: {
  title: string;
  children: React.ReactNode;
  hasPrivateVersion?: boolean;
  privateContent?: string | null;
}) => (
  <div className="rounded-xl border p-4 bg-muted/40">
    <h3 className="text-base font-semibold text-muted-foreground mb-2 flex items-center gap-2">
      {title}
      {hasPrivateVersion && (
        <Badge variant="outline" className="text-xs">
          <Shield className="h-3 w-3 mr-1" />
          NDA
        </Badge>
      )}
    </h3>
    <div className="text-sm text-foreground">{children}</div>
    {privateContent && (
      <div className="mt-3 pt-3 border-t border-dashed">
        <p className="text-xs font-medium text-amber-700 mb-1 flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Private Information
        </p>
        <div className="text-sm text-amber-900">{privateContent}</div>
      </div>
    )}
  </div>
);
