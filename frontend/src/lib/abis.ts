export const ROUTER_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "_factory", "type": "address" },
            { "internalType": "address", "name": "_WFLR", "type": "address" }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "WFLR",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
            { "internalType": "address[]", "name": "path", "type": "address[]" }
        ],
        "name": "getAmountsOut",
        "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "tokenA", "type": "address" },
            { "internalType": "address", "name": "tokenB", "type": "address" },
            { "internalType": "uint256", "name": "amountADesired", "type": "uint256" },
            { "internalType": "uint256", "name": "amountBDesired", "type": "uint256" },
            { "internalType": "uint256", "name": "amountAMin", "type": "uint256" },
            { "internalType": "uint256", "name": "amountBMin", "type": "uint256" },
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "uint256", "name": "deadline", "type": "uint256" }
        ],
        "name": "addLiquidity",
        "outputs": [
            { "internalType": "uint256", "name": "amountA", "type": "uint256" },
            { "internalType": "uint256", "name": "amountB", "type": "uint256" },
            { "internalType": "uint256", "name": "liquidity", "type": "uint256" }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "token", "type": "address" },
            { "internalType": "uint256", "name": "amountTokenDesired", "type": "uint256" },
            { "internalType": "uint256", "name": "amountTokenMin", "type": "uint256" },
            { "internalType": "uint256", "name": "amountFLRMin", "type": "uint256" },
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "uint256", "name": "deadline", "type": "uint256" }
        ],
        "name": "addLiquidityFLR",
        "outputs": [
            { "internalType": "uint256", "name": "amountToken", "type": "uint256" },
            { "internalType": "uint256", "name": "amountFLR", "type": "uint256" },
            { "internalType": "uint256", "name": "liquidity", "type": "uint256" }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
            { "internalType": "address[]", "name": "path", "type": "address[]" },
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "uint256", "name": "deadline", "type": "uint256" }
        ],
        "name": "swapExactFLRForTokens",
        "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
            { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
            { "internalType": "address[]", "name": "path", "type": "address[]" },
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "uint256", "name": "deadline", "type": "uint256" }
        ],
        "name": "swapExactTokensForFLR",
        "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
            { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
            { "internalType": "address[]", "name": "path", "type": "address[]" },
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "uint256", "name": "deadline", "type": "uint256" }
        ],
        "name": "swapExactTokensForTokens",
        "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

export const ERC20_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "spender", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "approve",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "owner", "type": "address" },
            { "internalType": "address", "name": "spender", "type": "address" }
        ],
        "name": "allowance",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
] as const;
