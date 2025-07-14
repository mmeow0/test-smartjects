"use client";

import type React from "react";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";
import { useRequirePaidAccount } from "@/hooks/use-auth-guard";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileUploader } from "@/components/file-uploader";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  FileText,
  Calendar,
  DollarSign,
  Check,
} from "lucide-react";
import { ProposalDocumentPreview } from "@/components/proposal-document-preview";
import type { DocumentVersion } from "@/components/document-version-history";
import { DatePicker } from "@/components/ui/date-picker";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  Plus,
  Trash2,
  ListChecks,
  Circle,
  CheckCircle2,
  X,
} from "lucide-react";
import { proposalService } from "@/lib/services/proposal.service";
import { fileService } from "@/lib/services/file.service";
import { PrivateFieldManager } from "@/components/private-field-manager/private-field-manager";
import type { ProposalPrivateFields } from "@/lib/types";

// Define deliverable type
interface Deliverable {
  id: string;
  description: string;
  completed: boolean;
}

// Define milestone type
interface Milestone {
  id: string;
  name: string;
  description: string;
  percentage: number;
  amount: string;
  deliverables: Deliverable[];
}

export default function EditProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const router = useRouter();
  const { toast } = useToast();
  const { isLoading: authLoading, user, canAccess } = useRequirePaidAccount();
  const [isLoading, setIsLoading] = useState(true);

  const fetchProposalData = async () => {
    try {
      const proposal = await proposalService.getProposalById(id);

      if (!proposal) {
        toast({ title: "Proposal not found", variant: "destructive" });
        router.push("/proposals");
        return;
      }

      setFormData({
        title: proposal.title || "",
        smartjectId: proposal.smartjectId || "",
        smartjectTitle: proposal.smartjectTitle || "",
        description: proposal.description || "",
        scope: proposal.scope || "",
        timeline: proposal.timeline || "",
        budget: proposal.budget || 0,
        deliverables: proposal.deliverables || "",
        requirements:
          proposal.type === "need" ? proposal.requirements || "" : "",
        expertise: proposal.type === "provide" ? proposal.expertise || "" : "",
        approach: proposal.type === "provide" ? proposal.approach || "" : "",
        team: proposal.type === "provide" ? proposal.team || "" : "",
        additionalInfo: proposal.additionalInfo || "",
      });

      // Set private fields if they exist
      if (proposal.privateFields) {
        setPrivateFields({
          scope: proposal.privateFields.scope || "",
          timeline: proposal.privateFields.timeline || "",
          budget: proposal.privateFields.budget || undefined,
          deliverables: proposal.privateFields.deliverables || "",
          requirements: proposal.privateFields.requirements || "",
          expertise: proposal.privateFields.expertise || "",
          approach: proposal.privateFields.approach || "",
          team: proposal.privateFields.team || "",
          additionalInfo: proposal.privateFields.additionalInfo || "",
        });

        // Enable fields that have private content
        const enabledFields: Record<string, boolean> = {};
        if (proposal.privateFields) {
          Object.keys(proposal.privateFields).forEach((field) => {
            enabledFields[field] = Boolean(
              proposal.privateFields?.[field as keyof ProposalPrivateFields],
            );
          });
        }
        setEnabledPrivateFields(enabledFields);
      }

      setFiles(proposal.files);
      setProposalType(proposal.type);
      setIsCooperationProposal(proposal.isCooperationProposal || false);
      setMilestones(proposal.milestones || []);
      setUseMilestones(
        Boolean(proposal.milestones && proposal.milestones.length > 0),
      );

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching proposal data:", error);
      toast({ title: "Failed to load proposal", variant: "destructive" });
      setIsLoading(false);
    }
  };

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [proposalType, setProposalType] = useState<"need" | "provide" | null>(
    null,
  );
  const [isCooperationProposal, setIsCooperationProposal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    smartjectId: "",
    smartjectTitle: "",
    description: "",
    scope: "",
    timeline: "",
    budget: 0,
    deliverables: "",
    requirements: "",
    expertise: "",
    approach: "",
    team: "",
    additionalInfo: "",
  });

  // Private fields state for confidential information
  const [privateFields, setPrivateFields] = useState<ProposalPrivateFields>({
    scope: "",
    timeline: "",
    budget: undefined,
    deliverables: "",
    requirements: "",
    expertise: "",
    approach: "",
    team: "",
    additionalInfo: "",
  });

  // Track which fields have private versions enabled
  const [enabledPrivateFields, setEnabledPrivateFields] = useState<
    Record<string, boolean>
  >({
    scope: false,
    timeline: false,
    budget: false,
    deliverables: false,
    requirements: false,
    expertise: false,
    approach: false,
    team: false,
    additionalInfo: false,
  });
  const [files, setFiles] = useState<
    {
      id: string;
      name: string;
      size: number;
      type: string;
      path: string;
    }[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentVersions, setDocumentVersions] = useState<DocumentVersion[]>(
    [],
  );

  // Milestone state
  const [useMilestones, setUseMilestones] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<Milestone>({
    id: "",
    name: "",
    description: "",
    percentage: 0,
    amount: "",
    deliverables: [],
  });
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(
    null,
  );
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [newDeliverable, setNewDeliverable] = useState("");

  // Load proposal data when authenticated
  useEffect(() => {
    if (authLoading || !canAccess) {
      return;
    }

    // Fetch proposal data
    fetchProposalData();
  }, [authLoading, canAccess, user, id]);

  // Calculate total percentage whenever milestones change
  useEffect(() => {
    const total = milestones.reduce(
      (sum, milestone) => sum + milestone.percentage,
      0,
    );
    setTotalPercentage(total);
  }, [milestones]);

  if (authLoading || !canAccess) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <div className="h-10 w-10 bg-gray-200 rounded-md animate-pulse mr-4"></div>
            <div>
              <div className="h-6 w-48 bg-gray-200 rounded-md animate-pulse mb-2"></div>
              <div className="h-4 w-64 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          </div>
          <div className="h-8 w-full bg-gray-200 rounded-md animate-pulse mb-8"></div>
          <div className="h-96 w-full bg-gray-200 rounded-md animate-pulse"></div>
        </div>
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrivateFieldChange = (fieldName: string, value: string) => {
    setPrivateFields((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleTogglePrivateField = (fieldName: string, enabled: boolean) => {
    setEnabledPrivateFields((prev) => ({ ...prev, [fieldName]: enabled }));
    // Clear private field value if disabled
    if (!enabled) {
      setPrivateFields((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  const handleFileChange = async (uploadedFiles: File[]) => {
    try {
      const newFiles: {
        id: string;
        name: string;
        size: number;
        type: string;
        path: string;
      }[] = [];

      for (const file of uploadedFiles) {
        // Загружаем файл в Supabase
        const filePath = await proposalService.uploadFile(id, file);
        if (filePath) {
          // Сохраняем ссылку на файл в базе данных
          const success = await proposalService.saveFileReference(
            id,
            file,
            filePath,
          );
          if (success) {
            newFiles.push({
              id: Date.now().toString(),
              name: file.name,
              size: file.size,
              type: file.type,
              path: filePath,
            });
          }
        }
      }
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Ошибка",
        description:
          "Не удалось загрузить файлы. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
    }
  };

  const nextStep = () => {
    // Skip to step 5 for cooperation proposals
    if (currentStep === 1 && isCooperationProposal) {
      setCurrentStep(5);
      window.scrollTo(0, 0);
    } else if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);

    try {
      // Prepare private fields (only include fields that are enabled and have content)
      const proposalPrivateFields = Object.keys(enabledPrivateFields).reduce(
        (acc, fieldName) => {
          if (
            enabledPrivateFields[fieldName] &&
            privateFields[fieldName as keyof typeof privateFields]
          ) {
            acc[fieldName as keyof typeof privateFields] =
              privateFields[fieldName as keyof typeof privateFields];
          }
          return acc;
        },
        {} as typeof privateFields,
      );

      const updatedProposal = {
        title: formData.title,
        description: formData.description,
        isCooperationProposal: isCooperationProposal,
        budget: formData.budget > 0 ? formData.budget : undefined,
        timeline: formData.timeline,
        scope: formData.scope,
        deliverables: formData.deliverables,
        requirements: formData.requirements,
        expertise: formData.expertise,
        approach: formData.approach,
        team: formData.team,
        additionalInfo: formData.additionalInfo,
        milestones: milestones,
        privateFields: proposalPrivateFields,
        status: "draft" as const,
      };

      const success = await proposalService.updateProposal(id, updatedProposal);

      if (success) {
        // Create a new version entry
        const newVersion: DocumentVersion = {
          id: `version-${documentVersions.length + 1}`,
          versionNumber: documentVersions.length + 1,
          date: new Date().toISOString(),
          author: user?.name || "User",
          changes: ["Updated proposal draft"],
        };

        setDocumentVersions([newVersion, ...documentVersions]);

        toast({
          title: "Draft saved",
          description: "Your proposal draft has been saved successfully.",
        });
      } else {
        throw new Error("Failed to save draft");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // For cooperation proposals, only basic validation is needed
    if (isCooperationProposal) {
      // Skip milestone validation and other detailed validations
    } else {
      // Validate milestones if they're being used
      if (useMilestones && totalPercentage !== 100) {
        toast({
          title: "Invalid milestone percentages",
          description:
            "The total percentage of all milestones must equal 100%.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Prepare private fields (only include fields that are enabled and have content)
      const proposalPrivateFields = Object.keys(enabledPrivateFields).reduce(
        (acc, fieldName) => {
          if (
            enabledPrivateFields[fieldName] &&
            privateFields[fieldName as keyof typeof privateFields]
          ) {
            acc[fieldName as keyof typeof privateFields] =
              privateFields[fieldName as keyof typeof privateFields];
          }
          return acc;
        },
        {} as typeof privateFields,
      );

      const updatedProposal = {
        title: formData.title,
        description: formData.description,
        isCooperationProposal: isCooperationProposal,
        budget: isCooperationProposal
          ? undefined
          : formData.budget > 0
            ? formData.budget
            : undefined,
        timeline: isCooperationProposal ? "" : formData.timeline,
        scope: isCooperationProposal ? "" : formData.scope,
        deliverables: isCooperationProposal ? "" : formData.deliverables,
        requirements: isCooperationProposal ? "" : formData.requirements,
        expertise: isCooperationProposal ? "" : formData.expertise,
        approach: isCooperationProposal ? "" : formData.approach,
        team: isCooperationProposal ? "" : formData.team,
        additionalInfo: formData.additionalInfo,
        milestones: isCooperationProposal ? [] : milestones,
        privateFields: proposalPrivateFields,
        status: "submitted" as const,
      };

      const success = await proposalService.updateProposal(id, updatedProposal);

      if (success) {
        toast({
          title: "Proposal updated",
          description: "Your proposal has been updated successfully.",
        });
        router.push(`/proposals/${id}`);
      } else {
        throw new Error("Failed to update proposal");
      }
    } catch (error) {
      console.error("Error updating proposal:", error);
      toast({
        title: "Error",
        description: "Failed to update proposal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // Milestone functions
  const openAddMilestoneDialog = () => {
    setEditingMilestoneId(null);
    setCurrentMilestone({
      id: Date.now().toString(),
      name: "",
      description: "",
      percentage: 0,
      amount: "",
      deliverables: [],
    });
    setNewDeliverable("");
    setShowMilestoneDialog(true);
  };

  const openEditMilestoneDialog = (milestone: Milestone) => {
    setEditingMilestoneId(milestone.id);
    setCurrentMilestone({ ...milestone });
    setNewDeliverable("");
    setShowMilestoneDialog(true);
  };

  const handleSaveMilestone = () => {
    // Validate milestone data
    if (!currentMilestone.name.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a name for the milestone.",
        variant: "destructive",
      });
      return;
    }

    if (currentMilestone.percentage <= 0) {
      toast({
        title: "Invalid percentage",
        description: "Percentage must be greater than 0.",
        variant: "destructive",
      });
      return;
    }

    // Check if adding/updating this milestone would exceed 100%
    const otherMilestonesTotal = milestones
      .filter((m) => m.id !== currentMilestone.id)
      .reduce((sum, m) => sum + m.percentage, 0);

    if (otherMilestonesTotal + currentMilestone.percentage > 100) {
      toast({
        title: "Percentage too high",
        description:
          "The total percentage of all milestones cannot exceed 100%.",
        variant: "destructive",
      });
      return;
    }

    if (editingMilestoneId) {
      // Update existing milestone
      setMilestones(
        milestones.map((m) =>
          m.id === editingMilestoneId ? currentMilestone : m,
        ),
      );
      toast({
        title: "Milestone updated",
        description: "The milestone has been updated successfully.",
      });
    } else {
      // Add new milestone
      setMilestones([...milestones, currentMilestone]);
      toast({
        title: "Milestone added",
        description: "The milestone has been added successfully.",
      });
    }

    setShowMilestoneDialog(false);
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
    toast({
      title: "Milestone deleted",
      description: "The milestone has been deleted successfully.",
    });
  };

  const formatCurrency = (value: string) => {
    // Remove any non-digit characters
    const numericValue = value.replace(/[^0-9]/g, "");

    // Format as currency
    if (numericValue) {
      return `$${Number.parseInt(numericValue).toLocaleString()}`;
    }
    return "";
  };

  const handleMilestoneAmountChange = (value: string) => {
    setCurrentMilestone({
      ...currentMilestone,
      amount: formatCurrency(value),
    });
  };

  const handleMilestonePercentageChange = (percentage: number) => {
    const newPercentage = Math.max(0, Math.min(100, percentage));
    setCurrentMilestone({
      ...currentMilestone,
      percentage: newPercentage,
    });
  };

  // Add a new deliverable to the current milestone
  const handleAddDeliverable = () => {
    if (!newDeliverable.trim()) return;

    const newDeliverableItem: Deliverable = {
      id: Date.now().toString(),
      description: newDeliverable.trim(),
      completed: false,
    };

    setCurrentMilestone({
      ...currentMilestone,
      deliverables: [...currentMilestone.deliverables, newDeliverableItem],
    });

    setNewDeliverable("");
  };

  // Remove a deliverable from the current milestone
  const handleRemoveDeliverable = (id: string) => {
    setCurrentMilestone({
      ...currentMilestone,
      deliverables: currentMilestone.deliverables.filter((d) => d.id !== id),
    });
  };

  // Toggle the completed status of a deliverable
  const handleToggleDeliverable = (id: string) => {
    setCurrentMilestone({
      ...currentMilestone,
      deliverables: currentMilestone.deliverables.map((d) =>
        d.id === id ? { ...d, completed: !d.completed } : d,
      ),
    });
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const success = await fileService.deleteFile(fileId);
      if (success) {
        setFiles(files.filter((file) => file.id !== fileId));
        toast({
          title: "Файл удален",
          description: "Файл был успешно удален.",
        });
      } else {
        throw new Error("Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить файл. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadFile = async (filePath: string, fileName: string) => {
    try {
      const url = await fileService.downloadFile(filePath, fileName);
      if (url) {
        window.open(url, "_blank"); // или <img src={url} />
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось скачать файл. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="proposalType">Proposal Type</Label>
              <RadioGroup
                id="proposalType"
                value={proposalType || ""}
                onValueChange={(value) =>
                  setProposalType(value as "need" | "provide")
                }
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="need" id="need" />
                  <Label htmlFor="need" className="cursor-pointer">
                    I Need (I'm looking for someone to implement this smartject)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="provide" id="provide" />
                  <Label htmlFor="provide" className="cursor-pointer">
                    I Provide (I can implement this smartject for someone)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smartjectId">Smartject</Label>
              <div className="p-4 border rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      <a
                        href={`/smartject/${formData.smartjectId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {formData.smartjectTitle}
                      </a>
                    </h3>
                  </div>
                  <Badge>{formData.smartjectId}</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Proposal Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter a descriptive title for your proposal"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Proposal Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Provide a brief overview of your proposal"
                rows={5}
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            {proposalType && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="cooperation"
                    checked={isCooperationProposal}
                    onChange={(e) => setIsCooperationProposal(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="cooperation" className="cursor-pointer">
                    This is a proposal for cooperation (partnership or
                    collaboration)
                  </Label>
                </div>
                {isCooperationProposal && (
                  <p className="text-sm text-muted-foreground">
                    Cooperation proposals will skip detailed project planning
                    and go directly to document upload.
                  </p>
                )}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <PrivateFieldManager
              fieldName="scope"
              label="Project Scope"
              publicValue={formData.scope}
              privateValue={privateFields.scope || ""}
              onPublicChangeAction={(value) =>
                setFormData((prev) => ({ ...prev, scope: value }))
              }
              onPrivateChangeAction={(value) =>
                handlePrivateFieldChange("scope", value)
              }
              fieldType="textarea"
              placeholder="Define the scope of the project"
              privatePlaceholder="Confidential scope details..."
              rows={4}
              hasPrivateField={enabledPrivateFields.scope}
              onTogglePrivateFieldAction={(enabled) =>
                handleTogglePrivateField("scope", enabled)
              }
              isProposalOwner={true}
            />

            <PrivateFieldManager
              fieldName="timeline"
              label="Timeline"
              publicValue={formData.timeline}
              privateValue={privateFields.timeline || ""}
              onPublicChangeAction={(value) =>
                setFormData((prev) => ({ ...prev, timeline: value }))
              }
              onPrivateChangeAction={(value) =>
                handlePrivateFieldChange("timeline", value)
              }
              fieldType="input"
              placeholder="e.g., 3 months, 12 weeks"
              privatePlaceholder="Confidential timeline details..."
              hasPrivateField={enabledPrivateFields.timeline}
              onTogglePrivateFieldAction={(enabled) =>
                handleTogglePrivateField("timeline", enabled)
              }
              isProposalOwner={true}
            />

            <PrivateFieldManager
              fieldName="budget"
              label="Budget"
              publicValue={
                formData.budget > 0 ? formData.budget.toString() : ""
              }
              privateValue={
                privateFields.budget !== undefined
                  ? privateFields.budget.toString()
                  : ""
              }
              onPublicChangeAction={(value) => {
                const numericValue = value.replace(/[^0-9.]/g, "");
                setFormData((prev) => ({
                  ...prev,
                  budget: numericValue ? Number(numericValue) : 0,
                }));
              }}
              onPrivateChangeAction={(value) => {
                const numericValue = value.replace(/[^0-9.]/g, "");
                handlePrivateFieldChange(
                  "budget",
                  numericValue ? Number(numericValue) : undefined,
                );
              }}
              fieldType="number"
              placeholder="e.g., 5000, 10000"
              privatePlaceholder="Confidential budget details..."
              hasPrivateField={enabledPrivateFields.budget}
              onTogglePrivateFieldAction={(enabled) =>
                handleTogglePrivateField("budget", enabled)
              }
              isProposalOwner={true}
            />

            <PrivateFieldManager
              fieldName="deliverables"
              label="Deliverables"
              publicValue={formData.deliverables}
              privateValue={privateFields.deliverables || ""}
              onPublicChangeAction={(value) =>
                setFormData((prev) => ({ ...prev, deliverables: value }))
              }
              onPrivateChangeAction={(value) =>
                handlePrivateFieldChange("deliverables", value)
              }
              fieldType="textarea"
              placeholder="List the specific deliverables expected from this project"
              privatePlaceholder="Confidential deliverables details..."
              rows={4}
              hasPrivateField={enabledPrivateFields.deliverables}
              onTogglePrivateFieldAction={(enabled) =>
                handleTogglePrivateField("deliverables", enabled)
              }
              isProposalOwner={true}
            />
          </div>
        );

      case 3:
        return proposalType === "need" ? (
          <div className="space-y-6">
            <PrivateFieldManager
              fieldName="requirements"
              label="Requirements"
              publicValue={formData.requirements}
              privateValue={privateFields.requirements || ""}
              onPublicChangeAction={(value) =>
                setFormData((prev) => ({ ...prev, requirements: value }))
              }
              onPrivateChangeAction={(value) =>
                handlePrivateFieldChange("requirements", value)
              }
              fieldType="textarea"
              placeholder="Specify your detailed requirements for this project"
              privatePlaceholder="Confidential requirements details..."
              rows={6}
              hasPrivateField={enabledPrivateFields.requirements}
              onTogglePrivateFieldAction={(enabled) =>
                handleTogglePrivateField("requirements", enabled)
              }
              isProposalOwner={true}
            />

            <PrivateFieldManager
              fieldName="additionalInfo"
              label="Additional Information"
              publicValue={formData.additionalInfo}
              privateValue={privateFields.additionalInfo || ""}
              onPublicChangeAction={(value) =>
                setFormData((prev) => ({ ...prev, additionalInfo: value }))
              }
              onPrivateChangeAction={(value) =>
                handlePrivateFieldChange("additionalInfo", value)
              }
              fieldType="textarea"
              placeholder="Any other information that might be helpful for potential providers"
              privatePlaceholder="Confidential additional information..."
              rows={4}
              hasPrivateField={enabledPrivateFields.additionalInfo}
              onTogglePrivateFieldAction={(enabled) =>
                handleTogglePrivateField("additionalInfo", enabled)
              }
              isProposalOwner={true}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <PrivateFieldManager
              fieldName="expertise"
              label="Expertise & Experience"
              publicValue={formData.expertise}
              privateValue={privateFields.expertise || ""}
              onPublicChangeAction={(value) =>
                setFormData((prev) => ({ ...prev, expertise: value }))
              }
              onPrivateChangeAction={(value) =>
                handlePrivateFieldChange("expertise", value)
              }
              fieldType="textarea"
              placeholder="Describe your relevant expertise and experience for this project"
              privatePlaceholder="Confidential expertise details..."
              rows={4}
              hasPrivateField={enabledPrivateFields.expertise}
              onTogglePrivateFieldAction={(enabled) =>
                handleTogglePrivateField("expertise", enabled)
              }
              isProposalOwner={true}
            />

            <PrivateFieldManager
              fieldName="approach"
              label="Implementation Approach"
              publicValue={formData.approach}
              privateValue={privateFields.approach || ""}
              onPublicChangeAction={(value) =>
                setFormData((prev) => ({ ...prev, approach: value }))
              }
              onPrivateChangeAction={(value) =>
                handlePrivateFieldChange("approach", value)
              }
              fieldType="textarea"
              placeholder="Describe your approach to implementing this smartject"
              privatePlaceholder="Confidential approach details..."
              rows={4}
              hasPrivateField={enabledPrivateFields.approach}
              onTogglePrivateFieldAction={(enabled) =>
                handleTogglePrivateField("approach", enabled)
              }
              isProposalOwner={true}
            />

            <PrivateFieldManager
              fieldName="team"
              label="Team & Resources"
              publicValue={formData.team}
              privateValue={privateFields.team || ""}
              onPublicChangeAction={(value) =>
                setFormData((prev) => ({ ...prev, team: value }))
              }
              onPrivateChangeAction={(value) =>
                handlePrivateFieldChange("team", value)
              }
              fieldType="textarea"
              placeholder="Describe the team and resources you'll allocate to this project"
              privatePlaceholder="Confidential team details..."
              rows={3}
              hasPrivateField={enabledPrivateFields.team}
              onTogglePrivateFieldAction={(enabled) =>
                handleTogglePrivateField("team", enabled)
              }
              isProposalOwner={true}
            />

            <PrivateFieldManager
              fieldName="additionalInfo"
              label="Additional Information"
              publicValue={formData.additionalInfo}
              privateValue={privateFields.additionalInfo || ""}
              onPublicChangeAction={(value) =>
                setFormData((prev) => ({ ...prev, additionalInfo: value }))
              }
              onPrivateChangeAction={(value) =>
                handlePrivateFieldChange("additionalInfo", value)
              }
              fieldType="textarea"
              placeholder="Any other information that might strengthen your proposal"
              privatePlaceholder="Confidential additional information..."
              rows={3}
              hasPrivateField={enabledPrivateFields.additionalInfo}
              onTogglePrivateFieldAction={(enabled) =>
                handleTogglePrivateField("additionalInfo", enabled)
              }
              isProposalOwner={true}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
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
                />
              </div>

              {useMilestones && (
                <>
                  <div className="border rounded-md p-3 bg-muted/30">
                    <p className="text-sm">
                      Define payment milestones to break down the project into
                      manageable phases. Each milestone should have a percentage
                      of the total budget.
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
                          className="border rounded-md p-3 flex justify-between items-start"
                        >
                          <div className="w-full">
                            <div className="font-medium">{milestone.name}</div>
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
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditMilestoneDialog(milestone)}
                            >
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleDeleteMilestone(milestone.id)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center text-muted-foreground">
                      <FileText className="h-8 w-8 mb-2" />
                      <p>No milestones defined yet</p>
                      <p className="text-sm">
                        Add milestones to define the payment schedule
                      </p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={openAddMilestoneDialog}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Milestone
                  </Button>
                </>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Supporting Documents</Label>
              <FileUploader onFilesChange={handleFileChange} />
              <p className="text-sm text-muted-foreground">
                Upload any supporting documents such as diagrams,
                specifications, or portfolios (max 5 files, 10MB each)
              </p>
              {files.map((file, index) => (
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadFile(file.path, file.name)}
                    >
                      Скачать
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFile(file.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      Удалить
                    </Button>
                  </div>
                </li>
              ))}
            </div>

            <div className="space-y-4 mt-8">
              <h3 className="text-lg font-medium">Proposal Summary</h3>
              <div className="space-y-4 border rounded-md p-4">
                <div>
                  <p className="text-sm font-medium">Proposal Type</p>
                  <p className="capitalize">{proposalType}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium">Title</p>
                  <p>{formData.title || "Not specified"}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium">Description</p>
                  <p>{formData.description || "Not specified"}</p>
                </div>
                <Separator />
                {isCooperationProposal ? (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <FileText className="h-4 w-4" /> Files
                      </p>
                      <p>{files.length > 0 ? files.length : 0} attached</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Calendar className="h-4 w-4" /> Timeline
                      </p>
                      <p>{formData.timeline || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <DollarSign className="h-4 w-4" /> Budget
                      </p>
                      <p>
                        {formData.budget
                          ? `$${formData.budget.toLocaleString()}`
                          : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <FileText className="h-4 w-4" /> Files
                      </p>
                      <p>{files.length > 0 ? files.length : 0} attached</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <ProposalDocumentPreview
                proposalId={id}
                title={formData.title}
                smartjectTitle={formData.smartjectTitle}
                type={proposalType || "need"}
                description={formData.description}
                scope={formData.scope}
                timeline={formData.timeline}
                budget={formData.budget ? formData.budget.toString() : ""}
                deliverables={formData.deliverables}
                requirements={formData.requirements}
                expertise={formData.expertise}
                approach={formData.approach}
                team={formData.team}
                additionalInfo={formData.additionalInfo}
                userName={user?.name || "User Name"}
                userEmail={user?.email || "user@example.com"}
                createdAt={new Date().toISOString()}
                versions={documentVersions}
                milestones={milestones}
                files={files.map((f) => f.name)}
                organizationName={user?.organizationName}
                contactPhone={user?.phone}
              />
            </div>
          </div>
        );

      default:
        return null;
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
          <div>
            <h1 className="text-2xl font-bold">Edit Proposal</h1>
            <p className="text-muted-foreground">
              Update your proposal for{" "}
              <a
                href={`/smartject/${formData.smartjectId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                {formData.smartjectTitle}
              </a>
            </p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">
              Step {currentStep} of 5:{" "}
              {currentStep === 1
                ? "Basic Information"
                : currentStep === 2
                  ? "Project Details"
                  : currentStep === 3
                    ? "Specific Requirements"
                    : currentStep === 4
                      ? "Payment Milestones"
                      : "Documents & Review"}
            </p>
            <p className="text-sm text-muted-foreground">
              {currentStep === 5
                ? "Final Step"
                : `${currentStep * 20}% Complete`}
            </p>
          </div>
          <Progress value={currentStep * 20} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1
                ? "Basic Information"
                : currentStep === 2
                  ? "Project Details"
                  : currentStep === 3
                    ? proposalType === "need"
                      ? "Your Requirements"
                      : "Your Expertise & Approach"
                    : currentStep === 4
                      ? "Payment Milestones"
                      : "Supporting Documents & Review"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1
                ? "Update basic information about your proposal"
                : currentStep === 2
                  ? "Modify the scope, timeline, and budget for the project"
                  : currentStep === 3
                    ? proposalType === "need"
                      ? "Update your detailed requirements for this smartject"
                      : "Revise your expertise and approach to implementing this smartject"
                    : currentStep === 4
                      ? "Define payment milestones for the project"
                      : isCooperationProposal
                        ? "Upload supporting documents and submit your cooperation proposal"
                        : "Upload supporting documents and review your proposal"}
            </CardDescription>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
          <CardFooter className="flex justify-between">
            <div>
              {currentStep > 1 && (
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Draft"}
              </Button>
              {currentStep < 5 ? (
                <Button
                  onClick={nextStep}
                  disabled={
                    currentStep === 4 &&
                    useMilestones &&
                    totalPercentage !== 100
                  }
                >
                  {currentStep === 1 && isCooperationProposal
                    ? "Skip to Review"
                    : "Next"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Updating..." : "Update Proposal"}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Milestone Dialog */}
      <Dialog open={showMilestoneDialog} onOpenChange={setShowMilestoneDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingMilestoneId ? "Edit Milestone" : "Add Milestone"}
            </DialogTitle>
            <DialogDescription>
              {editingMilestoneId
                ? "Update the details of this milestone"
                : "Define a new milestone for the project"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="milestone-name">Milestone Name</Label>
              <Input
                id="milestone-name"
                placeholder="e.g., Project Kickoff, MVP Delivery"
                value={currentMilestone.name}
                onChange={(e) =>
                  setCurrentMilestone({
                    ...currentMilestone,
                    name: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="milestone-description">Description</Label>
              <Textarea
                id="milestone-description"
                placeholder="Describe what will be delivered in this milestone"
                value={currentMilestone.description}
                onChange={(e) =>
                  setCurrentMilestone({
                    ...currentMilestone,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="milestone-percentage">Percentage (%)</Label>
                <Input
                  id="milestone-percentage"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="e.g., 25"
                  value={currentMilestone.percentage || ""}
                  onChange={(e) =>
                    handleMilestonePercentageChange(
                      Number.parseInt(e.target.value) || 0,
                    )
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Percentage of total budget
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="milestone-amount">Amount</Label>
                <Input
                  id="milestone-amount"
                  placeholder="e.g., $5,000"
                  value={currentMilestone.amount}
                  onChange={(e) => handleMilestoneAmountChange(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Payment amount for this milestone
                </p>
              </div>
            </div>

            {/* Deliverables Section */}
            <div className="space-y-2 pt-2 border-t">
              <Label className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" /> Deliverables
              </Label>

              {currentMilestone.deliverables.length > 0 ? (
                <div className="border rounded-md p-2 space-y-2 max-h-[200px] overflow-y-auto">
                  {currentMilestone.deliverables.map((deliverable) => (
                    <div
                      key={deliverable.id}
                      className="flex items-center gap-2 p-2 bg-muted/50 rounded-md"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleToggleDeliverable(deliverable.id)}
                      >
                        {deliverable.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                        <span className="sr-only">Toggle completion</span>
                      </Button>
                      <span className="flex-1 text-sm">
                        {deliverable.description}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => handleRemoveDeliverable(deliverable.id)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed rounded-md p-4 text-center text-muted-foreground">
                  <p className="text-sm">No deliverables added yet</p>
                </div>
              )}

              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add a deliverable item..."
                  value={newDeliverable}
                  onChange={(e) => setNewDeliverable(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newDeliverable.trim()) {
                      e.preventDefault();
                      handleAddDeliverable();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddDeliverable}
                  disabled={!newDeliverable.trim()}
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Add</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Add specific items that will be delivered as part of this
                milestone
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMilestoneDialog(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveMilestone}>
              <Check className="h-4 w-4 mr-2" />
              {editingMilestoneId ? "Update Milestone" : "Add Milestone"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
