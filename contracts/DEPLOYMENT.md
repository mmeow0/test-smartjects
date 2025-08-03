# Smart Contracts Deployment Guide

This guide walks you through deploying the Smartjects escrow contracts to Polygon networks.

## Prerequisites

### 1. Node.js Version
Ensure you're using Node.js 18.x or 20.x (not 21.x):
```bash
# Check current version
node --version

# If using NVM, switch to Node 20
nvm use 20

# Or install Node 20 if not available
nvm install 20
nvm use 20
```

### 2. Required Accounts & Keys

#### Deployment Wallet
- Create a dedicated wallet for contract deployment
- **For Testnet**: Get test MATIC from [Polygon Faucet](https://faucet.polygon.technology/)
- **For Mainnet**: Ensure wallet has sufficient MATIC (≥0.5 MATIC recommended)

#### API Keys (Optional but Recommended)
- **Polygonscan API Key**: For contract verification - [Get here](https://polygonscan.com/apis)
- **Thirdweb Client ID**: For frontend integration - [Get here](https://thirdweb.com/dashboard)

## Environment Setup

### 1. Create Environment File
```bash
cd contracts
cp .env.example .env
```

### 2. Configure .env File
Edit `.env` with your actual values:

```bash
# Essential for deployment
PLATFORM_WALLET_PRIVATE_KEY=0x_your_private_key_here

# Optional but recommended
POLYGONSCAN_API_KEY=your_polygonscan_api_key
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
```

⚠️ **Security Warning**: Never commit real private keys to version control!

### 3. Install Dependencies
```bash
npm install
```

### 4. Compile Contracts
```bash
npm run compile
```

### 5. Run Tests (Optional but Recommended)
```bash
npm test
```

## Network Configuration

### Supported Networks
- **polygonAmoy** - Polygon Amoy Testnet (Recommended for testing)
- **polygon** - Polygon Mainnet (Production)
- **hardhat** - Local development network

### Network Details
| Network | Chain ID | Native Token | Block Explorer |
|---------|----------|--------------|----------------|
| Amoy    | 80002    | MATIC        | [amoy.polygonscan.com](https://amoy.polygonscan.com) |
| Polygon | 137      | MATIC        | [polygonscan.com](https://polygonscan.com) |

## Deployment Steps

### 1. Deploy to Testnet (Recommended First)
```bash
npm run deploy:polygonAmoy
```

Expected output:
```
🚀 Starting contract deployment...
📡 Deploying to network: polygonAmoy
💼 Deploying contracts with account: 0x...
💰 Account balance: 10.0 MATIC
📄 Deploying EscrowFactory contract...
✅ EscrowFactory deployed to: 0x...
✅ Deployment confirmed at block: 12345
💾 Deployment info saved to: deployments/amoy.json
✅ Updated .env.local with factory address
🎉 Deployment successful!
```

### 2. Deploy to Mainnet (Production)
```bash
npm run deploy:polygon
```

⚠️ **Important**: Test thoroughly on testnet before mainnet deployment!

### 3. Local Development Network
Start local Hardhat network:
```bash
npm run node
```

In another terminal:
```bash
npm run deploy:local
```

## Contract Verification

### Automatic Verification
Verification happens automatically during deployment if `POLYGONSCAN_API_KEY` is set.

### Manual Verification
If automatic verification fails:
```bash
npx hardhat verify --network amoy 0x_contract_address_here

# For mainnet
npx hardhat verify --network polygon 0x_contract_address_here
```

## Post-Deployment Steps

### 1. Update Frontend Configuration
Copy the factory address to your main application's `.env.local`:
```bash
NEXT_PUBLIC_ESCROW_FACTORY_ADDRESS=0x_factory_address_here
```

### 2. Test Deployment
Run the blockchain test suite:
```bash
cd ..  # Back to main project
npm run test:blockchain
```

### 3. Verify on Block Explorer
Visit the block explorer and confirm:
- ✅ Contract is verified (green checkmark)
- ✅ Contract owner is correct
- ✅ No compilation warnings

## Deployment Files

After deployment, you'll find:
- `deployments/amoy.json` - Testnet deployment info
- `deployments/polygon.json` - Mainnet deployment info
- Updated `.env.local` in parent directory

### Deployment Info Structure
```json
{
  "network": "amoy",
  "chainId": 80002,
  "deployedAt": "2024-01-30T10:00:00.000Z",
  "deployer": "0x...",
  "contracts": {
    "EscrowFactory": {
      "address": "0x...",
      "blockNumber": 12345,
      "transactionHash": "0x...",
      "gasUsed": "1500000"
    }
  }
}
```

## Troubleshooting

### Common Issues

#### 1. "Network doesn't exist"
```bash
Error HH100: Network polygonAmoy doesn't exist
```
**Solution**: Use correct network name (`amoy` not `polygonAmoy`)

#### 2. "Insufficient funds"
```bash
Error: insufficient funds for intrinsic transaction cost
```
**Solutions**:
- Get more MATIC from faucet (testnet)
- Check wallet balance: `npx hardhat run scripts/check-balance.js --network amoy`

#### 3. "Invalid private key"
```bash
Error: invalid private key
```
**Solutions**:
- Ensure private key starts with `0x`
- Private key should be 64 characters (without 0x prefix)
- No spaces or newlines in private key

#### 4. "Contract verification failed"
```bash
Error: Contract verification failed
```
**Solutions**:
- Check POLYGONSCAN_API_KEY is correct
- Wait a few minutes and try manual verification
- Ensure contract is properly deployed

#### 5. "Node.js version warning"
```bash
WARNING: You are currently using Node.js v21.7.1
```
**Solution**: Switch to Node.js 20:
```bash
nvm use 20
rm -rf node_modules package-lock.json
npm install
```

### Debug Commands
```bash
# Check account balance
npx hardhat run scripts/check-balance.js --network amoy

# List available networks
npx hardhat help

# Check compilation
npx hardhat compile --force

# Run with debug info
npx hardhat run scripts/deploy.js --network amoy --verbose
```

### Gas Optimization
If deployment costs are high:
1. Check current gas prices: [Polygon Gas Tracker](https://polygonscan.com/gastracker)
2. Adjust gas settings in `hardhat.config.js`
3. Deploy during low-traffic periods

## Security Checklist

Before mainnet deployment:
- [ ] Tested on testnet thoroughly
- [ ] Code reviewed and audited
- [ ] Private keys are secure and not in version control
- [ ] Contract ownership verified
- [ ] Platform fee percentage confirmed (2.5%)
- [ ] Emergency procedures documented

## Support

### Documentation
- [Hardhat Documentation](https://hardhat.org/docs)
- [Polygon Documentation](https://docs.polygon.technology/)
- [Ethers.js Documentation](https://docs.ethers.org/)

### Block Explorers
- Testnet: [amoy.polygonscan.com](https://amoy.polygonscan.com)
- Mainnet: [polygonscan.com](https://polygonscan.com)

### Getting Help
1. Check the troubleshooting section above
2. Review Hardhat logs for detailed error messages
3. Verify network connectivity and RPC endpoints
4. Check wallet balance and permissions

## Next Steps

After successful deployment:
1. Update main application with contract addresses
2. Test end-to-end contract flow
3. Monitor contract on block explorer
4. Set up monitoring/alerting for contract events
5. Document contract addresses for team reference