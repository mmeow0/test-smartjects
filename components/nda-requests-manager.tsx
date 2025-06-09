"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Shield,
  Users,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Eye,
  AlertTriangle,
  Loader2,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";
import { ndaService } from "@/lib/services/nda.service";
import type { NDARequest } from "@/lib/types";

interface NDARequestsManagerProps {
  proposalId: string;
  proposalTitle: string;
  isProposalOwner: boolean;
  onRequestsUpdated: () => void;
}

export function NDARequestsManager({
  proposalId,
  proposalTitle,
  isProposalOwner,
  onRequestsUpdated,
}: NDARequestsManagerProps) {
  const [pendingRequests, setPendingRequests] = useState<NDARequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<NDARequest | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch pending requests
  const fetchPendingRequests = async () => {
    if (!isProposalOwner) return;
    
    setIsLoading(true);
    try {
      const requests = await ndaService.getPendingNDARequests(proposalId);
      setPendingRequests(requests);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      toast({
        title: "Error",
        description: "Failed to load NDA requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, [proposalId, isProposalOwner]);

  const handleApprove = async (requestId: string) => {
    setProcessingRequest(requestId);
    try {
      const success = await ndaService.approveNDARequest(requestId, user?.id || "");
      if (success) {
        toast({
          title: "Request Approved",
          description: "NDA request has been approved. User now has access to private fields.",
        });
        
        // Remove the approved request from local state immediately
        setPendingRequests(prev => prev.filter(req => req.id !== requestId));
        
        // Add delay to ensure database is updated before refreshing
        setTimeout(async () => {
          await fetchPendingRequests();
          onRequestsUpdated();
        }, 500);
      } else {
        throw new Error("Failed to approve request");
      }
    } catch (error) {
      console.error("Error approving request:", error);
      toast({
        title: "Error",
        description: "Failed to approve NDA request",
        variant: "destructive",
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    setProcessingRequest(selectedRequest.id);
    try {
      const success = await ndaService.rejectNDARequest(
        selectedRequest.id,
        user?.id || "",
        rejectionReason.trim() || undefined
      );
      
      if (success) {
        toast({
          title: "Request Rejected",
          description: "NDA request has been rejected and user has been notified.",
        });
        
        // Remove the rejected request from local state immediately
        setPendingRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
        
        // Close dialog immediately
        setShowRejectDialog(false);
        setRejectionReason("");
        setSelectedRequest(null);
        
        // Add delay to ensure database is updated before refreshing
        setTimeout(async () => {
          await fetchPendingRequests();
          onRequestsUpdated();
        }, 500);
      } else {
        throw new Error("Failed to reject request");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Error",
        description: "Failed to reject NDA request",
        variant: "destructive",
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleDownloadFile = async (filePath: string, fileName: string, fileId: string) => {
    setDownloadingFile(fileId);
    try {
      const blob = await ndaService.downloadNDAFile(filePath);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Download Started",
          description: `Downloading ${fileName}`,
        });
      } else {
        throw new Error("Failed to download file");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download file",
        variant: "destructive",
      });
    } finally {
      setDownloadingFile(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!isProposalOwner) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            NDA Requests Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading NDA requests...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              NDA Requests Management
            </div>
            <Badge variant="secondary">
              {pendingRequests.length} pending
            </Badge>
          </CardTitle>
          <CardDescription>
            Review and manage NDA access requests for "{proposalTitle}"
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Pending Requests
              </h3>
              <p className="text-gray-500">
                There are currently no pending NDA requests for this proposal.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={request.signerAvatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {request.signerName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">
                            {request.signerName || `User ${request.signerUserId}`}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {request.signerEmail || 'Email not available'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(request.pendingAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Request Message */}
                    {request.requestMessage && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-gray-500" />
                          <Label className="font-medium">Request Message</Label>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm whitespace-pre-wrap">
                            {request.requestMessage}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Attached Files */}
                    {request.attachedFiles && request.attachedFiles.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <Label className="font-medium">
                            Attached Documents ({request.attachedFiles.length})
                          </Label>
                        </div>
                        <div className="space-y-2">
                          {request.attachedFiles.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between p-3 rounded-lg border bg-gray-50"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-blue-500" />
                                <div>
                                  <p className="text-sm font-medium">{file.fileName}</p>
                                  <p className="text-xs text-gray-500">
                                    {formatFileSize(file.fileSize)} • {file.fileType}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadFile(file.filePath, file.fileName, file.id)}
                                disabled={downloadingFile === file.id}
                              >
                                {downloadingFile === file.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                  </>
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Request Timeline */}
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Submitted {new Date(request.pendingAt).toLocaleDateString()} at{" "}
                      {new Date(request.pendingAt).toLocaleTimeString()}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowRejectDialog(true);
                      }}
                      disabled={processingRequest === request.id}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleApprove(request.id)}
                      disabled={processingRequest === request.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {processingRequest === request.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Reject NDA Request
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this NDA request from{" "}
              {selectedRequest?.signerName || "this user"}? You can optionally provide a reason.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">
                  This action cannot be undone
                </p>
                <p className="text-sm text-red-700 mt-1">
                  The user will be notified of the rejection and will not have access to private fields.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rejection-reason">
                Reason for Rejection (Optional)
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="Provide a reason for rejecting this request..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                This reason will be shared with the user
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
                setSelectedRequest(null);
              }}
              disabled={processingRequest !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processingRequest !== null}
            >
              {processingRequest ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}