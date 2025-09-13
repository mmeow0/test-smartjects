import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
  sendTransaction,
  waitForReceipt,
  readContract,
  ThirdwebClient,
  getContractEvents,
} from "thirdweb";
import { client } from "@/app/thirdweb/client";
import {
  getActiveAccount,
  getActiveAddress,
} from "@/lib/utils/thirdweb-wallet";
import { toWei, toEther } from "thirdweb/utils";
import { defineChain } from "thirdweb";

// Hardhat local network configuration
const hardhatChain = defineChain({
  id: 31337,
  name: "Hardhat",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpc: "http://127.0.0.1:8545",
  testnet: true,
});

// Contract configuration
const MARKETPLACE_ADDRESS =
  process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// New SmartjectsMarketplace ABI
const MARKETPLACE_ABI = [
  "event AgreementAccepted(bytes32 indexed,address indexed)",
  "event AgreementCancelled(bytes32 indexed,address indexed)",
  "event AgreementCompleted(bytes32 indexed,address indexed,address indexed)",
  "event AgreementCreated(bytes32 indexed,address indexed,address indexed,uint256)",
  "event EscrowWithdrawn(bytes32 indexed,address indexed,uint256)",
  "fallback() payable",
  "function acceptAgreement(bytes32)",
  "function cancelAgreement(bytes32)",
  "function completeAgreement(bytes32)",
  "function computeExternalId(string) pure returns (bytes32)",
  "function createAgreement(string,address,address,string,string) payable",
  "function exists(bytes32) view returns (bool)",
  "function getAgreement(bytes32) view returns (bytes32,address,address,string,string,uint8,uint256,uint256)",
  "function listAgreementIds() view returns (bytes32[])",
  "function updateTermsAndRequirements(bytes32,string,string)",
  "function withdrawEscrow(bytes32)",
  "receive() payable",
] as const;

// Types
export enum AgreementStatus {
  Created = 0,
  Accepted = 1,
  Completed = 2,
  Cancelled = 3,
}

export interface Agreement {
  externalId: string; // bytes32 as hex string
  needer: string;
  provider: string;
  requirements: string;
  terms: string;
  status: AgreementStatus;
  createdAt: bigint;
  escrowAmount: bigint;
}

// Error handling
class MarketplaceError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "MarketplaceError";
  }
}

// Marketplace service class for new SmartjectsMarketplace contract
class MarketplaceService {
  private client: ThirdwebClient;
  private chain: any;

  constructor() {
    this.client = client;
    // Use hardhat for local development
    this.chain =
      process.env.NODE_ENV === "development" ? hardhatChain : hardhatChain;
  }

  // Get marketplace contract instance
  private getMarketplaceContract() {
    if (!MARKETPLACE_ADDRESS || MARKETPLACE_ADDRESS === "") {
      throw new MarketplaceError(
        `Marketplace contract not deployed. Please set NEXT_PUBLIC_MARKETPLACE_ADDRESS in your environment variables.`,
      );
    }

    return getContract({
      chain: this.chain,
      address: MARKETPLACE_ADDRESS,
      client: this.client,
    });
  }

  // Check if wallet is connected
  private async ensureWalletConnected() {
    const account = getActiveAccount();
    if (!account) {
      throw new MarketplaceError("Please connect your wallet first");
    }
    return account;
  }

  // Convert string ID to bytes32 using contract's computeExternalId
  async computeExternalId(externalIdStr: string): Promise<string> {
    try {
      const contract = this.getMarketplaceContract();

      const result = await readContract({
        contract,
        method: "function computeExternalId(string) pure returns (bytes32)",
        params: [externalIdStr],
      });

      return result as string;
    } catch (error: any) {
      console.error("Error computing external ID:", error);
      // Fallback to local computation if contract call fails
      // This is a simple keccak256 hash of the string
      throw new MarketplaceError("Failed to compute external ID");
    }
  }

