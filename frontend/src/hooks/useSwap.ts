"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { ROUTER_ABI, ERC20_ABI } from "@/lib/abis";
import { ROUTER_ADDRESS, WFLR_ADDRESS } from "@/lib/constants";
import { useState, useEffect } from "react";

export function useSwap(tokenIn: any, tokenOut: any, amountIn: string) {
    const { address } = useAccount();
    const [debouncedAmountIn, setDebouncedAmountIn] = useState(amountIn);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedAmountIn(amountIn), 500);
        return () => clearTimeout(timer);
    }, [amountIn]);

    const path = [
        tokenIn.address === "0x0000000000000000000000000000000000000000" ? WFLR_ADDRESS : tokenIn.address,
        tokenOut.address === "0x0000000000000000000000000000000000000000" ? WFLR_ADDRESS : tokenOut.address
    ];

    const { data: amountsOut, isLoading: isQuoteLoading, error } = useReadContract({
        address: ROUTER_ADDRESS as `0x${string}`,
        abi: ROUTER_ABI,
        functionName: "getAmountsOut",
        args: debouncedAmountIn && parseFloat(debouncedAmountIn) > 0
            ? [parseUnits(debouncedAmountIn, tokenIn.decimals), path as readonly `0x${string}`[]]
            : undefined,
        query: {
            enabled: !!debouncedAmountIn && parseFloat(debouncedAmountIn) > 0 && tokenIn.address !== tokenOut.address,
            retry: false,
        }
    });

    const quote = amountsOut ? formatUnits((amountsOut as any)[path.length - 1], tokenOut.decimals) : "";

    return {
        quote,
        isLoading: isQuoteLoading,
        error
    };
}
