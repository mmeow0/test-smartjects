import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { config } from "dotenv";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

// Load environment variables
config();

// Contract ABIs and bytecodes (these will be generated after compilation)
import EscrowFactoryArtifact from "../contracts/artifacts/EscrowFactory.json";

async function deployContracts() {
  console.log("🚀 Starting contract deployment...");

  try {
    // Validate environment variables
    const privateKey = process.env.PLATFORM_WALLET_PRIVATE_KEY;
    const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
    const secretKey = process.env.THIRDWEB_SECRET_KEY;

    if (!privateKey) {
      throw new Error("PLATFORM_WALLET_PRIVATE_KEY not found in environment variables");
    }

    if (!clientId && !secretKey) {
      throw new Error("Either NEXT_PUBLIC_THIRDWEB_CLIENT_ID or THIRDWEB_SECRET_KEY must be set");
    }

    // Determine network based on NODE_ENV
    const isProduction = process.env.NODE_ENV === "production";
    const network = isProduction ? "polygon" : "polygon-amoy-testnet";

    console.log(`📡 Deploying to network: ${network}`);

    // Initialize Thirdweb SDK
    const sdk = ThirdwebSDK.fromPrivateKey(
      privateKey,
      network,
      {
        clientId: clientId,
        secretKey: secretKey,
      }
    );

    // Get the signer address
    const signerAddress = await sdk.getSigner()?.getAddress();
    console.log(`💼 Deploying from address: ${signerAddress}`);

    // Check balance
    const balance = await sdk.getBalance(signerAddress!);
    console.log(`💰 Wallet balance: ${balance.displayValue} ${balance.symbol}`);

    if (parseFloat(balance.displayValue) < 0.1) {
      console.warn("⚠️  Warning: Low wallet balance. Make sure you have enough funds for deployment.");
    }

    // Deploy EscrowFactory contract
    console.log("\n📄 Deploying EscrowFactory contract...");

    const factoryContract = await sdk.deployer.deployContract({
      name: "EscrowFactory",
      abi: EscrowFactoryArtifact.abi,
      bytecode: EscrowFactoryArtifact.bytecode,
      constructorArgs: [], // No constructor args for factory
    });

    const factoryAddress = factoryContract.address;
    console.log(`✅ EscrowFactory deployed at: ${factoryAddress}`);

    // Verify the deployment
    console.log("\n🔍 Verifying deployment...");
    const deployedFactory = await sdk.getContract(factoryAddress);
    const owner = await deployedFactory.call("owner");
    console.log(`✅ Factory owner verified: ${owner}`);

    // Save deployment info
    const deploymentInfo = {
      network: network,
      deployedAt: new Date().toISOString(),
      contracts: {
        EscrowFactory: {
          address: factoryAddress,
          deployedBy: signerAddress,
          blockExplorer: getBlockExplorerUrl(network, factoryAddress),
        },
      },
    };

    // Save to deployment file
    const deploymentPath = join(process.cwd(), `deployments.${network}.json`);
    writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n💾 Deployment info saved to: ${deploymentPath}`);

    // Update environment file
    console.log("\n📝 Updating environment configuration...");
    updateEnvFile(factoryAddress);

    // Print summary
    console.log("\n🎉 Deployment successful!");
    console.log("=====================================");
    console.log(`Network: ${network}`);
    console.log(`EscrowFactory: ${factoryAddress}`);
    console.log(`Block Explorer: ${getBlockExplorerUrl(network, factoryAddress)}`);
    console.log("=====================================");
    console.log("\n⚡ Next steps:");
    console.log("1. Update your .env.local with:");
    console.log(`   NEXT_PUBLIC_ESCROW_FACTORY_ADDRESS=${factoryAddress}`);
    console.log("2. Verify the contract on the block explorer (optional)");
    console.log("3. Test the deployment by creating a test escrow contract");

  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  }
}

function getBlockExplorerUrl(network: string, address: string): string {
  const explorers: Record<string, string> = {
    "polygon": "https://polygonscan.com/address/",
    "polygon-amoy-testnet": "https://amoy.polygonscan.com/address/",
  };

  return `${explorers[network] || "https://etherscan.io/address/"}${address}`;
}

function updateEnvFile(factoryAddress: string) {
  try {
    const envExamplePath = join(process.cwd(), "blockchain.env.example");
    const envLocalPath = join(process.cwd(), ".env.local");

    // Read current .env.local if it exists
    let envContent = "";
    try {
      envContent = readFileSync(envLocalPath, "utf-8");
    } catch (e) {
      console.log("📄 Creating new .env.local file...");
    }

    // Update or add the factory address
    const factoryKey = "NEXT_PUBLIC_ESCROW_FACTORY_ADDRESS";
    const factoryLine = `${factoryKey}=${factoryAddress}`;

    if (envContent.includes(factoryKey)) {
      // Replace existing line
      envContent = envContent.replace(
        new RegExp(`^${factoryKey}=.*$`, "m"),
        factoryLine
      );
    } else {
      // Add new line
      envContent += `\n# Smart Contract Addresses\n${factoryLine}\n`;
    }

    // Write back to file
    writeFileSync(envLocalPath, envContent);
    console.log("✅ Updated .env.local with factory address");
  } catch (error) {
    console.warn("⚠️  Could not update .env.local automatically:", error);
  }
}

// Run deployment
deployContracts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
