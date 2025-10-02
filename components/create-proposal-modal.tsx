"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  MobileDialog,
  MobileDialogContent,
  MobileDialogDescription,
  MobileDialogFooter,
  MobileDialogHeader,
  MobileDialogTitle,
} from "@/components/ui/mobile-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileUploader } from "@/components/file-uploader";
import { smartjectService } from "@/lib/services/smartject.service";
import { proposalService } from "@/lib/services/proposal.service";
import { voteService } from "@/lib/services";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  Plus,
  Trash2,
  Circle,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";
import type { DocumentVersion } from "@/components/document-version-history";
import type { SmartjectType, ProposalType } from "@/lib/types";
import { Switch } from "@/components/ui/switch";
import { PrivateFieldManager } from "@/components/private-field-manager/private-field-manager";
import type { ProposalPrivateFields } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  smartjectId?: string;
  proposalType?: "need" | "provide";
  onSuccess?: () => void;
  editingProposal?: ProposalType | null;
}

export function CreateProposalModal({
  isOpen,
  onClose,
  smartjectId,
  proposalType: initialProposalType,
  onSuccess,
  editingProposal,
}: CreateProposalModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  // State for loading smartject
  const [loadingSmartject, setLoadingSmartject] = useState(false);
  const [smartject, setSmartject] = useState<SmartjectType | null>(null);

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [proposalType, setProposalType] = useState<"need" | "provide" | null>(
    initialProposalType || null,
  );
  const [isCooperationProposal, setIsCooperationProposal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    smartjectId: smartjectId || "",
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
    budget: 0,
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

  const [files, setFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftVersions, setDraftVersions] = useState<DocumentVersion[]>([
    {
      id: "draft-1",
      versionNumber: 1,
      date: new Date().toISOString(),
      author: user?.name || "User",
      changes: ["Initial draft creation"],
    },
  ]);

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

  // Calculate total percentage whenever milestones change
  useEffect(() => {
    const total = milestones.reduce(
      (sum, milestone) => sum + milestone.percentage,
      0,
    );
    setTotalPercentage(total);
  }, [milestones]);

  // Load smartject data if ID is provided or when editing
  useEffect(() => {
    const fetchSmartject = async () => {
      const idToUse = smartjectId || editingProposal?.smartjectId;
      if (idToUse && isOpen) {
        setLoadingSmartject(true);
        try {
          const data = await smartjectService.getSmartjectById(idToUse);
          if (data) {
            setSmartject(data);
            // Only set title and smartjectId if not editing (to avoid overriding existing proposal data)
            if (!editingProposal) {
              setFormData((prev) => ({
                ...prev,
                title: `${data.title}`,
                smartjectId: data.id,
              }));
            }
          }
        } catch (error) {
          console.error("Error fetching smartject:", error);
          toast({
            title: "Error",
            description:
              "Failed to load smartject data. Please try again later.",
            variant: "destructive",
          });
        } finally {
          setLoadingSmartject(false);
        }
      }
    };

    fetchSmartject();
  }, [
    smartjectId,
    editingProposal?.smartjectId,
    isOpen,
    toast,
    editingProposal,
  ]);

  // Populate form when editing
  useEffect(() => {
    if (isOpen && editingProposal) {
      setCurrentStep(1);
      setProposalType(editingProposal.type);
      setIsCooperationProposal(editingProposal.isCooperationProposal || false);
      setFormData({
        title: editingProposal.title || "",
        smartjectId: editingProposal.smartjectId || "",
        description: editingProposal.description || "",
        scope: editingProposal.scope || "",
        timeline: editingProposal.timeline || "",
        budget: editingProposal.budget || 0,
        deliverables: editingProposal.deliverables || "",
        requirements: editingProposal.requirements || "",
        expertise: editingProposal.expertise || "",
        approach: editingProposal.approach || "",
        team: editingProposal.team || "",
        additionalInfo: editingProposal.additionalInfo || "",
      });

      // Populate private fields if they exist
      if (editingProposal.privateFields) {
        setPrivateFields({
          scope: editingProposal.privateFields.scope || "",
          timeline: editingProposal.privateFields.timeline || "",
          budget: editingProposal.privateFields.budget || undefined,
          deliverables: editingProposal.privateFields.deliverables || "",
          requirements: editingProposal.privateFields.requirements || "",
          expertise: editingProposal.privateFields.expertise || "",
          approach: editingProposal.privateFields.approach || "",
          team: editingProposal.privateFields.team || "",
          additionalInfo: editingProposal.privateFields.additionalInfo || "",
        });

        // Enable private fields that have content
        setEnabledPrivateFields({
          scope: !!editingProposal.privateFields.scope,
          timeline: !!editingProposal.privateFields.timeline,
          budget: !!editingProposal.privateFields.budget,
          deliverables: !!editingProposal.privateFields.deliverables,
          requirements: !!editingProposal.privateFields.requirements,
          expertise: !!editingProposal.privateFields.expertise,
          approach: !!editingProposal.privateFields.approach,
          team: !!editingProposal.privateFields.team,
          additionalInfo: !!editingProposal.privateFields.additionalInfo,
        });
      }
    }
  }, [isOpen, editingProposal]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setProposalType(initialProposalType || null);
      setIsCooperationProposal(false);
      setFormData({
        title: "",
        smartjectId: smartjectId || "",
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
      setPrivateFields({
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
      setEnabledPrivateFields({
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
      setFiles([]);
      setMilestones([]);
      setUseMilestones(false);
      setSmartject(null);
    }
  }, [isOpen, smartjectId, initialProposalType]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrivateFieldChange = (
    fieldName: string,
    value: string | number | undefined,
  ) => {
    setPrivateFields((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleTogglePrivateField = (fieldName: string, enabled: boolean) => {
    setEnabledPrivateFields((prev) => ({ ...prev, [fieldName]: enabled }));
    // Clear private field value if disabled
    if (!enabled) {
      setPrivateFields((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  const handleFileChange = (uploadedFiles: File[]) => {
    setFiles(uploadedFiles);
  };

  const handleSaveDraft = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to save a draft.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Prepare private fields (only include fields that are enabled and have content)
      const proposalPrivateFields: Partial<ProposalPrivateFields> = {};

      Object.keys(enabledPrivateFields).forEach((fieldName) => {
        const field = fieldName as keyof typeof privateFields;
        if (enabledPrivateFields[field] && privateFields[field] !== undefined) {
          if (field === "budget" && typeof privateFields[field] === "number") {
            proposalPrivateFields[field] = privateFields[field] as number;
          } else if (
            field !== "budget" &&
            typeof privateFields[field] === "string"
          ) {
            proposalPrivateFields[field] = privateFields[field] as string;
          }
        }
      });

      let proposalId: string;

      if (editingProposal) {
        // Update existing proposal
        const success = await proposalService.updateProposal(
          editingProposal.id,
          {
            userId: user.id,
            smartjectId: formData.smartjectId,
            type: proposalType || "need",
            title: formData.title,
            description: formData.description,
            isCooperationProposal: isCooperationProposal,
            budget: formData.budget || undefined,
            timeline: formData.timeline,
            scope: formData.scope,
            deliverables: formData.deliverables,
            requirements: formData.requirements,
            expertise: formData.expertise,
            approach: formData.approach,
            team: formData.team,
            additionalInfo: formData.additionalInfo,
            privateFields: proposalPrivateFields,
            status: "draft",
          },
        );

        if (!success) {
          throw new Error("Failed to update proposal draft");
        }

        proposalId = editingProposal.id;
      } else {
        // Save the proposal to Supabase
        const createdId = await proposalService.createProposal({
          userId: user.id,
          smartjectId: formData.smartjectId,
          type: proposalType || "need",
          title: formData.title,
          description: formData.description,
          isCooperationProposal: isCooperationProposal,
          budget: formData.budget || undefined,
          timeline: formData.timeline,
          scope: formData.scope,
          deliverables: formData.deliverables,
          requirements: formData.requirements,
          expertise: formData.expertise,
          approach: formData.approach,
          team: formData.team,
          additionalInfo: formData.additionalInfo,
          privateFields: proposalPrivateFields,
          status: "draft",
        });

        if (!createdId) {
          throw new Error("Failed to create proposal draft");
        }

        proposalId = createdId;
      }

      if (!proposalId) {
        throw new Error("Failed to create proposal draft");
      }

      // Create a new version entry
      const newVersion: DocumentVersion = {
        id: `draft-${draftVersions.length + 1}`,
        versionNumber: draftVersions.length + 1,
        date: new Date().toISOString(),
        author: user.name || "User",
        changes: ["Draft saved"],
      };

      setDraftVersions([newVersion, ...draftVersions]);

      toast({
        title: editingProposal ? "Changes saved" : "Draft saved",
        description: editingProposal
          ? "Your proposal changes have been saved successfully."
          : "Your proposal draft has been saved successfully.",
      });

      onClose();
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to submit a proposal.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.smartjectId) {
      toast({
        title: "Missing information",
        description: "Please select a smartject for this proposal.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title) {
      toast({
        title: "Missing information",
        description: "Please provide a title for the proposal.",
        variant: "destructive",
      });
      return;
    }

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
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Prepare private fields (only include fields that are enabled and have content)
      const proposalPrivateFields: Partial<ProposalPrivateFields> = {};

      Object.keys(enabledPrivateFields).forEach((fieldName) => {
        const field = fieldName as keyof typeof privateFields;
        if (enabledPrivateFields[field] && privateFields[field] !== undefined) {
          if (field === "budget" && typeof privateFields[field] === "number") {
            proposalPrivateFields[field] = privateFields[field] as number;
          } else if (
            field !== "budget" &&
            typeof privateFields[field] === "string"
          ) {
            proposalPrivateFields[field] = privateFields[field] as string;
          }
        }
      });

      let proposalId: string;

      if (editingProposal) {
        // Update existing proposal
        const success = await proposalService.updateProposal(
          editingProposal.id,
          {
            userId: user.id,
            smartjectId: formData.smartjectId,
            type: proposalType || "need",
            title: formData.title,
            description: formData.description,
            isCooperationProposal: isCooperationProposal,
            budget: isCooperationProposal
              ? undefined
              : formData.budget
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
            privateFields: proposalPrivateFields,
            status: "submitted",
          },
        );

        if (!success) {
          throw new Error("Failed to update proposal");
        }

        proposalId = editingProposal.id;
      } else {
        // Save the proposal to Supabase
        const createdId = await proposalService.createProposal({
          userId: user.id,
          smartjectId: formData.smartjectId,
          type: proposalType || "need",
          title: formData.title,
          description: formData.description,
          isCooperationProposal: isCooperationProposal,
          budget: isCooperationProposal
            ? undefined
            : formData.budget
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
          privateFields: proposalPrivateFields,
          status: "submitted",
        });

        if (!createdId) {
          throw new Error("Failed to create proposal");
        }

        proposalId = createdId;
      }

      if (!proposalId) {
        throw new Error("Failed to create proposal");
      }

      if (useMilestones && milestones.length > 0 && !isCooperationProposal) {
        // Create milestones and deliverables
        const createdMilestones = await proposalService.createMilestones(
          proposalId,
          milestones,
        );
        if (!createdMilestones) {
          throw new Error("Failed to create milestones");
        }

        // Create deliverables for each milestone
        for (const created of createdMilestones) {
          const milestone = milestones.find((m) => m.name === created.name);
          if (milestone?.deliverables?.length) {
            const deliverablesCreated =
              await proposalService.createDeliverables(
                created.id,
                milestone.deliverables,
              );
            if (!deliverablesCreated) {
              throw new Error("Failed to create deliverables");
            }
          }
        }
      }

      // Upload files
      if (files.length > 0) {
        for (const file of files) {
          const filePath = `proposals/${proposalId}/${Date.now()}-${file.name}`;

          // Upload file to storage
          const publicUrl = await proposalService.uploadFile(proposalId, file);
          if (!publicUrl) {
            throw new Error("Failed to upload file");
          }

          // Save file reference in database
          const saved = await proposalService.saveFileReference(
            proposalId,
            file,
            filePath,
          );
          if (!saved) {
            throw new Error("Failed to save file reference");
          }
        }
      }

      // Automatic voting based on proposal type
      if (proposalType && smartjectId) {
        try {
          const voteType = proposalType === "need" ? "need" : "provide";
          await voteService.vote({
            userId: user.id,
            smartjectId: smartjectId,
            voteType: voteType,
          });
        } catch (voteError) {
          // Don't fail the whole process if voting fails
          console.error("Failed to auto-vote:", voteError);
        }
      }

      // Show success notification
      toast({
        title: editingProposal ? "Proposal updated" : "Proposal submitted",
        description: editingProposal
          ? "Your proposal has been updated successfully."
          : "Your proposal has been submitted successfully.",
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error submitting proposal:", error);
      toast({
        title: "Error",
        description: "Failed to submit proposal. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    // Skip to step 5 for cooperation proposals
    if (currentStep === 1 && isCooperationProposal) {
      setCurrentStep(5);
    } else if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    // For cooperation proposals, if we're on step 5, go back to step 1
    if (currentStep === 5 && isCooperationProposal) {
      setCurrentStep(1);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Basic Information";
      case 2:
        return "Project Details";
      case 3:
        return proposalType === "need" ? "Requirements" : "Your Offer";
      case 4:
        return "Milestones & Planning";
      case 5:
        return "Documents & Review";
      default:
        return "Create Proposal";
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Proposal Type Selector */}
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg relative">
                <div className="grid grid-cols-2">
                  {/* I Need Option */}
                  <div
                    className={`p-4 rounded-lg transition-all ${
                      proposalType === "need"
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-gray-200 hover:border-gray-300"
                    } ${
                      editingProposal
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                    onClick={() => !editingProposal && setProposalType("need")}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          proposalType === "need"
                            ? "border-yellow-500 bg-yellow-500 shadow-sm"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {proposalType === "need" && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-black font-medium">I Need</div>
                        <div className="text-gray-500 text-sm">
                          I'm looking for someone to implement this smartject
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* I Provide Option */}
                  <div
                    className={`p-4 rounded-lg transition-all ${
                      proposalType === "provide"
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-gray-200 hover:border-gray-300"
                    } ${
                      editingProposal
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                    onClick={() =>
                      !editingProposal && setProposalType("provide")
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          proposalType === "provide"
                            ? "border-yellow-500 bg-yellow-500 shadow-sm"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {proposalType === "provide" && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-black font-medium">I Provide</div>
                        <div className="text-gray-500 text-sm">
                          I can implement this smartject for someone
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Vertical Separator */}
                <div className="absolute left-1/2 top-4 bottom-4 w-px bg-gray-300 transform -translate-x-1/2" />
              </div>
            </div>

            {/* Smartject ID and Proposal Title */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                {loadingSmartject ? (
                  <div className="p-4 border rounded-md flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>Loading smartject...</span>
                  </div>
                ) : smartject || editingProposal ? (
                  <div className="p-2 border rounded-md bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">
                          {smartject?.title ||
                            editingProposal?.smartjectTitle ||
                            "Smartject"}
                        </h3>
                        {editingProposal && !smartject && (
                          <p className="text-xs text-muted-foreground">
                            Cannot change smartject when editing
                          </p>
                        )}
                      </div>
                      <Badge className="bg-yellow-300 hover:bg-yellow-400 text-black">
                        {smartjectId || editingProposal?.smartjectId}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="smartjectId"
                      name="smartjectId"
                      value={formData.smartjectId}
                      onChange={handleInputChange}
                      className="peer placeholder-transparent"
                      placeholder="Smartject ID"
                    />
                  </div>
                )}
              </div>

              <div className="relative">
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="peer placeholder-transparent"
                  placeholder="Proposal Title"
                />
              </div>
            </div>

            {/* Proposal Description */}
            <div className="relative">
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="peer placeholder-transparent min-h-[80px] sm:min-h-[100px]"
                placeholder="Proposal Description"
              />
            </div>

            {/* Cooperation Checkbox */}
            {proposalType && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="cooperation"
                    checked={isCooperationProposal}
                    onChange={(e) =>
                      !editingProposal &&
                      setIsCooperationProposal(e.target.checked)
                    }
                    disabled={!!editingProposal}
                    className={`h-4 w-4 rounded border-yellow-400 accent-yellow-400 focus:ring-2 focus:ring-yellow-400 ${
                      editingProposal ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  />
                  <Label
                    htmlFor="cooperation"
                    className={
                      editingProposal
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }
                  >
                    This is a proposal for cooperation (partnership or
                    collaboration)
                  </Label>
                </div>
                {isCooperationProposal && (
                  <p className="text-sm text-muted-foreground">
                    Cooperation proposals will skip detailed project planning
                    and go directly to document upload.
                    {editingProposal && " (Cannot be changed when editing)"}
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
              publicValue={formData.budget.toString()}
              privateValue={
                privateFields.budget !== undefined
                  ? privateFields.budget.toString()
                  : ""
              }
              onPublicChangeAction={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  budget: value ? Number(value) : 0,
                }))
              }
              onPrivateChangeAction={(value) =>
                handlePrivateFieldChange(
                  "budget",
                  value ? Number(value) : undefined,
                )
              }
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
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="useMilestones"
                  checked={useMilestones}
                  onCheckedChange={setUseMilestones}
                />
                <Label htmlFor="useMilestones">
                  Use milestone-based payments
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Break down your project into milestones with specific
                deliverables and payment schedules.
              </p>
            </div>

            {useMilestones && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-medium">Milestones</h3>
                    <Badge variant="outline">{totalPercentage}% of 100%</Badge>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openAddMilestoneDialog}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Milestone
                  </Button>
                </div>

                {milestones.length > 0 && (
                  <div className="space-y-2">
                    {milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {milestone.name}
                            </span>
                            <Badge variant="secondary">
                              {milestone.percentage}%
                            </Badge>
                            <Badge variant="outline">{milestone.amount}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {milestone.description}
                          </p>
                          {milestone.deliverables.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs text-muted-foreground">
                                Deliverables: {milestone.deliverables.length}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditMilestoneDialog(milestone)}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMilestone(milestone.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Progress value={totalPercentage} className="w-full" />
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Document Upload</Label>
              <FileUploader
                onFilesChange={handleFileChange}
                maxFiles={5}
                acceptedFileTypes=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              />
              <p className="text-sm text-muted-foreground">
                Upload supporting documents for your proposal (max 5 files)
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Review Your Proposal</h3>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm text-muted-foreground">
                    {proposalType === "need" ? "I Need" : "I Provide"}
                    {isCooperationProposal && " (Cooperation)"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Title</Label>
                  <p className="text-sm text-muted-foreground">
                    {formData.title || "Not specified"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground">
                    {formData.description || "Not specified"}
                  </p>
                </div>

                {!isCooperationProposal && (
                  <>
                    <div>
                      <Label className="text-sm font-medium">Budget</Label>
                      <p className="text-sm text-muted-foreground">
                        {formData.budget
                          ? `$${formData.budget.toLocaleString()}`
                          : "Not specified"}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Timeline</Label>
                      <p className="text-sm text-muted-foreground">
                        {formData.timeline || "Not specified"}
                      </p>
                    </div>
                  </>
                )}

                {useMilestones && milestones.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Milestones</Label>
                    <p className="text-sm text-muted-foreground">
                      {milestones.length} milestones ({totalPercentage}% total)
                    </p>
                  </div>
                )}

                {files.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Documents</Label>
                    <p className="text-sm text-muted-foreground">
                      {files.length} file(s) attached
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
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

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return proposalType && formData.title && formData.description;
      case 2:
        return !isCooperationProposal || formData.additionalInfo;
      case 3:
        return true;
      case 4:
        return !useMilestones || totalPercentage === 100;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const canSaveDraft = () => {
    return (
      proposalType &&
      formData.smartjectId &&
      formData.title &&
      formData.description
    );
  };

  // Add deliverable to milestone
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

  // Remove deliverable from milestone
  const handleRemoveDeliverable = (id: string) => {
    setCurrentMilestone({
      ...currentMilestone,
      deliverables: currentMilestone.deliverables.filter((d) => d.id !== id),
    });
  };

  // Toggle deliverable completion
  const handleToggleDeliverable = (id: string) => {
    setCurrentMilestone({
      ...currentMilestone,
      deliverables: currentMilestone.deliverables.map((d) =>
        d.id === id ? { ...d, completed: !d.completed } : d,
      ),
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

  return (
    <>
      <MobileDialog open={isOpen} onOpenChange={onClose}>
        <MobileDialogContent
          className="sm:max-w-4xl p-4 sm:p-6"
          overlayClassName="bg-black/30"
        >
          <TooltipProvider>
            <MobileDialogHeader>
              <MobileDialogTitle className="text-2xl font-bold">
                {editingProposal ? "Edit Proposal" : "Create Proposal"}
              </MobileDialogTitle>
              <MobileDialogDescription>
                {editingProposal
                  ? "Edit your existing proposal for a smartject"
                  : "Create a detailed proposal for a smartject"}
              </MobileDialogDescription>
            </MobileDialogHeader>

            <div className="py-2 sm:py-4">
              <div className="mb-2">
                <span className="text-sm font-medium">
                  Step {currentStep} of 5: {getStepTitle()}
                </span>
              </div>
              <Progress
                value={(currentStep / 5) * 100}
                className="w-full mb-4 sm:mb-6 [&>div]:bg-yellow-400 [&>div]:transition-all [&>div]:duration-300"
              />
              <div className="space-y-4 sm:space-y-6">
                {renderStepContent()}
              </div>
            </div>

            <MobileDialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 pt-4 border-t">
              <div className="flex gap-2 order-2 sm:order-1">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1 sm:flex-none"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                )}
              </div>
              <div className="flex gap-2 order-1 sm:order-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleSaveDraft}
                      disabled={isSaving || !canSaveDraft()}
                      className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Draft
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {canSaveDraft()
                        ? "Save your progress as a draft"
                        : "Fill in proposal type, smartject ID, title, and description to save draft"}
                    </p>
                  </TooltipContent>
                </Tooltip>
                {currentStep < 5 && (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className="flex-1 sm:flex-none"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
                {currentStep === 5 && (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !canProceed()}
                    className="flex-1 sm:flex-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {editingProposal ? "Updating..." : "Submitting..."}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {editingProposal
                          ? "Update Proposal"
                          : "Submit Proposal"}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </MobileDialogFooter>
          </TooltipProvider>
        </MobileDialogContent>
      </MobileDialog>

      {/* Milestone Dialog */}
      <MobileDialog
        open={showMilestoneDialog}
        onOpenChange={setShowMilestoneDialog}
      >
        <MobileDialogContent className="sm:max-w-2xl p-4 sm:p-6">
          <MobileDialogHeader>
            <MobileDialogTitle className="text-xl font-bold">
              {editingMilestoneId ? "Edit Milestone" : "Add Milestone"}
            </MobileDialogTitle>
            <MobileDialogDescription>
              Define a project milestone with deliverables and payment details.
            </MobileDialogDescription>
          </MobileDialogHeader>

          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="milestoneName">Milestone Name</Label>
                <Input
                  id="milestoneName"
                  placeholder="e.g., Initial Development"
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
                <Label htmlFor="milestonePercentage">Percentage</Label>
                <Input
                  id="milestonePercentage"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="25"
                  value={currentMilestone.percentage}
                  onChange={(e) =>
                    handleMilestonePercentageChange(Number(e.target.value))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="milestoneDescription">Description</Label>
              <Textarea
                id="milestoneDescription"
                placeholder="Describe what will be accomplished in this milestone"
                rows={3}
                value={currentMilestone.description}
                onChange={(e) =>
                  setCurrentMilestone({
                    ...currentMilestone,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="milestoneAmount">Payment Amount</Label>
              <Input
                id="milestoneAmount"
                placeholder="$5,000"
                value={currentMilestone.amount}
                onChange={(e) => handleMilestoneAmountChange(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Deliverables</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Add deliverable..."
                    value={newDeliverable}
                    onChange={(e) => setNewDeliverable(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddDeliverable();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddDeliverable}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {currentMilestone.deliverables.length > 0 && (
                <div className="space-y-2">
                  {currentMilestone.deliverables.map((deliverable) => (
                    <div
                      key={deliverable.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleDeliverable(deliverable.id)
                          }
                          className="flex items-center"
                        >
                          {deliverable.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Circle className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                        <span
                          className={
                            deliverable.completed
                              ? "line-through text-muted-foreground"
                              : ""
                          }
                        >
                          {deliverable.description}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDeliverable(deliverable.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <MobileDialogFooter className="pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMilestoneDialog(false)}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveMilestone}
              className="flex-1 sm:flex-none"
            >
              {editingMilestoneId ? "Update Milestone" : "Add Milestone"}
            </Button>
          </MobileDialogFooter>
        </MobileDialogContent>
      </MobileDialog>
    </>
  );
}
