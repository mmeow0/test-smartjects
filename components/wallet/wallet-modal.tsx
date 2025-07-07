"use client";

import React, { useState } from "react";
import { ConnectButton, useActiveAccount, useActiveWallet, useWalletBalance } from "thirdweb/react";
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
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { client } from "@/app/thirdweb/client";
import { cn } from "@/lib/utils";

interface WalletModalProps {
  trigger?: React.ReactNode;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

export function WalletModal({ trigger, className, onOpenChange }: WalletModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const chain = wallet?.getChain();
  const { data: balance, isLoading: balanceLoading } = useWalletBalance({
    client,
    chain,
    address: account?.address,
  });
  const { toast } = useToast();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

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

  const isConnected = !!account;

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "gap-2 transition-all duration-200 hover:shadow-md",
        isConnected && "border-green-500 bg-green-100 hover:bg-green-150",
        className
      )}
    >
      <Wallet className="h-4 w-4" />
      <span className="hidden sm:inline">
        {isConnected ? "Connected" : "Connect Wallet"}
      </span>
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <DialogTitle>Web3 Wallet</DialogTitle>
            </div>
            {account && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Connected
              </Badge>
            )}
          </div>
          <DialogDescription>
            {account
              ? "Your wallet is connected and ready to use"
              : "Connect your wallet to access Web3 features"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Connection Button */}
          <div className="flex justify-center py-2">
            <ConnectButton
              client={client}
              theme="light"
              connectButton={{
                label: "Connect Wallet",
                style: {
                  background: "hsl(var(--primary))",
                  color: "hsl(var(--primary-foreground))",
                  border: "none",
                  borderRadius: "6px",
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: "500",
                  minWidth: "160px",
                },
              }}
              detailsButton={{
                style: {
                  background: "hsl(var(--secondary))",
                  color: "hsl(var(--secondary-foreground))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  minWidth: "160px",
                },
              }}
            />
          </div>

          {account ? (
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
                        {balanceLoading ? (
                          <Skeleton className="h-4 w-20" />
                        ) : (
                          <p className="font-semibold text-sm">
                            {balance?.displayValue || "0"} {balance?.symbol || "ETH"}
                          </p>
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
                  onClick={() => wallet?.disconnect()}
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
          ) : (
            /* No Wallet Connected */
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
