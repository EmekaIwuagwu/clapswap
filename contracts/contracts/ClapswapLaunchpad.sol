// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ClapswapToken is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address owner
    ) ERC20(name, symbol) {
        _mint(owner, initialSupply * 10 ** decimals());
    }
}

contract ClapswapLaunchpad {
    event TokenCreated(
        address indexed tokenAddress,
        string name,
        string symbol,
        uint256 initialSupply,
        address indexed creator
    );

    address[] public allTokens;

    function createToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) external returns (address tokenAddress) {
        ClapswapToken newToken = new ClapswapToken(
            name,
            symbol,
            initialSupply,
            msg.sender
        );
        tokenAddress = address(newToken);
        allTokens.push(tokenAddress);
        emit TokenCreated(
            tokenAddress,
            name,
            symbol,
            initialSupply,
            msg.sender
        );
    }

    function allTokensLength() external view returns (uint256) {
        return allTokens.length;
    }
}
