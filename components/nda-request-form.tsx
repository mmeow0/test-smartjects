"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Upload,
  FileText,
  X,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";
import { ndaService } from "@/lib/services/nda.service";

interface NDARequestFormProps {
  proposalId: string;
  proposalTitle: string;
  onRequestSubmitted: () => void;
  disabled?: boolean;
}

export function NDARequestForm({
  proposalId,
  proposalTitle,
  onRequestSubmitted,
  disabled = false,
}: NDARequestFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const maxFiles = 5;
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const acceptedTypes = [
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
    ".jpg",
    ".jpeg",
    ".png",
  ];

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files).filter((file) => {
      // Check file size
      if (file.size > maxFileSize) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive",
        });
        return false;
      }

      // Check file type
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
      if (!acceptedTypes.includes(fileExtension)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    });

    // Check total file count
    if (selectedFiles.length + newFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload up to ${maxFiles} files`,
        variant: "destructive",
      });
      return;
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSubmit = async () => {
    if (!requestMessage.trim()) {
      toast({
        title: "Message required",
        description: "Please provide a message with your NDA request",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (!user?.id) {
        toast({
          title: "Authentication required",
          description: "Please log in to submit an NDA request",
          variant: "destructive",
        });
        return;
      }

      await ndaService.submitNDARequest(
        proposalId,
        user.id,
        requestMessage,
        selectedFiles
      );

      toast({
        title: "NDA Request Submitted",
        description: "Your request has been sent to the proposal owner for review",
      });

      // Reset form
      setRequestMessage("");
      setSelectedFiles([]);
      setIsOpen(false);
      
      // Notify parent component
      onRequestSubmitted();
    } catch (error: any) {
      console.error("Error submitting NDA request:", error);
      
      // Check if it's a migration-related error
      if (error?.message?.includes('Database migration required') || 
          error?.message?.includes('column "status"') ||
          error?.message?.includes('migration required')) {
        toast({
          title: "Database Migration Required",
          description: "The NDA approval system requires database updates. Please contact your administrator to apply migrations.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Submission Failed",
          description: "Failed to submit NDA request. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} className="w-full">
          <Shield className="h-4 w-4 mr-2" />
          Request NDA Access
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Request NDA Access
          </DialogTitle>
          <DialogDescription>
            Submit a request to access private information in "{proposalTitle}".
            The proposal owner will review your request and attached documents.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning Notice */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">
                Non-Disclosure Agreement
              </p>
              <p className="text-sm text-amber-700 mt-1">
                By submitting this request, you agree to maintain confidentiality
                of any private information shared with you. The proposal owner
                will review your request before granting access.
              </p>
            </div>
          </div>

          {/* Request Message */}
          <div className="space-y-2">
            <Label htmlFor="message">
              Request Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Please explain why you need access to the private information and how you plan to use it..."
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Provide a clear explanation of your interest and qualifications
            </p>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <div>
              <Label>Supporting Documents (Optional)</Label>
              <p className="text-sm text-muted-foreground">
                Upload documents that support your request (portfolio, credentials, etc.)
              </p>
            </div>

            {/* Drop Zone */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                dragActive
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <span className="font-medium text-blue-600 hover:text-blue-500">
                      Upload files
                    </span>
                    <span className="text-gray-500"> or drag and drop</span>
                  </Label>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    multiple
                    accept={acceptedTypes.join(",")}
                    onChange={(e) => handleFileSelect(e.target.files)}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  PDF, DOC, DOCX, TXT, JPG, PNG up to 10MB each (max {maxFiles} files)
                </p>
              </div>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Files ({selectedFiles.length}/{maxFiles})</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* File Requirements */}
          <div className="text-xs text-gray-500 space-y-1">
            <p className="font-medium">File Requirements:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Maximum {maxFiles} files per request</li>
              <li>Maximum 10MB per file</li>
              <li>Accepted formats: {acceptedTypes.join(", ")}</li>
              <li>Files should be relevant to your request</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !requestMessage.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}