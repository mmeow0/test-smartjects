"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ndaService, type NDATemplate } from "@/lib/services/nda.service";
import {
  Upload,
  Download,
  FileText,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
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

interface NDATemplateManagerProps {
  proposalId: string;
  isProposalOwner: boolean;
  onTemplateChange?: () => void;
}

export function NDATemplateManager({
  proposalId,
  isProposalOwner,
  onTemplateChange,
}: NDATemplateManagerProps) {
  const [template, setTemplate] = useState<NDATemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  // Check if this is a draft proposal
  const isDraftProposal = proposalId.startsWith("draft");

  // Fetch existing template on component mount
  useEffect(() => {
    if (!isDraftProposal) {
      fetchTemplate();
    }
  }, [proposalId, isDraftProposal]);

  const fetchTemplate = async () => {
    setIsLoading(true);
    try {
      const existingTemplate = await ndaService.getNDATemplate(proposalId);
      setTemplate(existingTemplate);
    } catch (error) {
      console.error("Error fetching NDA template:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type (common document formats)
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, Word document, or text file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const uploadedTemplate = await ndaService.uploadNDATemplate(
        proposalId,
        selectedFile,
      );

      if (uploadedTemplate) {
        setTemplate(uploadedTemplate);
        setSelectedFile(null);
        onTemplateChange?.();
        toast({
          title: "Template uploaded",
          description: "NDA template has been successfully uploaded.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload NDA template.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!template) return;

    setIsLoading(true);
    try {
      const blob = await ndaService.downloadNDATemplate(proposalId);
      if (blob) {
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = template.templateName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: "Download started",
          description: "NDA template download has started.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.message || "Failed to download NDA template.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await ndaService.deleteNDATemplate(proposalId);
      if (success) {
        setTemplate(null);
        onTemplateChange?.();
        toast({
          title: "Template deleted",
          description: "NDA template has been successfully deleted.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete NDA template.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (isLoading && !template && !isDraftProposal) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading NDA template...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          NDA Template
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Draft proposal message */}
        {isDraftProposal && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Save Proposal First</p>
                <p>
                  NDA templates can only be uploaded after saving your proposal.
                  Complete and save your proposal to enable template management.
                </p>
              </div>
            </div>
          </div>
        )}
        {!isDraftProposal && template ? (
          // Template exists - show template info and actions
          <div className="space-y-4">
            <div className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                <FileText className="h-8 w-8 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-medium">{template.templateName}</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Size: {formatFileSize(template.fileSize)}</p>
                    <p>
                      Uploaded:{" "}
                      {new Date(template.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
                {isProposalOwner && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" disabled={isDeleting}>
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete NDA Template</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this NDA template?
                          Users will no longer be able to download it for their
                          NDA requests.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Template
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>

            {!isProposalOwner && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">NDA Template Available</p>
                    <p>
                      Download this template, fill it out, and submit it with
                      your NDA request to gain access to private information.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : !isDraftProposal ? (
          // No template - show upload interface (owner only) or message
          <div className="space-y-4">
            {isProposalOwner ? (
              // Upload interface for proposal owner
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nda-template">Upload NDA Template</Label>
                  <Input
                    id="nda-template"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Supported formats: PDF, Word documents, Text files (max
                    10MB)
                  </p>
                </div>

                {selectedFile && (
                  <div className="p-3 bg-gray-50 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {selectedFile.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({formatFileSize(selectedFile.size)})
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={handleUpload}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Template
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-700">
                      <p className="font-medium">About NDA Templates</p>
                      <p>
                        Upload an NDA template that users can download, fill
                        out, and submit with their requests for access to
                        private information. This ensures proper legal
                        documentation for confidential data sharing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Message for non-owners when no template exists
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No NDA template has been provided for this proposal.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  You can still submit an NDA request with your own
                  documentation.
                </p>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
