"use client";

import React from "react";
import { X, ArrowRight, Share2, Info, AlertTriangle, ExternalLink, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatAmount } from "@/lib/utils";

interface SwapConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    tokenIn: any;
    tokenOut: any;
    amountIn: string;
    amountOut: string;
    priceImpact: number | null;
    bestPath: string[];
    slippage: string;
    getTokenSymbol: (addr: string) => string;
}

export function SwapConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    tokenIn,
    tokenOut,
    amountIn,
    amountOut,
    priceImpact,
    bestPath,
    slippage,
    getTokenSymbol,
}: SwapConfirmModalProps) {
    if (!isOpen) return null;

    const minReceived = parseFloat(amountOut) * (1 - parseFloat(slippage) / 100);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl flex flex-col p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black text-white px-2">Review Swap</h3>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white group">
                            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Token Breakdown */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <img src={tokenIn.logo} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <div className="text-xl font-black text-white">{amountIn}</div>
                                        <div className="text-xs text-slate-500">{tokenIn.symbol}</div>
                                    </div>
                                </div>
                                <div className="text-slate-700 font-black">OUT</div>
                            </div>

                            <div className="flex justify-center -my-6 relative z-10">
                                <div className="bg-slate-900 p-2 rounded-2xl border border-white/10 shadow-xl text-orange-500">
                                    <ArrowRight size={20} className="rotate-90" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <img src={tokenOut.logo} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <div className="text-xl font-black text-white">{amountOut}</div>
                                        <div className="text-xs text-slate-500">{tokenOut.symbol}</div>
                                    </div>
                                </div>
                                <div className="text-green-500 font-black">IN</div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">Exchange Rate</span>
                                <span className="text-white font-bold">1 {tokenIn.symbol} = {(parseFloat(amountOut) / parseFloat(amountIn)).toFixed(6)} {tokenOut.symbol}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">Minimum Received</span>
                                <span className="text-white font-bold">{formatAmount(minReceived.toString())} {tokenOut.symbol}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">Price Impact</span>
                                <span className={priceImpact && priceImpact > 5 ? "text-red-500 font-bold" : "text-green-500 font-bold"}>
                                    {priceImpact ? (priceImpact < 0.01 ? "< 0.01%" : `${priceImpact.toFixed(2)}%`) : "Calculating..."}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">Route</span>
                                <div className="flex items-center gap-1">
                                    {bestPath.map((addr, i) => (
                                        <React.Fragment key={addr}>
                                            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300 font-bold">{getTokenSymbol(addr)}</span>
                                            {i < bestPath.length - 1 && <Share2 size={10} className="rotate-90 text-slate-700" />}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {priceImpact && priceImpact > 5 && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold leading-tight">
                                <AlertTriangle size={18} className="shrink-0" />
                                High Price Impact! You will lose approximately {priceImpact.toFixed(2)}% of your value to slippage.
                            </div>
                        )}

                        <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-start gap-3 mt-2">
                            <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-slate-400 font-medium leading-normal">
                                Output is estimated. You will receive at least <span className="text-white font-bold">{formatAmount(minReceived.toString())} {tokenOut.symbol}</span> or the transaction will revert.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onConfirm}
                        className="w-full mt-8 py-5 bg-gradient-to-r from-orange-500 to-red-600 rounded-[24px] font-black text-xl text-white shadow-2xl shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        Confirm Swap
                    </button>

                    <p className="text-center text-[10px] text-slate-600 mt-4 font-medium uppercase tracking-widest">Powered by Flare FTSO</p>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

export function SwapStatusModal({
    isOpen,
    onClose,
    txHash,
    status
}: {
    isOpen: boolean;
    onClose: () => void;
    txHash?: string;
    status: "pending" | "success" | "error";
}) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl flex flex-col p-10 items-center text-center">

                    <div className="mb-8">
                        {status === "pending" && (
                            <div className="relative">
                                <div className="absolute inset-0 bg-orange-500/20 blur-3xl animate-pulse rounded-full" />
                                <div className="relative p-6 rounded-full bg-white/5 border border-white/10">
                                    <Loader2 className="animate-spin text-orange-500" size={64} />
                                </div>
                            </div>
                        )}
                        {status === "success" && (
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full" />
                                <div className="relative p-6 rounded-full bg-green-500/10 border border-green-500/20 text-green-500">
                                    <CheckCircle2 size={64} />
                                </div>
                            </div>
                        )}
                        {status === "error" && (
                            <div className="relative">
                                <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
                                <div className="relative p-6 rounded-full bg-red-500/10 border border-red-500/20 text-red-500">
                                    <AlertTriangle size={64} />
                                </div>
                            </div>
                        )}
                    </div>

                    <h3 className="text-2xl font-black text-white mb-2">
                        {status === "pending" ? "Executing Swap" : status === "success" ? "Swap Complete!" : "Swap Failed"}
                    </h3>

                    <p className="text-slate-400 text-sm font-medium mb-8">
                        {status === "pending" ? "Follow instructions in your wallet to complete the trade." : status === "success" ? "Your tokens have been successfully exchanged on Flare Network." : "Something went wrong with your transaction. Please try again."}
                    </p>

                    {txHash && (
                        <a
                            href={`https://coston2-explorer.flare.network/tx/${txHash}`}
                            target="_blank"
                            className="flex items-center gap-2 text-sm font-bold text-orange-500 hover:text-orange-400 transition-colors bg-orange-500/5 px-6 py-3 rounded-2xl border border-orange-500/10 mb-8"
                        >
                            View on Explorer <ExternalLink size={14} />
                        </a>
                    )}

                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white hover:bg-white/10 transition-all active:scale-95"
                    >
                        {status === "pending" ? "Close" : "Done"}
                    </button>

                </motion.div>
            </div>
        </AnimatePresence>
    );
}
