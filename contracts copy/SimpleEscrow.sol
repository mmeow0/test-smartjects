// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SimpleEscrow
 * @dev Simple escrow contract for Smartjects platform
 */
contract SimpleEscrow {
    // Contract states
    enum State { CREATED, FUNDED, COMPLETED, REFUNDED, CANCELLED }

    // Contract parties
    address public client;
    address public provider;
    address public platform;

    // Contract details
    string public contractId;
    uint256 public amount;
    State public state;

    // Platform fee (2.5%)
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 250; // 2.5% = 250 basis points
    uint256 public constant BASIS_POINTS = 10000;

    // Events
    event ContractCreated(string contractId, address client, address provider, uint256 amount);
    event ContractFunded(string contractId, uint256 amount);
    event ContractCompleted(string contractId, uint256 providerAmount, uint256 platformFee);
    event ContractRefunded(string contractId, uint256 amount);
    event ContractCancelled(string contractId);

    // Modifiers
    modifier onlyClient() {
        require(msg.sender == client, "Only client can call this function");
        _;
    }

    modifier onlyPlatform() {
        require(msg.sender == platform, "Only platform can call this function");
        _;
    }

    modifier inState(State _state) {
        require(state == _state, "Invalid contract state");
        _;
    }

    /**
     * @dev Constructor initializes the escrow contract
     * @param _contractId Unique identifier for the contract
     * @param _client Address of the client (needer)
     * @param _provider Address of the service provider
     * @param _amount Total contract amount in wei
     */
    constructor(
        string memory _contractId,
        address _client,
        address _provider,
        uint256 _amount
    ) {
        require(_client != address(0), "Invalid client address");
        require(_provider != address(0), "Invalid provider address");
        require(_amount > 0, "Amount must be greater than 0");

        contractId = _contractId;
        client = _client;
        provider = _provider;
        platform = msg.sender;
        amount = _amount;
        state = State.CREATED;

        emit ContractCreated(_contractId, _client, _provider, _amount);
    }

    /**
     * @dev Client deposits funds into escrow
     */
    function deposit() external payable onlyClient inState(State.CREATED) {
        require(msg.value == amount, "Incorrect amount sent");

        state = State.FUNDED;
        emit ContractFunded(contractId, msg.value);
    }

    /**
     * @dev Release funds to provider when work is approved
     * @param _approved Whether the work is approved
     */
    function release(bool _approved) external onlyPlatform inState(State.FUNDED) {
        if (_approved) {
            // Calculate platform fee
            uint256 platformFee = (amount * PLATFORM_FEE_PERCENTAGE) / BASIS_POINTS;
            uint256 providerAmount = amount - platformFee;

            // Update state first
            state = State.COMPLETED;

            // Transfer funds
            (bool providerSuccess, ) = provider.call{value: providerAmount}("");
            require(providerSuccess, "Provider transfer failed");

            (bool platformSuccess, ) = platform.call{value: platformFee}("");
            require(platformSuccess, "Platform fee transfer failed");

            emit ContractCompleted(contractId, providerAmount, platformFee);
        } else {
            // Refund to client
            state = State.REFUNDED;

            (bool success, ) = client.call{value: amount}("");
            require(success, "Refund transfer failed");

            emit ContractRefunded(contractId, amount);
        }
    }

    /**
     * @dev Cancel contract and refund if not yet funded
     */
    function cancel() external onlyClient inState(State.CREATED) {
        state = State.CANCELLED;
        emit ContractCancelled(contractId);
    }

    /**
     * @dev Get contract balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Get contract details
     */
    function getContractDetails() external view returns (
        string memory _contractId,
        address _client,
        address _provider,
        uint256 _amount,
        State _state,
        uint256 _balance
    ) {
        return (
            contractId,
            client,
            provider,
            amount,
            state,
            address(this).balance
        );
    }
}
