import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
  sendTransaction,
  waitForReceipt,
  readContract,
  getAddress,
  ThirdwebClient,
} from "thirdweb";
import {
  logBlockchainConfig,
  checkBlockchainConfig,
} from "@/lib/utils/blockchain-config-check";
import { getRpcClient } from "thirdweb/rpc";
import { createWallet, injectedProvider } from "thirdweb/wallets";
import { toWei, toEther } from "thirdweb/utils";
import {
  CONTRACT_ADDRESSES,
  THIRDWEB_CONFIG,
  activeChain,
  configuredChain,
  TX_CONFIG,
  BLOCKCHAIN_ERRORS,
  logTransaction,
  validateAddress,
} from "@/lib/config/blockchain.config";

// Types
export interface DeployEscrowParams {
  contractId: string;
  clientAddress: string;
  providerAddress: string;
  amount: string; // Amount in ETH/MATIC
}

export interface EscrowDetails {
  client: string;
  provider: string;
  amount: bigint;
  state: number;
  balance: bigint;
}

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

// Blockchain service class
class BlockchainService {
  private client: ThirdwebClient | null = null;
  private wallet: any = null;

  constructor() {
    this.initializeClient();
  }

  // Initialize Thirdweb client
  private initializeClient() {
    console.log("🔧 Initializing Thirdweb client...");

    // Log full configuration status
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
      console.log("✅ Thirdweb client initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Thirdweb client:", error);
      this.client = null;
    }
  }

  // Connect wallet
  async connectWallet(): Promise<string | null> {
    try {
      if (!this.client) {
        throw new BlockchainError("Thirdweb client not initialized");
      }

      // Create wallet instance for MetaMask
      this.wallet = createWallet("io.metamask");

      // Connect wallet
      const account = await this.wallet.connect({
        client: this.client,
      });

      const address = account.address;
      console.log("Wallet connected:", address);
      return address;
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      if (error.message?.includes("rejected")) {
        throw new BlockchainError(BLOCKCHAIN_ERRORS.USER_REJECTED);
      }
      throw new BlockchainError(BLOCKCHAIN_ERRORS.WALLET_NOT_CONNECTED);
    }
  }

  // Get connected wallet address
  async getWalletAddress(): Promise<string | null> {
    try {
      if (!this.wallet) {
        return null;
      }

      const account = await this.wallet.getAccount();
      return account?.address || null;
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

  // Deploy new escrow contract
  async deployEscrowContract(
    params: DeployEscrowParams,
  ): Promise<string | null> {
    console.log("🚀 Starting escrow contract deployment...");
    console.log("📋 Deployment params:", {
      contractId: params.contractId,
      clientAddress: params.clientAddress,
      providerAddress: params.providerAddress,
      amount: params.amount,
    });

    // Test RPC connection first
    const rpcOk = await this.testRPCConnection();
    if (!rpcOk) {
      console.error("❌ RPC connection test failed");
    }

    try {
      if (!this.client) {
        console.error("❌ Thirdweb client not initialized");
        throw new BlockchainError(
          "Blockchain client not initialized. Please check environment configuration.",
        );
      }

      if (!this.wallet) {
        console.error("❌ Wallet not connected");
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

      // Validate factory contract address
      console.log("🏭 Factory address:", CONTRACT_ADDRESSES.escrowFactory);
      if (!validateAddress(CONTRACT_ADDRESSES.escrowFactory)) {
        console.error("❌ Invalid factory contract address");
        throw new BlockchainError(BLOCKCHAIN_ERRORS.CONTRACT_NOT_DEPLOYED);
      }
      console.log("✅ Factory address is valid");

      // Get factory contract
      console.log("📝 Getting factory contract...");
      const factoryContract = getContract({
        client: this.client,
        chain: configuredChain,
        address: CONTRACT_ADDRESSES.escrowFactory,
      });
      console.log("✅ Factory contract instance created");

      // Convert amount to wei
      const amountInWei = toWei(params.amount);
      console.log("💰 Amount in wei:", amountInWei.toString());

      // Prepare transaction
      console.log("📤 Preparing contract call...");
      const transaction = prepareContractCall({
        contract: factoryContract,
        method:
          "function createEscrow(string memory _contractId, address _client, address _provider, uint256 _amount)",
        params: [
          params.contractId,
          getAddress(params.clientAddress),
          getAddress(params.providerAddress),
          amountInWei,
        ],
      });
      console.log("✅ Transaction prepared");

      // Send transaction
      console.log("🔄 Sending transaction...");
      const account = await this.wallet.getAccount();
      console.log("👤 Sending from account:", account.address);

      const result = await sendTransaction({
        transaction,
        account: account,
      });
      console.log("✅ Transaction sent:", result.transactionHash);

      // Wait for confirmation
      console.log("⏳ Waiting for transaction confirmation...");
      console.log("   Chain:", configuredChain.name);
      console.log("   Confirmations required:", TX_CONFIG.confirmationBlocks);
      console.log("   RPC URL:", configuredChain.rpc);
      console.log("   Timeout:", TX_CONFIG.confirmationTimeout, "ms");

      let receipt;
      try {
        // Add a manual timeout since maxBlockWaitTime might not work properly
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(
              new Error(
                `Transaction confirmation timeout after ${TX_CONFIG.confirmationTimeout}ms`,
              ),
            );
          }, TX_CONFIG.confirmationTimeout);
        });

        const receiptPromise = waitForReceipt({
          client: this.client,
          chain: configuredChain,
          transactionHash: result.transactionHash,
          confirmations: TX_CONFIG.confirmationBlocks,
          maxBlockWaitTime: TX_CONFIG.confirmationTimeout,
        });

        // Race between receipt and timeout
        receipt = await Promise.race([receiptPromise, timeoutPromise]);

        console.log("✅ Transaction confirmed");
        console.log("   Block number:", receipt.blockNumber);
        console.log("   Gas used:", receipt.gasUsed?.toString());
      } catch (receiptError: any) {
        console.error("❌ Error waiting for receipt:");
        console.error("   Error:", receiptError.message);
        console.error("   Details:", receiptError);

        // Check if it's a timeout error
        if (
          receiptError.message?.includes("timeout") ||
          receiptError.message?.includes("Timeout")
        ) {
          console.error(
            "⏱️ Transaction confirmation timed out after",
            TX_CONFIG.confirmationTimeout,
            "ms",
          );
          console.error(
            "   Transaction may still be pending on the blockchain",
          );
          console.error("   Transaction hash:", result.transactionHash);

          // Try alternative confirmation method
          console.log("🔄 Attempting alternative confirmation method...");
          try {
            receipt = await this.checkTransactionWithRetry(
              result.transactionHash,
            );
            if (receipt) {
              console.log("✅ Transaction confirmed via alternative method");
            }
          } catch (altError) {
            console.error("❌ Alternative confirmation also failed:", altError);
          }
        }

        if (!receipt) {
          throw new Error(
            `Transaction confirmation failed: ${receiptError.message}`,
          );
        }
      }

      logTransaction("Escrow deployed", result.transactionHash);

      // Get deployed escrow address from events
      console.log("🔍 Getting deployed escrow address...");
      let escrowAddress;
      try {
        // First try to get address from factory contract
        escrowAddress = await this.getEscrowAddress(params.contractId);

        // If that fails, try to get it from transaction events
        if (!escrowAddress) {
          console.log(
            "⚠️ Direct read failed, trying to get address from events...",
          );
          escrowAddress = await this.getEscrowAddressFromEvents(
            result.transactionHash,
          );
        }

        if (!escrowAddress) {
          console.error("❌ No escrow address returned from any method");
          throw new Error(
            "Failed to get escrow address from contract or events",
          );
        }

        console.log("✅ Escrow deployed at:", escrowAddress);
      } catch (addressError: any) {
        console.error("❌ Error getting escrow address:");
        console.error("   Error:", addressError.message);
        console.error("   Details:", addressError);
        throw new Error(
          `Failed to retrieve escrow address: ${addressError.message}`,
        );
      }

      return escrowAddress;
    } catch (error: any) {
      console.error("❌ Error deploying escrow contract:");
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

  // Fund escrow contract (client deposits funds)
  async fundEscrowContract(
    contractId: string,
    amount: string,
  ): Promise<boolean> {
    try {
      if (!this.client || !this.wallet) {
        throw new BlockchainError(BLOCKCHAIN_ERRORS.WALLET_NOT_CONNECTED);
      }

      // Get escrow contract address
      const escrowAddress = await this.getEscrowAddress(contractId);
      if (!escrowAddress) {
        throw new BlockchainError("Escrow contract not found");
      }

      // Get escrow contract
      const escrowContract = getContract({
        client: this.client,
        chain: configuredChain,
        address: escrowAddress,
      });

      // Convert amount to wei
      const amountInWei = toWei(amount);

      // Prepare deposit transaction
      const transaction = prepareContractCall({
        contract: escrowContract,
        method: "function deposit()",
        params: [],
        value: amountInWei,
      });

      // Send transaction
      const result = await sendTransaction({
        transaction,
        account: await this.wallet.getAccount(),
      });

      // Wait for confirmation
      await waitForReceipt({
        client: this.client,
        chain: configuredChain,
        transactionHash: result.transactionHash,
        confirmations: TX_CONFIG.confirmationBlocks,
      });

      logTransaction("Escrow funded", result.transactionHash);
      return true;
    } catch (error: any) {
      console.error("Error funding escrow contract:", error);
      this.handleBlockchainError(error);
      return false;
    }
  }

  // Release escrow funds (approve or reject)
  async releaseEscrowFunds(
    contractId: string,
    approved: boolean,
  ): Promise<boolean> {
    try {
      if (!this.client || !this.wallet) {
        throw new BlockchainError(BLOCKCHAIN_ERRORS.WALLET_NOT_CONNECTED);
      }

      // Get factory contract
      const factoryContract = getContract({
        client: this.client,
        chain: activeChain,
        address: CONTRACT_ADDRESSES.escrowFactory,
      });

      // Prepare release transaction
      const transaction = prepareContractCall({
        contract: factoryContract,
        method:
          "function releaseEscrow(string memory _contractId, bool _approved)",
        params: [contractId, approved],
      });

      // Send transaction
      const result = await sendTransaction({
        transaction,
        account: await this.wallet.getAccount(),
      });

      // Wait for confirmation
      await waitForReceipt({
        client: this.client,
        chain: configuredChain,
        transactionHash: result.transactionHash,
        confirmations: TX_CONFIG.confirmationBlocks,
      });

      logTransaction(
        approved ? "Escrow released" : "Escrow refunded",
        result.transactionHash,
      );
      return true;
    } catch (error: any) {
      console.error("Error releasing escrow funds:", error);
      this.handleBlockchainError(error);
      return false;
    }
  }

  // Get escrow contract address
  async getEscrowAddress(contractId: string): Promise<string | null> {
    console.log("📍 Getting escrow address for contract:", contractId);

    try {
      if (!this.client) {
        console.error("❌ Client not initialized in getEscrowAddress");
        throw new BlockchainError("Thirdweb client not initialized");
      }

      console.log("🏭 Creating factory contract instance...");
      const factoryContract = getContract({
        client: this.client,
        chain: configuredChain,
        address: CONTRACT_ADDRESSES.escrowFactory,
      });
      console.log("✅ Factory contract created");

      console.log("📖 Reading escrow address from factory...");
      console.log("   Contract ID:", contractId);
      console.log("   Factory address:", CONTRACT_ADDRESSES.escrowFactory);

      const address = await readContract({
        contract: factoryContract,
        method:
          "function getEscrowAddress(string memory _contractId) view returns (address)",
        params: [contractId],
      });

      console.log("📋 Read contract result:", address);
      console.log("   Type:", typeof address);
      console.log(
        "   Is zero address:",
        address === "0x0000000000000000000000000000000000000000",
      );

      if (
        !address ||
        address === "0x0000000000000000000000000000000000000000"
      ) {
        console.warn(
          "⚠️ Factory returned zero address - contract may not be deployed yet",
        );
        return null;
      }

      console.log("✅ Successfully retrieved escrow address:", address);
      return address as string;
    } catch (error: any) {
      console.error("❌ Error getting escrow address:");
      console.error("   Error type:", error.constructor.name);
      console.error("   Error message:", error.message);
      console.error("   Error details:", error);

      if (error.cause) {
        console.error("   Error cause:", error.cause);
      }

      return null;
    }
  }

  // Get escrow address from transaction events (fallback method)
  async getEscrowAddressFromEvents(
    transactionHash: string,
  ): Promise<string | null> {
    console.log("🔍 Getting escrow address from transaction events...");

    try {
      if (!this.client) {
        console.error("❌ Client not initialized");
        return null;
      }

      console.log("📋 Fetching transaction receipt...");
      const receipt = await waitForReceipt({
        client: this.client,
        chain: configuredChain,
        transactionHash: transactionHash,
        confirmations: 1, // Just need the receipt, not full confirmations
      });

      console.log("📋 Receipt retrieved, checking events...");
      console.log("   Number of events:", receipt.logs?.length || 0);

      // Look for EscrowCreated event
      // Event signature: EscrowCreated(string indexed contractId, address escrow)
      const escrowCreatedTopic =
        "0x" + "EscrowCreated(string,address)".replace(/\s/g, "");

      for (const log of receipt.logs || []) {
        console.log("   Checking log:", {
          address: log.address,
          topics: log.topics,
        });

        // The event will have the contractId as the first indexed parameter
        // and the escrow address in the data
        if (
          log.topics?.[0]?.includes("EscrowCreated") ||
          log.address === CONTRACT_ADDRESSES.escrowFactory
        ) {
          // Decode the escrow address from the log data
          // The address is the second parameter (after contractId)
          const addressHex = log.data?.slice(66, 130); // Skip first 32 bytes (contractId), take next 32 bytes
          if (addressHex) {
            const escrowAddress = "0x" + addressHex.slice(24); // Remove padding, keep last 40 chars
            console.log("✅ Found escrow address in events:", escrowAddress);
            return escrowAddress;
          }
        }
      }

      console.warn("⚠️ No EscrowCreated event found in transaction");
      return null;
    } catch (error: any) {
      console.error("❌ Error getting escrow address from events:");
      console.error("   Error:", error.message);
      console.error("   Details:", error);
      return null;
    }
  }

  // Alternative transaction confirmation method with retry
  async checkTransactionWithRetry(transactionHash: string): Promise<any> {
    console.log("🔄 Checking transaction status with retry...");

    const maxAttempts = 10;
    const delayMs = 3000; // 3 seconds between attempts

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`   Attempt ${attempt}/${maxAttempts}...`);

      try {
        // Try to get transaction receipt with minimal confirmations
        const receipt = await waitForReceipt({
          client: this.client,
          chain: configuredChain,
          transactionHash: transactionHash,
          confirmations: 1, // Just 1 confirmation for now
          maxBlockWaitTime: 10000, // 10 second timeout per attempt
        });

        if (receipt && receipt.status === "success") {
          console.log(`✅ Transaction confirmed on attempt ${attempt}`);
          return receipt;
        }
      } catch (error: any) {
        console.log(`   Attempt ${attempt} failed:`, error.message);

        if (attempt < maxAttempts) {
          console.log(`   Waiting ${delayMs}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    throw new Error(
      `Transaction confirmation failed after ${maxAttempts} attempts`,
    );
  }

  // Test RPC connection
  async testRPCConnection(): Promise<boolean> {
    try {
      console.log("🔍 Testing RPC connection...");
      if (!this.client) {
        console.error("❌ Client not initialized");
        return false;
      }

      const rpcClient = getRpcClient({
        client: this.client,
        chain: configuredChain,
      });
      const blockNumber = await rpcClient.getBlockNumber();
      console.log("✅ RPC connection successful, latest block:", blockNumber);
      return true;
    } catch (error: any) {
      console.error("❌ RPC connection failed:", error.message);
      return false;
    }
  }

  // Get escrow details
  async getEscrowDetails(contractId: string): Promise<EscrowDetails | null> {
    try {
      if (!this.client) {
        throw new BlockchainError("Thirdweb client not initialized");
      }

      const factoryContract = getContract({
        client: this.client,
        chain: activeChain,
        address: CONTRACT_ADDRESSES.escrowFactory,
      });

      const [client, provider, amount, state, balance] = (await readContract({
        contract: factoryContract,
        method:
          "function getEscrowDetails(string memory _contractId) view returns (address client, address provider, uint256 amount, uint8 state, uint256 balance)",
        params: [contractId],
      })) as [string, string, bigint, number, bigint];

      return {
        client,
        provider,
        amount,
        state,
        balance,
      };
    } catch (error) {
      console.error("Error getting escrow details:", error);
      return null;
    }
  }

  // Check if escrow is funded
  async isEscrowFunded(contractId: string): Promise<boolean> {
    try {
      const details = await this.getEscrowDetails(contractId);
      if (!details) return false;

      // State 1 = FUNDED
      return details.state === 1;
    } catch (error) {
      console.error("Error checking escrow status:", error);
      return false;
    }
  }

  // Get wallet balance
  async getWalletBalance(): Promise<string | null> {
    try {
      if (!this.wallet || !this.client) {
        return null;
      }

      const account = await this.wallet.getAccount();
      if (!account) return null;

      // Use RPC client to get balance
      const rpcRequest = getRpcClient({
        client: this.client,
        chain: activeChain,
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
