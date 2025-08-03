"use client";

import React, { useState } from "react";
import { ConnectButton } from "thirdweb/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wallet,
  Copy,
  ExternalLink,
  CheckCircle,
  Shield,
  Coins,
  Zap,
  X,
  Settings,
  LogOut,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Chrome,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/contexts/wallet-context";
import { client } from "@/app/thirdweb/client";
import { cn } from "@/lib/utils";

interface WalletModalProps {
  trigger?: React.ReactNode;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

interface WalletOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  description?: string;
}

const WALLET_OPTIONS: WalletOption[] = [
  {
    id: "io.metamask",
    name: "MetaMask",
    icon: (
      <svg width="24" height="24" viewBox="0 0 212 189" className="w-6 h-6">
        <g fill="none" fillRule="evenodd">
          <polygon
            fill="#CDBDB2"
            points="60.75 173.25 88.313 180.563 88.313 171 90.563 168.75 106.313 168.75 106.313 180 106.313 187.875 89.438 187.875 68.625 178.875"
          />
          <polygon
            fill="#CDBDB2"
            points="105.75 173.25 132.75 180.563 132.75 171 135 168.75 150.75 168.75 150.75 180 150.75 187.875 133.875 187.875 113.063 178.875"
          />
          <polygon
            fill="#393939"
            points="90.563 152.438 88.313 171 91.125 168.75 120.375 168.75 123.75 171 121.5 152.438 117 149.625 94.5 150.188"
          />
          <polygon
            fill="#F89C35"
            points="75.375 27 88.875 58.125 95.063 150.188 117 150.188 123.75 58.125 136.125 27"
          />
          <polygon
            fill="#F89D35"
            points="16.313 96.188 0.563 141.75 39.938 139.5 65.25 139.5 65.25 119.813 64.125 79.313 58.5 83.813"
          />
          <polygon
            fill="#D87C30"
            points="46.125 101.25 92.25 102.375 87.188 126 65.25 120.375"
          />
          <polygon
            fill="#EA8D3A"
            points="46.125 101.813 65.25 119.813 65.25 137.813"
          />
          <polygon
            fill="#F89D35"
            points="65.25 120.375 87.75 126 95.063 150.188 90 153 65.25 138.375"
          />
          <polygon
            fill="#EB8F35"
            points="65.25 138.375 60.75 173.25 90.563 152.438"
          />
          <polygon
            fill="#EA8E3A"
            points="92.25 102.375 95.063 150.188 86.625 125.719"
          />
          <polygon
            fill="#D87C30"
            points="39.375 138.938 65.25 138.375 60.75 173.25"
          />
          <polygon
            fill="#EB8F35"
            points="12.938 188.438 60.75 173.25 39.375 138.938 0.563 141.75"
          />
          <polygon
            fill="#E8821E"
            points="88.875 58.125 64.688 78.75 46.125 101.25 92.25 102.938"
          />
          <polygon
            fill="#393939"
            points="60.75 173.25 90.563 152.438 88.313 170.438 88.313 180.563 68.063 176.625"
          />
          <polygon
            fill="#E88F35"
            points="12.375 0.563 88.875 58.125 75.938 27"
          />
          <path
            fill="#8E5A30"
            d="M12.3750002,0.562500008 L2.25000003,31.5000005 L7.87500012,65.250001 L3.93750006,67.500001 L9.56250014,72.5625 L5.06250008,76.5000011 L11.25,82.1250012 L7.31250011,85.5000013 L16.3125002,96.7500014 L58.5000009,83.8125012 C79.1250012,67.3125004 89.2500013,58.8750003 88.8750013,58.1250003 C88.5000013,57.3750002 63.0000009,38.8125 12.3750002,0.562500008 Z"
          />
        </g>
      </svg>
    ),
    description: "Connect using MetaMask wallet",
  },
  {
    id: "com.coinbase.wallet",
    name: "Coinbase Wallet",
    icon: (
      <svg width="24" height="24" viewBox="0 0 32 32" className="w-6 h-6">
        <g fill="none" fillRule="evenodd">
          <circle cx="16" cy="16" fill="#1652f0" r="16" />
          <path
            fill="#fff"
            d="M12.528 16.944v-1.892c0-1.028.84-1.864 1.876-1.864h6.044c.518 0 .936.416.936.928s-.418.928-.936.928h-6.044v1.9h6.044c1.036 0 1.876.836 1.876 1.864v1.892c0 1.028-.84 1.864-1.876 1.864h-6.044a1.871 1.871 0 0 1-1.876-1.864v-3.756zm1.876 3.748h6.044v-1.884h-6.044v1.884z"
          />
        </g>
      </svg>
    ),
    description: "Connect using Coinbase Wallet",
  },
  {
    id: "walletConnect",
    name: "WalletConnect",
    icon: (
      <svg width="24" height="24" viewBox="0 0 300 185" className="w-6 h-6">
        <path
          fill="#3B99FC"
          d="M61.439 36.256c48.91-47.888 128.212-47.888 177.123 0l5.886 5.764a6.041 6.041 0 0 1 0 8.67l-20.136 19.716a3.179 3.179 0 0 1-4.428 0l-8.101-7.931c-34.122-33.408-89.444-33.408-123.566 0l-8.675 8.494a3.179 3.179 0 0 1-4.428 0L54.978 51.253a6.041 6.041 0 0 1 0-8.67l6.46-6.327zM280.206 77.03l17.922 17.547a6.041 6.041 0 0 1 0 8.67l-80.81 79.122c-2.446 2.394-6.41 2.394-8.856 0l-57.354-56.155a1.59 1.59 0 0 0-2.214 0l-57.353 56.155c-2.446 2.394-6.411 2.394-8.857 0L1.875 103.247a6.041 6.041 0 0 1 0-8.671l17.922-17.547c2.445-2.394 6.41-2.394 8.856 0l57.354 56.155a1.59 1.59 0 0 0 2.214 0l57.353-56.155c2.446-2.394 6.41-2.394 8.857 0l57.354 56.155a1.59 1.59 0 0 0 2.214 0l57.353-56.155c2.446-2.394 6.411-2.394 8.857 0z"
        />
      </svg>
    ),
    description: "Connect using WalletConnect",
  },
];

