# Wallet Setup Documentation

## Overview

The SmartJects platform uses a unified wallet connection system that supports multiple Web3 wallets with automatic reconnection and shared state management across the application.

## Features

- 🔄 **Auto-reconnection**: Automatically reconnects wallet on page refresh
- 🌐 **Multiple wallet support**: MetaMask, Coinbase Wallet, WalletConnect, and more
- 📱 **Responsive UI**: Works seamlessly on desktop and mobile
- 🔐 **Secure**: Wallet addresses are stored securely in the database
- 🎨 **Consistent UI**: Shared wallet state across all components

## Configuration

### 1. Environment Variables

Add the following to your `.env.local` file:

```env
# Thirdweb Configuration
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id

# Optional: Chain Configuration
NEXT_PUBLIC_DEFAULT_CHAIN_ID=1  # Ethereum Mainnet
```

### 2. Getting a Thirdweb Client ID

1. Visit [thirdweb.com](https://thirdweb.com)
2. Create an account or sign in
3. Go to Settings → API Keys
4. Create a new API key
5. Copy the Client ID

## Architecture

### Wallet Context Provider

The wallet system uses a React Context (`WalletContext`) that provides:

- **State Management**: Centralized wallet state (address, balance, connection status)
- **Auto-reconnection**: Automatically reconnects on page load if previously connected
- **Database Sync**: Updates user's wallet address in Supabase

### Supported Wallets

- MetaMask
- Coinbase Wallet
- WalletConnect
- Rabby Wallet
- Trust Wallet

## Usage

### Basic Connection

```tsx
import { useWallet } from "@/contexts/wallet-context";

function MyComponent() {
  const { 
    address, 
    isConnected, 
    connectWallet, 
    disconnectWallet 
  } = useWallet();

  return (
    <button onClick={connectWallet}>
      {isConnected ? `Connected: ${address}` : "Connect Wallet"}
    </button>
  );
}
```

### Using Pre-built Components

#### WalletModal

Full-featured modal with wallet selection:

```tsx
import { WalletModal } from "@/components/wallet/wallet-modal";

<WalletModal />
```

#### WalletConnect

Compact or full card view:

```tsx
import { WalletConnect } from "@/components/blockchain/wallet-connect";

// Compact view (for navbar)
<WalletConnect compact />

// Full card view
<WalletConnect 
  onConnect={(address) => console.log("Connected:", address)}
  onDisconnect={() => console.log("Disconnected")}
/>
```

#### WalletCard

Status card with wallet information:

```tsx
import { WalletCard } from "@/components/wallet/wallet-card";

<WalletCard 
  showActions 
  showNetwork 
  onConnectClick={() => setShowModal(true)}
/>
```

## Implementation Details

### Auto-reconnection Flow

1. On app load, the `WalletProvider` checks localStorage for previous connection
2. If found, it attempts to reconnect with the last used wallet type
3. On successful reconnection, the wallet state is restored
4. Failed reconnections clear the stored connection data

### Database Integration

When a wallet connects/disconnects:

1. The wallet address is stored/cleared in the `users` table
2. Connection timestamp is recorded
3. This allows for wallet-based features like:
   - Contract ownership tracking
   - Transaction history
   - Wallet-specific settings

### Security Considerations

- Private keys are never stored or transmitted
- Only public addresses are saved in the database
- All wallet interactions happen client-side
- Users must approve each transaction

## Troubleshooting

### Wallet Not Reconnecting

1. Check browser console for errors
2. Ensure the wallet extension is installed and unlocked
3. Clear localStorage: `localStorage.removeItem('smartjects_wallet_connected')`

### Connection Failed

Common issues:
- Wallet not installed
- User rejected connection
- Network mismatch
- Incorrect RPC URL

### Balance Not Showing

- Ensure correct chain is selected
- Check RPC endpoint availability
- Verify wallet has funds on the selected network

## Best Practices

1. **Always check connection status** before blockchain operations:
   ```tsx
   if (!isConnected) {
     toast.error("Please connect your wallet first");
     return;
   }
   ```

2. **Handle errors gracefully**:
   ```tsx
   try {
     await connectWallet();
   } catch (error) {
     console.error("Connection failed:", error);
   }
   ```

3. **Use the shared context** instead of creating separate wallet connections

4. **Test on multiple wallets** to ensure compatibility

## Advanced Features

### Custom Wallet Integration

To add a new wallet:

1. Add wallet ID to `SUPPORTED_WALLETS` in `wallet-context.tsx`
2. Add wallet option to `WALLET_OPTIONS` in `wallet-modal.tsx`
3. Include wallet icon and metadata

### Chain-specific Features

The context automatically detects the connected chain and provides:
- Native currency symbol
- Block explorer URLs
- Network information

### Event Handling

Listen for wallet events:

```tsx
useEffect(() => {
  if (isConnected) {
    // Handle connection
  } else {
    // Handle disconnection
  }
}, [isConnected]);
```

## Migration Guide

If migrating from the old `blockchainService`:

1. Replace `blockchainService.connectWallet()` with `connectWallet()`
2. Replace `blockchainService.getWalletAddress()` with `address`
3. Remove manual database updates (handled automatically)
4. Update imports to use the wallet context

## Support

For issues or questions:
1. Check the browser console for detailed error messages
2. Verify environment variables are set correctly
3. Ensure wallet extensions are up to date
4. Test in incognito mode to rule out extension conflicts