  // Create a new agreement
  async createAgreement(
    externalIdStr: string, // Database contract ID
    neederId: string, // Needer wallet address
    providerId: string, // Provider wallet address
    requirements: string,
    terms: string,
    escrowAmount?: string, // Amount in ETH to escrow
  ): Promise<string | null> {
    try {
      console.log("🚀 Creating agreement on SmartjectsMarketplace...");
      console.log("📋 Agreement params:", {
        externalIdStr,
        neederId,
        providerId,
        requirements,
        terms,
        escrowAmount,
      });

      const account = await this.ensureWalletConnected();
      const contract = this.getMarketplaceContract();

      // Convert escrow amount to wei if provided
      const escrowInWei = escrowAmount ? toWei(escrowAmount) : BigInt(0);

      console.log(
        `💰 Escrow amount: ${escrowAmount || "0"} ETH (${escrowInWei.toString()} wei)`,
      );

      // Prepare transaction
      const transaction = prepareContractCall({
        contract,
        method:
          "function createAgreement(string,address,address,string,string) payable",
        params: [
          externalIdStr,
          neederId as `0x${string}`,
          providerId as `0x${string}`,
          requirements,
          terms,
        ],
        value: escrowInWei, // Include ETH for escrow if provided
      });

      // Send transaction
      const result = await sendTransaction({
        transaction,
        account,
      });

      console.log("✅ Transaction sent:", result.transactionHash);

      // Wait for confirmation
      const receipt = await waitForReceipt({
        client: this.client,
        chain: this.chain,
        transactionHash: result.transactionHash,
      });

      console.log("✅ Agreement created successfully");
      console.log("Receipt:", receipt);

      return result.transactionHash;
    } catch (error: any) {
      console.error("❌ Error creating agreement:", error);
      this.handleError(error);
      return null;
    }
  }

  // Accept an agreement (provider only)
  async acceptAgreement(externalIdStr: string): Promise<boolean> {
    try {
      console.log("✅ Accepting agreement:", externalIdStr);

      const account = await this.ensureWalletConnected();
      const contract = this.getMarketplaceContract();

      // Compute bytes32 ID
      const externalId = await this.computeExternalId(externalIdStr);

      const transaction = prepareContractCall({
        contract,
        method: "function acceptAgreement(bytes32)",
        params: [externalId as `0x${string}`],
      });

      const result = await sendTransaction({
        transaction,
        account,
      });

      await waitForReceipt({
        client: this.client,
        chain: this.chain,
        transactionHash: result.transactionHash,
      });

      console.log("✅ Agreement accepted successfully");
      return true;
    } catch (error: any) {
      console.error("❌ Error accepting agreement:", error);
      this.handleError(error);
      return false;
    }
  }

  // Complete an agreement (needer only)
  async completeAgreement(externalIdStr: string): Promise<boolean> {
    try {
      console.log("✔️ Completing agreement:", externalIdStr);

      const account = await this.ensureWalletConnected();
      const contract = this.getMarketplaceContract();

      // Compute bytes32 ID
      const externalId = await this.computeExternalId(externalIdStr);

      const transaction = prepareContractCall({
        contract,
        method: "function completeAgreement(bytes32)",
        params: [externalId as `0x${string}`],
      });

      const result = await sendTransaction({
        transaction,
        account,
      });

      await waitForReceipt({
        client: this.client,
        chain: this.chain,
        transactionHash: result.transactionHash,
      });

      console.log("✅ Agreement completed successfully");
      return true;
    } catch (error: any) {
      console.error("❌ Error completing agreement:", error);
      this.handleError(error);
      return false;
    }
  }

  // Withdraw escrow (provider only, after completion)
  async withdrawEscrow(externalIdStr: string): Promise<boolean> {
    try {
      console.log("💰 Withdrawing escrow for agreement:", externalIdStr);

      const account = await this.ensureWalletConnected();
      const contract = this.getMarketplaceContract();

      // Compute bytes32 ID
      const externalId = await this.computeExternalId(externalIdStr);

      const transaction = prepareContractCall({
        contract,
        method: "function withdrawEscrow(bytes32)",
        params: [externalId as `0x${string}`],
      });

      const result = await sendTransaction({
        transaction,
        account,
      });

      await waitForReceipt({
        client: this.client,
        chain: this.chain,
        transactionHash: result.transactionHash,
      });

      console.log("✅ Escrow withdrawn successfully");
      return true;
    } catch (error: any) {
      console.error("❌ Error withdrawing escrow:", error);
      this.handleError(error);
      return false;
    }
  }