export function WalletModal({
  trigger,
  className,
  onOpenChange,
}: WalletModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const {
    address,
    isConnected,
    isConnecting,
    balance,
    chain,
    connectWallet,
    disconnectWallet,
    copyAddress,
    truncateAddress,
    openExplorer,
  } = useWallet();
  const { toast } = useToast();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setShowWalletOptions(false);
    }
    onOpenChange?.(open);
  };

  const handleConnect = async (walletId?: string) => {
    await connectWallet(walletId);
    // Close modal after successful connection
    if (isConnected) {
      handleOpenChange(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    handleOpenChange(false);
  };

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "gap-2 transition-all duration-200 hover:shadow-md",
        isConnected &&
          "border-green-500 bg-green-50 hover:bg-green-100 dark:bg-green-950/20 dark:hover:bg-green-950/30",
        className,
      )}
    >
      <Wallet className="h-4 w-4" />
      <span className="hidden sm:inline">
        {isConnecting
          ? "Connecting..."
          : isConnected
            ? "Connected"
            : "Connect Wallet"}
      </span>
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <DialogTitle>Web3 Wallet</DialogTitle>
            </div>
            {isConnected && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Connected
              </Badge>
            )}
          </div>
          <DialogDescription>
            {isConnected
              ? "Your wallet is connected and ready to use"
              : "Connect your wallet to access Web3 features"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isConnected ? (
            <>
              {/* Connect Wallet Options */}
              {showWalletOptions ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowWalletOptions(false)}
                    className="mb-2"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>

                  <div className="space-y-2">
                    {WALLET_OPTIONS.map((wallet) => (
                      <Card
                        key={wallet.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleConnect(wallet.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">{wallet.icon}</div>
                            <div className="flex-1">
                              <h4 className="font-medium">{wallet.name}</h4>
                              {wallet.description && (
                                <p className="text-sm text-muted-foreground">
                                  {wallet.description}
                                </p>
                              )}
                            </div>
                            {isConnecting && (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="text-center pt-4">
                    <p className="text-xs text-muted-foreground">
                      By connecting, you agree to our Terms of Service
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Initial Connect Button */}
                  <div className="flex justify-center py-4">
                    <Button
                      onClick={() => setShowWalletOptions(true)}
                      disabled={isConnecting}
                      className="min-w-[200px]"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Wallet className="mr-2 h-4 w-4" />
                          Connect Wallet
                        </>
                      )}
                    </Button>
                  </div>

                  {/* No Wallet Connected State */}
                  <div className="text-center py-6 space-y-4">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      <Wallet className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Connect Your Wallet</h4>
                      <p className="text-sm text-muted-foreground">
                        Access Web3 features and manage your digital assets
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Multiple wallets supported
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Secure connection
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Easy to use
                      </span>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <Separator />

              {/* Wallet Details */}
              <div className="space-y-3">
                {/* Address */}
                <Card className="bg-muted/30">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          Address
                        </p>
                        <p className="font-mono text-sm font-medium">
                          {truncateAddress(address!)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={copyAddress}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={openExplorer}
                          className="h-8 w-8 p-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Balance */}
                <Card className="bg-muted/30">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <Coins className="h-3 w-3" />
                          Balance
                        </p>
                        {balance ? (
                          <p className="font-semibold text-sm">{balance}</p>
                        ) : (
                          <Skeleton className="h-4 w-20" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Network */}
                {chain && (
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            Network
                          </p>
                          <p className="font-semibold text-sm">
                            {chain.name || "Unknown"}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {chain.id}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <Separator />

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => handleOpenChange(false)}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={handleDisconnect}
                >
                  <LogOut className="h-4 w-4" />
                  Disconnect
                </Button>
              </div>

              {/* Security Notice */}
              <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <Shield className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-orange-900 dark:text-orange-100">
                    Security Reminder
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    Never share your private keys or seed phrase with anyone.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
