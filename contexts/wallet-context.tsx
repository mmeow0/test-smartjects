"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
} from "react";
import {
  useActiveAccount,
  useActiveWallet,
  useWalletBalance,
  useDisconnect,
  useConnectedWallets,
  useSwitchActiveWalletChain,
} from "thirdweb/react";
import { client } from "@/app/thirdweb/client";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Chain } from "thirdweb/chains";
import {
  setActiveWallet,
  clearActiveWallet,
} from "@/lib/utils/thirdweb-wallet";

interface WalletContextType {
  // State
  address: string | undefined;
  isConnected: boolean;
  balance: string | null;
  chain: Chain | undefined;
  wallet: any;
  account: any;

  // Multiple wallets
  connectedWallets: any[];

  // Actions
  disconnectWallet: () => Promise<void>;
  switchChain: (chain: Chain) => Promise<void>;

  // Utilities
  copyAddress: () => Promise<void>;
  truncateAddress: (address: string) => string;
  openExplorer: () => void;
  formatBalance: (value: string, decimals?: number) => string;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const connectedWallets = useConnectedWallets();
  const { disconnect } = useDisconnect();
  const switchChain = useSwitchActiveWalletChain();
  const { toast } = useToast();

  const chain = wallet?.getChain();
  const address = account?.address;
  const isConnected = !!address;

  // Get wallet balance
  const { data: balanceData } = useWalletBalance({
    client,
    chain,
    address,
  });

  const balance = balanceData
    ? `${balanceData.displayValue} ${balanceData.symbol}`
    : null;

  // Store active wallet and account in utility
  useEffect(() => {
    setActiveWallet(wallet ?? null, account);
  }, [wallet, account]);

  // Update database when wallet connects/disconnects
  useEffect(() => {
    const updateDatabase = async () => {
      try {
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
      } catch (error) {
        console.error("Error updating wallet in database:", error);
      }
    };

    updateDatabase();
  }, [address]);

  const disconnectWallet = useCallback(async () => {
    if (!wallet) return;

    try {
      await disconnect(wallet);
      clearActiveWallet();

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
  }, [wallet, disconnect, toast]);

  const switchToChain = useCallback(
    async (targetChain: Chain) => {
      if (!wallet) {
        toast({
          title: "No wallet connected",
          description: "Please connect a wallet first.",
          variant: "destructive",
        });
        return;
      }

      try {
        await switchChain(targetChain);
        toast({
          title: "Chain switched",
          description: `Switched to ${targetChain.name}`,
        });
      } catch (error) {
        console.error("Error switching chain:", error);
        toast({
          title: "Error",
          description: "Failed to switch chain. Please try again.",
          variant: "destructive",
        });
      }
    },
    [wallet, switchChain, toast],
  );

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
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  const openExplorer = useCallback(() => {
    if (!address || !chain) return;

    let explorerUrl = "";

    // Get explorer URL from chain if available
    if (chain.blockExplorers && chain.blockExplorers.length > 0) {
      const explorer = chain.blockExplorers[0];
      explorerUrl = `${explorer.url}/address/${address}`;
    } else {
      // Fallback to common explorers
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
        case 11155111: // Sepolia
          explorerUrl = `https://sepolia.etherscan.io/address/${address}`;
          break;
        default:
          // Generic fallback
          explorerUrl = `https://etherscan.io/address/${address}`;
      }
    }

    window.open(explorerUrl, "_blank", "noopener,noreferrer");
  }, [address, chain]);

  const formatBalance = useCallback((value: string, decimals: number = 4) => {
    if (!value) return "0";

    const num = parseFloat(value);
    if (isNaN(num)) return "0";

    if (num === 0) return "0";
    if (num < 0.0001) return "< 0.0001";

    return num.toFixed(decimals);
  }, []);

  const value: WalletContextType = {
    address,
    isConnected,
    balance,
    chain,
    wallet,
    account,
    connectedWallets,
    disconnectWallet,
    switchChain: switchToChain,
    copyAddress,
    truncateAddress,
    openExplorer,
    formatBalance,
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

// Export additional utility hooks
export function useWalletAddress() {
  const { address } = useWallet();
  return address;
}

export function useIsWalletConnected() {
  const { isConnected } = useWallet();
  return isConnected;
}

export function useWalletChain() {
  const { chain } = useWallet();
  return chain;
}

export function useWalletUtils() {
  const { copyAddress, truncateAddress, openExplorer, formatBalance } =
    useWallet();
  return { copyAddress, truncateAddress, openExplorer, formatBalance };
}