  // Cancel an agreement
  async cancelAgreement(externalIdStr: string): Promise<boolean> {
    try {
      console.log("❌ Cancelling agreement:", externalIdStr);

      const account = await this.ensureWalletConnected();
      const contract = this.getMarketplaceContract();

      // Compute bytes32 ID
      const externalId = await this.computeExternalId(externalIdStr);

      const transaction = prepareContractCall({
        contract,
        method: "function cancelAgreement(bytes32)",
        params: [externalId as `0x${string}`],
      });

      const result = await sendTransaction({
        transaction,
        account,
      });

      await waitForReceipt({
        client: this.client,
        chain: this.chain,
        transactionHash: result.transactionHash,
      });

      console.log("✅ Agreement cancelled successfully");
      return true;
    } catch (error: any) {
      console.error("❌ Error cancelling agreement:", error);
      this.handleError(error);
      return false;
    }
  }

  // Update terms and requirements (needer only, before acceptance)
  async updateTermsAndRequirements(
    externalIdStr: string,
    requirements: string,
    terms: string,
  ): Promise<boolean> {
    try {
      console.log("📝 Updating terms and requirements for:", externalIdStr);

      const account = await this.ensureWalletConnected();
      const contract = this.getMarketplaceContract();

      // Compute bytes32 ID
      const externalId = await this.computeExternalId(externalIdStr);

      const transaction = prepareContractCall({
        contract,
        method: "function updateTermsAndRequirements(bytes32,string,string)",
        params: [externalId as `0x${string}`, requirements, terms],
      });

      const result = await sendTransaction({
        transaction,
        account,
      });

      await waitForReceipt({
        client: this.client,
        chain: this.chain,
        transactionHash: result.transactionHash,
      });

      console.log("✅ Terms and requirements updated successfully");
      return true;
    } catch (error: any) {
      console.error("❌ Error updating terms and requirements:", error);
      this.handleError(error);
      return false;
    }
  }

  // Check if agreement exists
  async agreementExists(externalIdStr: string): Promise<boolean> {
    try {
      const contract = this.getMarketplaceContract();

      // Compute bytes32 ID
      const externalId = await this.computeExternalId(externalIdStr);

      const exists = await readContract({
        contract,
        method: "function exists(bytes32) view returns (bool)",
        params: [externalId as `0x${string}`],
      });

      return exists as boolean;
    } catch (error) {
      console.error("❌ Error checking agreement existence:", error);
      return false;
    }
  }

  // Get agreement details
  async getAgreement(externalIdStr: string): Promise<Agreement | null> {
    try {
      const contract = this.getMarketplaceContract();

      // Compute bytes32 ID
      const externalId = await this.computeExternalId(externalIdStr);

      // Check if exists first
      const exists = await this.agreementExists(externalIdStr);
      if (!exists) {
        console.log("Agreement does not exist:", externalIdStr);
        return null;
      }

      const result = await readContract({
        contract,
        method:
          "function getAgreement(bytes32) view returns (bytes32,address,address,string,string,uint8,uint256,uint256)",
        params: [externalId as `0x${string}`],
      });

      if (!result) return null;

      const [
        returnedId,
        needer,
        provider,
        requirements,
        terms,
        status,
        createdAt,
        escrowAmount,
      ] = result as any;

      return {
        externalId: returnedId,
        needer,
        provider,
        requirements,
        terms,
        status: Number(status) as AgreementStatus,
        createdAt,
        escrowAmount,
      };
    } catch (error: any) {
      console.error("Error getting agreement:", error);
      return null;
    }
  }

  // List all agreement IDs
  async listAgreementIds(): Promise<string[]> {
    try {
      const contract = this.getMarketplaceContract();

      const result = await readContract({
        contract,
        method: "function listAgreementIds() view returns (bytes32[])",
        params: [],
      });

      return (result as string[]) || [];
    } catch (error: any) {
      console.error("Error listing agreement IDs:", error);
      return [];
    }
  }

