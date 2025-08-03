/**
 * Blockchain Feature Configuration
 *
 * This file controls the blockchain functionality mode for the Smartjects platform.
 * Easily toggle between different blockchain feature sets.
 */

// =============================================================================
// MAIN FEATURE FLAGS
// =============================================================================

/**
 * BLOCKCHAIN_RECORDS_ONLY
 *
 * When true (default):
 * - All contracts use minimal amount (0.0001 ETH/MATIC) for blockchain record-keeping only
 * - No actual escrow functionality - funds are not held or transferred
 * - UI shows "record-keeping only" messages
 * - Contract completion doesn't attempt to release funds
 * - Provides blockchain transparency and immutability without financial risk
 *
 * When false:
 * - Full escrow functionality enabled
 * - Real contract amounts are used
 * - Actual funds are held in escrow and released upon completion
 * - UI shows funding buttons and escrow status
 * - Requires wallet connections for all financial operations
 */
export const BLOCKCHAIN_RECORDS_ONLY = true;

/**
 * ZERO_BUDGET_CONTRACTS_ENABLED
 *
 * When true:
 * - Allows creation of contracts with $0 budget
 * - Zero budget contracts use minimal blockchain amount
 *
 * When false:
 * - Requires all contracts to have a budget > 0
 */
export const ZERO_BUDGET_CONTRACTS_ENABLED = true;

/**
 * WALLET_REQUIRED_FOR_COMPLETION
 *
 * When true:
 * - Contract completion requires wallet connection (when escrow is enabled)
 * - Prevents completion if wallet not connected
 *
 * When false:
 * - Contract completion can proceed without wallet connection
 */
export const WALLET_REQUIRED_FOR_COMPLETION = true;

// =============================================================================
// BLOCKCHAIN AMOUNTS
// =============================================================================

/**
 * Minimal amount used for blockchain record-keeping contracts
 * This satisfies smart contract requirements while being negligible cost
 */
export const MINIMAL_BLOCKCHAIN_AMOUNT = "0.0001";

/**
 * Threshold for detecting zero-budget contracts
 * Contracts with amount <= this value are considered zero-budget
 */
export const ZERO_BUDGET_THRESHOLD = 0.0001;

// =============================================================================
// UI CONFIGURATION
// =============================================================================

/**
 * Messages displayed in different modes
 */
export const UI_MESSAGES = {
  RECORDS_ONLY: {
    CLIENT_TITLE: "Blockchain Record Only",
    CLIENT_DESCRIPTION: "This contract is secured on the blockchain for record-keeping and transparency purposes. No funding is required at this time.",
    PROVIDER_TITLE: "Contract Ready - Blockchain Record Only",
    PROVIDER_DESCRIPTION: "This contract is secured on the blockchain and ready for work to begin. This is a record-keeping contract with no escrow functionality at this time.",
    COMPLETION_MESSAGE: "Contract completion recorded on blockchain."
  },
  ZERO_BUDGET: {
    CLIENT_TITLE: "Zero Budget Contract",
    CLIENT_DESCRIPTION: "This contract has no budget and doesn't require funding. It's secured on the blockchain for record-keeping purposes.",
    PROVIDER_TITLE: "Zero Budget Contract Active",
    PROVIDER_DESCRIPTION: "This contract is secured on the blockchain and ready for work to begin. No funding is required as this is a zero-budget agreement.",
    FUNDING_PREVENTED: "This contract has no budget and doesn't require funding."
  },
  FULL_ESCROW: {
    FUNDING_REQUIRED: "Please fund the escrow contract to activate it. The amount will be held securely until work is completed.",
    AWAITING_FUNDING: "The client needs to fund the escrow contract before work can begin.",
    COMPLETION_MESSAGE: "Escrow funds have been released to the provider."
  }
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Determines the deployment amount based on current configuration
 */
export function getDeploymentAmount(contractBudget: number | string): string {
  if (BLOCKCHAIN_RECORDS_ONLY) {
    return MINIMAL_BLOCKCHAIN_AMOUNT;
  }

  const budget = typeof contractBudget === 'string' ? parseFloat(contractBudget) : contractBudget;

  if (!budget || budget <= 0) {
    return ZERO_BUDGET_CONTRACTS_ENABLED ? MINIMAL_BLOCKCHAIN_AMOUNT : "0";
  }

  return budget.toString();
}

/**
 * Checks if a contract should be treated as zero-budget
 */
export function isZeroBudgetContract(amount: string | number | null | undefined): boolean {
  if (!amount) return true;
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return numAmount <= ZERO_BUDGET_THRESHOLD;
}

/**
 * Checks if escrow functionality should be enabled for a contract
 */
export function shouldEnableEscrow(contractBudget: number | string): boolean {
  if (BLOCKCHAIN_RECORDS_ONLY) return false;

  const budget = typeof contractBudget === 'string' ? parseFloat(contractBudget) : contractBudget;
  return budget > ZERO_BUDGET_THRESHOLD;
}

/**
 * Gets appropriate UI message based on current mode and contract type
 */
export function getUIMessage(
  messageType: 'CLIENT_TITLE' | 'CLIENT_DESCRIPTION' | 'PROVIDER_TITLE' | 'PROVIDER_DESCRIPTION' | 'COMPLETION_MESSAGE' | 'FUNDING_PREVENTED',
  contractBudget?: number | string
): string {
  if (BLOCKCHAIN_RECORDS_ONLY) {
    return UI_MESSAGES.RECORDS_ONLY[messageType] || '';
  }

  if (contractBudget && isZeroBudgetContract(contractBudget)) {
    return UI_MESSAGES.ZERO_BUDGET[messageType] || '';
  }

  return UI_MESSAGES.FULL_ESCROW[messageType] || '';
}

// =============================================================================
// DEVELOPMENT HELPERS
// =============================================================================

/**
 * Logs current configuration for debugging
 */
export function logCurrentConfig(): void {
  console.log('🔧 Blockchain Configuration:', {
    BLOCKCHAIN_RECORDS_ONLY,
    ZERO_BUDGET_CONTRACTS_ENABLED,
    WALLET_REQUIRED_FOR_COMPLETION,
    MINIMAL_BLOCKCHAIN_AMOUNT,
    ZERO_BUDGET_THRESHOLD
  });
}

/**
 * Quick toggle for development - returns opposite config
 */
export function getAlternativeConfig() {
  return {
    BLOCKCHAIN_RECORDS_ONLY: !BLOCKCHAIN_RECORDS_ONLY,
    ZERO_BUDGET_CONTRACTS_ENABLED,
    WALLET_REQUIRED_FOR_COMPLETION,
    MINIMAL_BLOCKCHAIN_AMOUNT,
    ZERO_BUDGET_THRESHOLD
  };
}
