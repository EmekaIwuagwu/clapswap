"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Info, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { TOKENS, ROUTER_ADDRESS, FACTORY_ADDRESS } from "@/lib/constants";
import { ROUTER_ABI, ERC20_ABI, FACTORY_ABI } from "@/lib/abis";
import { formatAmount } from "@/lib/utils";

export function AddLiquidityModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [tokenA, setTokenA] = useState(TOKENS[0]);
    const [tokenB, setTokenB] = useState(TOKENS[1]);
    const [amountA, setAmountA] = useState("");
    const [amountB, setAmountB] = useState("");
    const { address } = useAccount();

    const isNativeA = tokenA.address === "0x0000000000000000000000000000000000000000";
    const isNativeB = tokenB.address === "0x0000000000000000000000000000000000000000";

    const { data: balANative, refetch: rfAN } = useBalance({ address: address as `0x${string}`, query: { enabled: isNativeA } });
    const { data: balAErc, refetch: rfAE } = useReadContract({ address: tokenA.address as `0x${string}`, abi: ERC20_ABI, functionName: "balanceOf", args: [address as `0x${string}`], query: { enabled: !isNativeA && !!address } });
    const { data: balBNative, refetch: rfBN } = useBalance({ address: address as `0x${string}`, query: { enabled: isNativeB } });
    const { data: balBErc, refetch: rfBE } = useReadContract({ address: tokenB.address as `0x${string}`, abi: ERC20_ABI, functionName: "balanceOf", args: [address as `0x${string}`], query: { enabled: !isNativeB && !!address } });

    const balanceA = isNativeA ? (balANative ? formatUnits(balANative.value, balANative.decimals) : "0") : (balAErc ? formatUnits(balAErc as bigint, tokenA.decimals) : "0");
    const balanceB = isNativeB ? (balBNative ? formatUnits(balBNative.value, balBNative.decimals) : "0") : (balBErc ? formatUnits(balBErc as bigint, tokenB.decimals) : "0");

    const { data: allowanceA, refetch: rfAA } = useReadContract({
        address: tokenA.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: address && !isNativeA ? [address as `0x${string}`, ROUTER_ADDRESS as `0x${string}`] : undefined,
        query: { enabled: !!address && !isNativeA }
    });
    const { data: allowanceB, refetch: rfAB } = useReadContract({
        address: tokenB.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: address && !isNativeB ? [address as `0x${string}`, ROUTER_ADDRESS as `0x${string}`] : undefined,
        query: { enabled: !!address && !isNativeB }
    });

    const isApproveARequired = !isNativeA && (!allowanceA || (allowanceA as bigint) < parseUnits(amountA || "1", tokenA.decimals));
    const isApproveBRequired = !isNativeB && (!allowanceB || (allowanceB as bigint) < parseUnits(amountB || "1", tokenB.decimals));

    const { writeContract: write, data: hash, error: writeError, isPending: isTxPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess, error: confirmError } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (isSuccess) {
            rfAN(); rfAE(); rfBN(); rfBE(); rfAA(); rfAB();
        }
    }, [isSuccess]);

    const handleAction = async () => {
        if (!amountA || !amountB || !address) return;
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);
        const amtA = parseUnits(amountA, tokenA.decimals);
        const amtB = parseUnits(amountB, tokenB.decimals);

        if (isApproveARequired) {
            write({ address: tokenA.address as `0x${string}`, abi: ERC20_ABI, functionName: "approve", args: [ROUTER_ADDRESS as `0x${string}`, amtA] });
            return;
        }
        if (isApproveBRequired) {
            write({ address: tokenB.address as `0x${string}`, abi: ERC20_ABI, functionName: "approve", args: [ROUTER_ADDRESS as `0x${string}`, amtB] });
            return;
        }

        // Use a much higher gas limit for the first pool creation
        const gasLimit = BigInt(5000000);

        if (tokenA.symbol === "FLR") {
            write({
                address: ROUTER_ADDRESS as `0x${string}`,
                abi: ROUTER_ABI,
                functionName: "addLiquidityFLR",
                args: [tokenB.address as `0x${string}`, amtB, BigInt(0), BigInt(0), address, deadline],
                value: amtA,
                // @ts-ignore
                gas: gasLimit
            });
        } else if (tokenB.symbol === "FLR") {
            write({
                address: ROUTER_ADDRESS as `0x${string}`,
                abi: ROUTER_ABI,
                functionName: "addLiquidityFLR",
                args: [tokenA.address as `0x${string}`, amtA, BigInt(0), BigInt(0), address, deadline],
                value: amtB,
                // @ts-ignore
                gas: gasLimit
            });
        } else {
            write({
                address: ROUTER_ADDRESS as `0x${string}`,
                abi: ROUTER_ABI,
                functionName: "addLiquidity",
                args: [tokenA.address as `0x${string}`, tokenB.address as `0x${string}`, amtA, amtB, BigInt(0), BigInt(0), address, deadline],
                // @ts-ignore
                gas: gasLimit
            });
        }
    };

    if (!isOpen) return null;

    const buttonText = isApproveARequired ? `Approve ${tokenA.symbol}` : isApproveBRequired ? `Approve ${tokenB.symbol}` : "Supply Liquidity (Force)";

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-white">Add Liquidity</h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 transition-all hover:bg-white/10">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-slate-400">Token 1</span>
                                <span className="text-sm text-slate-500">Bal: {formatAmount(balanceA)}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <input type="number" value={amountA} onChange={(e) => setAmountA(e.target.value)} placeholder="0.0" className="bg-transparent border-none text-2xl font-bold text-white w-full outline-none" />
                                <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-1.5 border border-white/10">
                                    <img src={tokenA.logo} className="w-5 h-5 rounded-full" />
                                    <span className="font-bold text-sm">{tokenA.symbol}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center -my-2 relative z-10">
                            <div className="bg-slate-900 p-1 rounded-full border border-white/5"><Plus size={20} className="text-orange-500" /></div>
                        </div>

                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 transition-all hover:bg-white/10">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-slate-400">Token 2</span>
                                <span className="text-sm text-slate-500">Bal: {formatAmount(balanceB)}</span>
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

                    {(writeError || confirmError) && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-red-400 text-xs">
                            <AlertCircle size={16} className="shrink-0" />
                            <div className="space-y-1">
                                <p><b>Force Supply Active:</b> If this fails, go to MetaMask and manually increase the "Gas Limit" to 5,000,000.</p>
                                <p className="opacity-50">{(writeError || confirmError)?.message.split('.')[0]}</p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleAction}
                        disabled={!amountA || !amountB || isTxPending || isConfirming}
                        className="w-full mt-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl font-bold text-lg text-white shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        {isTxPending || isConfirming ? <Loader2 className="animate-spin" /> : null}
                        {buttonText}
                    </button>

                    {isSuccess && (
                        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2 text-green-500 text-sm">
                            <CheckCircle2 size={16} /> Seed Successful!
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
