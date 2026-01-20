"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { FACTORY_ADDRESS } from "@/lib/constants";
import { FACTORY_ABI, PAIR_ABI, ERC20_ABI } from "@/lib/abis";
import { formatUnits } from "viem";

const FACTORY_ABI_FULL = [
    ...FACTORY_ABI,
    {
        "inputs": [],
        "name": "allPairsLength",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "name": "allPairs",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

export function usePools() {
    const { data: pairCount } = useReadContract({
        address: FACTORY_ADDRESS as `0x${string}`,
        abi: FACTORY_ABI_FULL,
        functionName: "allPairsLength",
    });

    const pairIndices = Array.from({ length: Number(pairCount || 0) }, (_, i) => i);

    const { data: pairAddresses } = useReadContracts({
        contracts: pairIndices.map(index => ({
            address: FACTORY_ADDRESS as `0x${string}`,
            abi: FACTORY_ABI_FULL,
            functionName: "allPairs",
            args: [BigInt(index)],
        })),
        query: { enabled: !!pairCount }
    });

    // For each pair, fetch tokens and reserves
    // This is getting complex for a single hook, but let's try
    const pairMetadata = useReadContracts({
        contracts: (pairAddresses || []).flatMap((pair: any) => [
            { address: pair.result as `0x${string}`, abi: PAIR_ABI, functionName: "token0" },
            { address: pair.result as `0x${string}`, abi: PAIR_ABI, functionName: "token1" },
            { address: pair.result as `0x${string}`, abi: PAIR_ABI, functionName: "getReserves" },
        ]),
        query: { enabled: !!pairAddresses }
    });

    // Process pair data
    const pools = [];
    if (pairAddresses && pairMetadata.data) {
        for (let i = 0; i < pairAddresses.length; i++) {
            const token0Addr = pairMetadata.data[i * 3]?.result;
            const token1Addr = pairMetadata.data[i * 3 + 1]?.result;
            const reserves = pairMetadata.data[i * 3 + 2]?.result as any;

            if (token0Addr && token1Addr && reserves) {
                pools.push({
                    address: pairAddresses[i].result,
                    token0: token0Addr,
                    token1: token1Addr,
                    reserve0: reserves[0],
                    reserve1: reserves[1],
                });
            }
        }
    }

    return {
        pools,
        isLoading: pairMetadata.isLoading,
    };
}
