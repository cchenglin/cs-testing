// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AttendanceRecorder {
    event Recorded(bytes32 indexed dataHash, address indexed sender, uint256 timestamp);
    mapping(bytes32 => bool) public seen;

    function recordData(bytes32 dataHash) external {
        require(!seen[dataHash], "already recorded");
        seen[dataHash] = true;
        emit Recorded(dataHash, msg.sender, block.timestamp);
    }
}