  // Get current wallet address
  async getCurrentWalletAddress(): Promise<string> {
    const account = await this.ensureWalletConnected();
    return account.address;
  }

  // Helper function to convert status enum to string
  getStatusString(status: AgreementStatus): string {
    switch (status) {
      case AgreementStatus.Created:
        return "created";
      case AgreementStatus.Accepted:
        return "accepted";
      case AgreementStatus.Completed:
        return "completed";
      case AgreementStatus.Cancelled:
        return "cancelled";
      default:
        return "unknown";
    }
  }

  // Complete agreement and release funds workflow
  async releaseContractFunds(contractId: string): Promise<boolean> {
    try {
      console.log("💰 Starting fund release process for contract:", contractId);

      // First, complete the agreement (needer action)
      console.log("📋 Step 1: Marking agreement as completed (needer action)");
      const completionSuccess = await this.completeAgreement(contractId);

      if (!completionSuccess) {
        console.error("❌ Failed to complete agreement");
        return false;
      }

      console.log("✅ Agreement marked as completed");
      console.log("📋 Provider can now withdraw escrow funds");

      // Note: Provider needs to call withdrawEscrow separately
      // This is a two-step process in the new contract

      return true;
    } catch (error: any) {
      console.error("❌ Error in fund release process:", error);
      return false;
    }
  }

  // Provider withdraws funds after agreement is completed
  async providerWithdrawFunds(contractId: string): Promise<boolean> {
    try {
      console.log("💰 Provider withdrawing funds for contract:", contractId);

      const success = await this.withdrawEscrow(contractId);

      if (success) {
        console.log("✅ Funds successfully withdrawn by provider");
      }

      return success;
    } catch (error: any) {
      console.error("❌ Error withdrawing funds:", error);
      return false;
    }
  }

  // Fund an agreement (add more escrow to existing agreement)
  async fundAgreement(contractId: string, amount: string): Promise<boolean> {
    try {
      console.log("💰 Adding funds to agreement:", contractId);
      console.log("💵 Amount:", amount, "ETH");

      // The new contract doesn't have a separate fund function
      // Funds are added during creation
      // This is kept for compatibility but returns false
      console.warn(
        "⚠️ The new contract requires funds to be added during creation",
      );
      console.warn("⚠️ Cannot add funds to existing agreement");

      throw new MarketplaceError(
        "Cannot add funds to existing agreement. Funds must be included during agreement creation.",
      );
    } catch (error: any) {
      console.error("❌ Error funding agreement:", error);
      this.handleError(error);
      return false;
    }
  }

  // Legacy method compatibility - redirect to new methods
  async createDirectContract(
    smartjectId: string,
    neederId: string,
    providerId: string,
    budget: string,
    requirements: string,
    terms: string,
  ): Promise<number | null> {
    try {
      console.log("🚀 Creating agreement (legacy createDirectContract)...");

      // Create agreement with escrow
      const txHash = await this.createAgreement(
        smartjectId, // Use smartjectId as external ID
        neederId,
        providerId,
        requirements,
        terms,
        budget, // Include budget as escrow
      );

      if (txHash) {
        // Return 1 as a placeholder ID for compatibility
        return 1;
      }

      return null;
    } catch (error: any) {
      console.error("❌ Error creating agreement:", error);
      return null;
    }
  }

  // Legacy method - check if contract can be funded
  async canFundContract(contractId: string): Promise<boolean> {
    try {
      // In new contract, funds are added during creation
      // Check if agreement exists and is in Created status
      const agreement = await this.getAgreement(contractId);

      if (!agreement) return false;

      // Can't add funds to existing agreement in new contract
      return false;
    } catch (error: any) {
      console.error("❌ Error checking funding capability:", error);
      return false;
    }
  }

  // Legacy method - check if funds can be released
  async canReleaseFunds(contractId: string): Promise<boolean> {
    try {
      const agreement = await this.getAgreement(contractId);

      if (!agreement) return false;

      // Funds can be released if status is Accepted (needer completes) or
      // withdrawn if status is Completed (provider withdraws)
      return agreement.status === AgreementStatus.Accepted;
    } catch (error: any) {
      console.error("❌ Error checking release capability:", error);
      return false;
    }
  }

