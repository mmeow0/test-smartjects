"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/auth-provider";
import { useRequirePaidAccount } from "@/hooks/use-auth-guard";
import { proposalService } from "@/lib/services";
import { ProposalType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function ProposalsPage() {
  const router = useRouter();
  const { isLoading: authLoading, user, canAccess } = useRequirePaidAccount();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [proposals, setProposals] = useState<ProposalType[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [proposalToDelete, setProposalToDelete] = useState<ProposalType | null>(
    null
  );
  const { toast } = useToast();
  // Load proposals when authenticated
  useEffect(() => {
    const fetchProposals = async () => {
      if (authLoading || !canAccess || !user?.id) {
        return;
      }

      try {
        const allProposals = await proposalService.getProposalsByUserId(
          user.id
        );

        setProposals(allProposals);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load proposals",
          variant: "destructive",
        });
        console.error("Error fetching proposals:", error);
      }
    };

    fetchProposals();
  }, [authLoading, canAccess, user, toast]);

  const filterProposals = useCallback(
    (proposals: ProposalType[]) => {
      return proposals
        .filter((proposal) => {
          // Filter by search term
          if (
            searchTerm &&
            !proposal.title.toLowerCase().includes(searchTerm.toLowerCase())
          ) {
            return false;
          }

          // Filter by status
          if (statusFilter !== "all" && proposal.status !== statusFilter) {
            return false;
          }

          return true;
        })
        .sort((a, b) => {
          // Sort by date (newest first)
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
    },
    [searchTerm, statusFilter]
  );

  const handleDeleteClick = (proposal: ProposalType, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to proposal details
    setProposalToDelete(proposal);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!proposalToDelete || !user?.id) return;

    try {
      const success = await proposalService.deleteProposal(
        proposalToDelete.id,
        user.id
      );

      if (success) {
        setProposals((prevProposals) =>
          prevProposals.filter((p) => p.id !== proposalToDelete.id)
        );
        toast({
          title: "Success",
          description: "Proposal deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete proposal",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting proposal:", error);
      toast({
        title: "Error",
        description: "Failed to delete proposal",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setProposalToDelete(null);
    }
  };

  if (authLoading || !canAccess) {
    return null;
  }

  // Helper function to display field value or "not specified"
  const displayField = (value: string | undefined | null) => {
    if (!value || value.trim() === "") {
      return (
        <span className="text-muted-foreground italic">not specified</span>
      );
    }
    return value;
  };

  const needProposals = proposals.filter(
    (proposal) => proposal.type === "need"
  );
  const provideProposals = proposals.filter(
    (proposal) => proposal.type === "provide"
  );
  const filteredNeedProposals = filterProposals(needProposals);
  const filteredProvideProposals = filterProposals(provideProposals);

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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Proposals</h1>
          <p className="text-muted-foreground">
            Manage your smartject proposals
          </p>
        </div>
        <Button
          className="mt-4 md:mt-0"
          onClick={() => router.push("/proposals/create")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Proposal
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search proposals..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="need">
        <TabsList className="mb-6">
          <TabsTrigger value="need">
            I Need ({filteredNeedProposals.length})
          </TabsTrigger>
          <TabsTrigger value="provide">
            I Provide ({filteredProvideProposals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="need" className="space-y-6">
          {filteredNeedProposals.length > 0 ? (
            filteredNeedProposals.map((proposal) => (
              <Card
                key={proposal.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => router.push(`/proposals/${proposal.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{proposal.title}</CardTitle>
                      <CardDescription>
                        Last updated on{" "}
                        {new Date(proposal.updatedAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(proposal.status)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => handleDeleteClick(proposal, e)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-medium">
                        {proposal.budget
                          ? `$${proposal.budget.toLocaleString()}`
                          : displayField(proposal.budget)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Timeline</p>
                      <p className="font-medium">
                        {displayField(proposal.timeline)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Smartject ID
                      </p>
                      <p className="font-medium">{proposal.smartjectId}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "No proposals match your search criteria."
                    : "You haven't created any 'I Need' proposals yet."}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button onClick={() => router.push("/proposals/create")}>
                    Create Your First Proposal
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="provide" className="space-y-6">
          {filteredProvideProposals.length > 0 ? (
            filteredProvideProposals.map((proposal) => (
              <Card
                key={proposal.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => router.push(`/proposals/${proposal.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{proposal.title}</CardTitle>
                      <CardDescription>
                        Last updated on{" "}
                        {new Date(proposal.updatedAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(proposal.status)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => handleDeleteClick(proposal, e)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-medium">
                        {proposal.budget
                          ? `$${proposal.budget.toLocaleString()}`
                          : displayField(proposal.budget)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Timeline</p>
                      <p className="font-medium">
                        {displayField(proposal.timeline)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Smartject ID
                      </p>
                      <p className="font-medium">{proposal.smartjectId}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "No proposals match your search criteria."
                    : "You haven't created any 'I Provide' proposals yet."}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button onClick={() => router.push("/proposals/create")}>
                    Create Your First Proposal
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Proposal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{proposalToDelete?.title}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
