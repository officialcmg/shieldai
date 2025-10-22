// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/DemoToken.sol";
import "../src/MaliciousContract.sol";

/**
 * @title DeployDemo
 * @notice Deploy demo token and malicious contract for ShieldAI testing on Base
 * 
 * Run with:
 * forge script script/DeployDemo.s.sol:DeployDemo \
 *   --rpc-url base \
 *   --broadcast \
 *   --private-key $PRIVATE_KEY
 */
contract DeployDemo is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("===========================================");
        console.log("DEPLOYING DEMO CONTRACTS TO BASE");
        console.log("===========================================");
        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);
        console.log("");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy Demo Token
        console.log("1. Deploying DemoToken...");
        DemoToken token = new DemoToken();
        console.log("   DemoToken deployed at:", address(token));
        console.log("   Name:", token.name());
        console.log("   Symbol:", token.symbol());
        console.log("   Decimals:", token.decimals());
        console.log("   Initial Supply:", token.totalSupply() / 10**token.decimals(), "SHIELD");
        console.log("");
        
        // Deploy Malicious Contract
        console.log("2. Deploying MaliciousContract...");
        MaliciousContract malicious = new MaliciousContract();
        console.log("   MaliciousContract deployed at:", address(malicious));
        console.log("   Owner:", malicious.owner());
        console.log("");
        
        vm.stopBroadcast();
        
        // Print update instructions
        console.log("===========================================");
        console.log("DEPLOYMENT COMPLETE!");
        console.log("===========================================");
        console.log("");
        console.log("UPDATE THESE ADDRESSES IN frontend/src/components/DemoSection.tsx:");
        console.log("");
        console.log("const DEMO_TOKEN_ADDRESS = '%s'", address(token));
        console.log("const MALICIOUS_CONTRACT = '%s'", address(malicious));
        console.log("");
        console.log("===========================================");
    }
}
