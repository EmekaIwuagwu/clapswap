"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Info, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { TOKENS, ROUTER_ADDRESS } from "@/lib/constants";
import { ROUTER_ABI, ERC20_ABI } from "@/lib/abis";
import { formatAmount } from "@/lib/utils";

export function AddLiquidityModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [tokenA, setTokenA] = useState(TOKENS[0]);
    const [tokenB, setTokenB] = useState(TOKENS[1]);
    const [amountA, setAmountA] = useState("");
    const [amountB, setAmountB] = useState("");
    const { address } = useAccount();

    const { data: balanceA } = useBalance({
        address: address as `0x${string}`,
        token: tokenA.address === "0x0000000000000000000000000000000000000000" ? undefined : tokenA.address as `0x${string}`,
    });
    const { data: balanceB } = useBalance({
        address: address as `0x${string}`,
        token: tokenB.address === "0x0000000000000000000000000000000000000000" ? undefined : tokenB.address as `0x${string}`,
    });

    // Approvals
    const { writeContract: write, data: hash, isPending: isTxPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const handleAddLiquidity = async () => {
        if (!amountA || !amountB || !address) return;

        const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);
        const amtA = parseUnits(amountA, tokenA.decimals);
        const amtB = parseUnits(amountB, tokenB.decimals);

        if (tokenA.symbol === "FLR") {
            write({
                address: ROUTER_ADDRESS as `0x${string}`,
                abi: ROUTER_ABI,
                functionName: "addLiquidityFLR",
                args: [tokenB.address as `0x${string}`, amtB, BigInt(0), BigInt(0), address, deadline],
                value: amtA,
            });
        } else if (tokenB.symbol === "FLR") {
            write({
                address: ROUTER_ADDRESS as `0x${string}`,
                abi: ROUTER_ABI,
                functionName: "addLiquidityFLR",
                args: [tokenA.address as `0x${string}`, amtA, BigInt(0), BigInt(0), address, deadline],
                value: amtB,
            });
        } else {
            write({
                address: ROUTER_ADDRESS as `0x${string}`,
                abi: ROUTER_ABI,
                functionName: "addLiquidity",
                args: [tokenA.address as `0x${string}`, tokenB.address as `0x${string}`, amtA, amtB, BigInt(0), BigInt(0), address, deadline],
            });
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-white">Add Liquidity</h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-slate-400">Token 1</span>
                                <span className="text-sm text-slate-500">Bal: {balanceA ? formatAmount(formatUnits(balanceA.value, balanceA.decimals)) : "0.00"}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <input type="number" value={amountA} onChange={(e) => setAmountA(e.target.value)} placeholder="0.0" className="bg-transparent border-none text-2xl font-bold text-white w-full outline-none" />
                                <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-1.5 border border-white/10">
                                    <img src={tokenA.logo} className="w-5 h-5 rounded-full" />
                                    <span className="font-bold text-sm">{tokenA.symbol}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center -my-2">
                            <Plus size={20} className="text-orange-500" />
                        </div>

                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-slate-400">Token 2</span>
                                <span className="text-sm text-slate-500">Bal: {balanceB ? formatAmount(formatUnits(balanceB.value, balanceB.decimals)) : "0.00"}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <input type="number" value={amountB} onChange={(e) => setAmountB(e.target.value)} placeholder="0.0" className="bg-transparent border-none text-2xl font-bold text-white w-full outline-none" />
                                <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-1.5 border border-white/10">
                                    <img src={tokenB.logo} className="w-5 h-5 rounded-full" />
                                    <span className="font-bold text-sm">{tokenB.symbol}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 bg-orange-500/5 border border-orange-500/10 rounded-2xl p-4 flex gap-3">
                        <Info size={18} className="text-orange-500 shrink-0" />
                        <p className="text-xs text-slate-400 leading-relaxed">
                            By adding liquidity you'll earn 0.3% of all trades on this pair proportional to your share of the pool.
                        </p>
                    </div>

                    <button
                        onClick={handleAddLiquidity}
                        disabled={!amountA || !amountB || isTxPending || isConfirming}
                        className="w-full mt-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl font-bold text-lg text-white shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isTxPending || isConfirming ? <Loader2 className="animate-spin" /> : null}
                        {isSuccess ? <CheckCircle2 /> : "Supply Liquidity"}
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
