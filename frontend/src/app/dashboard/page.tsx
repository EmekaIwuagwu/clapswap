"use client";

import { Wallet, PieChart, History, ExternalLink, ArrowUpRight, ArrowDownLeft, TrendingUp } from "lucide-react";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { formatUnits } from "viem";
import { formatAmount, cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { TOKENS } from "@/lib/constants";
import { useFtsoPrice } from "@/hooks/useFtsoPrice";
import { ERC20_ABI } from "@/lib/abis";

export default function DashboardPage() {
    const [mounted, setMounted] = useState(false);
    const { address, isConnected } = useAccount();
    const { openConnectModal } = useConnectModal();
    const { data: ethBalance } = useBalance({ address: address as `0x${string}` });
    const { price: flrPrice, isLoading: isPriceLoading } = useFtsoPrice("FLR");

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return (
        <div className="w-full max-w-6xl py-12 px-4 animate-pulse space-y-8">
            <div className="h-64 bg-slate-900/50 rounded-[40px]" />
            <div className="h-96 bg-slate-900/50 rounded-[40px]" />
        </div>
    );

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center text-slate-500">
                    <Wallet size={48} />
                </div>
                <h2 className="text-3xl font-bold">Connect your wallet</h2>
                <p className="text-slate-400 max-w-sm mb-4">Connect your wallet to view your personal portfolio, transaction history, and earnings.</p>
                <button
                    onClick={openConnectModal}
                    className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-4 px-10 rounded-2xl shadow-xl shadow-orange-500/20 hover:scale-105 transition-all"
                >
                    Connect Wallet
                </button>
            </div>
        );
    }

    const totalValue = ethBalance ? parseFloat(formatUnits(ethBalance.value, ethBalance.decimals)) * (flrPrice || 0.035) : 0;

    return (
        <div className="flex flex-col w-full max-w-6xl py-12 px-4 gap-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left Col: Overview */}
                <div className="flex-1 space-y-8">
                    <div className="bg-slate-900/50 border border-white/5 rounded-[40px] p-8 backdrop-blur-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp size={120} />
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                                <PieChart size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Your Portfolio</h2>
                                <p className="text-sm text-slate-400">Net worth on Coston2 Testnet</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <div className="text-sm text-slate-500 mb-1">Total Balance (USD)</div>
                                <div className="text-5xl font-black text-white leading-none tracking-tighter">
                                    ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-500 mb-1">Live FLR Price</div>
                                <div className="text-2xl font-bold text-orange-500">
                                    {isPriceLoading ? "..." : `$${flrPrice?.toFixed(4)}`}
                                    <span className="text-xs text-slate-500 ml-2 font-normal">via FTSO</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 border border-white/5 rounded-[40px] p-8 backdrop-blur-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                                <History size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
                        </div>
                        <div className="text-center py-12 text-slate-500 border-2 border-dashed border-white/5 rounded-3xl">
                            <History size={32} className="mx-auto mb-2 opacity-20" />
                            <p>No recent activity found on Flare Explorer</p>
                        </div>
                    </div>
                </div>

                {/* Right Col: Token Balances */}
                <div className="w-full md:w-80 space-y-8">
                    <div className="bg-slate-900/50 border border-white/5 rounded-[40px] p-8 backdrop-blur-xl">
                        <h3 className="text-lg font-bold text-white mb-6">Live Balances</h3>
                        <div className="space-y-6">
                            {TOKENS.map((token) => (
                                <TokenRow key={token.address} token={token} address={address!} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TokenRow({ token, address }: { token: any, address: `0x${string}` }) {
    const isNative = token.address === "0x0000000000000000000000000000000000000000";

    const { data: nativeBalance } = useBalance({
        address,
        query: { enabled: isNative }
    });

    const { data: erc20Balance } = useReadContract({
        address: token.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address],
        query: { enabled: !isNative }
    });

    const balanceFormatted = isNative
        ? (nativeBalance ? formatUnits(nativeBalance.value, nativeBalance.decimals) : "0.00")
        : (erc20Balance ? formatUnits(erc20Balance as bigint, token.decimals) : "0.00");

    return (
        <div className="flex items-center justify-between group cursor-default">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <img src={token.logo} className="w-8 h-8 rounded-full" />
                    <div className="absolute -inset-1 bg-white/10 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="font-bold text-slate-200 group-hover:text-white transition-colors">{token.symbol}</span>
            </div>
            <span className="font-medium text-white">{formatAmount(balanceFormatted)}</span>
        </div>
    );
}
