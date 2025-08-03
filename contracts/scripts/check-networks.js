const hre = require("hardhat");

async function main() {
  console.log("🔧 Hardhat Network Configuration Check");
  console.log("=====================================\n");

  console.log("📡 Available Networks:");
  console.log("----------------------");

  // Get network configuration
  const networks = hre.config.networks;

  for (const [networkName, networkConfig] of Object.entries(networks)) {
    console.log(`\n🌐 Network: ${networkName}`);
    if (networkConfig.url) {
      console.log(`   URL: ${networkConfig.url}`);
    }
    if (networkConfig.chainId) {
      console.log(`   Chain ID: ${networkConfig.chainId}`);
    }
    if (networkConfig.accounts && networkConfig.accounts.length > 0) {
      console.log(`   Accounts: ${networkConfig.accounts.length} configured`);
    }
    if (networkConfig.gasPrice) {
      console.log(`   Gas Price: ${networkConfig.gasPrice}`);
    }
  }

  console.log("\n🎯 Current Network:");
  console.log("-------------------");
  console.log(`Network Name: ${hre.network.name}`);
  console.log(`Chain ID: ${hre.network.config.chainId || 'Not specified'}`);

  console.log("\n🔍 Environment Variables:");
  console.log("-------------------------");
  console.log(`PLATFORM_WALLET_PRIVATE_KEY: ${process.env.PLATFORM_WALLET_PRIVATE_KEY ? 'Set' : 'Not set'}`);
  console.log(`POLYGON_AMOY_RPC_URL: ${process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC_URL || 'Using default'}`);
  console.log(`POLYGON_RPC_URL: ${process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'Using default'}`);

  console.log("\n✅ Network Check Complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
