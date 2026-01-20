// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./ClapswapPair.sol";

contract ClapswapFactory {
    address public feeTo;
    address public feeToSetter;

    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;

    event PairCreated(
        address indexed token0,
        address indexed token1,
        address pair,
        uint
    );

    constructor(address _feeToSetter) {
        feeToSetter = _feeToSetter;
    }

    function allPairsLength() external view returns (uint) {
        return allPairs.length;
    }

    function createPair(
        address tokenA,
        address tokenB
    ) external returns (address pair) {
        require(tokenA != tokenB, "Clapswap: IDENTICAL_ADDRESSES");
        (address token0, address token1) = tokenA < tokenB
            ? (tokenA, tokenB)
            : (tokenB, tokenA);
        require(token0 != address(0), "Clapswap: ZERO_ADDRESS");
        require(getPair[token0][token1] == address(0), "Clapswap: PAIR_EXISTS");

        // Simple deployment using new
        ClapswapPair newPair = new ClapswapPair();
        newPair.initialize(token0, token1);

        pair = address(newPair);
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair; // populate mapping in both directions
        allPairs.push(pair);
        emit PairCreated(token0, token1, pair, allPairs.length);
    }

    function setFeeTo(address _feeTo) external {
        require(msg.sender == feeToSetter, "Clapswap: FORBIDDEN");
        feeTo = _feeTo;
    }

    function setFeeToSetter(address _feeToSetter) external {
        require(msg.sender == feeToSetter, "Clapswap: FORBIDDEN");
        feeToSetter = _feeToSetter;
    }
}
