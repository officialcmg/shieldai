// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console2} from "forge-std/Script.sol";
import {UserRegistry} from "../src/UserRegistry.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        UserRegistry registry = new UserRegistry();
        
        console2.log("UserRegistry deployed at:", address(registry));
        
        vm.stopBroadcast();
    }
}
