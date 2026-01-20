// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./ClapswapFactory.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IWFLR is IERC20 {
    function deposit() external payable;
    function withdraw(uint) external;
}

contract ClapswapRouter {
    address public immutable factory;
    address public immutable WFLR;

    modifier ensure(uint deadline) {
        require(deadline >= block.timestamp, "ClapswapRouter: EXPIRED");
        _;
    }

    constructor(address _factory, address _WFLR) {
        factory = _factory;
        WFLR = _WFLR;
    }

    receive() external payable {
        assert(msg.sender == WFLR); // only accept FLR via fallback from the WFLR contract
    }

    // **** ADD LIQUIDITY ****
    function _addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin
    ) internal virtual returns (uint amountA, uint amountB) {
        // create the pair if it doesn't exist yet
        if (ClapswapFactory(factory).getPair(tokenA, tokenB) == address(0)) {
            ClapswapFactory(factory).createPair(tokenA, tokenB);
        }
        (uint reserveA, uint reserveB) = getReserves(tokenA, tokenB);
        if (reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            uint amountBOptimal = quote(amountADesired, reserveA, reserveB);
            if (amountBOptimal <= amountBDesired) {
                require(
                    amountBOptimal >= amountBMin,
                    "ClapswapRouter: INSUFFICIENT_B_AMOUNT"
                );
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint amountAOptimal = quote(amountBDesired, reserveB, reserveA);
                assert(amountAOptimal <= amountADesired);
                require(
                    amountAOptimal >= amountAMin,
                    "ClapswapRouter: INSUFFICIENT_A_AMOUNT"
                );
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }
    }

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    )
        external
        virtual
        ensure(deadline)
        returns (uint amountA, uint amountB, uint liquidity)
    {
        (amountA, amountB) = _addLiquidity(
            tokenA,
            tokenB,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin
        );
        address pair = ClapswapFactory(factory).getPair(tokenA, tokenB);
        IERC20(tokenA).transferFrom(msg.sender, pair, amountA);
        IERC20(tokenB).transferFrom(msg.sender, pair, amountB);
        liquidity = ClapswapPair(pair).mint(to);
    }

    function addLiquidityFLR(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountFLRMin,
        address to,
        uint deadline
    )
        external
        payable
        virtual
        ensure(deadline)
        returns (uint amountToken, uint amountFLR, uint liquidity)
    {
        (amountToken, amountFLR) = _addLiquidity(
            token,
            WFLR,
            amountTokenDesired,
            msg.value,
            amountTokenMin,
            amountFLRMin
        );
        address pair = ClapswapFactory(factory).getPair(token, WFLR);
        IERC20(token).transferFrom(msg.sender, pair, amountToken);
        IWFLR(WFLR).deposit{value: amountFLR}();
        assert(IWFLR(WFLR).transfer(pair, amountFLR));
        liquidity = ClapswapPair(pair).mint(to);
        // refund dust FLR, if any
        if (msg.value > amountFLR)
            payable(msg.sender).transfer(msg.value - amountFLR);
    }

    // **** REMOVE LIQUIDITY ****
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) public virtual ensure(deadline) returns (uint amountA, uint amountB) {
        address pair = ClapswapFactory(factory).getPair(tokenA, tokenB);
        IERC20(pair).transferFrom(msg.sender, pair, liquidity); // send liquidity to pair
        (uint amount0, uint amount1) = ClapswapPair(pair).burn(to);
        (address token0, ) = sortTokens(tokenA, tokenB);
        (amountA, amountB) = tokenA == token0
            ? (amount0, amount1)
            : (amount1, amount0);
        require(amountA >= amountAMin, "ClapswapRouter: INSUFFICIENT_A_AMOUNT");
        require(amountB >= amountBMin, "ClapswapRouter: INSUFFICIENT_B_AMOUNT");
    }

    // **** SWAP ****
    function _swap(
        uint[] memory amounts,
        address[] memory path,
        address _to
    ) internal virtual {
        for (uint i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0, ) = sortTokens(input, output);
            uint amountOut = amounts[i + 1];
            (uint amount0Out, uint amount1Out) = input == token0
                ? (uint(0), amountOut)
                : (amountOut, uint(0));
            address to = i < path.length - 2
                ? ClapswapFactory(factory).getPair(output, path[i + 2])
                : _to;
            ClapswapPair(ClapswapFactory(factory).getPair(input, output)).swap(
                amount0Out,
                amount1Out,
                to,
                new bytes(0)
            );
        }
    }

    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external virtual ensure(deadline) returns (uint[] memory amounts) {
        amounts = getAmountsOut(amountIn, path);
        require(
            amounts[amounts.length - 1] >= amountOutMin,
            "ClapswapRouter: INSUFFICIENT_OUTPUT_AMOUNT"
        );
        IERC20(path[0]).transferFrom(
            msg.sender,
            ClapswapFactory(factory).getPair(path[0], path[1]),
            amounts[0]
        );
        _swap(amounts, path, to);
    }

    function swapExactFLRForTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    )
        external
        payable
        virtual
        ensure(deadline)
        returns (uint[] memory amounts)
    {
        require(path[0] == WFLR, "ClapswapRouter: INVALID_PATH");
        amounts = getAmountsOut(msg.value, path);
        require(
            amounts[amounts.length - 1] >= amountOutMin,
            "ClapswapRouter: INSUFFICIENT_OUTPUT_AMOUNT"
        );
        IWFLR(WFLR).deposit{value: amounts[0]}();
        assert(
            IWFLR(WFLR).transfer(
                ClapswapFactory(factory).getPair(path[0], path[1]),
                amounts[0]
            )
        );
        _swap(amounts, path, to);
    }

    function swapExactTokensForFLR(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external virtual ensure(deadline) returns (uint[] memory amounts) {
        require(path[path.length - 1] == WFLR, "ClapswapRouter: INVALID_PATH");
        amounts = getAmountsOut(amountIn, path);
        require(
            amounts[amounts.length - 1] >= amountOutMin,
            "ClapswapRouter: INSUFFICIENT_OUTPUT_AMOUNT"
        );
        IERC20(path[0]).transferFrom(
            msg.sender,
            ClapswapFactory(factory).getPair(path[0], path[1]),
            amounts[0]
        );
        _swap(amounts, path, address(this));
        IWFLR(WFLR).withdraw(amounts[amounts.length - 1]);
        payable(to).transfer(amounts[amounts.length - 1]);
    }

    // **** LIBRARY FUNCTIONS ****
    function sortTokens(
        address tokenA,
        address tokenB
    ) internal pure returns (address token0, address token1) {
        require(tokenA != tokenB, "ClapswapRouter: IDENTICAL_ADDRESSES");
        (token0, token1) = tokenA < tokenB
            ? (tokenA, tokenB)
            : (tokenB, tokenA);
        require(token0 != address(0), "ClapswapRouter: ZERO_ADDRESS");
    }

    function getReserves(
        address tokenA,
        address tokenB
    ) public view returns (uint reserveA, uint reserveB) {
        (address token0, ) = sortTokens(tokenA, tokenB);
        (uint reserve0, uint reserve1, ) = ClapswapPair(
            ClapswapFactory(factory).getPair(tokenA, tokenB)
        ).getReserves();
        (reserveA, reserveB) = tokenA == token0
            ? (reserve0, reserve1)
            : (reserve1, reserve0);
    }

    function quote(
        uint amountA,
        uint reserveA,
        uint reserveB
    ) public pure virtual returns (uint amountB) {
        require(amountA > 0, "ClapswapRouter: INSUFFICIENT_AMOUNT");
        require(
            reserveA > 0 && reserveB > 0,
            "ClapswapRouter: INSUFFICIENT_LIQUIDITY"
        );
        amountB = (amountA * reserveB) / reserveA;
    }

    function getAmountOut(
        uint amountIn,
        uint reserveIn,
        uint reserveOut
    ) public pure virtual returns (uint amountOut) {
        require(amountIn > 0, "ClapswapRouter: INSUFFICIENT_INPUT_AMOUNT");
        require(
            reserveIn > 0 && reserveOut > 0,
            "ClapswapRouter: INSUFFICIENT_LIQUIDITY"
        );
        uint amountInWithFee = amountIn * 997;
        uint numerator = amountInWithFee * reserveOut;
        uint denominator = reserveIn * 1000 + amountInWithFee;
        amountOut = numerator / denominator;
    }

    function getAmountsOut(
        uint amountIn,
        address[] memory path
    ) public view virtual returns (uint[] memory amounts) {
        require(path.length >= 2, "ClapswapRouter: INVALID_PATH");
        amounts = new uint[](path.length);
        amounts[0] = amountIn;
        for (uint i; i < path.length - 1; i++) {
            (uint reserveIn, uint reserveOut) = getReserves(
                path[i],
                path[i + 1]
            );
            amounts[i + 1] = getAmountOut(amounts[i], reserveIn, reserveOut);
        }
    }
}
