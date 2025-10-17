// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title UserRegistry
 * @notice Onchain registry for ShieldAI users
 * @dev Tracks which addresses are protected by ShieldAI
 */
contract UserRegistry {
    // ============ Events ============
    
    event UserRegistered(address indexed user, uint256 timestamp);
    event UserUnregistered(address indexed user, uint256 timestamp);
    
    // ============ State Variables ============
    
    /// @notice Mapping to check if an address is registered
    mapping(address => bool) public isRegistered;
    
    /// @notice Array of all registered users (for enumeration)
    address[] public registeredUsers;
    
    /// @notice Mapping from user address to their index in the array
    mapping(address => uint256) private userIndex;
    
    /// @notice Total number of registered users
    uint256 public userCount;
    
    // ============ External Functions ============
    
    /**
     * @notice Register the caller as a ShieldAI protected user
     * @dev Can be called by anyone, but each address can only register once
     */
    function register() external {
        require(!isRegistered[msg.sender], "Already registered");
        
        isRegistered[msg.sender] = true;
        
        // Add to array
        userIndex[msg.sender] = registeredUsers.length;
        registeredUsers.push(msg.sender);
        
        userCount++;
        
        emit UserRegistered(msg.sender, block.timestamp);
    }
    
    /**
     * @notice Unregister the caller from ShieldAI protection
     * @dev Removes user from active monitoring
     */
    function unregister() external {
        require(isRegistered[msg.sender], "Not registered");
        
        isRegistered[msg.sender] = false;
        
        // Remove from array (swap with last element)
        uint256 index = userIndex[msg.sender];
        uint256 lastIndex = registeredUsers.length - 1;
        
        if (index != lastIndex) {
            address lastUser = registeredUsers[lastIndex];
            registeredUsers[index] = lastUser;
            userIndex[lastUser] = index;
        }
        
        registeredUsers.pop();
        delete userIndex[msg.sender];
        
        userCount--;
        
        emit UserUnregistered(msg.sender, block.timestamp);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get total number of registered users
     * @return Total count of active users
     */
    function getUserCount() external view returns (uint256) {
        return userCount;
    }
    
    /**
     * @notice Get a registered user by index
     * @param index Index in the registered users array
     * @return User address at that index
     */
    function getUserAt(uint256 index) external view returns (address) {
        require(index < registeredUsers.length, "Index out of bounds");
        return registeredUsers[index];
    }
    
    /**
     * @notice Get all registered users
     * @return Array of all registered user addresses
     */
    function getAllUsers() external view returns (address[] memory) {
        return registeredUsers;
    }
    
    /**
     * @notice Check if multiple addresses are registered
     * @param users Array of addresses to check
     * @return Array of booleans indicating registration status
     */
    function areUsersRegistered(address[] calldata users) external view returns (bool[] memory) {
        bool[] memory results = new bool[](users.length);
        for (uint256 i = 0; i < users.length; i++) {
            results[i] = isRegistered[users[i]];
        }
        return results;
    }
}
