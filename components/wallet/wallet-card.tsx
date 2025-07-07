"use client";

import React from "react";
import { useActiveAccount, useActiveWallet, useWalletBalance } from "thirdweb/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wallet,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Coins,
  Zap,
  Settings,
  WifiOff,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { client } from "@/app/thirdweb/client";
import { cn } from "@/lib/utils";

interface WalletCardProps {
  className?: string;
  showActions?: boolean;
  showNetwork?: boolean;
  compact?: boolean;
  onConnectClick?: () => void;
  onSettingsClick?: () => void;
}

export function WalletCard({
  className,
  showActions = true,
  showNetwork = true,
  compact = false,
  onConnectClick,
  onSettingsClick
}: WalletCardProps) {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const chain = wallet?.getChain();
  const { data: balance, isLoading: balanceLoading } = useWalletBalance({
    client,
    chain,
    address: account?.address,
  });
  const { toast } = useToast();

  const isConnected = !!account;
  const isConnecting = wallet && !account;

  const copyAddress = async () => {
    if (account?.address) {
      try {
        await navigator.clipboard.writeText(account.address);
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
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const openExplorer = () => {
    if (account?.address && chain) {
      const explorerUrl = `https://etherscan.io/address/${account.address}`;
      window.open(explorerUrl, '_blank');
    }
  };

  const getStatusIcon = () => {
    if (isConnecting) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    if (isConnected) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <WifiOff className="h-4 w-4 text-gray-400" />;
  };

  const getStatusText = () => {
    if (isConnecting) return "Connecting...";
    if (isConnected) return "Connected";
    return "Disconnected";
  };

  const getStatusColor = () => {
    if (isConnecting) return "blue";
    if (isConnected) return "green";
    return "gray";
  };

  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
      <CardHeader className={cn("pb-3", compact && "pb-2")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <CardTitle className={cn("text-lg", compact && "text-base")}>
              Web3 Wallet
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                isConnected && "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800",
                isConnecting && "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800",
                !isConnected && !isConnecting && "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-800"
              )}
            >
              {getStatusText()}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isConnected ? (
          <>
            {/* Wallet Information */}
            <div className="space-y-3">
              {/* Address */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Address
                  </p>
                  <p className="font-mono text-sm font-medium">
                    {truncateAddress(account.address)}
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

              {/* Balance */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Coins className="h-4 w-4" />
                    Balance
                  </p>
                  {balanceLoading ? (
                    <Skeleton className="h-4 w-24" />
                  ) : (
                    <p className="font-semibold text-sm">
                      {balance?.displayValue || "0"} {balance?.symbol || "ETH"}
                    </p>
                  )}
                </div>
              </div>

              {/* Network */}
              {showNetwork && chain && (
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Zap className="h-4 w-4" />
                      Network
                    </p>
                    <p className="font-semibold text-sm">
                      {chain.name || "Unknown Network"}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    ID: {chain.id}
                  </Badge>
                </div>
              )}
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={onSettingsClick}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => wallet?.disconnect()}
                >
                  <WifiOff className="h-4 w-4" />
                  Disconnect
                </Button>
              </div>
            )}
          </>
        ) : (
          /* Not Connected State */
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <Wallet className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">No Wallet Connected</h4>
              <p className="text-sm text-muted-foreground">
                Connect your wallet to access Web3 features
              </p>
            </div>
            {showActions && (
              <Button
                onClick={onConnectClick}
                className="w-full gap-2"
                variant="default"
              >
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </Button>
            )}
            <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                MetaMask
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                WalletConnect
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Coinbase
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
