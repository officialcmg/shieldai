// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/MaliciousContract.sol";

/**
 * @title DeployMalicious
 * @notice Deploy the malicious contract for testing ShieldAI threat detection
 * 
 * Run with:
 * forge script script/DeployMalicious.s.sol:DeployMalicious \
 *   --rpc-url https://testnet-rpc.monad.xyz \
 *   --broadcast \
 *   --private-key $PRIVATE_KEY
 */
contract DeployMalicious is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("Deploying MaliciousContract...");
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        
        MaliciousContract malicious = new MaliciousContract();
        
        console.log("\n===========================================");
        console.log("MALICIOUS CONTRACT DEPLOYED!");
        console.log("===========================================");
        console.log("Address:", address(malicious));
        console.log("Owner:", malicious.owner());
        console.log("\nADD THIS ADDRESS TO main.ts:");
        console.log("const MALICIOUS_CONTRACT_ADDRESS = '%s';", address(malicious));
        console.log("===========================================\n");
        
        vm.stopBroadcast();
    }
}
