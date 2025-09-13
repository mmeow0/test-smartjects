// Blockchain configuration checker utility for SmartjectsMarketplace
// This helps diagnose issues with marketplace contract integration

export interface BlockchainConfigStatus {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: {
    clientId: boolean;
    secretKey: boolean;
    marketplaceAddress: boolean;
    chainId: number;
    chainName: string;
    rpcUrl: string;
    environment: string;
    isProduction: boolean;
  };
}

/**
 * Check blockchain configuration for SmartjectsMarketplace
 * Focuses on Hardhat local network setup
 */
export function checkBlockchainConfig(): BlockchainConfigStatus {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check environment
  const environment = process.env.NODE_ENV || "development";
  const isProduction = environment === "production";

  // Check client ID (required for all environments)
  const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
  const hasClientId = !!clientId && clientId.length > 0;

  if (!hasClientId) {
    errors.push(
      "NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not set. This is required for blockchain functionality.",
    );
  }

  // Check secret key (optional, for server-side operations)
  const secretKey = process.env.THIRDWEB_SECRET_KEY;
  const hasSecretKey = !!secretKey && secretKey.length > 0;

  // Check marketplace address (new system only)
  const marketplaceAddress =
    process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS ||
    "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const hasMarketplaceAddress =
    !!marketplaceAddress && marketplaceAddress.length > 0;

  if (!hasMarketplaceAddress) {
    warnings.push(
      "NEXT_PUBLIC_MARKETPLACE_ADDRESS is not set. Using default Hardhat deployment address.",
    );
  }

  // Hardhat network configuration
  const chainId = 31337; // Always Hardhat for now
  const chainName = "Hardhat Local";
  const rpcUrl =
    process.env.NEXT_PUBLIC_HARDHAT_RPC_URL || "http://127.0.0.1:8545";

  // Development-specific checks
  if (environment === "development") {
    if (chainId !== 31337) {
      warnings.push(
        "Expected Hardhat chainId (1337) for development. Make sure Hardhat node is running.",
      );
    }

    if (!rpcUrl.includes("127.0.0.1") && !rpcUrl.includes("localhost")) {
      warnings.push(
        "RPC URL does not point to localhost. Make sure Hardhat node is running on port 8545.",
      );
    }
  }

  // Production checks (when ready for production)
  if (isProduction) {
    warnings.push(
      "Production deployment detected. Make sure to deploy SmartjectsMarketplace to production network and update NEXT_PUBLIC_MARKETPLACE_ADDRESS.",
    );
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    warnings,
    config: {
      clientId: hasClientId,
      secretKey: hasSecretKey,
      marketplaceAddress: hasMarketplaceAddress,
      chainId,
      chainName,
      rpcUrl,
      environment,
      isProduction,
    },
  };
}

/**
 * Log blockchain configuration status to console
 */
export function logBlockchainConfig(): void {
  const status = checkBlockchainConfig();

  console.log("🔍 SmartjectsMarketplace Configuration Check");
  console.log("================================");
  console.log(`Environment: ${status.config.environment}`);
  console.log(`Is Production: ${status.config.isProduction}`);
  console.log(
    `Chain: ${status.config.chainName} (ID: ${status.config.chainId})`,
  );
  console.log(`RPC URL: ${status.config.rpcUrl}`);
  console.log(
    `Marketplace Address: ${process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3"}`,
  );
  console.log("");
  console.log("Configuration Status:");
  console.log(`✓ Client ID: ${status.config.clientId ? "✅" : "❌"}`);
  console.log(
    `✓ Secret Key: ${status.config.secretKey ? "✅" : "⚠️  (optional)"}`,
  );
  console.log(
    `✓ Marketplace Address: ${status.config.marketplaceAddress ? "✅" : "⚠️  (using default)"}`,
  );
  console.log("");

  if (status.errors.length > 0) {
    console.log("❌ Errors:");
    status.errors.forEach((error) => console.log(`   - ${error}`));
    console.log("");
  }

  if (status.warnings.length > 0) {
    console.log("⚠️  Warnings:");
    status.warnings.forEach((warning) => console.log(`   - ${warning}`));
    console.log("");
  }

  console.log(`Overall Status: ${status.isValid ? "✅ Valid" : "❌ Invalid"}`);
  console.log("================================");
}

/**
 * Get a user-friendly error message for blockchain configuration issues
 */
export function getConfigErrorMessage(): string | null {
  const status = checkBlockchainConfig();

  if (status.isValid) {
    return null;
  }

  if (!status.config.clientId) {
    return "ThirdWeb client ID is not configured. Please set NEXT_PUBLIC_THIRDWEB_CLIENT_ID in your .env.local file.";
  }

  return status.errors[0] || "Blockchain configuration error detected.";
}

/**
 * Check if blockchain features should be available
 */
export function isBlockchainAvailable(): boolean {
  const status = checkBlockchainConfig();
  return status.isValid && status.config.clientId;
}

/**
 * Check if Hardhat network is properly configured
 */
export function isHardhatConfigured(): boolean {
  const status = checkBlockchainConfig();
  return (
    status.config.chainId === 31337 &&
    status.config.rpcUrl.includes("127.0.0.1") &&
    status.config.clientId
  );
}

/**
 * Get setup instructions for missing configuration
 */
export function getSetupInstructions(): string[] {
  const status = checkBlockchainConfig();
  const instructions: string[] = [];

  if (!status.config.clientId) {
    instructions.push(
      "1. Get a ThirdWeb client ID from https://thirdweb.com/dashboard",
    );
    instructions.push(
      "2. Add NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id to .env.local",
    );
  }

  if (!status.config.marketplaceAddress) {
    instructions.push(
      "3. Add NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3 to .env.local",
    );
  }

  if (status.config.environment === "development") {
    instructions.push("4. Start Hardhat node: npx hardhat node");
    instructions.push(
      "5. Make sure MetaMask is connected to Hardhat network (chainId: 1337)",
    );
  }

  return instructions;
}
