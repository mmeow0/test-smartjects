import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
  sendTransaction,
  waitForReceipt,
  readContract,
  ThirdwebClient,
} from "thirdweb";
import {
  logBlockchainConfig,
  checkBlockchainConfig,
} from "@/lib/utils/blockchain-config-check";
import { getRpcClient } from "thirdweb/rpc";
import { toWei, toEther } from "thirdweb/utils";
import {
  getActiveAccount,
  getActiveAddress,
} from "@/lib/utils/thirdweb-wallet";
import {
  THIRDWEB_CONFIG,
  TX_CONFIG,
  BLOCKCHAIN_ERRORS,
  logTransaction,
  validateAddress,
  hardhatChain,
} from "@/lib/config/blockchain.config";
import MARKETPLACE_JSON from "./hardhat-SmartjectsMarketplace-ABI.json"
import { parseAbi } from "viem";

// Marketplace contract configuration
const MARKETPLACE_ADDRESS =
  process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Marketplace contract types
export enum AgreementStatus {
  Created = 0,
  Accepted = 1,
  Completed = 2,
  Cancelled = 3,
}

// Types for compatibility with existing code
export interface DeployEscrowParams {
  contractId: string;
  clientAddress: string;
  providerAddress: string;
  amount: string; // Amount in ETH
}

export interface EscrowDetails {
  client: string;
  provider: string;
  amount: bigint;
  state: number;
  balance: bigint;
}

const MARKETPLACE_ABI = parseAbi(MARKETPLACE_JSON.abi);

// Error handling
class BlockchainError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "BlockchainError";
  }
}

// No longer need to map IDs - we use contract IDs directly as external IDs

// Blockchain service class - ONLY MARKETPLACE
class BlockchainService {
  private client: ThirdwebClient | null = null;
  private chain: any;

  constructor() {
    this.initializeClient();
    // Always use hardhat for now
    this.chain = hardhatChain;
  }

  // Initialize Thirdweb client
  private initializeClient() {
    console.log("🔧 Initializing Thirdweb client for Marketplace...");

    // Log configuration status
    logBlockchainConfig();

    const configStatus = checkBlockchainConfig();
    if (!configStatus.isValid) {
      console.error("❌ Blockchain configuration is invalid");
      configStatus.errors.forEach((error) => console.error(`   - ${error}`));
      return;
    }

    if (!THIRDWEB_CONFIG.clientId) {
      console.error("❌ Thirdweb client ID not configured");
      console.error(
        "Please ensure NEXT_PUBLIC_THIRDWEB_CLIENT_ID is set in your environment",
      );
      return;
    }

    try {
      this.client = createThirdwebClient({
        clientId: THIRDWEB_CONFIG.clientId,
      });
      console.log("✅ Thirdweb client initialized for Marketplace");
      console.log("📍 Marketplace address:", MARKETPLACE_ADDRESS);
    } catch (error) {
      console.error("❌ Failed to initialize Thirdweb client:", error);
      this.client = null;
    }
  }

  // Get marketplace contract instance
  private getMarketplaceContract() {
    if (!this.client) {
      throw new BlockchainError("Thirdweb client not initialized");
    }

    if (!MARKETPLACE_ADDRESS || !validateAddress(MARKETPLACE_ADDRESS)) {
      throw new BlockchainError("Marketplace contract not deployed");
    }

    return getContract({
      client: this.client,
      chain: this.chain,
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
    });
  }

  // Connect wallet (compatibility method)
  async connectWallet(): Promise<string | null> {
    try {
      console.log("Wallet connection should be handled by UI component");

      // Try to get the current address if wallet is already connected
      const address = await this.getWalletAddress();
      if (address) {
        console.log("Wallet already connected:", address);
        return address;
      }

      console.log(
        "No wallet connected - use ConnectButton component to connect",
      );
      return null;
    } catch (error: any) {
      console.error("Error in connectWallet:", error);
      throw new BlockchainError(BLOCKCHAIN_ERRORS.WALLET_NOT_CONNECTED);
    }
  }

  // Get connected wallet address
  async getWalletAddress(): Promise<string | null> {
    try {
      return getActiveAddress();
    } catch (error) {
      console.error("Error getting wallet address:", error);
      return null;
    }
  }

