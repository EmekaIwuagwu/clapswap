"use client";

import { useState, useEffect } from "react";
import { Rocket, Loader2, CheckCircle2, Copy, ExternalLink, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { LAUNCHPAD_ADDRESS } from "@/lib/constants";
import { LAUNCHPAD_ABI } from "@/lib/abis";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function LaunchpadPage() {
    const [mounted, setMounted] = useState(false);
    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("");
    const [supply, setSupply] = useState("1000000");

    const { isConnected, address } = useAccount();
    const { openConnectModal } = useConnectModal();
    const { writeContract: write, data: hash, isPending: isTxPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({ hash });

    useEffect(() => { setMounted(true); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isConnected) return openConnectModal?.();

        write({
            address: LAUNCHPAD_ADDRESS as `0x${string}`,
            abi: LAUNCHPAD_ABI,
            functionName: "createToken",
            args: [name, symbol, BigInt(supply)],
        });
    };

    // Extract token address from logs if possible
    const deployedTokenAddress = receipt?.logs[0]?.address;

    if (!mounted) return null;

    return (
        <div className="flex flex-col items-center w-full max-w-6xl py-12 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-500 text-sm font-bold">
                            <Rocket size={16} /> Clapswap Launchpad
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-tight">
                            Create Your <span className="text-orange-500">Token</span> In Seconds.
                        </h1>
                        <p className="text-slate-400 text-lg max-w-lg leading-relaxed">
                            The fastest way to launch your project on Flare. No coding required. Standard ERC20, fully compatible with Clapswap DEX.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6">
                            <ShieldCheck className="text-green-500 mb-4" size={32} />
                            <h3 className="text-white font-bold mb-1">Standard Code</h3>
                            <p className="text-xs text-slate-500">Verified OpenZeppelin logic for maximum security.</p>
                        </div>
                        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6">
                            <Zap className="text-orange-500 mb-4" size={32} />
                            <h3 className="text-white font-bold mb-1">Instant Listing</h3>
                            <p className="text-xs text-slate-500">Immediately add liquidity after deployment.</p>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute -inset-4 bg-orange-500/20 blur-3xl opacity-20" />
                    <div className="relative bg-slate-900 border border-white/10 rounded-[40px] p-8 md:p-10 shadow-2xl backdrop-blur-3xl">
                        {!isSuccess ? (
                            <form onSubmit={handleCreate} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 ml-1 uppercase tracking-wider">Token Name</label>
                                    <input
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Flare Moon"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-lg focus:outline-none focus:border-orange-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 ml-1 uppercase tracking-wider">Symbol</label>
                                    <input
                                        required
                                        value={symbol}
                                        onChange={(e) => setSymbol(e.target.value)}
                                        placeholder="e.g. MOON"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-lg focus:outline-none focus:border-orange-500 transition-all uppercase"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 ml-1 uppercase tracking-wider">Initial Supply</label>
                                    <div className="relative">
                                        <input
                                            required
                                            type="number"
                                            value={supply}
                                            onChange={(e) => setSupply(e.target.value)}
                                            placeholder="1,000,000"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-lg focus:outline-none focus:border-orange-500 transition-all"
                                        />
                                        <span className="absolute right-6 top-5 text-slate-500 font-bold">{symbol || 'TOKENS'}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isTxPending || isConfirming}
                                    className="w-full py-5 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl font-black text-xl text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {isTxPending || isConfirming ? <Loader2 className="animate-spin" /> : <Rocket size={20} />}
                                    {!isConnected ? "Connect Wallet" : isTxPending || isConfirming ? "Deploying..." : "Launch Token"}
                                </button>

                                <p className="text-center text-xs text-slate-500">
                                    Deployment takes ~5 seconds on Coston2.
                                </p>
                            </form>
                        ) : (
                            <div className="text-center py-6 space-y-8 animate-in fade-in zoom-in duration-500">
                                <div className="w-24 h-24 bg-green-500/20 rounded-[32px] flex items-center justify-center mx-auto text-green-500">
                                    <CheckCircle2 size={48} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white mb-2">Token Launched!</h2>
                                    <p className="text-slate-400">Your token "{name}" is now live on the blockchain.</p>
                                </div>

                                <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Address</span>
                                        <div className="flex items-center gap-2 text-white font-mono">
                                            {deployedTokenAddress ? `${deployedTokenAddress.slice(0, 6)}...${deployedTokenAddress.slice(-4)}` : "Pending..."}
                                            <button onClick={() => navigator.clipboard.writeText(deployedTokenAddress || "")} className="p-1 hover:bg-white/10 rounded-md">
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Link
                                        href="/liquidity"
                                        className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20"
                                    >
                                        Add Liquidity Now <ArrowRight size={18} />
                                    </Link>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="text-slate-500 hover:text-white transition-colors text-sm font-bold"
                                    >
                                        Launch another token
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
