require("@nomicfoundation/hardhat-toolbox");

// Test private key (DO NOT USE WITH REAL FUNDS)
const TEST_PRIVATE_KEY =
  "0x0d74e6d92372ec72347145959a0f3319ac9c36476c6150e7812ed5b11a7e07a9";

module.exports = {
  solidity: "0.8.19",

  networks: {
    hardhat: {
      chainId: 31337,
    },

    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },

    amoy: {
      url: "https://rpc-amoy.polygon.technology",
      chainId: 80002,
      accounts: [TEST_PRIVATE_KEY],
      gasPrice: 30000000000, // Increased to 30 gwei to meet network minimum
      gas: 2000000, // Further reduced gas limit to minimize cost
      gasMultiplier: 1.2,
    },

    polygon: {
      url: "https://polygon-rpc.com",
      chainId: 137,
      accounts: [TEST_PRIVATE_KEY],
      gasPrice: 40000000000, // Increased to 40 gwei for polygon mainnet
      gas: 2000000, // Further reduced gas limit to minimize cost
      gasMultiplier: 1.2,
    },
  },

  etherscan: {
    apiKey: {
      polygon: "",
      amoy: "",
    },
  },
};
