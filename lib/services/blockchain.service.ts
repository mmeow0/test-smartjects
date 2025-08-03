import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
  sendTransaction,
  waitForReceipt,
  readContract,
  ThirdwebClient,
} from "thirdweb";
import { getRpcClient } from "thirdweb/rpc";
import { createWallet, injectedProvider } from "thirdweb/wallets";
import { toWei, getAddress, toEther } from "thirdweb/utils";
import {
  CONTRACT_ADDRESSES,
  THIRDWEB_CONFIG,
  activeChain,
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
    if (!THIRDWEB_CONFIG.clientId) {
      console.error("Thirdweb client ID not configured");
      return;
    }

    this.client = createThirdwebClient({
      clientId: THIRDWEB_CONFIG.clientId,
    });
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
    try {
      if (!this.client || !this.wallet) {
        throw new BlockchainError(BLOCKCHAIN_ERRORS.WALLET_NOT_CONNECTED);
      }

      // Validate addresses
      if (
        !validateAddress(params.clientAddress) ||
        !validateAddress(params.providerAddress)
      ) {
        throw new BlockchainError("Invalid wallet address");
      }

      // Validate factory contract address
      if (!validateAddress(CONTRACT_ADDRESSES.escrowFactory)) {
        throw new BlockchainError(BLOCKCHAIN_ERRORS.CONTRACT_NOT_DEPLOYED);
      }

      // Get factory contract
      const factoryContract = getContract({
        client: this.client,
        chain: activeChain,
        address: CONTRACT_ADDRESSES.escrowFactory,
      });

      // Convert amount to wei
      const amountInWei = toWei(params.amount);

      // Prepare transaction
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

      // Send transaction
      const result = await sendTransaction({
        transaction,
        account: await this.wallet.getAccount(),
      });

      // Wait for confirmation
      const receipt = await waitForReceipt({
        client: this.client,
        chain: activeChain,
        transactionHash: result.transactionHash,
        confirmations: TX_CONFIG.confirmationBlocks,
      });

      logTransaction("Escrow deployed", result.transactionHash);

      // Get deployed escrow address from events
      const escrowAddress = await this.getEscrowAddress(params.contractId);
      return escrowAddress;
    } catch (error: any) {
      console.error("Error deploying escrow contract:", error);
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
        chain: activeChain,
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
        chain: activeChain,
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
        chain: activeChain,
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
    try {
      if (!this.client) {
        throw new BlockchainError("Thirdweb client not initialized");
      }

      const factoryContract = getContract({
        client: this.client,
        chain: activeChain,
        address: CONTRACT_ADDRESSES.escrowFactory,
      });

      const address = await readContract({
        contract: factoryContract,
        method:
          "function getEscrowAddress(string memory _contractId) view returns (address)",
        params: [contractId],
      });

      return address as string;
    } catch (error) {
      console.error("Error getting escrow address:", error);
      return null;
    }
  }

  // Get escrow contract details
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
