"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowDown, Droplets, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { ROUTER_ABI, ERC20_ABI, PAIR_ABI } from "@/lib/abis";
import { ROUTER_ADDRESS, TOKENS, WFLR_ADDRESS } from "@/lib/constants";
import { cn, formatAmount } from "@/lib/utils";

interface RemoveLiquidityModalProps {
    isOpen: boolean;
    onClose: () => void;
    position: any;
}

export function RemoveLiquidityModal({ isOpen, onClose, position }: RemoveLiquidityModalProps) {
    const [percent, setPercent] = useState("50");
    const { address } = useAccount();

    const token0 = useMemo(() => TOKENS.find(t => t.address.toLowerCase() === position?.token0.toLowerCase()) || { symbol: "TKN0", logo: "", decimals: 18 }, [position]);
    const token1 = useMemo(() => TOKENS.find(t => t.address.toLowerCase() === position?.token1.toLowerCase()) || { symbol: "TKN1", logo: "", decimals: 18 }, [position]);

    const isToken0WFLR = position?.token0.toLowerCase() === WFLR_ADDRESS.toLowerCase();
    const isToken1WFLR = position?.token1.toLowerCase() === WFLR_ADDRESS.toLowerCase();
    const hasFLR = isToken0WFLR || isToken1WFLR;

    // Calculations
    const lpAmount = useMemo(() => {
        if (!position || !percent) return 0n;
        return (position.balance * BigInt(Math.floor(parseFloat(percent) * 100))) / 10000n;
    }, [position, percent]);

    const amount0 = useMemo(() => {
        if (!position || !lpAmount) return 0n;
        return (lpAmount * position.reserve0) / position.totalSupply;
    }, [position, lpAmount]);

    const amount1 = useMemo(() => {
        if (!position || !lpAmount) return 0n;
        return (lpAmount * position.reserve1) / position.totalSupply;
    }, [position, lpAmount]);

    // Removal Logic
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: position?.pairAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: address ? [address, ROUTER_ADDRESS as `0x${string}`] : undefined,
        query: { enabled: !!address && !!position }
    });

    const isApprovalRequired = allowance !== undefined && (allowance as bigint) < lpAmount;

    const { writeContract: write, data: hash, isPending: isTxPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (isSuccess) {
            setTimeout(() => {
                onClose();
            }, 3000);
        }
    }, [isSuccess]);

    const handleRemove = async () => {
        if (isApprovalRequired) {
            write({
                address: position.pairAddress as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "approve",
                args: [ROUTER_ADDRESS as `0x${string}`, lpAmount],
            });
        } else {
            const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);
            const amount0Min = (amount0 * 98n) / 100n; // 2% slippage
            const amount1Min = (amount1 * 98n) / 100n;

            if (hasFLR) {
                const token = isToken0WFLR ? position.token1 : position.token0;
                const amountTokenMin = isToken0WFLR ? amount1Min : amount0Min;
                const amountFLRMin = isToken0WFLR ? amount0Min : amount1Min;

                write({
                    address: ROUTER_ADDRESS as `0x${string}`,
                    abi: ROUTER_ABI,
                    functionName: "removeLiquidityFLR",
                    args: [token, lpAmount, amountTokenMin, amountFLRMin, address!, deadline],
                });
            } else {
                write({
                    address: ROUTER_ADDRESS as `0x${string}`,
                    abi: ROUTER_ABI,
                    functionName: "removeLiquidity",
                    args: [position.token0, position.token1, lpAmount, amount0Min, amount1Min, address!, deadline],
                });
            }
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl p-8"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-white">Remove Liquidity</h2>
                            <p className="text-slate-500 text-sm">Withdraw your tokens from the pool</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Percent Input */}
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                            <div className="flex justify-between items-end mb-6">
                                <span className="text-5xl font-black text-white">{percent}%</span>
                                <span className="text-slate-500 font-bold uppercase tracking-wider text-sm">Amount</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="100"
                                value={percent}
                                onChange={(e) => setPercent(e.target.value)}
                                className="w-full accent-orange-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex gap-2 mt-6">
                                {["25", "50", "75", "100"].map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPercent(p)}
                                        className={cn(
                                            "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                                            percent === p ? "bg-orange-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                        )}
                                    >
                                        {p}%
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-center -my-4 relative z-10">
                            <div className="p-2 bg-slate-900 border border-white/10 rounded-xl shadow-xl">
                                <ArrowDown size={20} className="text-orange-500" />
                            </div>
                        </div>

                        {/* Output Info */}
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <img src={token0.logo} className="w-8 h-8 rounded-full" />
                                    <span className="font-bold text-white">{token0.symbol}</span>
                                </div>
                                <span className="text-lg font-bold text-slate-200">{formatAmount(formatUnits(amount0, token0.decimals))}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <img src={token1.logo} className="w-8 h-8 rounded-full" />
                                    <span className="font-bold text-white">{token1.symbol}</span>
                                </div>
                                <span className="text-lg font-bold text-slate-200">{formatAmount(formatUnits(amount1, token1.decimals))}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleRemove}
                        disabled={isTxPending || isConfirming}
                        className="w-full mt-8 py-5 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl font-black text-xl text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {isTxPending || isConfirming ? <Loader2 className="animate-spin" /> : null}
                        {isApprovalRequired ? `Approve ${token0.symbol}/${token1.symbol} LP` : "Remove Liquidity"}
                    </button>

                    {isSuccess && (
                        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 text-green-500 font-bold animate-in fade-in slide-in-from-top-2">
                            <CheckCircle2 size={20} />
                            Tokens returned to your wallet!
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
