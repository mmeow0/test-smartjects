// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./SimpleEscrow.sol";

/**
 * @title EscrowFactory
 * @dev Factory contract for creating and managing SimpleEscrow contracts
 */
contract EscrowFactory {
    // Owner of the factory (platform)
    address public owner;

    // Mapping from contract ID to escrow contract address
    mapping(string => address) public escrowContracts;

    // Mapping from user address to their contract addresses
    mapping(address => address[]) public userContracts;

    // Array of all deployed escrow contracts
    address[] public allContracts;

    // Events
    event EscrowCreated(
        string indexed contractId,
        address indexed escrowAddress,
        address indexed client,
        address provider,
        uint256 amount
    );

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    /**
     * @dev Constructor sets the factory owner
     */
    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Create a new escrow contract
     * @param _contractId Unique identifier for the contract
     * @param _client Address of the client (needer)
     * @param _provider Address of the service provider
     * @param _amount Total contract amount in wei
     * @return escrowAddress Address of the newly created escrow contract
     */
    function createEscrow(
        string memory _contractId,
        address _client,
        address _provider,
        uint256 _amount
    ) external onlyOwner returns (address escrowAddress) {
        // Check if contract ID already exists
        require(escrowContracts[_contractId] == address(0), "Contract ID already exists");
        require(_client != address(0), "Invalid client address");
        require(_provider != address(0), "Invalid provider address");
        require(_amount > 0, "Amount must be greater than 0");

        // Create new escrow contract
        SimpleEscrow escrow = new SimpleEscrow(
            _contractId,
            _client,
            _provider,
            _amount
        );

        escrowAddress = address(escrow);

        // Store contract reference
        escrowContracts[_contractId] = escrowAddress;
        allContracts.push(escrowAddress);

        // Add to user contracts mapping for both client and provider
        userContracts[_client].push(escrowAddress);
        userContracts[_provider].push(escrowAddress);

        emit EscrowCreated(
            _contractId,
            escrowAddress,
            _client,
            _provider,
            _amount
        );

        return escrowAddress;
    }

    /**
     * @dev Release funds for a specific escrow contract
     * @param _contractId The contract ID
     * @param _approved Whether the work is approved
     */
    function releaseEscrow(string memory _contractId, bool _approved) external onlyOwner {
        address escrowAddress = escrowContracts[_contractId];
        require(escrowAddress != address(0), "Escrow contract not found");

        SimpleEscrow escrow = SimpleEscrow(escrowAddress);
        escrow.release(_approved);
    }

    /**
     * @dev Get escrow contract address by contract ID
     * @param _contractId The contract ID
     * @return The escrow contract address
     */
    function getEscrowAddress(string memory _contractId) external view returns (address) {
        return escrowContracts[_contractId];
    }

    /**
     * @dev Get all contracts for a specific user
     * @param _user The user address
     * @return Array of contract addresses
     */
    function getUserContracts(address _user) external view returns (address[] memory) {
        return userContracts[_user];
    }

    /**
     * @dev Get total number of deployed contracts
     * @return Total number of contracts
     */
    function getTotalContracts() external view returns (uint256) {
        return allContracts.length;
    }

    /**
     * @dev Get details of an escrow contract
     * @param _contractId The contract ID
     * @return client, provider, amount, state, balance
     */
    function getEscrowDetails(string memory _contractId) external view returns (
        address client,
        address provider,
        uint256 amount,
        uint8 state,
        uint256 balance
    ) {
        address escrowAddress = escrowContracts[_contractId];
        require(escrowAddress != address(0), "Escrow contract not found");

        SimpleEscrow escrow = SimpleEscrow(escrowAddress);

        (
            string memory contractId,
            address _client,
            address _provider,
            uint256 _amount,
            SimpleEscrow.State _state,
            uint256 _balance
        ) = escrow.getContractDetails();

        return (_client, _provider, _amount, uint8(_state), _balance);
    }

    /**
     * @dev Transfer ownership of the factory
     * @param _newOwner The new owner address
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid new owner address");
        owner = _newOwner;
    }
}
