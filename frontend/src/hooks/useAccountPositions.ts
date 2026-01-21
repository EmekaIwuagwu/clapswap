"use client";

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { FACTORY_ADDRESS } from "@/lib/constants";
import { FACTORY_ABI, PAIR_ABI } from "@/lib/abis";
import { formatUnits } from "viem";
import { useMemo } from "react";

export function useAccountPositions() {
    const { address } = useAccount();

    const { data: pairCount } = useReadContract({
        address: FACTORY_ADDRESS as `0x${string}`,
        abi: FACTORY_ABI,
        functionName: "allPairsLength",
    });

    const pairIndices = Array.from({ length: Number(pairCount || 0) }, (_, i) => i);

    const { data: pairAddresses } = useReadContracts({
        contracts: pairIndices.map(index => ({
            address: FACTORY_ADDRESS as `0x${string}`,
            abi: FACTORY_ABI,
            functionName: "allPairs",
            args: [BigInt(index)],
        })),
        query: { enabled: !!pairCount }
    });

    const lpBalances = useReadContracts({
        contracts: (pairAddresses || []).map((pair: any) => ({
            address: pair.result as `0x${string}`,
            abi: PAIR_ABI,
            functionName: "balanceOf",
            args: [address as `0x${string}`],
        })),
        query: { enabled: !!pairAddresses && !!address }
    });

    const pairMetadata = useReadContracts({
        contracts: (pairAddresses || []).flatMap((pair: any) => [
            { address: pair.result as `0x${string}`, abi: PAIR_ABI, functionName: "token0" },
            { address: pair.result as `0x${string}`, abi: PAIR_ABI, functionName: "token1" },
            { address: pair.result as `0x${string}`, abi: PAIR_ABI, functionName: "getReserves" },
            { address: pair.result as `0x${string}`, abi: PAIR_ABI, functionName: "totalSupply" },
        ]),
        query: { enabled: !!pairAddresses }
    });

    const positions = useMemo(() => {
        const results = [];
        if (pairAddresses && lpBalances.data && pairMetadata.data) {
            for (let i = 0; i < pairAddresses.length; i++) {
                const balance = lpBalances.data[i]?.result as bigint;

                if (balance && balance > 0n) {
                    const token0 = pairMetadata.data[i * 4]?.result as string;
                    const token1 = pairMetadata.data[i * 4 + 1]?.result as string;
                    const reserves = pairMetadata.data[i * 4 + 2]?.result as any;
                    const totalSupply = pairMetadata.data[i * 4 + 3]?.result as bigint;

                    if (token0 && token1 && reserves && totalSupply) {
                        results.push({
                            pairAddress: pairAddresses[i].result as string,
                            token0,
                            token1,
                            balance,
                            totalSupply,
                            reserve0: reserves[0],
                            reserve1: reserves[1],
                        });
                    }
                }
            }
        }
        return results;
    }, [pairAddresses, lpBalances.data, pairMetadata.data]);

    return {
        positions,
        isLoading: lpBalances.isLoading || pairMetadata.isLoading,
        refetch: () => {
            lpBalances.refetch();
            pairMetadata.refetch();
        }
    };
}
