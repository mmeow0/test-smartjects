"use client";

import type React from "react";

import { useEffect, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileUploader } from "@/components/file-uploader";
import { smartjectService, proposalService } from "@/lib/services";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  FileText,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  ListChecks,
  Circle,
  CheckCircle2,
  X,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { ProposalDocumentPreview } from "@/components/proposal-document-preview";
import type { DocumentVersion } from "@/components/document-version-history";
import type { SmartjectType } from "@/lib/types";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

export default function CreateProposalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const smartjectId = searchParams.get("smartjectId");

  useEffect(() => {
    const voteType = searchParams.get("voteType");
    if (voteType === "need" || voteType === "provide") {
      setProposalType(voteType);
    }
  }, [searchParams]);

  // State for loading smartject
  const [loadingSmartject, setLoadingSmartject] = useState(false);
  const [smartject, setSmartject] = useState<SmartjectType | null>(null);

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [proposalType, setProposalType] = useState<"need" | "provide" | null>(
    null
  );
  const [formData, setFormData] = useState({
    title: "",
    smartjectId: smartjectId || "",
    description: "",
    scope: "",
    timeline: "",
    budget: "",
    deliverables: "",
    requirements: "",
    expertise: "",
    approach: "",
    team: "",
    additionalInfo: "",
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
    null
  );
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [newDeliverable, setNewDeliverable] = useState("");

  // Project timeline dates
  const [projectStartDate, setProjectStartDate] = useState<Date>(
    () => new Date()
  );
  const [projectEndDate, setProjectEndDate] = useState<Date>(() => {
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3); // Default 3 months
    return endDate;
  });

  // Calculate total percentage whenever milestones change
  useEffect(() => {
    const total = milestones.reduce(
      (sum, milestone) => sum + milestone.percentage,
      0
    );
    setTotalPercentage(total);
  }, [milestones]);

  // Redirect if not authenticated or not a paid user
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    } else if (user?.accountType !== "paid") {
      router.push("/upgrade");
    }
  }, [isAuthenticated, router, user]);

  // Load smartject data if ID is provided
  useEffect(() => {
    const fetchSmartject = async () => {
      if (smartjectId) {
        setLoadingSmartject(true);
        try {
          const data = await smartjectService.getSmartjectById(smartjectId);
          if (data) {
            setSmartject(data);
            setFormData((prev) => ({
              ...prev,
              title: `Proposal for: ${data.title}`,
              smartjectId: data.id,
            }));
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
  }, [smartjectId, toast]);

  // Update project end date when timeline changes
  useEffect(() => {
    if (formData.timeline) {
      const durationMatch = formData.timeline.match(/(\d+(\.\d+)?)/);
      if (durationMatch) {
        const durationMonths = Number.parseFloat(durationMatch[1]);
        const end = new Date(projectStartDate);
        end.setMonth(end.getMonth() + Math.floor(durationMonths));
        // Handle partial months
        const remainingDays = Math.round((durationMonths % 1) * 30);
        end.setDate(end.getDate() + remainingDays);
        setProjectEndDate(end);
      }
    }
  }, [formData.timeline, projectStartDate]);

  if (!isAuthenticated || user?.accountType !== "paid") {
    return null;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      // Save the proposal to Supabase
      const proposalId = await proposalService.createProposal({
        userId: user.id,
        smartjectId: formData.smartjectId,
        type: proposalType || "need",
        title: formData.title,
        description: formData.description,
        budget: formData.budget,
        timeline: formData.timeline,
        scope: formData.scope,
        deliverables: formData.deliverables,
        requirements: formData.requirements,
        expertise: formData.expertise,
        approach: formData.approach,
        team: formData.team,
        additionalInfo: formData.additionalInfo,
        status: "draft",
      });

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
        title: "Draft saved",
        description: "Your proposal draft has been saved successfully.",
      });
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

    // Validate milestones if they're being used
    if (useMilestones && totalPercentage !== 100) {
      toast({
        title: "Invalid milestone percentages",
        description: "The total percentage of all milestones must equal 100%.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Save the proposal to Supabase
      const proposalId = await proposalService.createProposal({
        userId: user.id,
        smartjectId: formData.smartjectId,
        type: proposalType || "need",
        title: formData.title,
        description: formData.description,
        budget: formData.budget,
        timeline: formData.timeline,
        scope: formData.scope,
        deliverables: formData.deliverables,
        requirements: formData.requirements,
        expertise: formData.expertise,
        approach: formData.approach,
        team: formData.team,
        additionalInfo: formData.additionalInfo,
        status: "submitted",
      });

      if (!proposalId) {
        throw new Error("Failed to create proposal");
      }

      if (useMilestones && milestones.length > 0) {
        // 1. Создаём все milestones и получаем их с id
        const createdMilestones = await proposalService.createMilestones(
          proposalId,
          milestones
        );
        if (!createdMilestones) {
          throw new Error("Failed to create milestones");
        }

        // 2. Для каждого созданного milestone создаём deliverables
        for (const created of createdMilestones) {
          // Ищем в исходных milestones объект с таким же именем (name)
          const milestone = milestones.find((m) => m.name === created.name);
          if (milestone?.deliverables?.length) {
            const deliverablesCreated =
              await proposalService.createDeliverables(
                created.id,
                milestone.deliverables
              );
            if (!deliverablesCreated) {
              throw new Error("Failed to create deliverables");
            }
          }
        }
      }

      // 3. Загружаем файлы
      if (files.length > 0) {
        for (const file of files) {
          const filePath = `proposals/${proposalId}/${Date.now()}-${file.name}`;

          // Загружаем файл в storage
          const publicUrl = await proposalService.uploadFile(proposalId, file);
          if (!publicUrl) {
            throw new Error("Failed to upload file");
          }

          // Сохраняем информацию о файле в базе
          const saved = await proposalService.saveFileReference(
            proposalId,
            file,
            filePath
          );
          if (!saved) {
            throw new Error("Failed to save file reference");
          }
        }
      }

      // Показываем уведомление об успешной отправке
      toast({
        title: "Proposal submitted",
        description: "Your proposal has been submitted successfully.",
      });

      toast({
        title: "Proposal submitted",
        description: "Your proposal has been submitted successfully.",
      });

      // Redirect to the proposals page
      router.push("/proposals");
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
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
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
          m.id === editingMilestoneId ? currentMilestone : m
        )
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
        d.id === id ? { ...d, completed: !d.completed } : d
      ),
    });
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
              {!proposalType && (
                <p className="text-sm text-muted-foreground">
                  Please select whether you need this smartject implemented or
                  you can provide implementation services.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="smartjectId">Smartject</Label>
              {loadingSmartject ? (
                <div className="p-4 border rounded-md flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>Loading smartject...</span>
                </div>
              ) : smartject ? (
                <div className="p-4 border rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{smartject.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {smartject.mission?.substring(0, 100) || ""}...
                      </p>
                    </div>
                    <Badge>{smartjectId}</Badge>
                  </div>
                </div>
              ) : (
                <Input
                  id="smartjectId"
                  name="smartjectId"
                  placeholder="Enter Smartject ID"
                  value={formData.smartjectId}
                  onChange={handleInputChange}
                />
              )}
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
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="scope">Project Scope</Label>
              <Textarea
                id="scope"
                name="scope"
                placeholder="Define the scope of the project"
                rows={4}
                value={formData.scope}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeline">Timeline</Label>
              <Input
                id="timeline"
                name="timeline"
                placeholder="e.g., 3 months, 12 weeks"
                value={formData.timeline}
                onChange={handleInputChange}
              />
              <p className="text-sm text-muted-foreground">
                Estimated time to complete the project
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                name="budget"
                placeholder="e.g., $5,000, $10,000-$15,000"
                value={formData.budget}
                onChange={handleInputChange}
              />
              <p className="text-sm text-muted-foreground">
                Estimated budget for the project
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliverables">Deliverables</Label>
              <Textarea
                id="deliverables"
                name="deliverables"
                placeholder="List the specific deliverables expected from this project"
                rows={4}
                value={formData.deliverables}
                onChange={handleInputChange}
              />
            </div>
          </div>
        );

      case 3:
        return proposalType === "need" ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                name="requirements"
                placeholder="Specify your detailed requirements for this project"
                rows={6}
                value={formData.requirements}
                onChange={handleInputChange}
              />
              <p className="text-sm text-muted-foreground">
                Include any specific technical requirements, constraints, or
                preferences
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Textarea
                id="additionalInfo"
                name="additionalInfo"
                placeholder="Any other information that might be helpful for potential providers"
                rows={4}
                value={formData.additionalInfo}
                onChange={handleInputChange}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="expertise">Expertise & Experience</Label>
              <Textarea
                id="expertise"
                name="expertise"
                placeholder="Describe your relevant expertise and experience for this project"
                rows={4}
                value={formData.expertise}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="approach">Implementation Approach</Label>
              <Textarea
                id="approach"
                name="approach"
                placeholder="Describe your approach to implementing this smartject"
                rows={4}
                value={formData.approach}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team">Team & Resources</Label>
              <Textarea
                id="team"
                name="team"
                placeholder="Describe the team and resources you'll allocate to this project"
                rows={3}
                value={formData.team}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Textarea
                id="additionalInfo"
                name="additionalInfo"
                placeholder="Any other information that might strengthen your proposal"
                rows={3}
                value={formData.additionalInfo}
                onChange={handleInputChange}
              />
            </div>
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
                                      )
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
                    <p>{formData.budget || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium flex items-center gap-1">
                      <FileText className="h-4 w-4" /> Files
                    </p>
                    <p>{files.length} attached</p>
                  </div>
                </div>
                {useMilestones && milestones.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <ListChecks className="h-4 w-4" /> Milestones
                      </p>
                      <p>
                        {milestones.length} defined ({totalPercentage}% of
                        budget allocated)
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <ProposalDocumentPreview
                proposalId="draft"
                title={formData.title}
                smartjectTitle={smartject?.title || formData.smartjectId}
                type={proposalType || "need"}
                description={formData.description}
                scope={formData.scope}
                timeline={formData.timeline}
                budget={formData.budget}
                deliverables={formData.deliverables}
                requirements={formData.requirements}
                expertise={formData.expertise}
                approach={formData.approach}
                team={formData.team}
                additionalInfo={formData.additionalInfo}
                userName={user?.name || "User Name"}
                userEmail={user?.email || "user@example.com"}
                createdAt={new Date().toISOString()}
                versions={draftVersions}
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
            <h1 className="text-2xl font-bold">Create Proposal</h1>
            <p className="text-muted-foreground">
              Create a detailed proposal for a smartject
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
                ? "Provide basic information about your proposal"
                : currentStep === 2
                ? "Define the scope, timeline, and budget for the project"
                : currentStep === 3
                ? proposalType === "need"
                  ? "Specify your detailed requirements for this smartject"
                  : "Describe your expertise and approach to implementing this smartject"
                : currentStep === 4
                ? "Define payment milestones for the project"
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
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Draft"
                )}
              </Button>
              {currentStep < 5 ? (
                <Button
                  onClick={nextStep}
                  disabled={currentStep === 1 && !proposalType}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Proposal
                    </>
                  )}
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
                      Number.parseInt(e.target.value) || 0
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
