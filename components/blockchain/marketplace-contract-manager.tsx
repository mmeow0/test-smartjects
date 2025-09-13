"use client";

import { useState, useEffect } from "react";
import {
  marketplaceService,
  ProposalType,
  ContractStatus,
} from "@/lib/services/marketplace.service";
import { useWallet } from "@/contexts/wallet-context";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Shield,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Copy,
  FileText,
  Send,
  Users,
} from "lucide-react";
import { toEther } from "thirdweb/utils";
import {
  getTransactionUrl,
  getAddressUrl,
  hardhatChain,
} from "@/lib/config/blockchain.config";
import {
  getFundingAmount,
  convertUSDToETH,
  USD_TO_ETH_RATE,
} from "@/lib/config/blockchain-features.config";

interface MarketplaceContractManagerProps {
  contractId: string;
  smartjectId: string;
  neederAddress?: string;
  providerAddress?: string;
  budget?: string;
  status?: string;
  blockchainProposalId?: number;
  blockchainContractId?: number;
  isNeeder?: boolean;
  isProvider?: boolean;
  onStatusChange?: (status: string) => void;
}

export function MarketplaceContractManager({
  contractId,
  smartjectId,
  neederAddress,
  providerAddress,
  budget = "0",
  status = "pending",
  blockchainProposalId,
  blockchainContractId,
  isNeeder = false,
  isProvider = false,
  onStatusChange,
}: MarketplaceContractManagerProps) {
  const { address, isConnected } = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [marketplaceContract, setMarketplaceContract] = useState<any>(null);
  const [proposal, setProposal] = useState<any>(null);
  const [applicants, setApplicants] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Load contract data
  useEffect(() => {
    if (blockchainContractId) {
      loadMarketplaceContract();
    } else if (blockchainProposalId) {
      loadProposal();
    }
  }, [blockchainContractId, blockchainProposalId]);

  const loadMarketplaceContract = async () => {
    if (!blockchainContractId) return;

    try {
      const contract =
        await marketplaceService.getContract(blockchainContractId);
      setMarketplaceContract(contract);

      // Update status
      if (contract) {
        const statusString = marketplaceService.getStatusString(
          contract.status,
        );
        onStatusChange?.(statusString);
      }
    } catch (error) {
      console.error("Error loading marketplace contract:", error);
    }
  };

  const loadProposal = async () => {
    if (!blockchainProposalId) return;

    try {
      const proposalData =
        await marketplaceService.getProposal(blockchainProposalId);
      setProposal(proposalData);

      // Load applicants if it's a NEED proposal
      if (proposalData && proposalData.proposalType === ProposalType.NEED) {
        const applicantsList =
          await marketplaceService.getProposalApplicants(blockchainProposalId);
        setApplicants(applicantsList);
      }
    } catch (error) {
      console.error("Error loading proposal:", error);
    }
  };

  // Create initial proposal
  const handleCreateProposal = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a proposal",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const txHash = await marketplaceService.createProposal(
        smartjectId,
        isNeeder ? ProposalType.NEED : ProposalType.PROVIDE,
        budget,
        `Contract for ${smartjectId}`,
        "See contract details for requirements",
      );

      if (txHash) {
        toast({
          title: "Proposal created",
          description: "Your proposal has been created on the blockchain",
        });

        // Reload data
        await loadProposal();
      }
    } catch (error: any) {
      toast({
        title: "Error creating proposal",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Accept proposal (create contract)
  const handleAcceptProposal = async (applicantAddress?: string) => {
    if (!blockchainProposalId) return;

    setLoading(true);
    try {
      const counterparty = applicantAddress || providerAddress || "";
      const paymentAmount =
        proposal?.proposalType === ProposalType.PROVIDE ? budget : undefined;

      const txHash = await marketplaceService.acceptProposal(
        blockchainProposalId,
        counterparty,
        paymentAmount,
      );

      if (txHash) {
        toast({
          title: "Contract created",
          description: "Smart contract has been created successfully",
        });

        // Reload data
        await loadMarketplaceContract();
      }
    } catch (error: any) {
      toast({
        title: "Error accepting proposal",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fund contract
  const handleFundContract = async () => {
    if (!blockchainContractId || !budget) return;

    setLoading(true);
    try {
      // Convert USD budget to ETH for funding
      const fundingAmount = await getFundingAmount(budget);
      const ethEquivalent = convertUSDToETH(budget);

      console.log(`💵 Contract value: $${budget} USD`);
      console.log(
        `💱 Converting to ETH: ${ethEquivalent} ETH (at $${USD_TO_ETH_RATE}/ETH)`,
      );
      console.log(`⚡ Funding with: ${fundingAmount} ETH`);

      const success = await marketplaceService.fundContract(
        blockchainContractId.toString(),
        fundingAmount,
      );

      if (success) {
        toast({
          title: "Contract funded",
          description: `Successfully funded contract with ${fundingAmount} ETH for a $${budget} USD contract (at $${USD_TO_ETH_RATE}/ETH)`,
        });

        await loadMarketplaceContract();
      }
    } catch (error: any) {
      toast({
        title: "Error funding contract",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Complete contract
  const handleCompleteContract = async () => {
    if (!blockchainContractId) return;

    setLoading(true);
    try {
      const success = await marketplaceService.completeContract(
        blockchainContractId,
        "Work completed as per requirements",
      );

      if (success) {
        toast({
          title: "Contract completed",
          description: "Contract has been marked as completed",
        });

        await loadMarketplaceContract();
      }
    } catch (error: any) {
      toast({
        title: "Error completing contract",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Cancel contract
  const handleCancelContract = async () => {
    if (!blockchainContractId) return;

    setLoading(true);
    try {
      const success =
        await marketplaceService.cancelContract(blockchainContractId);

      if (success) {
        toast({
          title: "Contract cancelled",
          description: "Contract has been cancelled",
        });

        await loadMarketplaceContract();
      }
    } catch (error: any) {
      toast({
        title: "Error cancelling contract",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Dispute contract
  const handleDisputeContract = async () => {
    if (!blockchainContractId) return;

    setLoading(true);
    try {
      const success =
        await marketplaceService.disputeContract(blockchainContractId);

      if (success) {
        toast({
          title: "Dispute initiated",
          description: "Contract dispute has been initiated",
        });

        await loadMarketplaceContract();
      }
    } catch (error: any) {
      toast({
        title: "Error disputing contract",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    });
  };

  const getStatusBadge = (contractStatus: ContractStatus) => {
    switch (contractStatus) {
      case ContractStatus.PENDING:
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case ContractStatus.ACTIVE:
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case ContractStatus.COMPLETED:
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case ContractStatus.CANCELLED:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      case ContractStatus.DISPUTED:
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Disputed
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // If no blockchain integration yet
  if (!blockchainProposalId && !blockchainContractId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Blockchain Integration
          </CardTitle>
          <CardDescription>
            Secure this contract on the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Wallet Required</AlertTitle>
              <AlertDescription>
                Please connect your wallet to enable blockchain features
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Ready to Deploy</AlertTitle>
                <AlertDescription>
                  Create a blockchain proposal to secure this contract
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleCreateProposal}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Create Blockchain Proposal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Marketplace Contract
          </div>
          {marketplaceContract && getStatusBadge(marketplaceContract.status)}
        </CardTitle>
        <CardDescription>
          {marketplaceContract
            ? `Contract ID: ${blockchainContractId}`
            : `Proposal ID: ${blockchainProposalId}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {marketplaceContract ? (
              // Contract overview
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Needer</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs">
                        {marketplaceContract.neederId.slice(0, 6)}...
                        {marketplaceContract.neederId.slice(-4)}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          copyAddress(marketplaceContract.neederId)
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Provider</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs">
                        {marketplaceContract.providerId.slice(0, 6)}...
                        {marketplaceContract.providerId.slice(-4)}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          copyAddress(marketplaceContract.providerId)
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="font-medium">
                      {toEther(marketplaceContract.budget)} ETH
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Escrow</p>
                    <p className="font-medium">
                      {toEther(marketplaceContract.escrowAmount)} ETH
                    </p>
                  </div>
                </div>

                {marketplaceContract.fundsReleased && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">
                      Funds Released
                    </AlertTitle>
                    <AlertDescription className="text-green-700">
                      The escrow funds have been released to the provider
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : proposal ? (
              // Proposal overview
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Proposal Type</p>
                  <Badge variant="outline">
                    {marketplaceService
                      .getProposalTypeString(proposal.proposalType)
                      .toUpperCase()}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Creator</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs">
                      {proposal.creator.slice(0, 6)}...
                      {proposal.creator.slice(-4)}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyAddress(proposal.creator)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-medium">{toEther(proposal.budget)} ETH</p>
                </div>

                {applicants.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Applicants ({applicants.length})
                    </p>
                    <div className="space-y-2">
                      {applicants.map((applicant, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <code className="text-xs">
                            {applicant.slice(0, 6)}...{applicant.slice(-4)}
                          </code>
                          {isNeeder && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAcceptProposal(applicant)}
                            >
                              Accept
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            {marketplaceContract ? (
              // Contract actions
              <div className="space-y-3">
                {/* Fund Contract (Needer only) */}
                {isNeeder &&
                  marketplaceContract.status === ContractStatus.ACTIVE &&
                  marketplaceContract.escrowAmount === BigInt(0) && (
                    <Button
                      onClick={handleFundContract}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <DollarSign className="mr-2 h-4 w-4" />
                      )}
                      Fund Contract ({convertUSDToETH(budget)} ETH)
                    </Button>
                  )}

                {/* Complete Contract */}
                {marketplaceContract.status === ContractStatus.ACTIVE && (
                  <Button
                    onClick={handleCompleteContract}
                    disabled={loading}
                    variant="default"
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Mark as Complete
                  </Button>
                )}

                {/* Cancel Contract */}
                {marketplaceContract.status === ContractStatus.ACTIVE && (
                  <Button
                    onClick={handleCancelContract}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Cancel Contract
                  </Button>
                )}

                {/* Dispute Contract */}
                {marketplaceContract.status === ContractStatus.ACTIVE &&
                  marketplaceContract.escrowAmount > BigInt(0) && (
                    <Button
                      onClick={handleDisputeContract}
                      disabled={loading}
                      variant="destructive"
                      className="w-full"
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <AlertTriangle className="mr-2 h-4 w-4" />
                      )}
                      Initiate Dispute
                    </Button>
                  )}
              </div>
            ) : proposal && proposal.isActive ? (
              // Proposal actions
              <div className="space-y-3">
                {isNeeder && proposal.proposalType === ProposalType.PROVIDE && (
                  <Button
                    onClick={() => handleAcceptProposal()}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Accept Proposal ({budget} ETH)
                  </Button>
                )}

                {proposal.proposalType === ProposalType.NEED &&
                  applicants.length === 0 && (
                    <Alert>
                      <Users className="h-4 w-4" />
                      <AlertTitle>Waiting for Applicants</AlertTitle>
                      <AlertDescription>
                        No providers have applied to this proposal yet
                      </AlertDescription>
                    </Alert>
                  )}
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Actions Available</AlertTitle>
                <AlertDescription>
                  This contract/proposal is not active
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  Blockchain Network
                </p>
                <p className="font-medium">{hardhatChain.name}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Contract Address
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                    {process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS ||
                      "0x5FbDB2315678afecb367f032d93F642f64180aa3"}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      copyAddress(
                        process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS ||
                          "0x5FbDB2315678afecb367f032d93F642f64180aa3",
                      )
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {marketplaceContract && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Created At</p>
                    <p className="font-medium">
                      Block #{marketplaceContract.createdAt.toString()}
                    </p>
                  </div>

                  {marketplaceContract.completedAt > BigInt(0) && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Completed At
                      </p>
                      <p className="font-medium">
                        Block #{marketplaceContract.completedAt.toString()}
                      </p>
                    </div>
                  )}

                  {marketplaceContract.deliverables && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Deliverables
                      </p>
                      <p className="text-sm">
                        {marketplaceContract.deliverables}
                      </p>
                    </div>
                  )}
                </>
              )}

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    window.open(
                      getAddressUrl(
                        process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS ||
                          "0x5FbDB2315678afecb367f032d93F642f64180aa3",
                      ),
                      "_blank",
                    )
                  }
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on Explorer
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
