"use client";

import { Plus, Info, ChevronRight, Droplets, Loader2, ArrowRightLeft, MinusCircle } from "lucide-react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useState, useEffect } from "react";
import { AddLiquidityModal } from "@/components/AddLiquidityModal";
import { RemoveLiquidityModal } from "@/components/RemoveLiquidityModal";
import { useAccountPositions } from "@/hooks/useAccountPositions";
import { TOKENS } from "@/lib/constants";
import { formatUnits } from "viem";
import { formatAmount } from "@/lib/utils";

export default function LiquidityPage() {
    const [mounted, setMounted] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState<any>(null);
    const { isConnected } = useAccount();
    const { openConnectModal } = useConnectModal();
    const { positions, isLoading, refetch } = useAccountPositions();

    useEffect(() => {
        setMounted(true);
    }, []);

    const getTokenInfo = (address: string) => {
        const token = TOKENS.find(t => t.address.toLowerCase() === address.toLowerCase());
        return token || { symbol: "???", logo: "https://avatar.vercel.sh/unknown", decimals: 18 };
    };

    if (!mounted) return null;

    return (
        <div className="flex flex-col items-center w-full max-w-4xl py-12 px-4">
            <div className="w-full max-w-lg space-y-8">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
                        Your Liquidity
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Manage your liquidity positions and earn fees from every swap.
                    </p>
                </div>

                {!isConnected ? (
                    <div className="bg-slate-900/50 border border-white/5 rounded-[40px] p-12 text-center space-y-6 backdrop-blur-xl">
                        <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center mx-auto text-orange-500">
                            <Plus size={40} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-white">No connected wallet</h3>
                            <p className="text-slate-400">Connect your wallet to view and manage your liquidity positions.</p>
                        </div>
                        <button
                            onClick={openConnectModal}
                            className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-4 px-10 rounded-2xl shadow-xl shadow-orange-500/20 hover:scale-105 transition-all"
                        >
                            Connect Wallet
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="w-full bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-[32px] p-6 transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                    <Plus size={24} />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-lg text-white">Add Liquidity</div>
                                    <div className="text-sm text-slate-400">Receive LP tokens and earn fees</div>
                                </div>
                            </div>
                            <ChevronRight className="text-slate-500 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" size={24} />
                        </button>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-4">Your Positions</h3>

                            {isLoading ? (
                                <div className="bg-slate-900/50 border border-white/5 rounded-[32px] p-12 flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="animate-spin text-orange-500" size={32} />
                                    <p className="text-slate-500 font-medium">Loading positions...</p>
                                </div>
                            ) : positions.length === 0 ? (
                                <div className="bg-slate-900/50 border border-white/5 rounded-[40px] p-12 text-center space-y-6 backdrop-blur-xl">
                                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-slate-500">
                                        <Droplets size={40} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold text-white">No positions found</h3>
                                        <p className="text-slate-400">You don't have any active liquidity positions yet.</p>
                                    </div>
                                    <Link href="/pools" className="inline-block text-orange-500 font-bold hover:text-orange-400 transition-colors">
                                        Browse available pools →
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {positions.map((pos: any) => {
                                        const t0 = getTokenInfo(pos.token0);
                                        const t1 = getTokenInfo(pos.token1);
                                        return (
                                            <div key={pos.pairAddress} className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 transition-all hover:border-white/10 group">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex -space-x-2">
                                                            <img src={t0.logo} className="w-8 h-8 rounded-full border-2 border-slate-900" />
                                                            <img src={t1.logo} className="w-8 h-8 rounded-full border-2 border-slate-900" />
                                                        </div>
                                                        <span className="font-black text-white text-lg">{t0.symbol}/{t1.symbol}</span>
                                                    </div>
                                                    <div className="bg-green-500/10 text-green-500 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">Active</div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-6">
                                                    <div className="bg-white/5 rounded-2xl p-4">
                                                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">{t0.symbol} Pooled</div>
                                                        <div className="text-white font-bold">{formatAmount(formatUnits((pos.balance * pos.reserve0) / pos.totalSupply, t0.decimals))}</div>
                                                    </div>
                                                    <div className="bg-white/5 rounded-2xl p-4">
                                                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">{t1.symbol} Pooled</div>
                                                        <div className="text-white font-bold">{formatAmount(formatUnits((pos.balance * pos.reserve1) / pos.totalSupply, t1.decimals))}</div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => setSelectedPosition(pos)}
                                                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border border-white/5"
                                                >
                                                    <MinusCircle size={18} />
                                                    Remove Liquidity
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Educational Info */}
                <div className="bg-orange-500/5 border border-orange-500/10 rounded-3xl p-6 flex gap-4">
                    <Info className="shrink-0 text-orange-500" size={24} />
                    <div className="space-y-1">
                        <h4 className="font-bold text-orange-500">What is Liquidity?</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            When you add liquidity, you provide both tokens of a pair in equal value. In return, you receive LP tokens that represent your share of the pool. These tokens automatically earn 0.3% fees from all trades in that pool.
                        </p>
                    </div>
                </div>
            </div>

            <AddLiquidityModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    refetch();
                }}
            />

            <RemoveLiquidityModal
                isOpen={!!selectedPosition}
                onClose={() => {
                    setSelectedPosition(null);
                    refetch();
                }}
                position={selectedPosition}
            />
        </div>
    );
}
