"use client";

import React from "react";
import { useActiveAccount, useActiveWallet } from "thirdweb/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wallet,
  CheckCircle,
  AlertCircle,
  Loader2,
  Wifi,
  WifiOff
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WalletStatusProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "badge" | "button" | "minimal";
  showAddress?: boolean;
  showBalance?: boolean;
  onClick?: () => void;
}

export function WalletStatus({
  className,
  size = "md",
  variant = "badge",
  showAddress = false,
  showBalance = false,
  onClick
}: WalletStatusProps) {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const isConnected = !!account;
  const isConnecting = wallet && !account;

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-xs px-2 py-1";
      case "lg":
        return "text-sm px-4 py-2";
      default:
        return "text-sm px-3 py-1.5";
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "sm":
        return "h-3 w-3";
      case "lg":
        return "h-5 w-5";
      default:
        return "h-4 w-4";
    }
  };

  const renderIcon = () => {
    if (isConnecting) {
      return <Loader2 className={cn(getIconSize(), "animate-spin")} />;
    }

    if (isConnected) {
      return <CheckCircle className={cn(getIconSize(), "text-green-500")} />;
    }

    return <WifiOff className={cn(getIconSize(), "text-gray-500")} />;
  };

  const getStatusText = () => {
    if (isConnecting) return "Connecting...";
    if (isConnected) return "Connected";
    return "Disconnected";
  };

  const getStatusColor = () => {
    if (isConnecting) return "default";
    if (isConnected) return "default";
    return "secondary";
  };

  // Minimal variant - just icon
  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center", className)} onClick={onClick}>
        {renderIcon()}
      </div>
    );
  }

  // Button variant
  if (variant === "button") {
    return (
      <Button
        variant="outline"
        size={size}
        className={cn("gap-2", getSizeClasses(), className)}
        onClick={onClick}
      >
        {renderIcon()}
        <span>{getStatusText()}</span>
        {showAddress && account && (
          <span className="font-mono text-xs text-muted-foreground">
            {truncateAddress(account.address)}
          </span>
        )}
      </Button>
    );
  }

  // Badge variant (default)
  return (
    <Badge
      variant={getStatusColor()}
      className={cn(
        "flex items-center gap-1.5 cursor-pointer transition-colors",
        getSizeClasses(),
        isConnected && "bg-green-50 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:hover:bg-green-950/30 dark:border-green-800",
        isConnecting && "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:hover:bg-blue-950/30 dark:border-blue-800",
        !isConnected && !isConnecting && "bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:hover:bg-gray-950/30 dark:border-gray-800",
        className
      )}
      onClick={onClick}
    >
      {renderIcon()}
      <span>{getStatusText()}</span>
      {showAddress && account && (
        <>
          <span className="text-muted-foreground">•</span>
          <span className="font-mono text-xs">
            {truncateAddress(account.address)}
          </span>
        </>
      )}
    </Badge>
  );
}

// Quick status variants for common use cases
export function WalletStatusBadge(props: Omit<WalletStatusProps, "variant">) {
  return <WalletStatus {...props} variant="badge" />;
}

export function WalletStatusButton(props: Omit<WalletStatusProps, "variant">) {
  return <WalletStatus {...props} variant="button" />;
}

export function WalletStatusIcon(props: Omit<WalletStatusProps, "variant">) {
  return <WalletStatus {...props} variant="minimal" />;
}
