const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Escrow Contracts", function () {
  let EscrowFactory, SimpleEscrow;
  let escrowFactory;
  let owner, client, provider, platform;
  let contractId, escrowAddress;

  // Test parameters
  const TEST_AMOUNT = ethers.parseEther("100"); // 100 MATIC
  const PLATFORM_FEE_PERCENTAGE = 250; // 2.5%
  const BASIS_POINTS = 10000;

  beforeEach(async function () {
    // Get signers
    [owner, client, provider, platform] = await ethers.getSigners();

    // Deploy EscrowFactory
    EscrowFactory = await ethers.getContractFactory("EscrowFactory");
    escrowFactory = await EscrowFactory.deploy();
    await escrowFactory.waitForDeployment();

    // Get SimpleEscrow contract factory for later use
    SimpleEscrow = await ethers.getContractFactory("SimpleEscrow");

    // Generate unique contract ID
    contractId = `test-contract-${Date.now()}`;
  });

  describe("EscrowFactory", function () {
    it("Should set the correct owner", async function () {
      expect(await escrowFactory.owner()).to.equal(owner.address);
    });

    it("Should create a new escrow contract", async function () {
      // Create escrow
      const tx = await escrowFactory.createEscrow(
        contractId,
        client.address,
        provider.address,
        TEST_AMOUNT
      );

      const receipt = await tx.wait();

      // Verify transaction was successful
      expect(receipt.status).to.equal(1);

      // Verify escrow address is stored and valid
      escrowAddress = await escrowFactory.getEscrowAddress(contractId);
      expect(escrowAddress).to.not.equal(ethers.ZeroAddress);

      // Verify the escrow contract details
      const details = await escrowFactory.getEscrowDetails(contractId);
      expect(details[0]).to.equal(client.address); // client
      expect(details[1]).to.equal(provider.address); // provider
      expect(details[2]).to.equal(TEST_AMOUNT); // amount
      expect(details[3]).to.equal(0); // state (CREATED)
      expect(details[4]).to.equal(0); // balance

      // Verify total contracts count increased
      const totalContracts = await escrowFactory.getTotalContracts();
      expect(totalContracts).to.be.greaterThan(0);
    });

    it("Should not allow duplicate contract IDs", async function () {
      // Create first escrow
      await escrowFactory.createEscrow(
        contractId,
        client.address,
        provider.address,
        TEST_AMOUNT
      );

      // Try to create duplicate
      await expect(
        escrowFactory.createEscrow(
          contractId,
          client.address,
          provider.address,
          TEST_AMOUNT
        )
      ).to.be.revertedWith("Contract ID already exists");
    });

    it("Should only allow owner to create escrows", async function () {
      await expect(
        escrowFactory
          .connect(client)
          .createEscrow(
            contractId,
            client.address,
            provider.address,
            TEST_AMOUNT
          )
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("Should get escrow details correctly", async function () {
      // Create escrow
      await escrowFactory.createEscrow(
        contractId,
        client.address,
        provider.address,
        TEST_AMOUNT
      );

      // Get details
      const details = await escrowFactory.getEscrowDetails(contractId);

      expect(details[0]).to.equal(client.address); // client
      expect(details[1]).to.equal(provider.address); // provider
      expect(details[2]).to.equal(TEST_AMOUNT); // amount
      expect(details[3]).to.equal(0); // state (CREATED)
      expect(details[4]).to.equal(0); // balance
    });

    it("Should track user contracts", async function () {
      // Create escrow
      await escrowFactory.createEscrow(
        contractId,
        client.address,
        provider.address,
        TEST_AMOUNT
      );

      // Check client contracts
      const clientContracts = await escrowFactory.getUserContracts(
        client.address
      );
      expect(clientContracts.length).to.equal(1);

      // Check provider contracts
      const providerContracts = await escrowFactory.getUserContracts(
        provider.address
      );
      expect(providerContracts.length).to.equal(1);
    });

    it("Should transfer ownership", async function () {
      const newOwner = provider;

      await escrowFactory.transferOwnership(newOwner.address);
      expect(await escrowFactory.owner()).to.equal(newOwner.address);
    });

    it("Should accept platform fees", async function () {
      const initialBalance = await escrowFactory.getContractBalance();
      expect(initialBalance).to.equal(0);

      // Send some ETH to the factory contract
      const feeAmount = ethers.parseEther("1");
      await owner.sendTransaction({
        to: await escrowFactory.getAddress(),
        value: feeAmount,
      });

      const finalBalance = await escrowFactory.getContractBalance();
      expect(finalBalance).to.equal(feeAmount);
    });

    it("Should allow owner to withdraw fees", async function () {
      // First, send some fees to the contract
      const feeAmount = ethers.parseEther("2");
      await owner.sendTransaction({
        to: await escrowFactory.getAddress(),
        value: feeAmount,
      });

      const ownerBalanceBefore = await ethers.provider.getBalance(
        owner.address
      );

      // Withdraw fees
      const tx = await escrowFactory.withdrawFees(owner.address, 0); // 0 means withdraw all
      const receipt = await tx.wait();

      // Account for gas costs
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

      expect(ownerBalanceAfter).to.be.closeTo(
        ownerBalanceBefore + feeAmount - gasUsed,
        ethers.parseEther("0.01") // Allow for small gas price variations
      );

      // Contract balance should be zero
      expect(await escrowFactory.getContractBalance()).to.equal(0);
    });

    it("Should allow partial fee withdrawal", async function () {
      // Send fees to contract
      const totalFees = ethers.parseEther("5");
      await owner.sendTransaction({
        to: await escrowFactory.getAddress(),
        value: totalFees,
      });

      const withdrawAmount = ethers.parseEther("2");
      await escrowFactory.withdrawFees(owner.address, withdrawAmount);

      const remainingBalance = await escrowFactory.getContractBalance();
      expect(remainingBalance).to.equal(totalFees - withdrawAmount);
    });

    it("Should not allow non-owner to withdraw fees", async function () {
      await expect(
        escrowFactory.connect(client).withdrawFees(client.address, 0)
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("Should not allow withdrawal to zero address", async function () {
      await expect(
        escrowFactory.withdrawFees(ethers.ZeroAddress, 0)
      ).to.be.revertedWith("Invalid recipient address");
    });

    it("Should not allow withdrawal when no fees available", async function () {
      await expect(
        escrowFactory.withdrawFees(owner.address, 0)
      ).to.be.revertedWith("No fees to withdraw");
    });
  });

  describe("SimpleEscrow", function () {
    let escrow;

    beforeEach(async function () {
      // Create escrow through factory
      await escrowFactory.createEscrow(
        contractId,
        client.address,
        provider.address,
        TEST_AMOUNT
      );

      // Get escrow contract instance
      escrowAddress = await escrowFactory.getEscrowAddress(contractId);
      escrow = SimpleEscrow.attach(escrowAddress);
    });

    it("Should initialize with correct values", async function () {
      expect(await escrow.client()).to.equal(client.address);
      expect(await escrow.provider()).to.equal(provider.address);
      expect(await escrow.platform()).to.equal(escrowFactory.target);
      expect(await escrow.amount()).to.equal(TEST_AMOUNT);
      expect(await escrow.state()).to.equal(0); // CREATED
    });

    it("Should allow client to deposit funds", async function () {
      // Deposit exact amount
      await escrow.connect(client).deposit({ value: TEST_AMOUNT });

      // Check state and balance
      expect(await escrow.state()).to.equal(1); // FUNDED
      expect(await escrow.getBalance()).to.equal(TEST_AMOUNT);
    });

    it("Should not allow non-client to deposit", async function () {
      await expect(
        escrow.connect(provider).deposit({ value: TEST_AMOUNT })
      ).to.be.revertedWith("Only client can call this function");
    });

    it("Should not allow incorrect deposit amount", async function () {
      const wrongAmount = ethers.parseEther("50");

      await expect(
        escrow.connect(client).deposit({ value: wrongAmount })
      ).to.be.revertedWith("Incorrect amount sent");
    });

    it("Should not allow deposit twice", async function () {
      // First deposit
      await escrow.connect(client).deposit({ value: TEST_AMOUNT });

      // Try second deposit
      await expect(
        escrow.connect(client).deposit({ value: TEST_AMOUNT })
      ).to.be.revertedWith("Invalid contract state");
    });

    describe("Release Functions", function () {
      beforeEach(async function () {
        // Fund the escrow first
        await escrow.connect(client).deposit({ value: TEST_AMOUNT });
      });

      it("Should release funds to provider when approved", async function () {
        const providerBalanceBefore = await ethers.provider.getBalance(
          provider.address
        );
        const factoryAddress = await escrowFactory.getAddress();
        const platformBalanceBefore = await ethers.provider.getBalance(
          factoryAddress
        );

        // Release funds (approved)
        await escrowFactory.releaseEscrow(contractId, true);

        // Calculate expected amounts
        const platformFee =
          (TEST_AMOUNT * BigInt(PLATFORM_FEE_PERCENTAGE)) /
          BigInt(BASIS_POINTS);
        const providerAmount = TEST_AMOUNT - platformFee;

        // Check balances
        const providerBalanceAfter = await ethers.provider.getBalance(
          provider.address
        );
        const platformBalanceAfter = await ethers.provider.getBalance(
          factoryAddress
        );

        expect(providerBalanceAfter - providerBalanceBefore).to.equal(
          providerAmount
        );
        expect(platformBalanceAfter - platformBalanceBefore).to.equal(
          platformFee
        );

        // Check state
        expect(await escrow.state()).to.equal(2); // COMPLETED
        expect(await escrow.getBalance()).to.equal(0);
      });

      it("Should refund to client when rejected", async function () {
        const clientBalanceBefore = await ethers.provider.getBalance(
          client.address
        );

        // Release funds (rejected)
        await escrowFactory.releaseEscrow(contractId, false);

        // Check balance
        const clientBalanceAfter = await ethers.provider.getBalance(
          client.address
        );
        expect(clientBalanceAfter - clientBalanceBefore).to.equal(TEST_AMOUNT);

        // Check state
        expect(await escrow.state()).to.equal(3); // REFUNDED
        expect(await escrow.getBalance()).to.equal(0);
      });

      it("Should only allow platform to release", async function () {
        await expect(escrow.connect(client).release(true)).to.be.revertedWith(
          "Only platform can call this function"
        );
      });

      it("Should not allow release before funding", async function () {
        // Create new unfunded escrow
        const newContractId = `test-contract-${Date.now()}-2`;
        await escrowFactory.createEscrow(
          newContractId,
          client.address,
          provider.address,
          TEST_AMOUNT
        );

        await expect(
          escrowFactory.releaseEscrow(newContractId, true)
        ).to.be.revertedWith("Invalid contract state");
      });
    });

    it("Should allow client to cancel before funding", async function () {
      // Cancel
      await escrow.connect(client).cancel();

      // Check state
      expect(await escrow.state()).to.equal(4); // CANCELLED

      // Should not allow deposit after cancel
      await expect(
        escrow.connect(client).deposit({ value: TEST_AMOUNT })
      ).to.be.revertedWith("Invalid contract state");
    });

    it("Should get contract details correctly", async function () {
      const details = await escrow.getContractDetails();

      expect(details[0]).to.equal(contractId); // contractId
      expect(details[1]).to.equal(client.address); // client
      expect(details[2]).to.equal(provider.address); // provider
      expect(details[3]).to.equal(TEST_AMOUNT); // amount
      expect(details[4]).to.equal(0); // state (CREATED)
      expect(details[5]).to.equal(0); // balance
    });
  });

  describe("Gas Usage", function () {
    it("Should log gas usage for key operations", async function () {
      // Create escrow
      const createTx = await escrowFactory.createEscrow(
        contractId,
        client.address,
        provider.address,
        TEST_AMOUNT
      );
      const createReceipt = await createTx.wait();
      console.log(
        `      Gas used for creating escrow: ${createReceipt.gasUsed.toString()}`
      );

      // Get escrow
      escrowAddress = await escrowFactory.getEscrowAddress(contractId);
      const escrow = SimpleEscrow.attach(escrowAddress);

      // Deposit
      const depositTx = await escrow
        .connect(client)
        .deposit({ value: TEST_AMOUNT });
      const depositReceipt = await depositTx.wait();
      console.log(
        `      Gas used for depositing: ${depositReceipt.gasUsed.toString()}`
      );

      // Release
      const releaseTx = await escrowFactory.releaseEscrow(contractId, true);
      const releaseReceipt = await releaseTx.wait();
      console.log(
        `      Gas used for releasing: ${releaseReceipt.gasUsed.toString()}`
      );
    });
  });
});
