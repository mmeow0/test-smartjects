const hre = require("hardhat");

async function main() {
  console.log("⛽ Gas Estimation for Contract Deployment");
  console.log("========================================\n");

  try {
    // Get network info
    const network = hre.network.name;
    const chainId = hre.network.config.chainId;

    console.log(`📡 Network: ${network}`);
    console.log(`🔗 Chain ID: ${chainId}\n`);

    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    const deployerAddress = await deployer.getAddress();

    console.log(`💼 Deployer Address: ${deployerAddress}`);

    // Get current balance
    const balance = await hre.ethers.provider.getBalance(deployerAddress);
    const balanceInEth = hre.ethers.formatEther(balance);

    console.log(`💰 Current Balance: ${balanceInEth} ${getTokenSymbol(network)}\n`);

    // Get gas price
    const gasPrice = await hre.ethers.provider.getGasPrice();
    const gasPriceInGwei = hre.ethers.formatUnits(gasPrice, "gwei");

    console.log(`⛽ Current Gas Price: ${gasPriceInGwei} gwei`);
    console.log(`⛽ Gas Price (wei): ${gasPrice.toString()}\n`);

    // Get EscrowFactory contract factory
    console.log("📄 Estimating EscrowFactory deployment...");
    const EscrowFactory = await hre.ethers.getContractFactory("EscrowFactory");

    // Estimate deployment gas
    const deploymentData = EscrowFactory.interface.encodeDeploy([]);
    const estimatedGas = await hre.ethers.provider.estimateGas({
      data: deploymentData,
    });

    console.log(`📊 Estimated Gas: ${estimatedGas.toString()} units`);

    // Calculate costs
    const totalCostWei = estimatedGas * gasPrice;
    const totalCostEth = hre.ethers.formatEther(totalCostWei);
    const totalCostGwei = hre.ethers.formatUnits(totalCostWei, "gwei");

    console.log("\n💰 Deployment Cost Breakdown:");
    console.log("─────────────────────────────");
    console.log(`Gas Units: ${estimatedGas.toString()}`);
    console.log(`Gas Price: ${gasPriceInGwei} gwei`);
    console.log(`Total Cost: ${totalCostEth} ${getTokenSymbol(network)}`);
    console.log(`Total Cost: ${totalCostGwei} gwei`);
    console.log(`Total Cost: ${totalCostWei.toString()} wei`);

    // Check if balance is sufficient
    console.log("\n🔍 Balance Check:");
    console.log("─────────────────");
    const hasEnoughBalance = balance >= totalCostWei;
    const requiredBalance = totalCostWei * BigInt(120) / BigInt(100); // 20% buffer
    const hasEnoughWithBuffer = balance >= requiredBalance;

    if (hasEnoughBalance) {
      console.log(`✅ Sufficient balance for deployment`);
      if (hasEnoughWithBuffer) {
        console.log(`✅ Has 20% buffer for gas fluctuations`);
      } else {
        console.log(`⚠️  Low balance - consider getting more tokens for safety`);
      }
    } else {
      const deficit = totalCostWei - balance;
      const deficitInEth = hre.ethers.formatEther(deficit);
      console.log(`❌ Insufficient balance!`);
      console.log(`❌ Need additional: ${deficitInEth} ${getTokenSymbol(network)}`);
    }

    // Gas optimization suggestions
    console.log("\n🚀 Gas Optimization Tips:");
    console.log("─────────────────────────");

    if (parseInt(gasPriceInGwei) > getOptimalGasPrice(network)) {
      console.log(`⚠️  Current gas price (${gasPriceInGwei} gwei) is high`);
      console.log(`💡 Consider waiting for lower gas prices (~${getOptimalGasPrice(network)} gwei)`);
    } else {
      console.log(`✅ Gas price looks reasonable`);
    }

    // Network-specific recommendations
    if (network === "amoy") {
      console.log(`💡 Get test tokens from: https://faucet.polygon.technology/`);
      console.log(`💡 Request tokens for address: ${deployerAddress}`);
    } else if (network === "polygon") {
      console.log(`💡 Monitor gas prices: https://polygonscan.com/gastracker`);
      console.log(`💡 Deploy during low-traffic hours for better prices`);
    }

    // Estimate time for deployment
    const blockTime = getAverageBlockTime(network);
    const estimatedConfirmationTime = blockTime * 3; // Assuming 3 confirmations
    console.log(`⏱️  Estimated confirmation time: ~${estimatedConfirmationTime} seconds`);

    console.log("\n📋 Deployment Command:");
    console.log("──────────────────────");
    if (hasEnoughBalance) {
      console.log(`npx hardhat run scripts/deploy.js --network ${network}`);
    } else {
      console.log(`❌ Cannot deploy - insufficient balance`);
      console.log(`1. Get more ${getTokenSymbol(network)} tokens`);
      console.log(`2. Then run: npx hardhat run scripts/deploy.js --network ${network}`);
    }

  } catch (error) {
    console.error("\n❌ Error estimating gas:", error.message);

    if (error.message.includes("insufficient funds")) {
      console.log("\n💡 This error usually means:");
      console.log("- The account has no balance");
      console.log("- Get test tokens from faucet for testnet");
      console.log("- Add real tokens for mainnet");
    } else if (error.message.includes("network")) {
      console.log("\n💡 Network connection issue:");
      console.log("- Check your internet connection");
      console.log("- Verify RPC URL is working");
      console.log("- Try a different RPC endpoint");
    }
  }
}

function getTokenSymbol(network) {
  switch (network) {
    case "polygon":
    case "amoy":
      return "MATIC";
    case "ethereum":
    case "goerli":
    case "sepolia":
      return "ETH";
    default:
      return "ETH";
  }
}

function getOptimalGasPrice(network) {
  switch (network) {
    case "polygon":
      return 30; // 30 gwei
    case "amoy":
      return 20; // 20 gwei
    case "ethereum":
      return 20; // 20 gwei
    default:
      return 20;
  }
}

function getAverageBlockTime(network) {
  switch (network) {
    case "polygon":
    case "amoy":
      return 2; // ~2 seconds
    case "ethereum":
      return 12; // ~12 seconds
    default:
      return 5;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
