// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Test, console2} from "forge-std/Test.sol";
import {UserRegistry} from "../src/UserRegistry.sol";

contract UserRegistryTest is Test {
    UserRegistry public registry;
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    address public user3 = address(0x3);

    event UserRegistered(address indexed user, uint256 timestamp);
    event UserUnregistered(address indexed user, uint256 timestamp);

    function setUp() public {
        registry = new UserRegistry();
    }

    function test_Register() public {
        vm.expectEmit(true, false, false, true);
        emit UserRegistered(user1, block.timestamp);
        
        vm.prank(user1);
        registry.register();
        
        assertTrue(registry.isRegistered(user1));
        assertEq(registry.userCount(), 1);
        assertEq(registry.getUserAt(0), user1);
    }

    function test_RegisterMultipleUsers() public {
        vm.prank(user1);
        registry.register();
        
        vm.prank(user2);
        registry.register();
        
        vm.prank(user3);
        registry.register();
        
        assertEq(registry.userCount(), 3);
        assertTrue(registry.isRegistered(user1));
        assertTrue(registry.isRegistered(user2));
        assertTrue(registry.isRegistered(user3));
    }

    function test_RevertWhen_AlreadyRegistered() public {
        vm.startPrank(user1);
        registry.register();
        
        vm.expectRevert("Already registered");
        registry.register();
        vm.stopPrank();
    }

    function test_Unregister() public {
        vm.startPrank(user1);
        registry.register();
        
        vm.expectEmit(true, false, false, true);
        emit UserUnregistered(user1, block.timestamp);
        
        registry.unregister();
        vm.stopPrank();
        
        assertFalse(registry.isRegistered(user1));
        assertEq(registry.userCount(), 0);
    }

    function test_RevertWhen_UnregisterNotRegistered() public {
        vm.prank(user1);
        vm.expectRevert("Not registered");
        registry.unregister();
    }

    function test_UnregisterMiddleUser() public {
        // Register 3 users
        vm.prank(user1);
        registry.register();
        
        vm.prank(user2);
        registry.register();
        
        vm.prank(user3);
        registry.register();
        
        // Unregister middle user
        vm.prank(user2);
        registry.unregister();
        
        assertEq(registry.userCount(), 2);
        assertFalse(registry.isRegistered(user2));
        assertTrue(registry.isRegistered(user1));
        assertTrue(registry.isRegistered(user3));
    }

    function test_GetAllUsers() public {
        vm.prank(user1);
        registry.register();
        
        vm.prank(user2);
        registry.register();
        
        address[] memory users = registry.getAllUsers();
        assertEq(users.length, 2);
        assertEq(users[0], user1);
        assertEq(users[1], user2);
    }

    function test_AreUsersRegistered() public {
        vm.prank(user1);
        registry.register();
        
        vm.prank(user3);
        registry.register();
        
        address[] memory usersToCheck = new address[](3);
        usersToCheck[0] = user1;
        usersToCheck[1] = user2;
        usersToCheck[2] = user3;
        
        bool[] memory results = registry.areUsersRegistered(usersToCheck);
        
        assertTrue(results[0]);  // user1 is registered
        assertFalse(results[1]); // user2 is not registered
        assertTrue(results[2]);  // user3 is registered
    }
}
