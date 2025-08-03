// Blockchain configuration checker utility
// This helps diagnose issues with blockchain integration in different environments

export interface BlockchainConfigStatus {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: {
    clientId: boolean;
    secretKey: boolean;
    factoryAddress: boolean;
    chainId: number;
    chainName: string;
    rpcUrl: string;
    environment: string;
    isProduction: boolean;
  };
}

/**
 * Check blockchain configuration and environment setup
 * Useful for debugging deployment issues between dev and production
 */
export function checkBlockchainConfig(): BlockchainConfigStatus {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check environment
  const environment = process.env.NODE_ENV || 'development';
  const isProduction = environment === 'production';

  // Check client ID (required for all environments)
  const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
  const hasClientId = !!clientId && clientId.length > 0;

  if (!hasClientId) {
    errors.push(
      'NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not set. This is required for blockchain functionality.'
    );
  }

  // Check secret key (optional, for server-side operations)
  const secretKey = process.env.THIRDWEB_SECRET_KEY;
  const hasSecretKey = !!secretKey && secretKey.length > 0;

  if (!hasSecretKey) {
    warnings.push(
      'THIRDWEB_SECRET_KEY is not set. Some server-side blockchain operations may not work.'
    );
  }

  // Check factory address
  const factoryAddress = process.env.NEXT_PUBLIC_ESCROW_FACTORY_ADDRESS;
  const hasFactoryAddress = !!factoryAddress && factoryAddress.length > 0;

  if (!hasFactoryAddress) {
    warnings.push(
      'NEXT_PUBLIC_ESCROW_FACTORY_ADDRESS is not set. Using default address which may not be correct for your deployment.'
    );
  }

  // Check chain configuration
  const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '80002');
  const chainName = process.env.NEXT_PUBLIC_CHAIN_NAME || 'Polygon Amoy Testnet';
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc-amoy.polygon.technology';

  // Additional production checks
  if (isProduction) {
    if (!hasClientId) {
      errors.push(
        'In production, NEXT_PUBLIC_THIRDWEB_CLIENT_ID must be set during build time (next build).'
      );
    }

    if (chainId === 80002) {
      warnings.push(
        'Using testnet (Polygon Amoy) in production environment. Consider switching to mainnet.'
      );
    }
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    warnings,
    config: {
      clientId: hasClientId,
      secretKey: hasSecretKey,
      factoryAddress: hasFactoryAddress,
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

  console.log('🔍 Blockchain Configuration Check');
  console.log('================================');
  console.log(`Environment: ${status.config.environment}`);
  console.log(`Is Production: ${status.config.isProduction}`);
  console.log(`Chain: ${status.config.chainName} (ID: ${status.config.chainId})`);
  console.log(`RPC URL: ${status.config.rpcUrl}`);
  console.log('');
  console.log('Configuration Status:');
  console.log(`✓ Client ID: ${status.config.clientId ? '✅' : '❌'}`);
  console.log(`✓ Secret Key: ${status.config.secretKey ? '✅' : '⚠️  (optional)'}`);
  console.log(`✓ Factory Address: ${status.config.factoryAddress ? '✅' : '⚠️  (using default)'}`);
  console.log('');

  if (status.errors.length > 0) {
    console.log('❌ Errors:');
    status.errors.forEach(error => console.log(`   - ${error}`));
    console.log('');
  }

  if (status.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    status.warnings.forEach(warning => console.log(`   - ${warning}`));
    console.log('');
  }

  console.log(`Overall Status: ${status.isValid ? '✅ Valid' : '❌ Invalid'}`);
  console.log('================================');
}

/**
 * Get a user-friendly error message for blockchain configuration issues
 */
export function getConfigErrorMessage(): string | null {
  const status = checkBlockchainConfig();

  if (status.isValid) {
    return null;
  }

  if (status.config.isProduction && !status.config.clientId) {
    return 'Blockchain integration is not properly configured for production. Please ensure environment variables are set during the build process.';
  }

  if (!status.config.clientId) {
    return 'Blockchain integration is not configured. Please set up the required environment variables.';
  }

  return status.errors[0] || 'Blockchain configuration error detected.';
}

/**
 * Check if blockchain features should be available
 */
export function isBlockchainAvailable(): boolean {
  const status = checkBlockchainConfig();
  return status.isValid || (status.errors.length === 0 && status.config.clientId);
}
