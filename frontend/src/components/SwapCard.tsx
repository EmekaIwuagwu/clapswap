"use client";

import React, { useState, useEffect } from "react";
import { ArrowDown, Settings, Info, Search, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { parseUnits, formatUnits } from "viem";
import { cn, formatAmount } from "@/lib/utils";
import { TOKENS, ROUTER_ADDRESS, WFLR_ADDRESS } from "@/lib/constants";
import { ROUTER_ABI, ERC20_ABI } from "@/lib/abis";
import { useSwap } from "@/hooks/useSwap";

export function SwapCard() {
    const [mounted, setMounted] = useState(false);
    const [tokenIn, setTokenIn] = useState(TOKENS[0]);
    const [tokenOut, setTokenOut] = useState(TOKENS[1]);
    const [amountIn, setAmountIn] = useState("");
    const [amountOut, setAmountOut] = useState("");
    const [isSelecting, setIsSelecting] = useState<"in" | "out" | null>(null);

    const { openConnectModal } = useConnectModal();
    const { isConnected, address } = useAccount();
    const { quote, isLoading: isQuoteLoading, error: swapError } = useSwap(tokenIn, tokenOut, amountIn);

    // Dynamic Balance Fetching
    const isNativeIn = tokenIn.address === "0x0000000000000000000000000000000000000000";
    const isNativeOut = tokenOut.address === "0x0000000000000000000000000000000000000000";

    const { data: balInNative, refetch: rfInN } = useBalance({ address: address as `0x${string}`, query: { enabled: isNativeIn } });
    const { data: balInErc, refetch: rfInE } = useReadContract({ address: tokenIn.address as `0x${string}`, abi: ERC20_ABI, functionName: "balanceOf", args: [address as `0x${string}`], query: { enabled: !isNativeIn && !!address } });

    const { data: balOutNative, refetch: rfOutN } = useBalance({ address: address as `0x${string}`, query: { enabled: isNativeOut } });
    const { data: balOutErc, refetch: rfOutE } = useReadContract({ address: tokenOut.address as `0x${string}`, abi: ERC20_ABI, functionName: "balanceOf", args: [address as `0x${string}`], query: { enabled: !isNativeOut && !!address } });

    const balanceIn = isNativeIn ? (balInNative ? formatUnits(balInNative.value, balInNative.decimals) : "0") : (balInErc ? formatUnits(balInErc as bigint, tokenIn.decimals) : "0");
    const balanceOut = isNativeOut ? (balOutNative ? formatUnits(balOutNative.value, balOutNative.decimals) : "0") : (balOutErc ? formatUnits(balOutErc as bigint, tokenOut.decimals) : "0");

    // Allowance
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: tokenIn.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: address && !isNativeIn ? [address, ROUTER_ADDRESS as `0x${string}`] : undefined,
        query: { enabled: !!address && !isNativeIn }
    });

    const isApprovalRequired = !isNativeIn && (!allowance || (allowance as bigint) < parseUnits(amountIn || "0", tokenIn.decimals));

    const { writeContract: write, data: hash, isPending: isTxPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => {
        if (quote) setAmountOut(quote);
        else if (amountIn === "") setAmountOut("");
    }, [quote, amountIn]);

    useEffect(() => {
        if (isSuccess) {
            setAmountIn("");
            rfInN(); rfInE(); rfOutN(); rfOutE(); refetchAllowance();
        }
    }, [isSuccess]);

    if (!mounted) return <div className="w-full max-w-[480px] h-[500px] bg-slate-900/80 rounded-[32px] animate-pulse" />;

    const handleAction = async () => {
        if (!isConnected) return openConnectModal?.();
        if (!amountIn) return;

        const path = [
            isNativeIn ? WFLR_ADDRESS : tokenIn.address,
            isNativeOut ? WFLR_ADDRESS : tokenOut.address
        ];
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

        if (isApprovalRequired) {
            write({
                address: tokenIn.address as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "approve",
                args: [ROUTER_ADDRESS as `0x${string}`, parseUnits(amountIn, tokenIn.decimals)],
            });
        } else {
            const amountInWei = parseUnits(amountIn, tokenIn.decimals);
            const amountOutMin = amountOut ? (parseUnits(amountOut, tokenOut.decimals) * BigInt(95)) / BigInt(100) : BigInt(0);

            if (isNativeIn) {
                write({
                    address: ROUTER_ADDRESS as `0x${string}`,
                    abi: ROUTER_ABI,
                    functionName: "swapExactFLRForTokens",
                    args: [amountOutMin, path as readonly `0x${string}`[], address!, deadline],
                    value: amountInWei,
                });
            } else if (isNativeOut) {
                write({
                    address: ROUTER_ADDRESS as `0x${string}`,
                    abi: ROUTER_ABI,
                    functionName: "swapExactTokensForFLR",
                    args: [amountInWei, amountOutMin, path as readonly `0x${string}`[], address!, deadline],
                });
            } else {
                write({
                    address: ROUTER_ADDRESS as `0x${string}`,
                    abi: ROUTER_ABI,
                    functionName: "swapExactTokensForTokens",
                    args: [amountInWei, amountOutMin, path as readonly `0x${string}`[], address!, deadline],
                });
            }
        }
    };

    return (
        <div className="w-full max-w-[480px] relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-[32px] blur opacity-20 transition duration-1000"></div>

            <div className="relative bg-slate-900/80 border border-white/10 backdrop-blur-2xl rounded-[32px] p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-white tracking-tight">Swap</h2>
                    <Settings className="text-slate-400 hover:text-white cursor-pointer transition-colors" size={20} />
                </div>

                <div className="space-y-1">
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-slate-400">You pay</span>
                            <span className="text-sm text-slate-500">Balance: {formatAmount(balanceIn)}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <input type="number" value={amountIn} onChange={(e) => setAmountIn(e.target.value)} placeholder="0.0" className="bg-transparent border-none text-3xl font-bold text-white w-full outline-none" />
                            <button onClick={() => setIsSelecting("in")} className="flex items-center gap-2 bg-slate-800 rounded-2xl px-3 py-2 min-w-fit border border-white/10">
                                <img src={tokenIn.logo} className="w-6 h-6 rounded-full" />
                                <span className="font-bold">{tokenIn.symbol}</span>
                                <ArrowDown size={16} className="text-slate-500" />
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center -my-3 relative z-10">
                        <button onClick={() => { setTokenIn(tokenOut); setTokenOut(tokenIn); }} className="p-2 bg-slate-900 border border-white/10 rounded-xl hover:scale-110 transition-transform">
                            <ArrowDown size={20} className="text-orange-500" />
                        </button>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-slate-400">You receive</span>
                            <span className="text-sm text-slate-500">Balance: {formatAmount(balanceOut)}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <input value={isQuoteLoading ? "..." : amountOut} readOnly placeholder="0.0" className="bg-transparent border-none text-3xl font-bold text-slate-300 w-full outline-none" />
                            <button onClick={() => setIsSelecting("out")} className="flex items-center gap-2 bg-slate-800 rounded-2xl px-3 py-2 min-w-fit border border-white/10">
                                <img src={tokenOut.logo} className="w-6 h-6 rounded-full" />
                                <span className="font-bold">{tokenOut.symbol}</span>
                                <ArrowDown size={16} className="text-slate-500" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-6 space-y-3 px-1">
                    {swapError && amountIn && (
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 flex gap-2 items-start">
                            <Info size={16} className="text-orange-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-orange-200/70">
                                <b>Insufficient Liquidity:</b> This pool hasn't been seeded yet. Please add liquidity in the "Pools" or "Liquidity" tab first.
                            </p>
                        </div>
                    )}
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Price</span>
                        <span className="text-slate-200">{amountIn && amountOut && !swapError ? `1 ${tokenIn.symbol} = ${(parseFloat(amountOut) / parseFloat(amountIn)).toFixed(4)} ${tokenOut.symbol}` : "-"}</span>
                    </div>
                </div>

                <button
                    onClick={handleAction}
                    disabled={isConnected && (!amountIn || isTxPending || isConfirming)}
                    className="w-full mt-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl font-bold text-lg text-white shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isTxPending || isConfirming ? <Loader2 className="animate-spin" /> : null}
                    {!isConnected ? "Connect Wallet" : isApprovalRequired ? "Approve Token" : "Swap"}
                </button>

                {isSuccess && <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2 text-green-500 text-sm"><CheckCircle2 size={16} /> Transaction Successful!</div>}
            </div>

            <AnimatePresence>
                {isSelecting && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSelecting(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-4">
                            <h3 className="text-lg font-bold mb-4 text-white">Select a token</h3>
                            <div className="space-y-1">
                                {TOKENS.map((token) => (
                                    <button key={token.address} onClick={() => { if (isSelecting === "in") setTokenIn(token); else setTokenOut(token); setIsSelecting(null); }} className="flex items-center gap-4 w-full p-3 hover:bg-white/5 rounded-2xl transition-colors">
                                        <img src={token.logo} className="w-10 h-10 rounded-full" />
                                        <div className="text-left">
                                            <div className="font-bold text-white">{token.symbol}</div>
                                            <div className="text-xs text-slate-500">{token.name}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
