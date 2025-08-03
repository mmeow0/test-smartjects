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
import {
  getAddressUrl,
  getTransactionUrl,
  activeChain,
} from "@/lib/config/blockchain.config";
import {
  BLOCKCHAIN_RECORDS_ONLY,
  isZeroBudgetContract,
  getUIMessage,
} from "@/lib/config/blockchain-features.config";

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
      setEscrowDetails(details);

      // Check if escrow is funded on blockchain (state 1 = FUNDED)
      // Use this as fallback if database hasn't been updated yet
      if (details && details.state === 1 && !escrowFunded) {
        setEffectiveEscrowFunded(true);
      }
    } catch (error) {
      console.error("Error loading escrow details:", error);
    }
  };

  const handleFundContract = async () => {
    console.log("💰 Attempting to fund contract");

    if (!walletConnected) {
      console.error("❌ Wallet not connected");
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    // Check if this is blockchain records only mode
    if (BLOCKCHAIN_RECORDS_ONLY) {
      toast({
        title: "Blockchain Record Only",
        description:
          "This contract is secured on blockchain for record-keeping purposes only. No funding required.",
        variant: "default",
      });
      return;
    }

    // Check if this is a zero-budget contract (no amount or minimal amount)
    const isZeroBudgetContractLocal = isZeroBudgetContract(escrowAmount);
    if (isZeroBudgetContractLocal) {
      toast({
        title: "Zero Budget Contract",
        description: "This contract has no budget and doesn't require funding.",
        variant: "default",
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await blockchainService.fundEscrowContract(
        contractId,
        escrowAmount,
      );

      if (success) {
        console.log("✅ Contract funded successfully");
        toast({
          title: "Contract funded",
          description: "Escrow contract has been funded successfully",
        });

        // Update contract status in database
        await contractService.updateContractFundingStatus(contractId);

        onFunded?.();
        // Reload escrow details
        await loadEscrowDetails();
      } else {
        throw new Error("Failed to fund contract");
      }
    } catch (error: any) {
      console.error("Error funding contract:", error);
      toast({
        title: "Funding failed",
        description: error.message || "Failed to fund the escrow contract",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryDeployment = async () => {
    // Check if required environment variables are set
    const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
    const factoryAddress = process.env.NEXT_PUBLIC_ESCROW_FACTORY_ADDRESS;

    console.log("🔍 Environment check before deployment:");
    console.log("Client ID available:", !!clientId);
    console.log("Factory address available:", !!factoryAddress);

    if (!clientId) {
      toast({
        title: "Configuration Error",
        description:
          "Blockchain client ID is not configured. Please contact support.",
        variant: "destructive",
      });
      console.error("❌ NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not set");
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
            Funded
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
    const states = ["Created", "Funded", "Completed", "Refunded", "Cancelled"];
    return states[state] || "Unknown";
  };

  // If no blockchain address, show pending state or retry option
  if (!blockchainAddress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Blockchain Security
          </CardTitle>
          <CardDescription>
            {isFullySigned
              ? "Smart contract deployment required"
              : "Smart contract will be deployed after both parties sign"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFullySigned && !escrowDetails ? (
            <div className="space-y-4">
              <Alert className="border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-800">
                  Deployment Required
                </AlertTitle>
                <AlertDescription className="text-orange-700">
                  The contract is fully signed but the smart contract deployment
                  failed or is incomplete. Please retry the deployment to secure
                  this contract on the blockchain.
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
                    Deploy Smart Contract
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Awaiting Signatures</AlertTitle>
              <AlertDescription>
                The smart contract will be automatically deployed once both
                parties have signed the agreement.
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
            Blockchain Security
          </div>
          {getStatusBadge()}
        </CardTitle>
        <CardDescription>
          Contract secured on {activeChain.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contract Address */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Smart Contract Address
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

        {/* Fund Contract Button (for client only) */}
        {isClient &&
          !escrowFunded &&
          blockchainStatus === "deployed" &&
          (() => {
            // Check if blockchain records only mode is enabled
            if (BLOCKCHAIN_RECORDS_ONLY) {
              return (
                <div className="pt-2">
                  <Alert className="border-blue-200 bg-blue-50">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800">
                      {getUIMessage("CLIENT_TITLE", escrowAmount)}
                    </AlertTitle>
                    <AlertDescription className="text-blue-700">
                      {getUIMessage("CLIENT_DESCRIPTION", escrowAmount)}
                    </AlertDescription>
                  </Alert>
                </div>
              );
            }

            const isZeroBudgetContractLocal =
              isZeroBudgetContract(escrowAmount);

            if (isZeroBudgetContractLocal) {
              return (
                <div className="pt-2">
                  <Alert className="border-blue-200 bg-blue-50">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800">
                      Zero Budget Contract
                    </AlertTitle>
                    <AlertDescription className="text-blue-700">
                      This contract has no budget and doesn't require funding.
                      It's secured on the blockchain for record-keeping
                      purposes.
                    </AlertDescription>
                  </Alert>
                </div>
              );
            }

            return (
              <div className="pt-2">
                <Alert className="mb-4">
                  <Wallet className="h-4 w-4" />
                  <AlertTitle>Action Required</AlertTitle>
                  <AlertDescription>
                    Please fund the escrow contract to activate it. The amount
                    will be held securely until work is completed.
                  </AlertDescription>
                </Alert>
                <Button
                  className="w-full"
                  onClick={handleFundContract}
                  disabled={isLoading || !walletConnected}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Funding Contract...
                    </>
                  ) : (
                    <>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Fund Contract ({escrowAmount}{" "}
                      {activeChain.nativeCurrency?.symbol})
                    </>
                  )}
                </Button>
                {!walletConnected && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Connect your wallet first to fund the contract
                  </p>
                )}
              </div>
            );
          })()}

        {/* Provider waiting message */}
        {isProvider &&
          !escrowFunded &&
          blockchainStatus === "deployed" &&
          (() => {
            // Check if blockchain records only mode is enabled
            if (BLOCKCHAIN_RECORDS_ONLY) {
              return (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">
                    {getUIMessage("PROVIDER_TITLE", escrowAmount)}
                  </AlertTitle>
                  <AlertDescription className="text-green-700">
                    {getUIMessage("PROVIDER_DESCRIPTION", escrowAmount)}
                  </AlertDescription>
                </Alert>
              );
            }

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
                    This contract is secured on the blockchain and ready for
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
                  The client needs to fund the escrow contract before work can
                  begin.
                </AlertDescription>
              </Alert>
            );
          })()}

        {/* Funded confirmation */}
        {escrowFunded && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Contract Funded</AlertTitle>
            <AlertDescription className="text-green-700">
              The escrow contract is active. Funds will be released upon
              successful completion of work.
            </AlertDescription>
          </Alert>
        )}

        {/* Completed state */}
        {blockchainStatus === "completed" && (
          <Alert className="border-purple-200 bg-purple-50">
            <CheckCircle className="h-4 w-4 text-purple-600" />
            <AlertTitle className="text-purple-800">
              Contract Completed
            </AlertTitle>
            <AlertDescription className="text-purple-700">
              This contract has been successfully completed and funds have been
              released.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
