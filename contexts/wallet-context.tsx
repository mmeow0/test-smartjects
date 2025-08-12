"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
import {
  useActiveAccount,
  useActiveWallet,
  useWalletBalance,
  useConnect,
} from "thirdweb/react";
import { createWallet, Wallet } from "thirdweb/wallets";
import { client } from "@/app/thirdweb/client";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface WalletContextType {
  // State
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string | null;
  chain: any;

  // Actions
  connectWallet: (walletId?: string) => Promise<void>;
  disconnectWallet: () => Promise<void>;

  // Utilities
  copyAddress: () => Promise<void>;
  truncateAddress: (address: string) => string;
  openExplorer: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const WALLET_STORAGE_KEY = "smartjects_wallet_connected";
const WALLET_TYPE_KEY = "smartjects_wallet_type";

// Supported wallet types
const SUPPORTED_WALLETS = [
  "io.metamask",
  "com.coinbase.wallet",
  "walletConnect",
  "io.rabby",
  "com.trustwallet.app",
] as const;

type WalletType = (typeof SUPPORTED_WALLETS)[number];

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const chain = wallet?.getChain();
  const { connect } = useConnect();
  const { toast } = useToast();

  const [isConnecting, setIsConnecting] = useState(false);
  const [isAutoReconnecting, setIsAutoReconnecting] = useState(true);

  const { data: balanceData, isLoading: balanceLoading } = useWalletBalance({
    client,
    chain,
    address: account?.address,
  });

  const address = account?.address || null;
  const isConnected = !!address;
  const balance = balanceData
    ? `${balanceData.displayValue} ${balanceData.symbol}`
    : null;

  // Auto-reconnect on mount
  useEffect(() => {
    const autoReconnect = async () => {
      if (!isAutoReconnecting) return;

      const wasConnected = localStorage.getItem(WALLET_STORAGE_KEY);
      const lastWalletType = localStorage.getItem(
        WALLET_TYPE_KEY,
      ) as WalletType;

      if (
        wasConnected === "true" &&
        lastWalletType &&
        !isConnected &&
        !isConnecting
      ) {
        try {
          setIsConnecting(true);

          // Try to reconnect with the last used wallet
          const wallet = createWallet(lastWalletType);

          // Check if wallet is available
          const isAvailable = await isWalletAvailable(lastWalletType);
          if (!isAvailable) {
            throw new Error(`Wallet ${lastWalletType} not available`);
          }

          await connect(async () => {
            await wallet.connect({
              client,
            });
            return wallet;
          });
        } catch (error) {
          console.error("Auto-reconnect failed:", error);
          localStorage.removeItem(WALLET_STORAGE_KEY);
          localStorage.removeItem(WALLET_TYPE_KEY);
        } finally {
          setIsConnecting(false);
          setIsAutoReconnecting(false);
        }
      } else {
        setIsAutoReconnecting(false);
      }
    };

    // Delay auto-reconnect to ensure proper initialization
    const timer = setTimeout(autoReconnect, 100);
    return () => clearTimeout(timer);
  }, [connect, isConnected, isConnecting, isAutoReconnecting]);

  // Update database when wallet connects/disconnects
  useEffect(() => {
    const updateDatabase = async () => {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      if (address) {
        // Update connected wallet
        await supabase
          .from("users")
          .update({
            wallet_address: address,
            wallet_connected_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      } else {
        // Clear wallet connection
        await supabase
          .from("users")
          .update({
            wallet_address: null,
            wallet_connected_at: null,
          })
          .eq("id", user.id);
      }
    };

    updateDatabase();
  }, [address]);

  // Helper function to check if wallet is available
  const isWalletAvailable = async (walletId: WalletType): Promise<boolean> => {
    try {
      if (typeof window === "undefined") return false;

      switch (walletId) {
        case "io.metamask":
          return !!window.ethereum?.isMetaMask;

        case "com.coinbase.wallet":
          return !!(
            window.ethereum?.isCoinbaseWallet || window.coinbaseWalletExtension
          );

        case "io.rabby":
          return !!window.ethereum?.isRabby;

        case "com.trustwallet.app":
          return !!window.ethereum?.isTrust;

        case "walletConnect":
          // WalletConnect doesn't require browser extension
          return true;

        default:
          return false;
      }
    } catch {
      return false;
    }
  };

  const connectWallet = useCallback(
    async (walletId?: string) => {
      if (isConnecting || isConnected) return;

      try {
        setIsConnecting(true);

        // Default to MetaMask if no wallet specified
        const selectedWalletId = (walletId || "io.metamask") as WalletType;

        // Check if wallet is supported
        if (!SUPPORTED_WALLETS.includes(selectedWalletId)) {
          throw new Error(`Unsupported wallet: ${selectedWalletId}`);
        }

        // Check if wallet is available
        const isAvailable = await isWalletAvailable(selectedWalletId);
        if (!isAvailable) {
          let walletName = selectedWalletId;
          switch (selectedWalletId) {
            case "io.metamask":
              walletName = "MetaMask";
              break;
            case "com.coinbase.wallet":
              walletName = "Coinbase Wallet";
              break;
            case "io.rabby":
              walletName = "Rabby";
              break;
            case "com.trustwallet.app":
              walletName = "Trust Wallet";
              break;
          }
          throw new Error(
            `${walletName} is not installed or available. Please install it first.`,
          );
        }

        // Create wallet instance
        const wallet = createWallet(selectedWalletId);

        // Add timeout to prevent infinite loading
        const connectPromise = connect(async () => {
          await wallet.connect({
            client,
          });
          return wallet;
        });

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Connection timeout")), 30000);
        });

        // Race between connection and timeout
        await Promise.race([connectPromise, timeoutPromise]);

        // Save connection state
        localStorage.setItem(WALLET_STORAGE_KEY, "true");
        localStorage.setItem(WALLET_TYPE_KEY, selectedWalletId);

        toast({
          title: "Wallet connected",
          description: "Your wallet has been successfully connected.",
        });
      } catch (error: any) {
        console.error("Error connecting wallet:", error);

        let errorMessage = "Failed to connect wallet. Please try again.";
        if (
          error.message?.includes("User rejected") ||
          error.message?.includes("rejected")
        ) {
          errorMessage = "Connection cancelled by user.";
        } else if (
          error.message?.includes("not installed") ||
          error.message?.includes("not available")
        ) {
          errorMessage = error.message;
        } else if (error.message?.includes("timeout")) {
          errorMessage = "Connection timed out. Please try again.";
        } else if (error.message?.includes("Network Error")) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        }

        toast({
          title: "Connection failed",
          description: errorMessage,
          variant: "destructive",
        });

        localStorage.removeItem(WALLET_STORAGE_KEY);
        localStorage.removeItem(WALLET_TYPE_KEY);
      } finally {
        setIsConnecting(false);
      }
    },
    [connect, isConnecting, isConnected, toast],
  );

  const disconnectWallet = useCallback(async () => {
    if (!wallet) return;

    try {
      await wallet.disconnect();
      localStorage.removeItem(WALLET_STORAGE_KEY);
      localStorage.removeItem(WALLET_TYPE_KEY);

      toast({
        title: "Wallet disconnected",
        description: "Your wallet has been disconnected.",
      });
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect wallet. Please try again.",
        variant: "destructive",
      });
    }
  }, [wallet, toast]);

  const copyAddress = useCallback(async () => {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      toast({
        title: "Address copied!",
        description: "Wallet address has been copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy address to clipboard.",
        variant: "destructive",
      });
    }
  }, [address, toast]);

  const truncateAddress = useCallback((address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  const openExplorer = useCallback(() => {
    if (!address || !chain) return;

    let explorerUrl = "";

    // Determine explorer URL based on chain
    switch (chain.id) {
      case 1: // Ethereum Mainnet
        explorerUrl = `https://etherscan.io/address/${address}`;
        break;
      case 137: // Polygon
        explorerUrl = `https://polygonscan.com/address/${address}`;
        break;
      case 56: // BSC
        explorerUrl = `https://bscscan.com/address/${address}`;
        break;
      case 43114: // Avalanche
        explorerUrl = `https://snowtrace.io/address/${address}`;
        break;
      case 42161: // Arbitrum
        explorerUrl = `https://arbiscan.io/address/${address}`;
        break;
      case 10: // Optimism
        explorerUrl = `https://optimistic.etherscan.io/address/${address}`;
        break;
      default:
        // For testnets and other chains
        if (chain.testnet) {
          explorerUrl = `https://${chain.name?.toLowerCase().replace(/\s+/g, "-") || "unknown"}.etherscan.io/address/${address}`;
        } else {
          explorerUrl = `https://etherscan.io/address/${address}`;
        }
    }

    window.open(explorerUrl, "_blank");
  }, [address, chain]);

  const value: WalletContextType = {
    address,
    isConnected,
    isConnecting: isConnecting || isAutoReconnecting,
    balance,
    chain,
    connectWallet,
    disconnectWallet,
    copyAddress,
    truncateAddress,
    openExplorer,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