  // Legacy method - complete contract
  async completeContract(
    contractId: string,
    deliverables: string,
  ): Promise<boolean> {
    // In new contract, provider doesn't submit deliverables
    // This is now just for compatibility
    console.log("📋 Note: New contract doesn't store deliverables on-chain");
    console.log(
      "📋 Provider work completion is acknowledged by needer calling completeAgreement",
    );

    // Return true as provider's work is done off-chain
    return true;
  }

  // Legacy method - fund contract
  async fundContract(contractId: string, amount: string): Promise<boolean> {
    // Redirect to fundAgreement which will show the warning
    return this.fundAgreement(contractId, amount);
  }

  // Legacy method - contract exists
  async contractExists(contractId: string): Promise<boolean> {
    return this.agreementExists(contractId);
  }

  // Legacy method - get contract details
  async getContractDetails(contractId: string): Promise<any> {
    try {
      const agreement = await this.getAgreement(contractId);

      if (!agreement) {
        throw new Error(`Agreement ${contractId} not found on blockchain`);
      }

      // Return in legacy format for compatibility
      return [
        contractId, // id
        0n, // proposalId (not used in new contract)
        agreement.needer,
        agreement.provider,
        agreement.escrowAmount, // budget
        agreement.escrowAmount, // escrowAmount
        agreement.status,
        agreement.createdAt,
        0n, // completedAt (not stored)
        "", // deliverables (not stored)
        agreement.status === AgreementStatus.Completed, // fundsReleased
      ];
    } catch (error: any) {
      console.error("❌ Error getting contract details:", error);
      throw error;
    }
  }

  // Legacy method - get contract
  async getContract(contractId: string): Promise<any> {
    const agreement = await this.getAgreement(contractId);

    if (!agreement) return null;

    // Return in legacy SmartjectContract format
    return {
      id: BigInt(1), // Placeholder ID
      proposalId: BigInt(0), // Not used
      neederId: agreement.needer,
      providerId: agreement.provider,
      budget: agreement.escrowAmount,
      escrowAmount: agreement.escrowAmount,
      status: agreement.status,
      createdAt: agreement.createdAt,
      completedAt: BigInt(0),
      deliverables: "",
      fundsReleased: agreement.status === AgreementStatus.Completed,
    };
  }

  // Error handling
  private handleError(error: any): never {
    if (error.message?.includes("user rejected")) {
      throw new MarketplaceError("Transaction cancelled by user");
    }
    if (error.message?.includes("insufficient funds")) {
      throw new MarketplaceError("Insufficient funds for transaction");
    }
    if (error.message?.includes("not found")) {
      throw new MarketplaceError("Agreement not found");
    }
    if (error.message?.includes("only needer")) {
      throw new MarketplaceError("Only the needer can perform this action");
    }
    if (error.message?.includes("only provider")) {
      throw new MarketplaceError("Only the provider can perform this action");
    }
    if (error.message?.includes("wrong status")) {
      throw new MarketplaceError("Invalid agreement status for this action");
    }
    if (error.message?.includes("already used")) {
      throw new MarketplaceError(
        "This contract ID already exists on blockchain",
      );
    }
    throw new MarketplaceError(error.message || "Transaction failed");
  }
}

// Export singleton instance
export const marketplaceService = new MarketplaceService();

// Re-export types for backward compatibility
export {
  ProposalType,
  ContractStatus,
} from "@/lib/services/marketplace.service.old";

// Map old status to new status for compatibility
export function mapContractStatusToAgreementStatus(
  status: ContractStatus,
): AgreementStatus {
  switch (status) {
    case ContractStatus.PENDING:
      return AgreementStatus.Created;
    case ContractStatus.ACTIVE:
      return AgreementStatus.Accepted;
    case ContractStatus.COMPLETED:
      return AgreementStatus.Completed;
    case ContractStatus.CANCELLED:
      return AgreementStatus.Cancelled;
    default:
      return AgreementStatus.Created;
  }
}
