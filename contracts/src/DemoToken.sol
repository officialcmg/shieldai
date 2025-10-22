// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title DemoToken
 * @notice A simple ERC20 token for testing ShieldAI
 * @dev Anyone can mint tokens for testing purposes
 */
contract DemoToken is ERC20 {
    constructor() ERC20("Shield Demo Token", "SHIELD") {
        // Mint 1 million tokens to deployer
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }
    
    /**
     * @notice Mint tokens to any address (for testing)
     * @dev In production, this would be restricted
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
    
    /**
     * @notice Get token decimals (6 decimals like USDC)
     */
    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