  // Check if wallet is connected
  async isWalletConnected(): Promise<boolean> {
    const address = await this.getWalletAddress();
    return !!address;
  }

  // Deploy escrow contract - NOW CREATES AGREEMENT ON MARKETPLACE
  async deployEscrowContract(
    params: DeployEscrowParams,
  ): Promise<string | null> {
    console.log("🚀 Creating agreement on marketplace for:", params.contractId);
    console.log("📋 Contract params:", params);
    console.log("💰 Escrow amount:", params.amount, "ETH");

    try {
      if (!this.client) {
        console.error("❌ Thirdweb client not initialized");
        throw new BlockchainError(
          "Blockchain client not initialized. Please check environment configuration.",
        );
      }

      const account = getActiveAccount();
      if (!account) {
        console.error("❌ No active wallet account");
        throw new BlockchainError(BLOCKCHAIN_ERRORS.WALLET_NOT_CONNECTED);
      }

      console.log("✅ Client and wallet are ready");

      // Validate addresses
      if (
        !validateAddress(params.clientAddress) ||
        !validateAddress(params.providerAddress)
      ) {
        throw new BlockchainError("Invalid wallet address");
      }

      // Get marketplace contract
      console.log("📝 Getting marketplace contract...");
      const marketplaceContract = this.getMarketplaceContract();
      console.log("✅ Marketplace contract instance created");

      // Convert amount to wei
      console.log("💰 Converting to wei - Amount:", params.amount, "ETH");
      const amountInWei = toWei(params.amount);
      console.log("💰 Amount in wei:", amountInWei.toString());

      // Create agreement on marketplace with escrow
      console.log("📤 Creating agreement on marketplace...");
      const createAgreementTx = prepareContractCall({
        contract: marketplaceContract,
        method:
          "function createAgreement(string,address,address,string,string) payable",
        params: [
          params.contractId, // External ID (database contract ID)
          params.clientAddress as `0x${string}`, // Needer address
          params.providerAddress as `0x${string}`, // Provider address
          `Requirements for contract ${params.contractId}`,
          `Terms for contract ${params.contractId}`,
        ],
        value: amountInWei, // Include escrow amount
      });

      const agreementResult = await sendTransaction({
        transaction: createAgreementTx,
        account: account,
      });
      console.log(
        "✅ Agreement transaction sent:",
        agreementResult.transactionHash,
      );

      // Wait for agreement creation confirmation
      await waitForReceipt({
        client: this.client,
        chain: this.chain,
        transactionHash: agreementResult.transactionHash,
      });
      console.log("✅ Agreement created on marketplace with escrow");

      logTransaction(
        "Marketplace agreement created",
        agreementResult.transactionHash,
      );

      // Return the marketplace contract address
      console.log("✅ Using marketplace at:", MARKETPLACE_ADDRESS);
      return MARKETPLACE_ADDRESS;
    } catch (error: any) {
      console.error("❌ Error creating marketplace agreement:");
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
      console.error("Error details:", error);

      if (error.cause) {
        console.error("Error cause:", error.cause);
      }

      this.handleBlockchainError(error);
      return null;
    }
  }

  // Fund escrow contract - NOT NEEDED ANYMORE (funds added during creation)
  async fundEscrowContract(
    contractId: string,
    amount: string,
  ): Promise<boolean> {
    try {
      console.log(
        "⚠️ Funding is done during agreement creation in new contract",
      );
      console.log("⚠️ This method is kept for compatibility but returns true");

      // In the new contract, escrow is added during createAgreement
      // This method is kept for backward compatibility
      // It returns true to indicate the contract is "funded"

      return true;
    } catch (error: any) {
      console.error("Error in fundEscrowContract:", error);
      return false;
    }
  }

