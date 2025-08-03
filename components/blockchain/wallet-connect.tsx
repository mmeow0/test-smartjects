"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Wallet, LogOut, Copy, ExternalLink, Loader2 } from "lucide-react"
import { blockchainService } from "@/lib/services/blockchain.service"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { activeChain, getAddressUrl } from "@/lib/config/blockchain.config"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface WalletConnectProps {
  onConnect?: (address: string) => void
  onDisconnect?: () => void
  compact?: boolean
}

export function WalletConnect({ onConnect, onDisconnect, compact = false }: WalletConnectProps) {
  const { toast } = useToast()
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [isUpdatingDb, setIsUpdatingDb] = useState(false)

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkWalletConnection()
  }, [])

  // Load balance when wallet is connected
  useEffect(() => {
    if (walletAddress) {
      loadBalance()
    }
  }, [walletAddress])

  const checkWalletConnection = async () => {
    try {
      const address = await blockchainService.getWalletAddress()
      if (address) {
        setWalletAddress(address)
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
          setWalletAddress(data.wallet_address)
        }
      }
    } catch (error) {
      console.error("Error loading user wallet:", error)
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)

    try {
      const address = await blockchainService.connectWallet()

      if (address) {
        setWalletAddress(address)

        // Update user's wallet address in database
        await updateUserWallet(address)

        toast({
          title: "Wallet connected",
          description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
        })

        onConnect?.(address)
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const updateUserWallet = async (address: string) => {
    setIsUpdatingDb(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { error } = await supabase
          .from("users")
          .update({
            wallet_address: address,
            wallet_connected_at: new Date().toISOString(),
          })
          .eq("id", user.id)

        if (error) {
          console.error("Error updating wallet address:", error)
        }
      }
    } catch (error) {
      console.error("Error updating user wallet:", error)
    } finally {
      setIsUpdatingDb(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      // Clear wallet address from state
      setWalletAddress(null)
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

      onDisconnect?.()
    } catch (error) {
      console.error("Error disconnecting wallet:", error)
      toast({
        title: "Error",
        description: "Failed to disconnect wallet",
        variant: "destructive",
      })
    }
  }

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
      toast({
        title: "Copied",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Compact view for navbar
  if (compact && walletAddress) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Wallet className="h-4 w-4" />
            {formatAddress(walletAddress)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">Connected Wallet</p>
              <p className="text-xs text-muted-foreground">{formatAddress(walletAddress)}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyAddress}>
            <Copy className="mr-2 h-4 w-4" />
            Copy address
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => window.open(getAddressUrl(walletAddress), "_blank")}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View on explorer
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDisconnect} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (compact && !walletAddress) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleConnect}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wallet className="h-4 w-4" />
        )}
        <span className="ml-2">Connect Wallet</span>
      </Button>
    )
  }

  // Full card view
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Connection
        </CardTitle>
        <CardDescription>
          Connect your wallet to enable blockchain features
        </CardDescription>
      </CardHeader>
      <CardContent>
        {walletAddress ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Connected to</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm">{formatAddress(walletAddress)}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={copyAddress}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => window.open(getAddressUrl(walletAddress), "_blank")}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-50">
                Connected
              </Badge>
            </div>

            {balance && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="font-medium">{balance} {activeChain.nativeCurrency?.symbol}</p>
              </div>
            )}

            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleDisconnect}
                disabled={isUpdatingDb}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Disconnect Wallet
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-medium mb-2">Why connect your wallet?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Secure contract execution on blockchain</li>
                <li>• Automated escrow payments</li>
                <li>• Transparent transaction history</li>
                <li>• Decentralized dispute resolution</li>
              </ul>
            </div>

            <Button
              className="w-full"
              onClick={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect MetaMask
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              We support {activeChain.name} network
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
