"use client"

import { useState, useEffect, useCallback } from "react"
import { blockchainService } from "@/lib/services/blockchain.service"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface UseWalletReturn {
  address: string | null
  balance: string | null
  isConnecting: boolean
  isConnected: boolean
  connect: () => Promise<string | null>
  disconnect: () => Promise<void>
  refreshBalance: () => Promise<void>
}

export function useWallet(): UseWalletReturn {
  const { toast } = useToast()
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  // Check wallet connection on mount
  useEffect(() => {
    checkWalletConnection()
  }, [])

  // Load balance when address changes
  useEffect(() => {
    if (address) {
      loadBalance()
    }
  }, [address])

  const checkWalletConnection = async () => {
    try {
      const walletAddress = await blockchainService.getWalletAddress()
      if (walletAddress) {
        setAddress(walletAddress)
        await loadUserWallet()
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error)
    }
  }

  const loadBalance = async () => {
    try {
      const walletBalance = await blockchainService.getWalletBalance()
      setBalance(walletBalance)
    } catch (error) {
      console.error("Error loading balance:", error)
    }
  }

  const loadUserWallet = async () => {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from("users")
          .select("wallet_address")
          .eq("id", user.id)
          .single()

        if (data?.wallet_address) {
          setAddress(data.wallet_address)
        }
      }
    } catch (error) {
      console.error("Error loading user wallet:", error)
    }
  }

  const updateUserWallet = async (walletAddress: string) => {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { error } = await supabase
          .from("users")
          .update({
            wallet_address: walletAddress,
            wallet_connected_at: new Date().toISOString(),
          })
          .eq("id", user.id)

        if (error) {
          console.error("Error updating wallet address:", error)
        }
      }
    } catch (error) {
      console.error("Error updating user wallet:", error)
    }
  }

  const connect = useCallback(async (): Promise<string | null> => {
    setIsConnecting(true)

    try {
      const walletAddress = await blockchainService.connectWallet()

      if (walletAddress) {
        setAddress(walletAddress)
        await updateUserWallet(walletAddress)

        toast({
          title: "Wallet connected",
          description: `Connected to ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        })

        return walletAddress
      }

      return null
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      })
      return null
    } finally {
      setIsConnecting(false)
    }
  }, [toast])

  const disconnect = useCallback(async () => {
    try {
      // Clear wallet address from state
      setAddress(null)
      setBalance(null)

      // Clear from database
      const supabase = getSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        await supabase
          .from("users")
          .update({
            wallet_address: null,
            wallet_connected_at: null,
          })
          .eq("id", user.id)
      }

      toast({
        title: "Wallet disconnected",
        description: "Your wallet has been disconnected",
      })
    } catch (error) {
      console.error("Error disconnecting wallet:", error)
      toast({
        title: "Error",
        description: "Failed to disconnect wallet",
        variant: "destructive",
      })
    }
  }, [toast])

  const refreshBalance = useCallback(async () => {
    if (address) {
      await loadBalance()
    }
  }, [address])

  return {
    address,
    balance,
    isConnecting,
    isConnected: !!address,
    connect,
    disconnect,
    refreshBalance,
  }
}
