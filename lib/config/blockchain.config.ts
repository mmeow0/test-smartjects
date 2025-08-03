import { defineChain } from "thirdweb";
import { polygon, polygonAmoy } from "thirdweb/chains";

// Environment check
const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

// Chain configuration
export const activeChain = isDevelopment ? polygonAmoy : polygon;

// Contract addresses (update after deployment)
export const CONTRACT_ADDRESSES = {
  escrowFactory: process.env.NEXT_PUBLIC_ESCROW_FACTORY_ADDRESS || "",
} as const;

// Thirdweb configuration
export const THIRDWEB_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
  secretKey: process.env.THIRDWEB_SECRET_KEY || "", // Only for server-side
} as const;

// Gas configuration
export const GAS_CONFIG = {
  maxPriorityFeePerGas: BigInt(30000000000), // 30 gwei
  maxFeePerGas: BigInt(50000000000), // 50 gwei
} as const;

// Platform fee configuration (must match smart contract)
export const PLATFORM_FEE = {
  percentage: 2.5, // 2.5%
  basisPoints: 250, // 250 basis points
} as const;

// Transaction timeouts and retries
export const TX_CONFIG = {
  confirmationBlocks: 3,
  confirmationTimeout: 60000, // 60 seconds
  maxRetries: 3,
  retryDelay: 2000, // 2 seconds
} as const;

// Supported networks for wallet connection
export const SUPPORTED_CHAINS = [polygon, polygonAmoy] as const;

// Block explorer URLs
export const BLOCK_EXPLORER_URLS = {
  [polygon.id]: "https://polygonscan.com",
  [polygonAmoy.id]: "https://amoy.polygonscan.com",
} as const;

// RPC URLs (fallback if Thirdweb RPC fails)
export const RPC_URLS = {
  [polygon.id]: process.env.NEXT_PUBLIC_POLYGON_RPC_URL || "https://polygon-rpc.com",
  [polygonAmoy.id]: process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
} as const;

// Validation helpers
export const validateAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const validateContractAddress = (): boolean => {
  return validateAddress(CONTRACT_ADDRESSES.escrowFactory);
};

// Error messages
export const BLOCKCHAIN_ERRORS = {
  WALLET_NOT_CONNECTED: "Please connect your wallet to continue",
  WRONG_NETWORK: `Please switch to ${activeChain.name}`,
  INSUFFICIENT_BALANCE: "Insufficient balance to complete this transaction",
  TRANSACTION_FAILED: "Transaction failed. Please try again",
  CONTRACT_NOT_DEPLOYED: "Smart contract not deployed on this network",
  USER_REJECTED: "Transaction was rejected by user",
  NETWORK_ERROR: "Network error. Please check your connection",
} as const;

// Helper function to get transaction URL
export const getTransactionUrl = (txHash: string): string => {
  const baseUrl = BLOCK_EXPLORER_URLS[activeChain.id];
  return `${baseUrl}/tx/${txHash}`;
};

// Helper function to get address URL
export const getAddressUrl = (address: string): string => {
  const baseUrl = BLOCK_EXPLORER_URLS[activeChain.id];
  return `${baseUrl}/address/${address}`;
};

// Export chain ID for easy access
export const ACTIVE_CHAIN_ID = activeChain.id;

// Development helpers
export const logTransaction = (action: string, txHash: string) => {
  if (isDevelopment) {
    console.log(`[Blockchain] ${action}:`, getTransactionUrl(txHash));
  }
};
