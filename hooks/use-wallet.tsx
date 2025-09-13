"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet as useWalletContext } from "@/contexts/wallet-context";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface UseWalletReturn {
  address: string | null;
  balance: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  connect: () => Promise<string | null>;
  disconnect: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}

export function useWallet(): UseWalletReturn {
  const { toast } = useToast();
  const {
    address: contextAddress,
    balance: contextBalance,
    isConnected: contextIsConnected,
    disconnectWallet: contextDisconnect,
  } = useWalletContext();

  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  // Sync with context values
  useEffect(() => {
    setAddress(contextAddress || null);
    setBalance(contextBalance);
  }, [contextAddress, contextBalance]);

  // Load user wallet from database on mount
  useEffect(() => {
    loadUserWallet();
  }, []);

  const loadUserWallet = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("users")
          .select("wallet_address")
          .eq("id", user.id)
          .single();

        if (data?.wallet_address && !contextAddress) {
          // Wallet address exists in DB but not connected
          // This will be handled by thirdweb's autoConnect
          console.log("Wallet address in DB:", data.wallet_address);
        }
      }
    } catch (error) {
      console.error("Error loading user wallet:", error);
    }
  };

  const connect = useCallback(async (): Promise<string | null> => {
    setIsConnecting(true);

    try {
      // The actual connection is handled by the ConnectButton component
      // This function is mainly for compatibility with existing code
      // We just need to wait for the wallet to be connected

      // Show a message to the user
      toast({
        title: "Connect Wallet",
        description:
          "Please use the Connect Wallet button to connect your wallet.",
      });

      // Wait a bit and check if wallet got connected
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (contextAddress) {
            clearInterval(checkInterval);
            setIsConnecting(false);

            toast({
              title: "Wallet connected",
              description: `Connected to ${contextAddress.slice(0, 6)}...${contextAddress.slice(-4)}`,
            });

            resolve(contextAddress);
          }
        }, 500);

        // Timeout after 30 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          setIsConnecting(false);
          resolve(null);
        }, 30000);
      });
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
      setIsConnecting(false);
      return null;
    }
  }, [contextAddress, toast]);

  const disconnect = useCallback(async () => {
    try {
      await contextDisconnect();

      // Clear wallet address from state
      setAddress(null);
      setBalance(null);

      // Clear from database
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("users")
          .update({
            wallet_address: null,
            wallet_connected_at: null,
          })
          .eq("id", user.id);
      }
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect wallet",
        variant: "destructive",
      });
    }
  }, [contextDisconnect, toast]);

  const refreshBalance = useCallback(async () => {
    // Balance is automatically refreshed by the context
    // This is just for compatibility
    if (contextBalance) {
      setBalance(contextBalance);
    }
  }, [contextBalance]);

  return {
    address,
    balance,
    isConnecting,
    isConnected: contextIsConnected,
    connect,
    disconnect,
    refreshBalance,
  };
}
