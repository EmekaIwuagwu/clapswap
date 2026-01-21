"use client";

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { ROUTER_ABI, FACTORY_ABI, PAIR_ABI } from "@/lib/abis";
import { ROUTER_ADDRESS, FACTORY_ADDRESS, WFLR_ADDRESS, TOKENS } from "@/lib/constants";
import { useState, useEffect, useMemo } from "react";

export function useSwap(tokenIn: any, tokenOut: any, amountIn: string) {
    const { address } = useAccount();
    const [debouncedAmountIn, setDebouncedAmountIn] = useState(amountIn);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedAmountIn(amountIn), 500);
        return () => clearTimeout(timer);
    }, [amountIn]);

    const addrIn = tokenIn.address === "0x0000000000000000000000000000000000000000" ? WFLR_ADDRESS : tokenIn.address;
    const addrOut = tokenOut.address === "0x0000000000000000000000000000000000000000" ? WFLR_ADDRESS : tokenOut.address;

    // Define potential paths for multi-hop
    // 1. Direct: In -> Out
    // 2. Through WFLR: In -> WFLR -> Out
    // 3. Through USDC: In -> USDC -> Out
    const allPaths = useMemo(() => {
        if (!addrIn || !addrOut || addrIn === addrOut) return [];

        const paths = [[addrIn, addrOut]];

        // Only add multi-hop if the bridge token isn't already the start or end
        if (addrIn !== WFLR_ADDRESS && addrOut !== WFLR_ADDRESS) {
            paths.push([addrIn, WFLR_ADDRESS, addrOut]);
        }

        // Bridge through USDC if possible
        const USDC_ADDR = TOKENS.find(t => t.symbol === "USDC")?.address;
        if (USDC_ADDR && addrIn !== USDC_ADDR && addrOut !== USDC_ADDR) {
            paths.push([addrIn, USDC_ADDR, addrOut]);
        }

        return paths;
    }, [addrIn, addrOut]);

    // 1. Get Quotes for all paths
    const { data: multipleQuotes, isLoading: isQuoteLoading } = useReadContracts({
        contracts: allPaths.map(path => ({
            address: ROUTER_ADDRESS as `0x${string}`,
            abi: ROUTER_ABI,
            functionName: "getAmountsOut",
            args: debouncedAmountIn && parseFloat(debouncedAmountIn) > 0
                ? [parseUnits(debouncedAmountIn, tokenIn.decimals), path as readonly `0x${string}`[]]
                : undefined,
        })),
        query: {
            enabled: !!debouncedAmountIn && parseFloat(debouncedAmountIn) > 0 && allPaths.length > 0,
            retry: false,
        }
    });

    // 2. Find the best path
    const { quote, bestPath, pathIndex } = useMemo(() => {
        if (!multipleQuotes || multipleQuotes.length === 0) return { quote: "", bestPath: [], pathIndex: -1 };

        let bestAmount = 0n;
        let index = -1;

        multipleQuotes.forEach((res, i) => {
            if (res.status === "success" && res.result) {
                const amounts = res.result as bigint[];
                const finalAmount = amounts[amounts.length - 1];
                if (finalAmount > bestAmount) {
                    bestAmount = finalAmount;
                    index = i;
                }
            }
        });

        if (index === -1) return { quote: "", bestPath: [], pathIndex: -1 };

        return {
            quote: formatUnits(bestAmount, tokenOut.decimals),
            bestPath: allPaths[index],
            pathIndex: index
        };
    }, [multipleQuotes, allPaths, tokenOut.decimals]);

    // 3. Get Reserves for Price Impact (of the direct pair for simplicity, or the first leg)
    const { data: pairAddress } = useReadContract({
        address: FACTORY_ADDRESS as `0x${string}`,
        abi: FACTORY_ABI,
        functionName: "getPair",
        args: bestPath.length >= 2 ? [bestPath[0] as `0x${string}`, bestPath[1] as `0x${string}`] : undefined,
        query: { enabled: bestPath.length >= 2 }
    });

    const { data: reserves } = useReadContract({
        address: pairAddress as `0x${string}`,
        abi: PAIR_ABI,
        functionName: "getReserves",
        query: { enabled: !!pairAddress && pairAddress !== "0x0000000000000000000000000000000000000000" }
    });

    const { data: token0 } = useReadContract({
        address: pairAddress as `0x${string}`,
        abi: PAIR_ABI,
        functionName: "token0",
        query: { enabled: !!pairAddress && pairAddress !== "0x0000000000000000000000000000000000000000" }
    });

    const priceImpact = useMemo(() => {
        if (!debouncedAmountIn || !quote || !reserves || !token0 || bestPath.length === 0) return null;

        const [r0, r1] = (reserves as any);
        const isTokenIn0 = (token0 as string).toLowerCase() === (bestPath[0] as string).toLowerCase();

        const reserveIn = isTokenIn0 ? r0 : r1;
        const reserveOut = isTokenIn0 ? r1 : r0;

        const executionPrice = parseFloat(quote) / parseFloat(debouncedAmountIn);
        const spotPrice = parseFloat(formatUnits(reserveOut, tokenOut.decimals)) / parseFloat(formatUnits(reserveIn, tokenIn.decimals));

        // Multi-hop impact is higher, but this gives a decent estimate of the first leg's liquidity depth
        const impact = (1 - (executionPrice / spotPrice)) * 100;
        return impact < 0 ? 0 : impact;
    }, [debouncedAmountIn, quote, reserves, token0, bestPath, tokenIn.decimals, tokenOut.decimals]);

    return {
        quote,
        priceImpact,
        bestPath,
        isLoading: isQuoteLoading,
        error: indexToError(multipleQuotes)
    };
}

function indexToError(quotes: any) {
    if (!quotes) return undefined;
    const allFailed = quotes.every((q: any) => q.status === "failure");
    if (allFailed && quotes.length > 0) return quotes[0].error;
    return undefined;
}
