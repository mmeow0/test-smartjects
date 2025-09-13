"use client";

import { useState, useEffect } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  ExternalLink,
  Copy,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Loader2,
  Wallet,
} from "lucide-react";
import { blockchainService } from "@/lib/services/blockchain.service";
import { contractService } from "@/lib/services/contract.service";
import { marketplaceService } from "@/lib/services/marketplace.service";
import {
  getAddressUrl,
  getTransactionUrl,
  activeChain,
} from "@/lib/config/blockchain.config";
import {
  isZeroBudgetContract,
  convertUSDToETH,
  USD_TO_ETH_RATE,
} from "@/lib/config/blockchain-features.config";
import { getSupabaseBrowserClient } from "@/lib/supabase";

interface BlockchainStatusProps {
  contractId: string;
  blockchainAddress?: string | null;
  blockchainStatus?: string;
  escrowFunded?: boolean;
  escrowAmount?: string;
  isClient?: boolean;
  isProvider?: boolean;
  isFullySigned?: boolean;
  onFunded?: () => void;
  onDeploymentRetried?: () => void;
}

export function BlockchainStatus({
  contractId,
  blockchainAddress,
  blockchainStatus = "pending",
  escrowFunded = false,
  escrowAmount,
  isClient = false,
  isProvider = false,
  isFullySigned = false,
  onFunded,
  onDeploymentRetried,
}: BlockchainStatusProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isRetryingDeployment, setIsRetryingDeployment] = useState(false);
  const [escrowDetails, setEscrowDetails] = useState<any>(null);
  const [walletConnected, setWalletConnected] = useState(false);

  console.log("escrowDetails");
  console.log(escrowDetails);
  console.log(isFullySigned);

  useEffect(() => {
    console.log("🔄 BlockchainStatus component mounted/updated");
    console.log("📍 Blockchain address:", blockchainAddress);
    console.log("📊 Blockchain status:", blockchainStatus);
    console.log("✍️ Is fully signed:", isFullySigned);

    checkWalletConnection();
    if (blockchainAddress) {
      loadEscrowDetails();
    }
  }, [blockchainAddress, walletConnected]);

  const checkWalletConnection = async () => {
    const connected = await blockchainService.isWalletConnected();
    setWalletConnected(connected);
  };

  
  const loadEscrowDetails = async () => {
    if (!blockchainAddress) return;

    try {
      const details = await blockchainService.getEscrowDetails(contractId);
      if (details) {
        setEscrowDetails(details);

        // Check if escrow exists in agreement (balance > 0 means funded)
        // Use this as fallback if database hasn't been updated yet
        if (details.balance > 0 && !escrowFunded) {
          // Note: Agreement has escrow included from creation
          console.log(
            "Agreement has escrow on blockchain but not marked in database",
          );
        }
      } else {
        // Contract might not be deployed on blockchain yet
        console.log(
          "No escrow details available - contract may not be deployed on blockchain",
        );
        setEscrowDetails(null);
      }
    } catch (error) {
      console.error("Error loading escrow details:", error);
      setEscrowDetails(null);
    }
  };

  const handleFundContract = async () => {
    console.log("💰 Attempting to fund contract");
    console.log("📊 Contract budget (USD):", escrowAmount);

    if (!walletConnected) {
      console.error("❌ Wallet not connected");
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    // In new contract, funding is done during agreement creation
    toast({
      title: "Already Funded",
      description:
        "This agreement was funded during creation. No additional funding needed.",
      variant: "default",
    });
    return;
  };

  const handleCompleteContract = async () => {
    console.log("✅ Attempting to complete contract and release funds");

    if (!walletConnected) {
      console.error("❌ Wallet not connected");
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("📋 Using contract ID directly as external ID:", contractId);

      // Complete agreement (marks as completed, allows provider to withdraw)
      const success = await marketplaceService.releaseContractFunds(contractId);

      if (success) {
        console.log("✅ Agreement completed - provider can withdraw funds");
        toast({
          title: "Agreement completed",
          description:
            "Agreement has been completed. The provider can now withdraw the escrow funds.",
        });

        // Update contract status in database
        const supabase = getSupabaseBrowserClient();
        await supabase
          .from("contracts")
          .update({
            blockchain_status: "completed",
            status: "completed",
            escrow_released: true,
            escrow_released_at: new Date().toISOString(),
            blockchain_completed_at: new Date().toISOString(),
          })
          .eq("id", contractId);

        // Send completion message
        await contractService.sendContractMessage(
          contractId,
          "✅ Agreement has been completed. Provider can now withdraw the escrow funds.",
        );

        // Trigger callback if provided
        onFunded?.(); // Reuse the same callback to refresh the page

        // Reload escrow details
        await loadEscrowDetails();
      } else {
        throw new Error("Failed to complete agreement");
      }
    } catch (error: any) {
      console.error("Error completing agreement:", error);
      toast({
        title: "Completion failed",
        description: error.message || "Failed to complete the agreement",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryDeployment = async () => {
    // Check if required environment variables are set
    const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
    const marketplaceAddress = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS;

    console.log("🔍 Environment check before deployment:");
    console.log("Client ID available:", !!clientId);
    console.log("Marketplace address available:", !!marketplaceAddress);

    if (!clientId || !marketplaceAddress) {
      toast({
        title: "Configuration Error",
        description:
          "Blockchain configuration is incomplete. Please contact support.",
        variant: "destructive",
      });
      console.error("❌ Missing required environment variables");
      return;
    }

    setIsRetryingDeployment(true);
    try {
      console.log("🚀 Attempting to deploy contract:", contractId);
      const success =
        await contractService.retryBlockchainDeployment(contractId);

      if (success) {
        console.log("✅ Deployment initiated successfully");
        toast({
          title: "Deployment initiated",
          description:
            "Smart contract deployment has been initiated. Please wait for confirmation.",
        });
        onDeploymentRetried?.();
      } else {
        console.error("❌ Deployment returned false");
        throw new Error("Failed to initiate deployment");
      }
    } catch (error: any) {
      console.error("❌ Error retrying deployment:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        cause: error.cause,
      });

      let errorMessage = "Failed to deploy the smart contract";

      // Provide more specific error messages
      if (error.message?.includes("client not initialized")) {
        errorMessage =
          "Blockchain service not initialized. Please refresh the page and try again.";
      } else if (error.message?.includes("wallet")) {
        errorMessage =
          "Wallet connection issue. Please ensure your wallet is connected.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Deployment failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRetryingDeployment(false);
    }
  };

  const copyAddress = () => {
    if (blockchainAddress) {
      navigator.clipboard.writeText(blockchainAddress);
      toast({
        title: "Copied",
        description: "Contract address copied to clipboard",
      });
    }
  };

  const getStatusBadge = () => {
    switch (blockchainStatus) {
      case "deployed":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            Deployed
          </Badge>
        );
      case "funded":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <DollarSign className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "refunded":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Refunded
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getEscrowStateName = (state: number) => {
    const states = ["Created", "Accepted", "Completed", "Cancelled"];
    return states[state] || "Unknown";
  };

  // If no blockchain address, show pending state or retry option
  if (!blockchainAddress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Marketplace Contract
          </CardTitle>
          <CardDescription>
            {isFullySigned
              ? "Marketplace contract deployment required"
              : "Marketplace contract will be deployed after both parties sign"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFullySigned && !escrowDetails && !isProvider ? (
            <div className="space-y-4">
              <Alert className="border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-800">
                  Deployment Required
                </AlertTitle>
                <AlertDescription className="text-orange-700">
                  The contract is fully signed and needs to be deployed on the blockchain.
                </AlertDescription>
              </Alert>
              <Button
                className="w-full"
                onClick={handleRetryDeployment}
                disabled={isRetryingDeployment}
              >
                {isRetryingDeployment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deploying Contract...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Deploy Marketplace Contract
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Awaiting Deployment</AlertTitle>
              <AlertDescription>
                The smartject contract will be deployed by the needer.
              </AlertDescription>
            </Alert>
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
          {getStatusBadge()}
        </CardTitle>
        <CardDescription>
          Contract secured on {activeChain.name} marketplace
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contract Address */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Marketplace Contract Address
          </p>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
              {blockchainAddress}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={copyAddress}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                window.open(getAddressUrl(blockchainAddress), "_blank")
              }
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Escrow Details */}
        {escrowDetails && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Escrow Status</p>
              <p className="font-medium">
                {getEscrowStateName(escrowDetails.state)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Escrow Balance</p>
              <p className="font-medium">
                {escrowDetails.balance > 0
                  ? `${(Number(escrowDetails.balance) / 1e18).toFixed(4)} ${activeChain.nativeCurrency?.symbol}`
                  : "0"}
              </p>
            </div>
          </div>
        )}

        {/* Agreement is already funded on creation - show status */}
        {isClient &&
          !escrowFunded &&
          blockchainStatus === "deployed" &&
          (() => {
            const isZeroBudgetContractLocal =
              isZeroBudgetContract(escrowAmount);

            if (isZeroBudgetContractLocal) {
              return (
                <div className="pt-2">
                  <Alert className="border-blue-200 bg-blue-50">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800">
                      Zero Budget Agreement
                    </AlertTitle>
                    <AlertDescription className="text-blue-700">
                      This agreement has no budget and doesn't require funding.
                      It's secured on the marketplace for record-keeping
                      purposes.
                    </AlertDescription>
                  </Alert>
                </div>
              );
            }

            return (
              <div className="pt-2">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">
                    Agreement Active
                  </AlertTitle>
                  <AlertDescription className="text-green-700">
                    The agreement has been created with escrow of{" "}
                    {convertUSDToETH(escrowAmount || "0")} ETH (${escrowAmount}{" "}
                    USD at ${USD_TO_ETH_RATE}/ETH). Work can begin immediately.
                  </AlertDescription>
                </Alert>
              </div>
            );
          })()}

        {/* Provider waiting message */}
        {isProvider &&
          !escrowFunded &&
          blockchainStatus === "deployed" &&
          (() => {
            const isZeroBudgetContractLocal =
              isZeroBudgetContract(escrowAmount);

            if (isZeroBudgetContractLocal) {
              return (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">
                    Zero Budget Contract Active
                  </AlertTitle>
                  <AlertDescription className="text-green-700">
                    This contract is secured on the marketplace and ready for
                    work to begin. No funding is required as this is a
                    zero-budget agreement.
                  </AlertDescription>
                </Alert>
              );
            }

            return (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertTitle>Awaiting Funding</AlertTitle>
                <AlertDescription>
                  The client needs to fund the marketplace contract before work
                  can begin. Contract value: ${escrowAmount} USD (
                  {convertUSDToETH(escrowAmount || "0")} ETH at $
                  {USD_TO_ETH_RATE}/ETH).
                </AlertDescription>
              </Alert>
            );
          })()}

        {/* Funded confirmation and complete button for needer */}
        {escrowFunded && blockchainStatus === "funded" && (
          <>
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">
                Agreement Active
              </AlertTitle>
              <AlertDescription className="text-green-700">
                The marketplace agreement is active with escrow. Funds will be
                available for withdrawal by the provider after successful
                completion.
              </AlertDescription>
            </Alert>

            {/* Complete button for needer/client */}
            {isClient && (
              <div className="pt-2">
                <Alert className="mb-4 border-blue-200 bg-blue-50">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">
                    Ready to Complete
                  </AlertTitle>
                  <AlertDescription className="text-blue-700">
                    If the work has been completed satisfactorily, you can
                    complete the agreement to allow the provider to withdraw
                    funds.
                  </AlertDescription>
                </Alert>
                <Button
                  className="w-full"
                  onClick={handleCompleteContract}
                  disabled={isLoading || !walletConnected}
                  variant="default"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete Agreement
                    </>
                  )}
                </Button>
                {!walletConnected && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Connect your wallet first to complete the contract
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* Already funded but not completed - provider view */}
        {escrowFunded && blockchainStatus === "funded" && isProvider && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Agreement Active</AlertTitle>
            <AlertDescription className="text-green-700">
              The marketplace agreement is active. Complete the work and wait
              for the client to complete the agreement, then you can withdraw
              your funds.
            </AlertDescription>
          </Alert>
        )}

        {/* Completed state */}
        {blockchainStatus === "completed" && (
          <Alert className="border-purple-200 bg-purple-50">
            <CheckCircle className="h-4 w-4 text-purple-600" />
            <AlertTitle className="text-purple-800">
              Agreement Completed
            </AlertTitle>
            <AlertDescription className="text-purple-700">
              This agreement has been successfully completed. The provider can
              withdraw the escrow funds.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
