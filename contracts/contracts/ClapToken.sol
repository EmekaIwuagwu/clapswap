// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ClapToken is ERC20, Ownable {
    constructor() ERC20("Clap Token", "CLAP") {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
