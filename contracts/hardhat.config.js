require("@nomicfoundation/hardhat-toolbox");

// Test private key (DO NOT USE WITH REAL FUNDS)
const TEST_PRIVATE_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

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
      gasPrice: 35000000000,
      gas: 5000000,
    },

    polygon: {
      url: "https://polygon-rpc.com",
      chainId: 137,
      accounts: [TEST_PRIVATE_KEY],
      gasPrice: 50000000000,
      gas: 5000000,
    }
  },

  etherscan: {
    apiKey: {
      polygon: "",
      amoy: "",
    }
  }
};
