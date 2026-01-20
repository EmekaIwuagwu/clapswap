"use client";

import { Plus, Info, ChevronRight, Droplets } from "lucide-react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useState, useEffect } from "react";
import { AddLiquidityModal } from "@/components/AddLiquidityModal";

export default function LiquidityPage() {
    const [mounted, setMounted] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const { isConnected } = useAccount();
    const { openConnectModal } = useConnectModal();

    useEffect(() => {
        setMounted(true);
    }, []);

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
                            className="w-full bg-slate-800 hover:bg-slate-700 border border-white/5 rounded-[32px] p-6 transition-all flex items-center justify-between group"
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
                onClose={() => setIsAddModalOpen(false)}
            />
        </div>
    );
}
