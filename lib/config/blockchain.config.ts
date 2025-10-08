import { defineChain } from "thirdweb";

// Hardhat local chain configuration - ONLY NETWORK SUPPORTED
export const hardhatChain = defineChain({
  id: 31337,
  name: "Hardhat Local",
  network: "hardhat",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpc: "http://127.0.0.1:8545",
  testnet: true,
  chain: "ETH",
  shortName: "hardhat",
  slug: "hardhat",
  blockExplorers: {
    default: {
      name: "Hardhat",
      url: "http://localhost:8545",
    },
  },
});

// Active chain - ONLY HARDHAT
export const activeChain = hardhatChain;

// Contract addresses - ONLY MARKETPLACE
export const CONTRACT_ADDRESSES = {
  // SmartjectsMarketplace contract (deployed on hardhat)
  smartjectsMarketplace:
    process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS ||
    "",
} as const;

// ThirdWeb configuration
export const THIRDWEB_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
  secretKey: process.env.THIRDWEB_SECRET_KEY || "", // Only for server-side
} as const;

// Gas configuration (optimized for local Hardhat)
export const GAS_CONFIG = {
  maxPriorityFeePerGas: BigInt(1000000000), // 1 gwei for local
  maxFeePerGas: BigInt(2000000000), // 2 gwei for local
} as const;

// Platform fee configuration (must match smart contract)
export const PLATFORM_FEE = {
  percentage: 2.5, // 2.5%
  basisPoints: 250, // 250 basis points
} as const;

// Transaction timeouts and retries (faster for local)
export const TX_CONFIG = {
  confirmationBlocks: 1, // Just 1 block for local development
  confirmationTimeout: 15000, // 15 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second
} as const;

// Supported networks - ONLY HARDHAT
export const SUPPORTED_CHAINS = [hardhatChain] as const;

// RPC URLs
export const RPC_URLS = {
  [hardhatChain.id]:
    process.env.NEXT_PUBLIC_HARDHAT_RPC_URL || "http://127.0.0.1:8545",
} as const;

// Configure chain
export const configuredChain = {
  ...activeChain,
  id: 31337,
  chainId: 31337,
  rpc: RPC_URLS[activeChain.id],
};

// Validation helpers
export const validateAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const validateContractAddress = (): boolean => {
  return validateAddress(CONTRACT_ADDRESSES.smartjectsMarketplace);
};

// Error messages
export const BLOCKCHAIN_ERRORS = {
  WALLET_NOT_CONNECTED: "Please connect your wallet to continue",
  WRONG_NETWORK: `Please switch to ${activeChain.name} (Chain ID: ${activeChain.id})`,
  INSUFFICIENT_BALANCE: "Insufficient balance to complete this transaction",
  TRANSACTION_FAILED: "Transaction failed. Please try again",
  CONTRACT_NOT_DEPLOYED:
    "SmartjectsMarketplace contract not deployed on Hardhat",
  USER_REJECTED: "Transaction was rejected by user",
  NETWORK_ERROR:
    "Network error. Please check your connection and ensure Hardhat node is running",
} as const;

// Helper function to get transaction URL (no explorer for Hardhat)
export const getTransactionUrl = (txHash: string): string => {
  return `http://localhost:8545/tx/${txHash}`;
};

// Helper function to get address URL (no explorer for Hardhat)
export const getAddressUrl = (address: string): string => {
  return `http://localhost:8545/address/${address}`;
};

// Export chain ID for easy access
export const ACTIVE_CHAIN_ID = activeChain.id;

// Development helpers
export const logTransaction = (action: string, txHash: string) => {
  console.log(`[Blockchain] ${action}:`, txHash);
};

// Marketplace specific helpers
export const isMarketplaceDeployed = (): boolean => {
  return validateAddress(CONTRACT_ADDRESSES.smartjectsMarketplace);
};

export const getMarketplaceAddress = (): string => {
  return CONTRACT_ADDRESSES.smartjectsMarketplace;
};

// Environment checks
export const isHardhatNetwork = (): boolean => {
  return activeChain.id === 31337;
};

export const isLocalDevelopment = (): boolean => {
  return process.env.NODE_ENV === "development" && isHardhatNetwork();
};

// Hardhat network validation
export const validateHardhatConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(RPC_URLS[hardhatChain.id], {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_chainId",
        params: [],
        id: 1,
      }),
    });

    const data = await response.json();
    const chainId = parseInt(data.result, 16);

    return chainId === 31337;
  } catch (error) {
    console.error("Failed to validate Hardhat connection:", error);
    return false;
  }
};

// Setup instructions
export const SETUP_INSTRUCTIONS = {
  hardhat: [
    "1. Start Hardhat node: npx hardhat node",
    "2. Add network to MetaMask with Chain ID: 1337",
    "3. Import test account private key to MetaMask",
    "4. Set NEXT_PUBLIC_THIRDWEB_CLIENT_ID in .env.local",
  ],
  environment: [
    "NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "NEXT_PUBLIC_HARDHAT_RPC_URL=http://127.0.0.1:8545",
    "NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id",
    "THIRDWEB_SECRET_KEY=your_secret_key",
  ],
} as const;

// Export configuration check helpers
import {
  checkBlockchainConfig,
  logBlockchainConfig,
} from "@/lib/utils/blockchain-config-check";
export { checkBlockchainConfig, logBlockchainConfig };
