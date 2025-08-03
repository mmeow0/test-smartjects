"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, LogOut, Copy, ExternalLink, Loader2 } from "lucide-react";
import { useWallet } from "@/contexts/wallet-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WalletConnectProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
  compact?: boolean;
}

export function WalletConnect({
  onConnect,
  onDisconnect,
  compact = false,
}: WalletConnectProps) {
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

  // Call onConnect when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      onConnect?.(address);
    }
  }, [isConnected, address, onConnect]);

  const handleConnect = async () => {
    await connectWallet();
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    onDisconnect?.();
  };

  // Compact view for navbar
  if (compact && isConnected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Wallet className="h-4 w-4" />
            {truncateAddress(address!)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">Connected Wallet</p>
              <p className="text-xs text-muted-foreground">
                {truncateAddress(address!)}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyAddress}>
            <Copy className="mr-2 h-4 w-4" />
            Copy address
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openExplorer}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View on explorer
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDisconnect}
            className="text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (compact && !isConnected) {
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
    );
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
        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Connected to</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm">
                    {truncateAddress(address!)}
                  </p>
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
                    onClick={openExplorer}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <Badge
                variant="outline"
                className="bg-green-50 dark:bg-green-950/20"
              >
                Connected
              </Badge>
            </div>

            {balance && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="font-medium">{balance}</p>
              </div>
            )}

            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleDisconnect}
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
              {chain
                ? `Connected to ${chain.name}`
                : "We support multiple networks"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
