# Blockchain Production Deployment Fix

## Problem Description

Smart contract deployment was working correctly in development mode (`next dev`) but failing in production mode (`next build` + `next start`). The specific symptoms were:

1. Transaction was sent successfully to the blockchain
2. Transaction hash was returned
3. `waitForReceipt` would hang indefinitely when waiting for confirmation
4. No error messages were displayed
5. Smart contract address was never retrieved

### Logs Comparison

**Development Mode (Working):**
```
✅ Transaction sent: 0xb99637b64681917774371b41bee47ce3ef59c0048dc22e44637b1e147f95c6f5
[Blockchain] Escrow deployed: https://amoy.polygonscan.com/tx/0xb99637b64681917774371b41bee47ce3ef59c0048dc22e44637b1e147f95c6f5
🔍 Getting deployed escrow address...
✅ Escrow deployed at: 0xCc3D37723BcF1d69ee96e8A7D610c45221Fa2811
```

**Production Mode (Failing):**
```
✅ Transaction sent: 0x536e677961ba2291d16544be6fca4dba0148dab87e68d16ed65d57ce552fea6b
⏳ Waiting for transaction confirmation...
   Chain: Polygon
   Confirmations required: 3
[HANGS HERE]
```

## Root Cause

The issue was caused by multiple factors:

1. **Chain Configuration**: The code was configured to use Polygon Amoy testnet in development but Polygon mainnet in production
2. **RPC Connection**: The default RPC endpoints weren't properly configured for production environment
3. **Missing Timeouts**: `waitForReceipt` didn't have proper timeout handling

## Solution

### 1. Fixed Chain Configuration

**Before:**
```typescript
export const activeChain = isDevelopment ? polygonAmoy : polygon;
```

**After:**
```typescript
// Always use testnet for now (change to polygon for mainnet deployment)
export const activeChain = polygonAmoy;

// Configure chain with custom RPC
export const configuredChain = defineChain({
  ...activeChain,
  rpc: RPC_URLS[activeChain.id],
});
```

### 2. Added Custom RPC Configuration

```typescript
export const RPC_URLS = {
  [polygon.id]:
    process.env.NEXT_PUBLIC_POLYGON_RPC_URL || "https://polygon-rpc.com",
  [polygonAmoy.id]:
    process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC_URL ||
    "https://rpc-amoy.polygon.technology",
} as const;
```

### 3. Enhanced Error Handling and Timeouts

```typescript
// Add manual timeout since maxBlockWaitTime might not work properly
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => {
    reject(
      new Error(
        `Transaction confirmation timeout after ${TX_CONFIG.confirmationTimeout}ms`,
      ),
    );
  }, TX_CONFIG.confirmationTimeout);
});

const receiptPromise = waitForReceipt({
  client: this.client,
  chain: configuredChain,
  transactionHash: result.transactionHash,
  confirmations: TX_CONFIG.confirmationBlocks,
  maxBlockWaitTime: TX_CONFIG.confirmationTimeout,
});

// Race between receipt and timeout
receipt = await Promise.race([receiptPromise, timeoutPromise]);
```

### 4. Added Alternative Confirmation Method

```typescript
async checkTransactionWithRetry(transactionHash: string): Promise<any> {
  const maxAttempts = 10;
  const delayMs = 3000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const receipt = await waitForReceipt({
        client: this.client,
        chain: configuredChain,
        transactionHash: transactionHash,
        confirmations: 1,
        maxBlockWaitTime: 10000,
      });

      if (receipt && receipt.status === "success") {
        return receipt;
      }
    } catch (error) {
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw new Error(
    `Transaction confirmation failed after ${maxAttempts} attempts`,
  );
}
```

### 5. Added RPC Connection Testing

```typescript
async testRPCConnection(): Promise<boolean> {
  try {
    const rpcClient = getRpcClient({
      client: this.client,
      chain: configuredChain,
    });
    const blockNumber = await rpcClient.getBlockNumber();
    console.log("✅ RPC connection successful, latest block:", blockNumber);
    return true;
  } catch (error) {
    console.error("❌ RPC connection failed:", error.message);
    return false;
  }
}
```

## Environment Variables

Make sure these environment variables are set in production:

```bash
# Required
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id
NEXT_PUBLIC_ESCROW_FACTORY_ADDRESS=0x9514E386D942F72F98d51B4597c60E16bAD24c5B

# Optional (for custom RPC)
NEXT_PUBLIC_POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
NEXT_PUBLIC_CHAIN_ID=80002
NEXT_PUBLIC_CHAIN_NAME=Polygon Amoy Testnet
```

## Important Notes

1. **Build Time Variables**: Environment variables with `NEXT_PUBLIC_` prefix must be available during build time (`next build`), not just runtime.

2. **Chain Selection**: Currently configured to always use testnet. When ready for mainnet deployment, change:
   ```typescript
   export const activeChain = polygon; // For mainnet
   ```

3. **RPC Endpoints**: Consider using paid RPC services (Alchemy, Infura) for production to avoid rate limiting.

4. **Monitoring**: The enhanced logging will help diagnose issues:
   - RPC connection status
   - Transaction confirmation progress
   - Timeout occurrences
   - Alternative confirmation attempts

## Testing

To verify the fix works:

1. Build the application: `npm run build`
2. Start in production mode: `npm run start`
3. Deploy a smart contract
4. Check console logs for confirmation messages
5. Verify contract address is saved in database

## Future Improvements

1. Add RPC failover to multiple endpoints
2. Implement WebSocket connections for real-time updates
3. Add retry logic with exponential backoff
4. Create monitoring dashboard for blockchain operations
5. Add Sentry or similar error tracking for production