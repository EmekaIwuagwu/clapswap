"use client";

import { Search, TrendingUp, Droplets, Zap, Loader2, Plus } from "lucide-react";
import { cn, formatAmount } from "@/lib/utils";
import Link from "next/link";
import { usePools } from "@/hooks/usePools";
import { formatUnits } from "viem";
import { TOKENS } from "@/lib/constants";
import { useState, useEffect } from "react";

export default function PoolsPage() {
    const { pools, isLoading } = usePools();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return null;

    const getTokenInfo = (address: string) => {
        const token = TOKENS.find(t => t.address.toLowerCase() === address.toLowerCase());
        return token || { symbol: "???", logo: "https://avatar.vercel.sh/unknown" };
    };

    return (
        <div className="flex flex-col w-full max-w-6xl py-12 px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                        Liquidity Pools
                    </h1>
                    <p className="text-slate-400 text-lg max-w-lg">
                        Provide liquidity to earn 0.3% of all trades on your pairs, proportional to your share of the pool.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search pools..."
                            className="bg-white/5 border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-white focus:ring-1 focus:ring-orange-500/50 outline-none w-64 transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                    { icon: TrendingUp, label: "Total Pairs", value: pools.length.toString(), color: "text-green-500" },
                    { icon: Droplets, label: "Live Deployment", value: "Coston2", color: "text-blue-500" },
                    { icon: Zap, label: "Fee Tier", value: "0.3%", color: "text-orange-500" },
                ].map((stat, i) => (
                    <div key={i} className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={cn("p-2 rounded-xl bg-white/5", stat.color)}>
                                <stat.icon size={20} />
                            </div>
                            <span className="text-sm font-medium text-slate-500">{stat.label}</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="bg-slate-900/50 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-xl shadow-2xl min-h-[400px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-4">
                        <Loader2 className="animate-spin text-orange-500" size={48} />
                        <p className="font-medium">Fetching pools from Flare Network...</p>
                    </div>
                ) : pools.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-4">
                        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-slate-600">
                            <Plus size={40} />
                        </div>
                        <p className="font-medium text-lg text-white">No pools found yet</p>
                        <p className="text-sm">Be the first to create a liquidity pool.</p>
                        <Link href="/liquidity" className="bg-orange-500 text-white font-bold py-3 px-8 rounded-2xl mt-4">Add Liquidity</Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="px-8 py-6 text-sm font-bold text-slate-500">Pool Name</th>
                                    <th className="px-8 py-6 text-sm font-bold text-slate-500 text-right">Liquidity (Tkn 0)</th>
                                    <th className="px-8 py-6 text-sm font-bold text-slate-500 text-right">Liquidity (Tkn 1)</th>
                                    <th className="px-8 py-6 text-sm font-bold text-slate-500 text-right">Fee</th>
                                    <th className="px-8 py-6 text-sm font-bold text-slate-500 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {pools.map((pool, i) => {
                                    const t0 = getTokenInfo(pool.token0);
                                    const t1 = getTokenInfo(pool.token1);
                                    return (
                                        <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex -space-x-2">
                                                        <img src={t0.logo} className="w-8 h-8 rounded-full border-2 border-slate-900" />
                                                        <img src={t1.logo} className="w-8 h-8 rounded-full border-2 border-slate-900" />
                                                    </div>
                                                    <span className="font-bold text-white group-hover:text-orange-500 transition-colors">{t0.symbol} / {t1.symbol}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right font-medium text-slate-300">
                                                {formatAmount(formatUnits(pool.reserve0, t0.decimals || 18))} {t0.symbol}
                                            </td>
                                            <td className="px-8 py-6 text-right font-medium text-slate-300">
                                                {formatAmount(formatUnits(pool.reserve1, t1.decimals || 18))} {t1.symbol}
                                            </td>
                                            <td className="px-8 py-6 text-right font-bold text-green-500">0.3%</td>
                                            <td className="px-8 py-6 text-right">
                                                <Link
                                                    href="/liquidity"
                                                    className="text-sm font-bold bg-white/5 hover:bg-white/10 text-white py-2 px-4 rounded-xl transition-all"
                                                >
                                                    Manage
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