  // Release escrow funds - NOW COMPLETES AGREEMENT
  async releaseEscrowFunds(
    contractId: string,
    approved: boolean,
  ): Promise<boolean> {
    try {
      if (!this.client) {
        throw new BlockchainError("Thirdweb client not initialized");
      }

      const account = getActiveAccount();
      if (!account) {
        throw new BlockchainError(BLOCKCHAIN_ERRORS.WALLET_NOT_CONNECTED);
      }

      // Get marketplace contract
      const marketplaceContract = this.getMarketplaceContract();

      // Compute bytes32 external ID
      const externalIdResult = await readContract({
        contract: marketplaceContract,
        method: "function computeExternalId(string) pure returns (bytes32)",
        params: [contractId],
      });
      const externalId = externalIdResult as `0x${string}`;

      console.log(
        `${approved ? "Completing" : "Cancelling"} agreement ${contractId}`,
      );

      if (approved) {
        // Complete the agreement (needer action)
        const transaction = prepareContractCall({
          contract: marketplaceContract,
          method: "function completeAgreement(bytes32)",
          params: [externalId],
        });

        const result = await sendTransaction({
          transaction,
          account: account,
        });

        await waitForReceipt({
          client: this.client,
          chain: this.chain,
          transactionHash: result.transactionHash,
        });

        logTransaction("Agreement completed", result.transactionHash);

        console.log("✅ Agreement marked as completed");
        console.log("📋 Provider can now withdraw escrow funds");
      } else {
        // Cancel the agreement
        const transaction = prepareContractCall({
          contract: marketplaceContract,
          method: "function cancelAgreement(bytes32)",
          params: [externalId],
        });

        const result = await sendTransaction({
          transaction,
          account: account,
        });

        await waitForReceipt({
          client: this.client,
          chain: this.chain,
          transactionHash: result.transactionHash,
        });

        logTransaction("Agreement cancelled", result.transactionHash);
      }

      return true;
    } catch (error: any) {
      console.error("Error completing/cancelling agreement:", error);
      this.handleBlockchainError(error);
      return false;
    }
  }

  // Get escrow address - RETURNS MARKETPLACE ADDRESS
  async getEscrowAddress(contractId: string): Promise<string | null> {
    console.log("📍 Contract", contractId, "is managed by marketplace");

    if (!MARKETPLACE_ADDRESS || !validateAddress(MARKETPLACE_ADDRESS)) {
      console.warn("⚠️ Marketplace contract not deployed");
      return null;
    }

    console.log("✅ Using marketplace address:", MARKETPLACE_ADDRESS);
    return MARKETPLACE_ADDRESS;
  }

  // Добавьте эту функцию в ваш BlockchainService
async diagnosticContractState(): Promise<void> {
  try {
    console.log("🔧 BLOCKCHAIN DIAGNOSTIC START");
    
    const marketplaceContract = this.getMarketplaceContract();
    console.log("📍 Contract address:", marketplaceContract.address);
    console.log("🌐 Chain ID:", marketplaceContract.chain.id);
    console.log("🔗 RPC URL:", marketplaceContract.chain.rpc);
    console.log("🔗 marketplaceContract:", marketplaceContract);

    const rpcRequest = getRpcClient({
        client: this.client,
        chain: this.chain,
      });

    // Проверяем код контракта
    const code = await rpcRequest({
      method: "eth_getCode", 
      params: [marketplaceContract.address, "latest"],
    });
    
    console.log("📜 Contract code length:", code.length);
    console.log("🏗️ Contract deployed:", code !== "0x");

    if (code === "0x") {
      console.error("❌ CONTRACT NOT DEPLOYED!");
      console.log("💡 Solutions:");
      console.log("   1. Deploy contract: npx hardhat run scripts/deploy.ts --network localhost");
      console.log("   2. Check contract address in your config");
      console.log("   3. Make sure you're on the right network");
      return;
    }

    // Пробуем простые вызовы
    try {
      const testId = await readContract({
        contract: marketplaceContract,
        method: "function computeExternalId(string) pure returns (bytes32)",
        params: ["test-123"],
      });
      console.log("✅ computeExternalId works:", testId);
    } catch (error) {
      console.error("❌ computeExternalId failed:", error);
    }

    try {
      const agreementIds = await readContract({
        contract: marketplaceContract,
        method: "function listAgreementIds() view returns (bytes32[])",
        params: [],
      });
      console.log("✅ Total agreements:", agreementIds.length);
      console.log("📋 Agreement IDs:", agreementIds);
    } catch (error) {
      console.error("❌ listAgreementIds failed:", error);
    }

    console.log("🔧 BLOCKCHAIN DIAGNOSTIC END");

  } catch (error) {
    console.error("❌ Diagnostic failed:", error);
  }
}

