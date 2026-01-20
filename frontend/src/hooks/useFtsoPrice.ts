"use client";

import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { FTSO_REGISTRY_ADDRESS } from "@/lib/constants";
import { useState, useEffect } from "react";

const FTSO_REGISTRY_ABI = [
    {
        "inputs": [{ "internalType": "string", "name": "_symbol", "type": "string" }],
        "name": "getCurrentPrice",
        "outputs": [
            { "internalType": "uint256", "name": "_price", "type": "uint256" },
            { "internalType": "uint256", "name": "_timestamp", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

export function useFtsoPrice(symbol: string = "FLR") {
    const { data, isLoading } = useReadContract({
        address: FTSO_REGISTRY_ADDRESS as `0x${string}`,
        abi: FTSO_REGISTRY_ABI,
        functionName: "getCurrentPrice",
        args: [symbol],
        query: {
            refetchInterval: 10000, // Refresh every 10s
        }
    });

    const price = data ? parseFloat(formatUnits((data as any)[0], 5)) : 0; // FTSO prices are 5 decimals Usually

    return {
        price,
        isLoading
    };
}
