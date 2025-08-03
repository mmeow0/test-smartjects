import { blockchainService } from "../lib/services/blockchain.service";
import { config } from "dotenv";
import readline from "readline";

// Load environment variables
config();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to get user input
const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

// Helper function to log with color
const log = {
  success: (msg: string) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  section: (msg: string) => console.log(`\n${colors.cyan}══════════════════════════════════════════${colors.reset}\n${colors.cyan}${msg}${colors.reset}\n${colors.cyan}══════════════════════════════════════════${colors.reset}`),
};

// Test data
const testData = {
  contractId: `test-contract-${Date.now()}`,
  clientAddress: "",
  providerAddress: "",
  amount: "0.01", // Small test amount in MATIC
};

async function runTests() {
  log.section("🚀 Blockchain Integration Test Suite");

  try {
    // Test 1: Environment Check
    log.section("Test 1: Environment Configuration");

    const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
    const factoryAddress = process.env.NEXT_PUBLIC_ESCROW_FACTORY_ADDRESS;

    if (!clientId) {
      log.error("NEXT_PUBLIC_THIRDWEB_CLIENT_ID not found in environment");
      log.info("Please set up your .env.local file based on blockchain.env.example");
      process.exit(1);
    }
    log.success("Thirdweb client ID configured");

    if (!factoryAddress) {
      log.warning("NEXT_PUBLIC_ESCROW_FACTORY_ADDRESS not found");
      log.info("You need to deploy the contracts first using: npm run deploy:contracts");
    } else {
      log.success(`Factory contract address: ${factoryAddress}`);
    }

    // Test 2: Wallet Connection
    log.section("Test 2: Wallet Connection");

    const connectWallet = await question("\nDo you want to test wallet connection? (y/n): ");

    if (connectWallet.toLowerCase() === 'y') {
      log.info("Please connect your MetaMask wallet when prompted...");

      try {
        const address = await blockchainService.connectWallet();

        if (address) {
          log.success(`Wallet connected: ${address}`);
          testData.clientAddress = address;

          // Get balance
          const balance = await blockchainService.getWalletBalance();
          log.info(`Wallet balance: ${balance || "0"} MATIC`);

          if (!balance || parseFloat(balance) < 0.01) {
            log.warning("Low balance! You need MATIC tokens for gas fees.");
            log.info("Get test MATIC from: https://faucet.polygon.technology/");
          }
        } else {
          log.error("Failed to connect wallet");
        }
      } catch (error: any) {
        log.error(`Wallet connection error: ${error.message}`);
      }
    }

    // Test 3: Contract Deployment
    if (!factoryAddress) {
      log.warning("Skipping contract deployment test - factory not deployed");
    } else {
      log.section("Test 3: Escrow Contract Deployment");

      const deployTest = await question("\nDo you want to test contract deployment? (y/n): ");

      if (deployTest.toLowerCase() === 'y') {
        // Get provider address
        testData.providerAddress = await question("Enter provider wallet address (or press Enter for test address): ");
        if (!testData.providerAddress) {
          testData.providerAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f6832e"; // Test address
        }

        log.info(`Deploying escrow contract...`);
        log.info(`Contract ID: ${testData.contractId}`);
        log.info(`Client: ${testData.clientAddress}`);
        log.info(`Provider: ${testData.providerAddress}`);
        log.info(`Amount: ${testData.amount} MATIC`);

        try {
          const escrowAddress = await blockchainService.deployEscrowContract(testData);

          if (escrowAddress) {
            log.success(`Escrow contract deployed at: ${escrowAddress}`);

            // Test getting escrow details
            const details = await blockchainService.getEscrowDetails(testData.contractId);
            if (details) {
              log.success("Escrow details retrieved successfully");
              log.info(`State: ${getStateName(details.state)}`);
              log.info(`Balance: ${details.balance.toString()} wei`);
            }
          } else {
            log.error("Failed to deploy escrow contract");
          }
        } catch (error: any) {
          log.error(`Contract deployment error: ${error.message}`);
        }
      }
    }

    // Test 4: Contract Funding
    log.section("Test 4: Escrow Funding");

    const fundTest = await question("\nDo you want to test contract funding? (y/n): ");

    if (fundTest.toLowerCase() === 'y') {
      const contractIdToFund = await question(`Enter contract ID to fund (or press Enter for '${testData.contractId}'): `);
      const fundContractId = contractIdToFund || testData.contractId;

      const fundAmount = await question(`Enter amount to fund in MATIC (or press Enter for ${testData.amount}): `);
      const amountToFund = fundAmount || testData.amount;

      log.info(`Funding contract ${fundContractId} with ${amountToFund} MATIC...`);

      try {
        const success = await blockchainService.fundEscrowContract(fundContractId, amountToFund);

        if (success) {
          log.success("Contract funded successfully!");

          // Check if funded
          const isFunded = await blockchainService.isEscrowFunded(fundContractId);
          log.info(`Escrow funded status: ${isFunded ? "FUNDED" : "NOT FUNDED"}`);
        } else {
          log.error("Failed to fund contract");
        }
      } catch (error: any) {
        log.error(`Funding error: ${error.message}`);
      }
    }

    // Test 5: Release Funds
    log.section("Test 5: Release Funds");

    const releaseTest = await question("\nDo you want to test releasing funds? (y/n): ");

    if (releaseTest.toLowerCase() === 'y') {
      const contractIdToRelease = await question(`Enter contract ID to release (or press Enter for '${testData.contractId}'): `);
      const releaseContractId = contractIdToRelease || testData.contractId;

      const approve = await question("Approve work and release funds? (y/n): ");
      const approved = approve.toLowerCase() === 'y';

      log.info(`${approved ? "Approving" : "Rejecting"} work for contract ${releaseContractId}...`);

      try {
        const success = await blockchainService.releaseEscrowFunds(releaseContractId, approved);

        if (success) {
          log.success(approved ? "Funds released to provider!" : "Funds refunded to client!");

          // Check final state
          const details = await blockchainService.getEscrowDetails(releaseContractId);
          if (details) {
            log.info(`Final state: ${getStateName(details.state)}`);
            log.info(`Final balance: ${details.balance.toString()} wei`);
          }
        } else {
          log.error("Failed to release funds");
        }
      } catch (error: any) {
        log.error(`Release error: ${error.message}`);
      }
    }

    // Summary
    log.section("📊 Test Summary");
    log.success("All tests completed!");
    log.info("\nNext steps:");
    log.info("1. Deploy contracts to mainnet when ready");
    log.info("2. Update environment variables with mainnet addresses");
    log.info("3. Test with real users on testnet first");
    log.info("4. Monitor gas costs and optimize if needed");

  } catch (error: any) {
    log.error(`Test suite error: ${error.message}`);
    console.error(error);
  } finally {
    rl.close();
  }
}

function getStateName(state: number): string {
  const states = ["CREATED", "FUNDED", "COMPLETED", "REFUNDED", "CANCELLED"];
  return states[state] || "UNKNOWN";
}

// Run tests
console.log(`
╔═══════════════════════════════════════════════════════╗
║          Smartjects Blockchain Integration Test       ║
║                                                       ║
║  This script will test the blockchain integration     ║
║  including wallet connection, contract deployment,    ║
║  and escrow operations.                              ║
║                                                       ║
║  Prerequisites:                                       ║
║  - MetaMask installed                                ║
║  - Connected to Polygon Amoy testnet                 ║
║  - Test MATIC tokens in wallet                       ║
║  - Environment variables configured                  ║
╚═══════════════════════════════════════════════════════╝
`);

runTests().catch(console.error);