  // Get escrow details - FROM MARKETPLACE AGREEMENT
  async getEscrowDetails(contractId: string): Promise<EscrowDetails | null> {
    try {
      if (!this.client) {
        throw new BlockchainError("Thirdweb client not initialized");
      }
      await blockchainService.diagnosticContractState();

      const marketplaceContract = this.getMarketplaceContract();

      // Compute bytes32 external ID
      const externalIdResult = await readContract({
        contract: marketplaceContract,
        method: "function computeExternalId(string) pure returns (bytes32)",
        params: [contractId],
      });
      const externalId = externalIdResult as `0x${string}`;

      // Check if agreement exists
      const exists = await readContract({
        contract: marketplaceContract,
        method: "function exists(bytes32) view returns (bool)",
        params: [externalId],
      });

      if (!exists) return null;

      // Get agreement details
      const result = await readContract({
        contract: marketplaceContract,
        method:
          "function getAgreement(bytes32) view returns (bytes32,address,address,string,string,uint8,uint256,uint256)",
        params: [externalId],
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

      // Map to EscrowDetails format for compatibility
      return {
        client: needer,
        provider: provider,
        amount: escrowAmount,
        state: status, // AgreementStatus enum
        balance: escrowAmount,
      };
    } catch (error) {
      console.error("Error getting agreement details:", error);
      return null;
    }
  }

  // Check if escrow is funded - CHECKS MARKETPLACE AGREEMENT
  async isEscrowFunded(contractId: string): Promise<boolean> {
    try {
      const details = await this.getEscrowDetails(contractId);
      if (!details) return false;

      // Agreement has escrow if balance > 0
      // Status doesn't matter for funding check in new contract
      return details.balance > BigInt(0);
    } catch (error) {
      console.error("Error checking agreement funding status:", error);
      return false;
    }
  }

  // Get wallet balance
  async getWalletBalance(): Promise<string | null> {
    try {
      if (!this.client) {
        return null;
      }

      const account = getActiveAccount();
      if (!account) return null;

      // Use RPC client to get balance
      const rpcRequest = getRpcClient({
        client: this.client,
        chain: this.chain,
      });

      const balanceWei = await rpcRequest({
        method: "eth_getBalance",
        params: [account.address, "latest"],
      });

      // Convert wei to ether format
      const balanceInEth = toEther(BigInt(balanceWei));
      return parseFloat(balanceInEth).toFixed(4);
    } catch (error) {
      console.error("Error getting wallet balance:", error);
      return null;
    }
  }

  // Test RPC connection
  async testRPCConnection(): Promise<boolean> {
    try {
      console.log("🔍 Testing RPC connection to Hardhat...");
      if (!this.client) {
        console.error("❌ Client not initialized");
        return false;
      }

      const rpcClient = getRpcClient({
        client: this.client,
        chain: this.chain,
      });
      const blockNumber = await rpcClient.getBlockNumber();
      console.log("✅ RPC connection successful, latest block:", blockNumber);
      return true;
    } catch (error: any) {
      console.error("❌ RPC connection failed:", error.message);
      return false;
    }
  }

  // No dispute function in new contract
  async disputeContract(contractId: string): Promise<boolean> {
    console.log("⚠️ Dispute function not available in new contract");
    return false;
  }

  // Get blockchain contract ID - not needed anymore
  getBlockchainContractId(contractId: string): number | null {
    // In new contract, we use the database contract ID directly
    return null;
  }

  // Set blockchain contract ID - not needed anymore
  setBlockchainContractId(contractId: string, blockchainId: number): void {
    // Not needed in new contract
    console.log("⚠️ ID mapping not needed in new contract");
  }

  // Handle blockchain errors
  private handleBlockchainError(error: any): never {
    if (error.message?.includes("user rejected")) {
      throw new BlockchainError(BLOCKCHAIN_ERRORS.USER_REJECTED);
    }
    if (error.message?.includes("insufficient funds")) {
      throw new BlockchainError(BLOCKCHAIN_ERRORS.INSUFFICIENT_BALANCE);
    }
    if (error.message?.includes("network")) {
      throw new BlockchainError(BLOCKCHAIN_ERRORS.NETWORK_ERROR);
    }
    throw new BlockchainError(BLOCKCHAIN_ERRORS.TRANSACTION_FAILED);
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();
