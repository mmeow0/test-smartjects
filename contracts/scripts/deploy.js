const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting contract deployment...\n");

  // Get network info
  const network = hre.network.name;
  const chainId = hre.network.config.chainId;

  console.log(`📡 Deploying to network: ${network}`);
  console.log(`🔗 Chain ID: ${chainId}\n`);

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();

  console.log(`💼 Deploying contracts with account: ${deployerAddress}`);

  // Get balance
  const balance = await hre.ethers.provider.getBalance(deployerAddress);
  console.log(`💰 Account balance: ${hre.ethers.formatEther(balance)} ${network === "polygon" ? "MATIC" : "ETH"}\n`);

  // Check if balance is sufficient
  if (balance < hre.ethers.parseEther("0.1")) {
    console.error("❌ Insufficient balance! You need at least 0.1 tokens for deployment.");
    process.exit(1);
  }

  try {
    // Deploy EscrowFactory
    console.log("📄 Deploying EscrowFactory contract...");

    const EscrowFactory = await hre.ethers.getContractFactory("EscrowFactory");
    const escrowFactory = await EscrowFactory.deploy();

    // Wait for deployment
    await escrowFactory.waitForDeployment();
    const factoryAddress = await escrowFactory.getAddress();

    console.log(`✅ EscrowFactory deployed to: ${factoryAddress}`);

    // Wait for a few block confirmations
    console.log("\n⏳ Waiting for block confirmations...");
    const deploymentReceipt = await escrowFactory.deploymentTransaction().wait(5);

    console.log(`✅ Deployment confirmed at block: ${deploymentReceipt.blockNumber}`);
    console.log(`📊 Gas used: ${deploymentReceipt.gasUsed.toString()}`);

    // Verify ownership
    const owner = await escrowFactory.owner();
    console.log(`\n👤 Contract owner: ${owner}`);

    // Save deployment information
    const deploymentInfo = {
      network: network,
      chainId: chainId,
      deployedAt: new Date().toISOString(),
      deployer: deployerAddress,
      contracts: {
        EscrowFactory: {
          address: factoryAddress,
          blockNumber: deploymentReceipt.blockNumber,
          transactionHash: deploymentReceipt.hash,
          gasUsed: deploymentReceipt.gasUsed.toString(),
        }
      }
    };

    // Save to deployments file
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentPath = path.join(deploymentsDir, `${network}.json`);
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

    console.log(`\n💾 Deployment info saved to: ${deploymentPath}`);

    // Update .env file in the parent directory
    updateEnvFile(factoryAddress, network);

    // Print summary
    console.log("\n🎉 Deployment successful!");
    console.log("=====================================");
    console.log(`Network: ${network}`);
    console.log(`Chain ID: ${chainId}`);
    console.log(`EscrowFactory: ${factoryAddress}`);
    console.log(`Block Explorer: ${getBlockExplorerUrl(network, chainId, factoryAddress)}`);
    console.log("=====================================");

    // Verify contract if on a supported network
    if (network !== "hardhat" && network !== "localhost") {
      console.log("\n🔍 Verifying contract on block explorer...");

      try {
        await hre.run("verify:verify", {
          address: factoryAddress,
          constructorArguments: [],
        });

        console.log("✅ Contract verified successfully!");
      } catch (error) {
        console.log("⚠️  Contract verification failed:", error.message);
        console.log("You can verify manually later using:");
        console.log(`npx hardhat verify --network ${network} ${factoryAddress}`);
      }
    }

    console.log("\n⚡ Next steps:");
    console.log("1. Update your .env.local with:");
    console.log(`   NEXT_PUBLIC_ESCROW_FACTORY_ADDRESS=${factoryAddress}`);
    console.log("2. Test the deployment by creating a test escrow contract");
    console.log("3. Monitor gas costs and optimize if needed");

  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  }
}

function getBlockExplorerUrl(network, chainId, address) {
  const explorers = {
    polygon: `https://polygonscan.com/address/${address}`,
    amoy: `https://amoy.polygonscan.com/address/${address}`,
    hardhat: `Local network - no explorer`,
    localhost: `Local network - no explorer`,
  };

  return explorers[network] || `https://etherscan.io/address/${address}`;
}

function updateEnvFile(factoryAddress, network) {
  try {
    // Path to the root .env.local file
    const envPath = path.join(__dirname, "..", "..", ".env.local");

    let envContent = "";

    // Read existing content if file exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf-8");
    }

    // Update or add the factory address
    const key = "NEXT_PUBLIC_ESCROW_FACTORY_ADDRESS";
    const value = `${key}=${factoryAddress}`;

    if (envContent.includes(key)) {
      // Replace existing line
      envContent = envContent.replace(
        new RegExp(`^${key}=.*$`, "m"),
        value
      );
    } else {
      // Add new line
      if (envContent && !envContent.endsWith("\n")) {
        envContent += "\n";
      }
      envContent += `\n# Smart Contract Addresses (${network})\n${value}\n`;
    }

    // Write back to file
    fs.writeFileSync(envPath, envContent);
    console.log("\n✅ Updated .env.local with factory address");
  } catch (error) {
    console.warn("\n⚠️  Could not update .env.local automatically:", error.message);
    console.log("Please update it manually.");
  }
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
