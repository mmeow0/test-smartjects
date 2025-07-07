"use client";

import React from "react";
import { ConnectButton, useActiveAccount, useActiveWallet, useWalletBalance } from "thirdweb/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wallet,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Coins,
  Shield,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { client } from "@/app/thirdweb/client";

interface WalletConnectionProps {
  className?: string;
}

export function WalletConnection({ className }: WalletConnectionProps) {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const chain = wallet?.getChain();
  const { data: balance, isLoading: balanceLoading } = useWalletBalance({
    client,
    chain,
    address: account?.address,
  });
  const { toast } = useToast();

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
      // You can customize this URL based on the chain
      const explorerUrl = `https://etherscan.io/address/${account.address}`;
      window.open(explorerUrl, '_blank');
    }
  };

  return (
    <div className={className}>
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Web3 Wallet</CardTitle>
            </div>
            {account && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Connected
              </Badge>
            )}
          </div>
          <CardDescription>
            {account
              ? "Your wallet is connected and ready to use"
              : "Connect your wallet to access Web3 features"
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Connection Status */}
          <div className="flex justify-center">
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
                },
              }}
              detailsButton={{
                style: {
                  background: "hsl(var(--secondary))",
                  color: "hsl(var(--secondary-foreground))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                },
              }}
            />
          </div>

          {account && (
            <>
              <Separator />

              {/* Wallet Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Address Card */}
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">
                            Wallet Address
                          </p>
                          <p className="font-mono text-sm">
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
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={openExplorer}
                            className="h-8 w-8 p-0"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Balance Card */}
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Coins className="h-4 w-4" />
                            Balance
                          </p>
                          {balanceLoading ? (
                            <Skeleton className="h-4 w-20" />
                          ) : (
                            <p className="font-semibold">
                              {balance?.displayValue || "0"} {balance?.symbol || "ETH"}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Network Info */}
                {chain && (
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Zap className="h-4 w-4" />
                            Network
                          </p>
                          <p className="font-semibold">
                            {chain.name || "Unknown Network"}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-background/50">
                          Chain ID: {chain.id}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Security Notice */}
                <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                      Security Reminder
                    </p>
                    <p className="text-xs text-orange-700 dark:text-orange-300">
                      Never share your private keys or seed phrase. Always verify transaction details before signing.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* No Wallet Connected State */}
          {!account && (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Wallet className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">No Wallet Connected</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Connect your wallet to access Web3 features, view your balance, and interact with blockchain applications.
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
                  Coinbase Wallet
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
