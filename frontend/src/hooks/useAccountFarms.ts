"use client";

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { CHEF_ADDRESS } from "@/lib/constants";
import { MasterChef_ABI, PAIR_ABI } from "@/lib/abis";
import { useMemo } from "react";

const CHEF_ABI_FULL = [
    {
        "inputs": [],
        "name": "poolLength",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "name": "poolInfo",
        "outputs": [
            { "internalType": "contract IERC20", "name": "lpToken", "type": "address" },
            { "internalType": "uint256", "name": "allocPoint", "type": "uint256" },
            { "internalType": "uint256", "name": "lastRewardBlock", "type": "uint256" },
            { "internalType": "uint256", "name": "accClapPerShare", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" },
            { "internalType": "address", "name": "", "type": "address" }
        ],
        "name": "userInfo",
        "outputs": [
            { "internalType": "uint256", "name": "amount", "type": "uint256" },
            { "internalType": "uint256", "name": "rewardDebt", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_pid", "type": "uint256" },
            { "internalType": "address", "name": "_user", "type": "address" }
        ],
        "name": "pendingClap",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

export function useAccountFarms() {
    const { address } = useAccount();

    const { data: poolLength } = useReadContract({
        address: CHEF_ADDRESS as `0x${string}`,
        abi: CHEF_ABI_FULL,
        functionName: "poolLength",
    });

    const pids = Array.from({ length: Number(poolLength || 0) }, (_, i) => i);

    const poolData = useReadContracts({
        contracts: pids.flatMap(pid => [
            { address: CHEF_ADDRESS as `0x${string}`, abi: CHEF_ABI_FULL, functionName: "poolInfo", args: [BigInt(pid)] },
            { address: CHEF_ADDRESS as `0x${string}`, abi: CHEF_ABI_FULL, functionName: "userInfo", args: [BigInt(pid), address!] },
            { address: CHEF_ADDRESS as `0x${string}`, abi: CHEF_ABI_FULL, functionName: "pendingClap", args: [BigInt(pid), address!] },
        ]),
        query: { enabled: !!poolLength && !!address }
    });

    const lpMetadata = useReadContracts({
        contracts: (poolData.data || []).filter((_, i) => i % 3 === 0).map((p: any) => ({
            address: p.result?.[0] as `0x${string}`,
            abi: PAIR_ABI,
            functionName: "getReserves",
        })).concat((poolData.data || []).filter((_, i) => i % 3 === 0).flatMap((p: any) => [
            { address: p.result?.[0] as `0x${string}`, abi: PAIR_ABI, functionName: "token0" },
            { address: p.result?.[0] as `0x${string}`, abi: PAIR_ABI, functionName: "token1" },
            { address: p.result?.[0] as `0x${string}`, abi: PAIR_ABI, functionName: "totalSupply" },
        ])),
        query: { enabled: !!poolData.data }
    });

    const farms = useMemo(() => {
        const results = [];
        if (poolData.data && lpMetadata.data) {
            const numPools = pids.length;
            for (let i = 0; i < numPools; i++) {
                const info = poolData.data[i * 3]?.result as any;
                const user = poolData.data[i * 3 + 1]?.result as any;
                const pending = poolData.data[i * 3 + 2]?.result as bigint;

                if (user && user[0] > 0n) {
                    // This is complex because of flatMap, let's fix the indexing
                    const reserves = lpMetadata.data[i]?.result as any;
                    const token0 = lpMetadata.data[numPools + i * 3]?.result as string;
                    const token1 = lpMetadata.data[numPools + i * 3 + 1]?.result as string;
                    const totalSupply = lpMetadata.data[numPools + i * 3 + 2]?.result as bigint;

                    if (info && token0 && token1 && reserves && totalSupply) {
                        results.push({
                            pid: i,
                            lpToken: info[0],
                            stakedAmount: user[0],
                            pendingReward: pending,
                            token0,
                            token1,
                            reserve0: reserves[0],
                            reserve1: reserves[1],
                            totalSupply
                        });
                    }
                }
            }
        }
        return results;
    }, [poolLength, poolData.data, lpMetadata.data, pids]);

    return {
        farms,
        isLoading: poolData.isLoading || lpMetadata.isLoading,
        refetch: () => {
            poolData.refetch();
            lpMetadata.refetch();
        }
    };
}
