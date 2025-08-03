# Blockchain Integration Guide

This guide explains how to set up and use the blockchain integration in the Smartjects platform.

## Overview

The Smartjects platform integrates with blockchain technology to provide:
- **Secure escrow contracts** for project payments
- **Automated payment release** upon work approval
- **Transparent transaction history** on the blockchain
- **Decentralized contract execution** using smart contracts

## Architecture

### Smart Contracts

1. **EscrowFactory.sol** - Factory contract for deploying individual escrow contracts
2. **SimpleEscrow.sol** - Individual escrow contract for each project

### Technology Stack

- **Blockchain**: Polygon (MATIC) - for low-cost, fast transactions
- **Development Network**: Polygon Amoy Testnet
- **Integration**: Thirdweb SDK
- **Wallet Support**: MetaMask

## Setup Instructions

### 1. Install Dependencies

The blockchain dependencies are already included in the project:
```bash
npm install
```

### 2. Environment Configuration

Create a `.env.local` file based on `blockchain.env.example`:

```bash
# Thirdweb Configuration
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id_here

# Smart Contract Addresses (will be populated after deployment)
NEXT_PUBLIC_ESCROW_FACTORY_ADDRESS=0x...

# Optional: Custom RPC URLs
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-rpc.com
NEXT_PUBLIC_POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
```

### 3. Get Thirdweb Client ID

1. Visit [Thirdweb Dashboard](https://thirdweb.com/dashboard)
2. Create a new project or select existing one
3. Copy your Client ID
4. Add it to your `.env.local` file

### 4. Compile Smart Contracts

First, install Hardhat (if not already installed):
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

Compile the contracts:
```bash
npx hardhat compile
```

### 5. Deploy Smart Contracts

For deployment, you'll need:
1. A wallet with MATIC tokens (for mainnet) or test MATIC (for testnet)
2. The private key of your deployment wallet

Deploy to testnet:
```bash
NODE_ENV=development PLATFORM_WALLET_PRIVATE_KEY=your_private_key npm run deploy:contracts
```

Deploy to mainnet:
```bash
NODE_ENV=production PLATFORM_WALLET_PRIVATE_KEY=your_private_key npm run deploy:contracts
```

The deployment script will:
- Deploy the EscrowFactory contract
- Save the contract address to `deployments.{network}.json`
- Update your `.env.local` with the factory address

## Database Setup

Run the migration to add blockchain fields to your database:

```bash
npx supabase migration up
```

This adds the following fields:
- `users.wallet_address` - User's connected wallet address
- `contracts.blockchain_address` - Deployed escrow contract address
- `contracts.blockchain_status` - Status of the blockchain contract
- And other blockchain-related fields

## Usage Guide

### For Users

#### 1. Connect Wallet

Users need to connect their MetaMask wallet:
- Click "Connect Wallet" button
- Approve the connection in MetaMask
- The wallet address will be saved to their profile

#### 2. Contract Flow

1. **Contract Creation**: When both parties sign a contract, a smart contract is automatically deployed
2. **Funding**: The client funds the escrow contract with the project amount
3. **Work Completion**: Provider completes the work
4. **Approval**: Client approves the work
5. **Payment Release**: Funds are automatically released to the provider

### For Developers

#### Blockchain Service Methods

```typescript
// Connect wallet
const address = await blockchainService.connectWallet();

// Deploy escrow contract
const escrowAddress = await blockchainService.deployEscrowContract({
  contractId: "contract-uuid",
  clientAddress: "0x...",
  providerAddress: "0x...",
  amount: "1000" // in MATIC
});

// Fund escrow contract
const success = await blockchainService.fundEscrowContract(
  contractId,
  amount
);

// Release funds (approve or reject)
const released = await blockchainService.releaseEscrowFunds(
  contractId,
  approved // boolean
);

// Get escrow details
const details = await blockchainService.getEscrowDetails(contractId);
```

#### Components

1. **WalletConnect** - Wallet connection UI component
```tsx
<WalletConnect 
  onConnect={(address) => console.log("Connected:", address)}
  onDisconnect={() => console.log("Disconnected")}
  compact={false} // or true for navbar usage
/>
```

2. **BlockchainStatus** - Shows smart contract status
```tsx
<BlockchainStatus
  contractId={contractId}
  blockchainAddress={contract.blockchain_address}
  blockchainStatus={contract.blockchain_status}
  escrowFunded={contract.escrow_funded}
  escrowAmount={contract.budget}
  isClient={true}
  isProvider={false}
  onFunded={() => reloadContract()}
/>
```

## Testing

### Local Testing with Testnet

1. Get test MATIC from [Polygon Faucet](https://faucet.polygon.technology/)
2. Connect to Polygon Amoy testnet in MetaMask
3. Test the full contract flow

### Testing Checklist

- [ ] Wallet connection
- [ ] Contract deployment on signing
- [ ] Escrow funding by client
- [ ] Work submission by provider
- [ ] Approval and fund release

## Smart Contract Details

### Platform Fee

- 2.5% platform fee on all transactions
- Automatically deducted when funds are released
- Configurable in smart contract

### Security Features

- Funds locked in escrow until work approved
- Only platform can release funds (based on database approval)
- Refund mechanism if work is rejected
- No direct access to funds by any party

## Troubleshooting

### Common Issues

1. **"Wallet not connected"**
   - Ensure MetaMask is installed
   - Check if user has approved the connection

2. **"Insufficient balance"**
   - User needs MATIC tokens for gas fees
   - Client needs full contract amount + gas

3. **"Wrong network"**
   - Switch to correct network in MetaMask
   - Testnet: Polygon Amoy
   - Mainnet: Polygon

4. **Contract not deploying**
   - Check if both parties have signed
   - Verify wallet addresses are set for both users
   - Check console for specific errors

### Debug Mode

Enable blockchain logging in development:
```typescript
// In lib/config/blockchain.config.ts
export const logTransaction = (action: string, txHash: string) => {
  if (isDevelopment) {
    console.log(`[Blockchain] ${action}:`, getTransactionUrl(txHash));
  }
};
```

## Security Considerations

1. **Never expose private keys** in code or version control
2. **Use environment variables** for sensitive data
3. **Validate all inputs** before blockchain transactions
4. **Handle errors gracefully** - blockchain operations can fail
5. **Test thoroughly** on testnet before mainnet deployment

## Resources

- [Polygon Documentation](https://docs.polygon.technology/)
- [Thirdweb Documentation](https://portal.thirdweb.com/)
- [MetaMask Integration Guide](https://docs.metamask.io/guide/)
- [Solidity Documentation](https://docs.soliditylang.org/)

## Support

For blockchain-related issues:
1. Check the browser console for detailed error messages
2. Verify transaction on block explorer
3. Ensure correct network and sufficient balance
4. Contact support with transaction hash if needed