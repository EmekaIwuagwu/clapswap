import { Search, TrendingUp, Droplets, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const POOLS = [
    { pair: "WFLR / USDC", tvl: "$12.4M", volume: "$1.2M", apr: "18.5%", tokens: ["FLR", "USDC"] },
    { pair: "WETH / WFLR", tvl: "$8.2M", volume: "$650K", apr: "12.2%", tokens: ["ETH", "FLR"] },
    { pair: "WBTC / WFLR", tvl: "$5.1M", volume: "$420K", apr: "14.8%", tokens: ["WBTC", "FLR"] },
    { pair: "USDT / USDC", tvl: "$4.8M", volume: "$890K", apr: "4.5%", tokens: ["USDT", "USDC"] },
];

export default function PoolsPage() {
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
                    <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg shadow-orange-500/10">
                        Create Pool
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                    { icon: TrendingUp, label: "Total TVL", value: "$42.5M", color: "text-green-500" },
                    { icon: Droplets, label: "Total Volume", value: "$8.2M", color: "text-blue-500" },
                    { icon: Zap, label: "Average APR", value: "12.4%", color: "text-orange-500" },
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

            <div className="bg-slate-900/50 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-xl shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="px-8 py-6 text-sm font-bold text-slate-500">Pool Name</th>
                                <th className="px-8 py-6 text-sm font-bold text-slate-500 text-right">TVL</th>
                                <th className="px-8 py-6 text-sm font-bold text-slate-500 text-right">Volume 24h</th>
                                <th className="px-8 py-6 text-sm font-bold text-slate-500 text-right">APR</th>
                                <th className="px-8 py-6 text-sm font-bold text-slate-500 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {POOLS.map((pool, i) => (
                                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex -space-x-2">
                                                <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-orange-500" />
                                                <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-blue-500" />
                                            </div>
                                            <span className="font-bold text-white group-hover:text-orange-500 transition-colors">{pool.pair}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right font-medium">{pool.tvl}</td>
                                    <td className="px-8 py-6 text-right font-medium">{pool.volume}</td>
                                    <td className="px-8 py-6 text-right font-bold text-green-500">{pool.apr}</td>
                                    <td className="px-8 py-6 text-right">
                                        <Link
                                            href="/liquidity"
                                            className="text-sm font-bold bg-white/5 hover:bg-white/10 text-white py-2 px-4 rounded-xl transition-all"
                                        >
                                            Add Liquidity
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
