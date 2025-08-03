# Wallet Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Environment Setup

Add to your `.env.local`:

```env
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
```

Get your client ID from [thirdweb.com](https://thirdweb.com) → Settings → API Keys

### 2. Basic Usage

#### Option A: Use Pre-built Modal

```tsx
import { WalletModal } from "@/components/wallet/wallet-modal";

export function MyApp() {
  return <WalletModal />;
}
```

#### Option B: Use Wallet Context

```tsx
import { useWallet } from "@/contexts/wallet-context";

export function MyComponent() {
  const { address, isConnected, connectWallet, disconnectWallet } = useWallet();

  if (!isConnected) {
    return <button onClick={connectWallet}>Connect Wallet</button>;
  }

  return (
    <div>
      <p>Connected: {address}</p>
      <button onClick={disconnectWallet}>Disconnect</button>
    </div>
  );
}
```

### 3. Common Patterns

#### Check Connection Before Action

```tsx
const { isConnected } = useWallet();

const handleAction = () => {
  if (!isConnected) {
    toast.error("Please connect your wallet first");
    return;
  }
  // Proceed with action
};
```

#### Show Different UI Based on Connection

```tsx
const { isConnected, address, balance } = useWallet();

return (
  <>
    {isConnected ? (
      <div>
        <p>Address: {address}</p>
        <p>Balance: {balance}</p>
      </div>
    ) : (
      <WalletModal />
    )}
  </>
);
```

#### Use in Navigation Bar

```tsx
import { WalletConnect } from "@/components/blockchain/wallet-connect";

<nav>
  {/* Other nav items */}
  <WalletConnect compact />
</nav>
```

### 4. Available Components

| Component | Use Case | Import |
|-----------|----------|--------|
| `WalletModal` | Full modal with wallet selection | `@/components/wallet/wallet-modal` |
| `WalletConnect` | Compact/full connection UI | `@/components/blockchain/wallet-connect` |
| `WalletCard` | Status card display | `@/components/wallet/wallet-card` |
| `WalletConnection` | Full connection interface | `@/components/wallet/wallet-connection` |

### 5. Hook API Reference

```tsx
const {
  // State
  address,           // string | null - Connected wallet address
  isConnected,       // boolean - Connection status
  isConnecting,      // boolean - Loading state
  balance,           // string | null - Wallet balance
  chain,             // Chain object - Current network
  
  // Actions
  connectWallet,     // (walletId?: string) => Promise<void>
  disconnectWallet,  // () => Promise<void>
  
  // Utils
  copyAddress,       // () => Promise<void>
  truncateAddress,   // (address: string) => string
  openExplorer,      // () => void
} = useWallet();
```

### 6. Features

✅ **Auto-reconnection** - Wallet reconnects on page refresh
✅ **Multi-wallet support** - MetaMask, Coinbase, WalletConnect
✅ **Database sync** - Wallet addresses saved to user profile
✅ **Responsive UI** - Works on desktop and mobile
✅ **TypeScript ready** - Full type support

### 7. Troubleshooting

#### Wallet not reconnecting?
```javascript
// Clear stored connection
localStorage.removeItem('smartjects_wallet_connected');
localStorage.removeItem('smartjects_wallet_type');
```

#### Connection failing?
- Check wallet extension is installed
- Ensure user is on correct network
- Verify environment variables are set

### 8. Example: Protected Page

```tsx
"use client";

import { useWallet } from "@/contexts/wallet-context";
import { WalletModal } from "@/components/wallet/wallet-modal";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedPage() {
  const { isConnected } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      router.push("/connect-wallet");
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1>Please connect your wallet</h1>
        <WalletModal />
      </div>
    );
  }

  return <div>Protected content here...</div>;
}
```

### 9. Next Steps

- See [Full Documentation](./wallet-setup.md) for advanced features
- Check [Examples](../examples/wallet-usage-example.tsx) for more patterns
- Read about [Smart Contract Integration](./smart-contracts.md)

## Need Help?

- 📚 [Full Documentation](./wallet-setup.md)
- 💬 [Discord Community](#)
- 🐛 [Report Issues](#)