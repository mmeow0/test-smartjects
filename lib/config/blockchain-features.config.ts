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
 * USD to ETH exchange rate
 * TODO: This should be fetched from a price oracle in production
 * Current rate: 1 ETH = $2500 USD (example rate)
 */
export const USD_TO_ETH_RATE = 2500;

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
    CLIENT_DESCRIPTION:
      "This contract is secured on the blockchain for record-keeping and transparency purposes. Contract value is in USD. No funding is required at this time.",
    PROVIDER_TITLE: "Contract Ready - Blockchain Record Only",
    PROVIDER_DESCRIPTION:
      "This contract is secured on the blockchain and ready for work to begin. This is a record-keeping contract with no escrow functionality at this time.",
    COMPLETION_MESSAGE: "Contract completion recorded on blockchain.",
    FUNDING_PREVENTED: "No funding required for record-keeping contracts.",
  },
  ZERO_BUDGET: {
    CLIENT_TITLE: "Zero Budget Contract",
    CLIENT_DESCRIPTION:
      "This contract has no budget and doesn't require funding. It's secured on the blockchain for record-keeping purposes.",
    PROVIDER_TITLE: "Zero Budget Contract Active",
    PROVIDER_DESCRIPTION:
      "This contract is secured on the blockchain and ready for work to begin. No funding is required as this is a zero-budget agreement.",
    FUNDING_PREVENTED:
      "This contract has no budget and doesn't require funding.",
    COMPLETION_MESSAGE: "Zero budget contract completed.",
  },
  FULL_ESCROW: {
    CLIENT_TITLE: "Escrow Contract",
    CLIENT_DESCRIPTION: "This contract requires funding to activate escrow.",
    PROVIDER_TITLE: "Escrow Contract Active",
    PROVIDER_DESCRIPTION: "Escrow contract is active and funded.",
    FUNDING_REQUIRED:
      "Please fund the escrow contract to activate it. The amount will be held securely until work is completed.",
    AWAITING_FUNDING:
      "The client needs to fund the escrow contract before work can begin.",
    COMPLETION_MESSAGE: "Escrow funds have been released to the provider.",
    FUNDING_PREVENTED: "Funding is required for this contract.",
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Safely parses a currency string and extracts the numeric USD value
 * Supports various formats: "$100", "100", "€50.99", etc.
 * IMPORTANT: All numeric values are treated as USD amounts
 */
export function parseCurrencyString(currencyString: string | number): number {
  if (typeof currencyString === "number") {
    return currencyString;
  }

  if (!currencyString || typeof currencyString !== "string") {
    return 0;
  }

  // Remove currency symbols and other non-numeric characters except decimal points
  const cleanString = currencyString.replace(/[$€£¥₽,\s]/g, "");
  const numericValue = parseFloat(cleanString);

  return isNaN(numericValue) ? 0 : numericValue;
}

/**
 * Formats a number as a currency string
 */
export function formatCurrency(amount: number, symbol: string = "$"): string {
  if (isNaN(amount) || amount < 0) {
    return `${symbol}0`;
  }

  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Converts USD amount to ETH based on current exchange rate
 * @param usdAmount - Amount in USD
 * @returns Amount in ETH as string
 */
export async function convertUSDToETH(
  usdAmount: number | string
) : Promise<string> {
  const usd =
    typeof usdAmount === "string"
      ? parseFloat(usdAmount.replace(/[^0-9.]/g, "")) // убираем $ и пробелы
      : usdAmount;

  if (!usd || isNaN(usd) || usd <= 0) {
    throw new Error("Invalid USD amount");
  }

  // 1. Получаем курс ETH/USD
  const res = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
  );
  const data = await res.json();
  const ethPrice = data.ethereum.usd; // 1 ETH = X USD

  // 2. Считаем ETH
  const ethAmount = usd / ethPrice;

  console.log(`💱 Converting $${usd} → ${ethAmount.toFixed(6)} ETH`);
  console.log(`📊 Rate: 1 ETH = $${ethPrice}`);

  return ethAmount.toFixed(18);
}

/**
 * Gets the funding amount for a contract based on its USD budget
 * Converts USD to ETH for actual escrow funding
 */
export async function getFundingAmount(contractBudget: number | string): Promise<string> {
  console.log(
    "🔍 getFundingAmount called with:",
    contractBudget,
    typeof contractBudget,
  );

  let budget: number =
    typeof contractBudget === "string"
      ? parseCurrencyString(contractBudget)
      : contractBudget;

  // For zero or invalid budgets, return minimal amount
  if (!budget || isNaN(budget) || budget <= 0) {
    console.log("🔍 Zero or invalid budget, returning minimal amount");
    return '0.0001';
  }

  // Convert USD to ETH for funding
  const ethAmount = await convertUSDToETH(budget);

  console.log(`✅ Funding amount for $${budget} USD: ${ethAmount} ETH`);

  return ethAmount;
}

/**
 * Determines the deployment amount for blockchain contracts
 * Converts USD budget to ETH for actual escrow deployment
 */
export async function getDeploymentAmount(contractBudget: number | string): Promise<string> {
  console.log(
    "🔍 getDeploymentAmount called with:",
    contractBudget,
    typeof contractBudget,
  );

  let budget: number =
    typeof contractBudget === "string"
      ? parseCurrencyString(contractBudget)
      : contractBudget;

  console.log(`💵 Contract budget: $${budget} USD`);

  // For zero or invalid budgets
  if (!budget || isNaN(budget) || budget <= 0) {
    console.log("🔍 Zero or invalid budget, returning minimal amount");
    return ZERO_BUDGET_CONTRACTS_ENABLED ? MINIMAL_BLOCKCHAIN_AMOUNT : "0";
  }

  // Convert USD to ETH for deployment
  const ethAmount = await convertUSDToETH(budget);
  console.log(
    `🔐 Deployment amount: ${ethAmount} ETH (converted from $${budget} USD)`,
  );

  return ethAmount;
}

/**
 * Checks if a contract should be treated as zero-budget
 * UPDATED: Better handling of USD amounts
 */
export function isZeroBudgetContract(
  amount: string | number | null | undefined,
): boolean {
  if (!amount) return true;

  let numAmount: number;
  let isUSDAmount = false;

  if (typeof amount === "string") {
    // Check if this is a USD amount
    isUSDAmount = amount.includes("$") || amount.toLowerCase().includes("usd");

    // Use the safe currency parser
    numAmount = parseCurrencyString(amount);
  } else {
    numAmount = amount;
  }

  if (isNaN(numAmount)) return true;

  // If it's a USD amount, don't treat it as zero-budget unless it's actually $0
  if (isUSDAmount) {
    return numAmount <= 0;
  }

  return numAmount <= ZERO_BUDGET_THRESHOLD;
}

/**
 * Checks if escrow functionality should be enabled for a contract
 * UPDATED: Better handling of USD amounts
 */
export function shouldEnableEscrow(contractBudget: number | string): boolean {
  let budget: number;
  let isUSDAmount = false;

  if (typeof contractBudget === "string") {
    // Check if this is a USD amount
    isUSDAmount =
      contractBudget.includes("$") ||
      contractBudget.toLowerCase().includes("usd");

    // Use the safe currency parser
    budget = parseCurrencyString(contractBudget);
  } else {
    budget = contractBudget;
  }

  if (isNaN(budget)) return false;

  // For USD amounts, we should enable escrow but use minimal blockchain amount
  if (isUSDAmount) {
    return budget > 0;
  }

  return budget > ZERO_BUDGET_THRESHOLD;
}

/**
 * Gets appropriate UI message based on current mode and contract type
 */
export function getUIMessage(
  messageType:
    | "CLIENT_TITLE"
    | "CLIENT_DESCRIPTION"
    | "PROVIDER_TITLE"
    | "PROVIDER_DESCRIPTION"
    | "COMPLETION_MESSAGE"
    | "FUNDING_PREVENTED",
  contractBudget?: number | string,
): string {
  if (contractBudget && isZeroBudgetContract(contractBudget)) {
    return (UI_MESSAGES.ZERO_BUDGET as any)[messageType] || "";
  }

  return (UI_MESSAGES.FULL_ESCROW as any)[messageType] || "";
}

// =============================================================================
// DEVELOPMENT HELPERS
// =============================================================================

/**
 * Logs current configuration for debugging
 */
export function logCurrentConfig(): void {
  console.log("🔧 Blockchain Configuration:", {
    ZERO_BUDGET_CONTRACTS_ENABLED,
    WALLET_REQUIRED_FOR_COMPLETION,
    MINIMAL_BLOCKCHAIN_AMOUNT,
    ZERO_BUDGET_THRESHOLD,
  });
}

/**
 * Quick toggle for development - returns opposite config
 */
export function getAlternativeConfig() {
  return {
    ZERO_BUDGET_CONTRACTS_ENABLED,
    WALLET_REQUIRED_FOR_COMPLETION,
    MINIMAL_BLOCKCHAIN_AMOUNT,
    ZERO_BUDGET_THRESHOLD,
  };
}
