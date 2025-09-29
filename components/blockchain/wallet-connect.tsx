"use client";

import { ConnectButton } from "thirdweb/react";
import { client } from "@/app/thirdweb/client";
import { createWallet } from "thirdweb/wallets";
import { useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { sepolia, ethereum, polygon, bsc } from "thirdweb/chains";
import { lightTheme } from "thirdweb/react";
import { Chain } from "thirdweb/chains";
import { Wallet } from "lucide-react";

const hardhatChain: Chain = {
  id: 31337,
  name: "Hardhat Local",
  rpc: "http://127.0.0.1:8545",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  blockExplorers: [
    {
      name: "Hardhat Explorer",
      url: "http://127.0.0.1:8545",
    },
  ],
  testnet: true,
};

interface WalletConnectProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
  compact?: boolean;
  showBalance?: boolean;
  className?: string;
}

export function WalletConnect({
  onConnect,
  onDisconnect,
  compact = false,
  showBalance = true,
  className,
}: WalletConnectProps) {
  const { toast } = useToast();

  // Update database when wallet connects/disconnects
  const updateUserWalletInDatabase = async (address: string | null) => {
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

  const handleConnect = async (wallet: any) => {
    try {
      const account = wallet.getAccount();
      if (account?.address) {
        await updateUserWalletInDatabase(account.address);
        onConnect?.(account.address);

        toast({
          title: "Wallet connected",
          description: "Your wallet has been successfully connected.",
        });
      }
    } catch (error) {
      console.error("Error in onConnect handler:", error);
    }
  };

  const handleDisconnect = async (info: any) => {
    try {
      await updateUserWalletInDatabase(null);
      onDisconnect?.();

      toast({
        title: "Wallet disconnected",
        description: "Your wallet has been disconnected.",
      });
    } catch (error) {
      console.error("Error in onDisconnect handler:", error);
    }
  };

  const chains = [ethereum, polygon, bsc, sepolia];

  if (process.env.NODE_ENV === "development") {
    chains.push(hardhatChain);
  }

  // Compact mode configuration
  if (compact) {
    return (
      <ConnectButton
        client={client}
        // Supported chains
        chains={chains}
        // Wallet options - popular wallets
        wallets={[
          createWallet("io.metamask"),
          createWallet("com.coinbase.wallet"),
          createWallet("me.rainbow"),
          createWallet("io.zerion.wallet"),
          createWallet("io.rabby"),
          createWallet("com.trustwallet.app"),
        ]}
        // Connect button customization for compact mode
        connectButton={{
          label: (
            <div className="">
              <Wallet className="w-4 h-4 text-black" />
            </div>
          ),
          style: {
            width: "2.5rem",
            minWidth: "2.5rem",
            height: "2.5rem",
            borderRadius: "10px",
            backgroundColor: "rgb(253 224 71)"
          },
        }}
        // Details button customization for compact mode
        detailsButton={{
          className: "h-9 px-1",
        }}
        // Modal customization
        connectModal={{
          size: "compact",
          title: "Connect to Smartjects",
          titleIcon: "/favicon.svg",
          showThirdwebBranding: false,
        }}
        // Details modal customization
        detailsModal={{
          assetTabs: ["token", "nft"],
        }}
        // Callbacks
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        // Auto connect
        autoConnect={{ timeout: 15000 }}
        // Theme
        theme={lightTheme({
          colors: {
            primaryButtonBg: "hsl(50, 80%, 65%)",
            primaryButtonText: "hsl(var(--primary-foreground))",
            modalBg: "hsl(var(--background))",
            borderColor: "hsl(var(--border))",
            separatorLine: "hsl(var(--border))",
            secondaryButtonBg: "hsl(var(--secondary))",
            secondaryButtonText: "hsl(var(--secondary-foreground))",
            secondaryButtonHoverBg: "hsl(var(--secondary))",
            connectedButtonBg: "hsl(var(--secondary))",
            connectedButtonBgHover: "hsl(var(--secondary))",
            primaryText: "hsl(var(--foreground))",
            secondaryText: "hsl(var(--muted-foreground))",
            accentText: "hsl(var(--primary))",
            accentButtonBg: "hsl(var(--primary))",
            accentButtonText: "hsl(var(--primary-foreground))",
            danger: "hsl(var(--destructive))",
            success: "hsl(142.1 76.2% 36.3%)",
            tertiaryBg: "hsl(var(--muted))",
          },
        })}
      />
    );
  }

  // Full card view
  return (
    <div className={className}>
      <ConnectButton
        client={client}
        // Supported chains
        chains={chains}
        // Wallet options - all popular wallets
        wallets={[
          createWallet("io.metamask"),
          createWallet("com.coinbase.wallet"),
          createWallet("me.rainbow"),
          createWallet("io.zerion.wallet"),
          createWallet("io.rabby"),
          createWallet("com.trustwallet.app"),
          createWallet("org.uniswap"),
        ]}
        // Show all wallets option
        showAllWallets={true}
        // Connect button customization
        connectButton={{
          label: "Connect Your Wallet",
          className: "w-full",
        }}
        // Details button customization
        detailsButton={{
          className: "w-full",
        }}
        // Modal customization
        connectModal={{
          size: "wide",
          title: "Connect to Smartjects Platform",
          titleIcon: "/favicon.svg",
          showThirdwebBranding: false,
          welcomeScreen: {
            title: "Welcome to Smartjects",
            subtitle: "Connect your wallet to access blockchain features",
            img: {
              src: "/logo.png",
              width: 150,
              height: 150,
            },
          },
          termsOfServiceUrl: "/terms",
          privacyPolicyUrl: "/privacy",
        }}
        // Details modal customization
        detailsModal={{
          assetTabs: ["token", "nft"],
          onClose: (screen) => {
            console.log("Modal closed on screen:", screen);
          },
        }}
        // App metadata
        appMetadata={{
          name: "Smartjects Platform",
          description: "Blockchain-powered smart contract platform",
          url: "https://smartjects.com",
          logoUrl: "/logo.png",
        }}
        // Callbacks
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        // Auto connect previously connected wallet
        autoConnect={{ timeout: 15000 }}
        // Theme customization
        theme={lightTheme({
          colors: {
            primaryButtonBg: "hsl(var(--primary))",
            primaryButtonText: "hsl(var(--primary-foreground))",
            modalBg: "hsl(var(--background))",
            borderColor: "hsl(var(--border))",
            separatorLine: "hsl(var(--border))",
            secondaryButtonBg: "hsl(var(--secondary))",
            secondaryButtonText: "hsl(var(--secondary-foreground))",
            secondaryButtonHoverBg: "hsl(var(--secondary))",
            connectedButtonBg: "hsl(var(--secondary))",
            connectedButtonBgHover: "hsl(var(--secondary))",
            primaryText: "hsl(var(--foreground))",
            secondaryText: "hsl(var(--muted-foreground))",
            accentText: "hsl(var(--primary))",
            accentButtonBg: "hsl(var(--primary))",
            accentButtonText: "hsl(var(--primary-foreground))",
            danger: "hsl(var(--destructive))",
            success: "hsl(142.1 76.2% 36.3%)",
            tertiaryBg: "hsl(var(--muted))",
            tooltipBg: "hsl(var(--popover))",
            tooltipText: "hsl(var(--popover-foreground))",
            skeletonBg: "hsl(var(--muted))",
          },
          fontFamily: "Inter, system-ui, sans-serif",
        })}
        // Supported tokens (optional - for send/receive features)
        supportedTokens={{
          [ethereum.id]: [
            {
              address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
              name: "USD Coin",
              symbol: "USDC",
              icon: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
            },
            {
              address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
              name: "Tether USD",
              symbol: "USDT",
              icon: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
            },
          ],
          [polygon.id]: [
            {
              address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC on Polygon
              name: "USD Coin",
              symbol: "USDC",
              icon: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
            },
          ],
        }}
      />
    </div>
  );
}
