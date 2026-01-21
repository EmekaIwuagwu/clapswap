"use client";

import React, { useState, useEffect } from "react";
import { ArrowDown, Settings, Info, Search, Loader2, CheckCircle2, ChevronDown, AlertTriangle, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { parseUnits, formatUnits } from "viem";
import { cn, formatAmount } from "@/lib/utils";
import { TOKENS, ROUTER_ADDRESS, WFLR_ADDRESS } from "@/lib/constants";
import { ROUTER_ABI, ERC20_ABI } from "@/lib/abis";
import { useSwap } from "@/hooks/useSwap";
import { TokenSelectModal } from "./TokenSelectModal";
import { SwapConfirmModal, SwapStatusModal } from "./SwapModals";

export function SwapCard() {
    const [mounted, setMounted] = useState(false);
    const [tokenIn, setTokenIn] = useState(TOKENS[0]);
    const [tokenOut, setTokenOut] = useState(TOKENS[1]);
    const [amountIn, setAmountIn] = useState("");
    const [amountOut, setAmountOut] = useState("");
    const [isSelecting, setIsSelecting] = useState<"in" | "out" | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [slippage, setSlippage] = useState("0.5");
    const [isReviewing, setIsReviewing] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);

    const { openConnectModal } = useConnectModal();
    const { isConnected, address } = useAccount();
    const { quote, priceImpact, bestPath, isLoading: isQuoteLoading, error: swapError } = useSwap(tokenIn, tokenOut, amountIn);

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
        else if (amountIn === "" || amountIn === "0") {
            setAmountOut("");
        }
    }, [quote, amountIn]);

    useEffect(() => {
        if (hash) {
            setIsStatusOpen(true);
            setIsReviewing(false);
        }
    }, [hash]);

    useEffect(() => {
        if (isSuccess) {
            setAmountIn("");
            rfInN(); rfInE(); rfOutN(); rfOutE(); refetchAllowance();
        }
    }, [isSuccess]);

    const handleAction = async () => {
        if (!isConnected) return openConnectModal?.();
        if (!amountIn) return;

        if (isApprovalRequired) {
            write({
                address: tokenIn.address as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "approve",
                args: [ROUTER_ADDRESS as `0x${string}`, parseUnits(amountIn, tokenIn.decimals)],
            });
            return;
        }

        // If not approval, we're doing a swap. Show review modal first.
        setIsReviewing(true);
    };

    const confirmSwap = async () => {
        const path = bestPath.length > 0 ? bestPath : [
            isNativeIn ? WFLR_ADDRESS : tokenIn.address,
            isNativeOut ? WFLR_ADDRESS : tokenOut.address
        ];
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

        const amountInWei = parseUnits(amountIn, tokenIn.decimals);
        const slippageBps = BigInt(Math.floor(parseFloat(slippage) * 100));
        const amountOutWei = parseUnits(amountOut, tokenOut.decimals);
        const amountOutMin = (amountOutWei * (BigInt(10000) - slippageBps)) / BigInt(10000);

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
    };

    const getTokenSymbol = (addr: string) => {
        if (addr.toLowerCase() === WFLR_ADDRESS.toLowerCase()) return "FLR";
        return TOKENS.find(t => t.address.toLowerCase() === addr.toLowerCase())?.symbol || "???";
    };

    if (!mounted) return <div className="w-full max-w-[480px] h-[500px] bg-slate-900/80 rounded-[32px] animate-pulse" />;

    return (
        <div className="w-full max-w-[480px] relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-[32px] blur opacity-20 transition duration-1000"></div>

            <div className="relative bg-slate-900/80 border border-white/10 backdrop-blur-2xl rounded-[32px] p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-white tracking-tight">Swap</h2>
                    <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <Settings className={cn("text-slate-400 hover:text-white transition-colors", isSettingsOpen && "text-white rotate-45")} size={20} />
                    </button>
                </div>

                <AnimatePresence>
                    {isSettingsOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-6 overflow-hidden bg-white/5 rounded-2xl p-4 border border-white/10">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-medium text-slate-300">Slippage Tolerance</span>
                                <span className="text-sm font-bold text-orange-500">{slippage}%</span>
                            </div>
                            <div className="flex gap-2">
                                {["0.1", "0.5", "1.0"].map((s) => (
                                    <button key={s} onClick={() => setSlippage(s)} className={cn("flex-1 py-2 rounded-xl text-xs font-bold transition-all", slippage === s ? "bg-orange-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700")}>
                                        {s}%
                                    </button>
                                ))}
                                <div className="flex-1 relative">
                                    <input type="number" value={slippage} onChange={(e) => setSlippage(e.target.value)} className="w-full bg-slate-800 border border-white/5 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-orange-500" placeholder="Custom" />
                                    <span className="absolute right-3 top-2 text-[10px] text-slate-500">%</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-1">
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all focus-within:border-orange-500/50">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-slate-400">You pay</span>
                            <span className="text-sm text-slate-500">Balance: {formatAmount(balanceIn)}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <input type="number" value={amountIn} onChange={(e) => setAmountIn(e.target.value)} placeholder="0.0" className="bg-transparent border-none text-3xl font-bold text-white w-full outline-none" />
                            <button onClick={() => setIsSelecting("in")} className="flex items-center gap-2 bg-slate-800 rounded-2xl px-3 py-2 min-w-fit border border-white/10 hover:border-white/20 transition-all active:scale-95">
                                <img src={tokenIn.logo} className="w-6 h-6 rounded-full" />
                                <span className="font-bold">{tokenIn.symbol}</span>
                                <ChevronDown size={16} className="text-slate-500" />
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center -my-3 relative z-10">
                        <button onClick={() => { setTokenIn(tokenOut); setTokenOut(tokenIn); setAmountIn(amountOut); }} className="p-2 bg-slate-900 border border-white/10 rounded-xl hover:scale-110 transition-transform active:rotate-180 duration-500 shadow-xl">
                            <ArrowDown size={20} className="text-orange-500" />
                        </button>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all focus-within:border-orange-500/50">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-slate-400">You receive</span>
                            <span className="text-sm text-slate-500">Balance: {formatAmount(balanceOut)}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <input value={isQuoteLoading ? "..." : amountOut} readOnly placeholder="0.0" className="bg-transparent border-none text-3xl font-bold text-slate-300 w-full outline-none" />
                            <button onClick={() => setIsSelecting("out")} className="flex items-center gap-2 bg-slate-800 rounded-2xl px-3 py-2 min-w-fit border border-white/10 hover:border-white/20 transition-all active:scale-95">
                                <img src={tokenOut.logo} className="w-6 h-6 rounded-full" />
                                <span className="font-bold">{tokenOut.symbol}</span>
                                <ChevronDown size={16} className="text-slate-500" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-6 space-y-3 px-1">
                    {swapError && amountIn && (
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 flex gap-2 items-start">
                            <Info size={16} className="text-orange-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-orange-200/70">
                                <b>Route Failed:</b> No liquidity found for this path. Try a smaller amount or a different token pair.
                            </p>
                        </div>
                    )}

                    {!swapError && amountIn && amountOut && (
                        <div className="bg-white/5 rounded-xl p-3 space-y-3">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Price</span>
                                <span className="text-slate-200">1 {tokenIn.symbol} = {(parseFloat(amountOut) / parseFloat(amountIn)).toFixed(6)} {tokenOut.symbol}</span>
                            </div>

                            {/* Route Visualization */}
                            <div className="flex justify-between text-xs items-center">
                                <span className="text-slate-400">Route</span>
                                <div className="flex items-center gap-1.5 text-orange-500 font-bold">
                                    {bestPath.map((addr, i) => (
                                        <React.Fragment key={addr}>
                                            <span className="bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{getTokenSymbol(addr)}</span>
                                            {i < bestPath.length - 1 && <Share2 size={10} className="rotate-90 text-slate-600" />}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Minimum Received</span>
                                <span className="text-slate-200">{formatAmount((parseFloat(amountOut) * (1 - parseFloat(slippage) / 100)).toString())} {tokenOut.symbol}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Price Impact</span>
                                <span className={cn(
                                    "font-medium",
                                    !priceImpact || priceImpact < 1 ? "text-green-500" :
                                        priceImpact < 5 ? "text-orange-500" : "text-red-500"
                                )}>
                                    {priceImpact ? (priceImpact < 0.01 ? "< 0.01%" : `${priceImpact.toFixed(2)}%`) : "Calculating..."}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {priceImpact && priceImpact > 5 && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-xs font-bold">
                        <AlertTriangle size={16} />
                        High Price Impact! Significant trade value loss.
                    </div>
                )}

                <button
                    onClick={handleAction}
                    disabled={isConnected && (!amountIn || isTxPending || isConfirming || (priceImpact ? priceImpact > 15 : false))}
                    className={cn(
                        "w-full mt-8 py-4 rounded-2xl font-bold text-lg text-white shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all",
                        priceImpact && priceImpact > 5 ? "bg-red-600 hover:bg-red-700" : "bg-gradient-to-r from-orange-500 to-red-600 hover:scale-[1.02] active:scale-95"
                    )}
                >
                    {isTxPending || isConfirming ? <Loader2 className="animate-spin" /> : null}
                    {!isConnected ? "Connect Wallet" : isApprovalRequired ? "Approve Token" : priceImpact && priceImpact > 15 ? "Impact Too High" : "Swap"}
                </button>

                {isSuccess && <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2 text-green-500 text-sm animate-in fade-in slide-in-from-top-2"><CheckCircle2 size={16} /> Transaction Successful!</div>}
            </div>

            <TokenSelectModal
                isOpen={!!isSelecting}
                onClose={() => setIsSelecting(null)}
                onSelect={(token) => {
                    if (isSelecting === "in") setTokenIn(token);
                    else setTokenOut(token);
                    setIsSelecting(null);
                }}
            />

            <SwapConfirmModal
                isOpen={isReviewing}
                onClose={() => setIsReviewing(false)}
                onConfirm={confirmSwap}
                tokenIn={tokenIn}
                tokenOut={tokenOut}
                amountIn={amountIn}
                amountOut={amountOut}
                priceImpact={priceImpact}
                bestPath={bestPath}
                slippage={slippage}
                getTokenSymbol={getTokenSymbol}
            />

            <SwapStatusModal
                isOpen={isStatusOpen}
                onClose={() => setIsStatusOpen(false)}
                txHash={hash}
                status={isConfirming || isTxPending ? "pending" : isSuccess ? "success" : "error"}
            />
        </div>
    );
}
