# Blockchain Mode Switching Guide

This guide explains how to easily switch between different blockchain modes in the Smartjects platform.

## Current Mode: Records Only

The platform is currently configured in **"Blockchain Records Only"** mode, which means:
- ✅ All contracts are recorded on blockchain for transparency and immutability
- ✅ Smart contracts are deployed with minimal amounts (0.0001 ETH/MATIC)
- ✅ No actual funds are held in escrow
- ✅ Users can view blockchain records and contract history
- ✅ Zero risk of lost funds or wallet security issues
- ❌ No real escrow functionality (funds not actually held/released)

## How to Switch to Full Escrow Mode

### Option 1: Quick Switch (Recommended for Development)

Edit `smartjects-platform-3/lib/config/blockchain-features.config.ts`:

```typescript
// Change this line:
export const BLOCKCHAIN_RECORDS_ONLY = true;
// To:
export const BLOCKCHAIN_RECORDS_ONLY = false;
```

### Option 2: Environment-Based Configuration (Recommended for Production)

1. **Add to your environment variables:**
```bash
# .env.local or .env.production
NEXT_PUBLIC_BLOCKCHAIN_RECORDS_ONLY=false
NEXT_PUBLIC_ENABLE_FULL_ESCROW=true
```

2. **Update the config file to read from environment:**
```typescript
export const BLOCKCHAIN_RECORDS_ONLY = 
  process.env.NEXT_PUBLIC_BLOCKCHAIN_RECORDS_ONLY === 'true';
```

## What Changes When Switching to Full Escrow Mode

### Frontend Changes
- **Funding buttons appear** for clients to deposit real contract amounts
- **Escrow status tracking** shows actual fund movements
- **Wallet connection required** for contract completion
- **Real amounts displayed** instead of minimal symbolic amounts

### Backend Changes
- **Real contract amounts** are used for blockchain deployment
- **Actual fund transfers** occur when contracts are completed
- **Escrow release functionality** is enabled
- **Wallet validation** enforced for financial operations

### User Experience Changes
- **Clients must fund contracts** with real money before work begins
- **Providers receive actual payments** upon completion
- **Higher gas fees** due to real amount transfers
- **Financial risk** as real funds are held in smart contracts

## Feature Flags Reference

### Main Configuration Options

```typescript
// Controls escrow functionality
export const BLOCKCHAIN_RECORDS_ONLY = true;

// Allows zero-budget contracts
export const ZERO_BUDGET_CONTRACTS_ENABLED = true;

// Requires wallet for completion
export const WALLET_REQUIRED_FOR_COMPLETION = true;

// Minimal amount for record-keeping
export const MINIMAL_BLOCKCHAIN_AMOUNT = "0.0001";
```

### Granular Control Options

You can also enable different combinations:

1. **Records Only + Zero Budget Support**
   ```typescript
   BLOCKCHAIN_RECORDS_ONLY = true;
   ZERO_BUDGET_CONTRACTS_ENABLED = true;
   ```

2. **Full Escrow + Zero Budget Support**
   ```typescript
   BLOCKCHAIN_RECORDS_ONLY = false;
   ZERO_BUDGET_CONTRACTS_ENABLED = true;
   ```

3. **Full Escrow Only (No Zero Budget)**
   ```typescript
   BLOCKCHAIN_RECORDS_ONLY = false;
   ZERO_BUDGET_CONTRACTS_ENABLED = false;
   ```

## Migration Strategies

### Gradual Migration (Recommended)

1. **Phase 1: Test with Select Users**
   - Enable full escrow for specific contract types
   - Monitor for issues and user feedback
   - Keep records-only as default

2. **Phase 2: Feature Toggle in UI**
   - Allow users to choose between modes
   - Add clear warnings about financial implications
   - Provide educational content

3. **Phase 3: Full Migration**
   - Switch default to full escrow mode
   - Maintain backward compatibility
   - Provide migration tools for existing contracts

### Testing Strategy

Before switching to full escrow mode:

1. **Test on Testnet**
   ```typescript
   // Use testnet configuration
   export const BLOCKCHAIN_CONFIG = {
     chainId: 80002, // Polygon Amoy Testnet
     rpcUrl: "https://rpc-amoy.polygon.technology",
     // ... other testnet settings
   };
   ```

2. **Test with Small Amounts**
   - Start with contracts under $10
   - Verify all flows work correctly
   - Check gas costs and transaction times

3. **Load Testing**
   - Test with multiple simultaneous contracts
   - Verify blockchain performance
   - Monitor error rates

## Safety Considerations

### Before Enabling Full Escrow

- [ ] **Smart contracts audited** and tested thoroughly
- [ ] **Wallet security procedures** in place
- [ ] **Customer support trained** on blockchain issues
- [ ] **Emergency procedures** documented
- [ ] **Insurance or backup funds** available
- [ ] **Legal compliance** verified for your jurisdiction

### Monitoring Required

When full escrow is enabled, monitor:
- Transaction success rates
- Gas fee costs
- User complaint patterns
- Stuck transactions
- Smart contract balance accuracy

## Rollback Procedure

If issues arise with full escrow mode:

1. **Immediate Rollback**
   ```typescript
   export const BLOCKCHAIN_RECORDS_ONLY = true;
   ```

2. **Handle In-Flight Contracts**
   - Complete existing escrow contracts manually if needed
   - Communicate with affected users
   - Provide alternative payment methods

3. **Post-Rollback Cleanup**
   - Audit any failed transactions
   - Refund affected users
   - Document lessons learned

## Development Workflow

### Local Development
```bash
# For records-only testing
NEXT_PUBLIC_BLOCKCHAIN_RECORDS_ONLY=true

# For full escrow testing  
NEXT_PUBLIC_BLOCKCHAIN_RECORDS_ONLY=false
```

### Staging Environment
```bash
# Always test full functionality on staging
NEXT_PUBLIC_BLOCKCHAIN_RECORDS_ONLY=false
NEXT_PUBLIC_BLOCKCHAIN_TESTNET=true
```

### Production Environment
```bash
# Start with records-only for safety
NEXT_PUBLIC_BLOCKCHAIN_RECORDS_ONLY=true
# Switch when ready
NEXT_PUBLIC_BLOCKCHAIN_RECORDS_ONLY=false
```

## FAQ

**Q: Can I switch modes without affecting existing contracts?**
A: Yes, existing contracts will continue to work with their original configuration. Only new contracts will use the new mode.

**Q: What happens to existing "records-only" contracts if I enable full escrow?**
A: They remain as records-only contracts. Users can complete them normally without any funding requirements.

**Q: How do I test full escrow without risking real money?**
A: Use a testnet (like Polygon Amoy) or enable escrow mode only for specific test accounts.

**Q: Can I have different modes for different contract types?**
A: Not with the current implementation, but you can extend the configuration system to support per-contract-type settings.

**Q: Is it safe to switch modes in production?**
A: Switching TO records-only mode is always safe. Switching FROM records-only to full escrow should be done carefully with proper testing and monitoring.

---

*This guide will be updated as new features and configuration options are added.*