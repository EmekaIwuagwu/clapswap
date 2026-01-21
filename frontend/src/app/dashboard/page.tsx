"use client";

import { Wallet, PieChart, History, ExternalLink, ArrowUpRight, ArrowDownLeft, TrendingUp, Droplets, Zap, ShieldCheck, Award, ArrowRight, Loader2 } from "lucide-react";
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { formatUnits, parseUnits } from "viem";
import { formatAmount, cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { TOKENS, CHEF_ADDRESS, WFLR_ADDRESS, CLAP_REWARD_ADDRESS } from "@/lib/constants";
import { useFtsoPrice } from "@/hooks/useFtsoPrice";
import { ERC20_ABI, MasterChef_ABI } from "@/lib/abis";
import { useAccountPositions } from "@/hooks/useAccountPositions";
import { useAccountFarms } from "@/hooks/useAccountFarms";
import Link from "next/link";

export default function DashboardPage() {
    const [mounted, setMounted] = useState(false);
    const { address, isConnected } = useAccount();
    const { openConnectModal } = useConnectModal();
    const { data: ethBalance } = useBalance({ address: address as `0x${string}` });
    const { price: flrPrice, isLoading: isPriceLoading } = useFtsoPrice("FLR");

    const { positions, isLoading: isPositionsLoading } = useAccountPositions();
    const { farms, isLoading: isFarmsLoading, refetch: refetchFarms } = useAccountFarms();

    const { writeContract: write, data: claimHash } = useWriteContract();
    const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: claimHash });

    useEffect(() => {
        setMounted(true);
    }, []);

    const totalLiquidityUSD = useMemo(() => {
        if (!flrPrice) return 0;
        let total = 0;

        positions.forEach(pos => {
            const isToken0FLR = pos.token0.toLowerCase() === WFLR_ADDRESS.toLowerCase();
            const flrReserve = isToken0FLR ? pos.reserve0 : pos.reserve1;
            // Use Number() for the final division to avoid BigInt errors in calc
            const userFlrShare = Number(pos.balance * flrReserve) / Number(pos.totalSupply);
            total += (userFlrShare / 1e18) * flrPrice * 2;
        });
        farms.forEach(farm => {
            const isToken0FLR = farm.token0.toLowerCase() === WFLR_ADDRESS.toLowerCase();
            const flrReserve = isToken0FLR ? farm.reserve0 : farm.reserve1;
            const userFlrShare = Number(farm.stakedAmount * flrReserve) / Number(farm.totalSupply);
            total += (userFlrShare / 1e18) * flrPrice * 2;
        });
        return total;
    }, [positions, farms, flrPrice]);

    const pendingRewards = useMemo(() => {
        return farms.reduce((acc, farm) => acc + (farm.pendingReward || 0n), 0n);
    }, [farms]);

    const handleClaimAll = () => {
        const farmToClaim = farms.find(f => f.pendingReward > 0n);
        if (farmToClaim) {
            write({
                address: CHEF_ADDRESS as `0x${string}`,
                abi: MasterChef_ABI,
                functionName: "deposit",
                args: [BigInt(farmToClaim.pid), 0n],
            });
        }
    };

    if (!mounted) return null;

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

    return (
        <div className="flex flex-col w-full max-w-7xl py-12 px-4 gap-8">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900 border border-white/5 rounded-[40px] p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp size={160} />
                    </div>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                            <PieChart size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Net Worth</h2>
                            <p className="text-sm text-slate-400">Total assets across Clapswap</p>
                        </div>
                    </div>
                    <div className="flex items-end gap-4">
                        <span className="text-6xl font-black text-white tracking-tighter">${totalLiquidityUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <div className="flex flex-col mb-2">
                            <span className="text-xs font-bold text-green-500 flex items-center gap-1">
                                <ArrowUpRight size={14} /> +12.5%
                            </span>
                            <span className="text-[10px] text-slate-500 uppercase font-black">Past 24H</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-[40px] p-8 text-white shadow-2xl shadow-orange-500/20 flex flex-col justify-between group cursor-pointer overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                        <Award size={80} />
                    </div>
                    <div>
                        <div className="text-orange-100/70 text-sm font-bold uppercase tracking-widest mb-1">Pending Rewards</div>
                        <div className="text-4xl font-black">{formatAmount(formatUnits(pendingRewards, 18))} <span className="text-xl">CLAP</span></div>
                    </div>
                    <button
                        onClick={handleClaimAll}
                        disabled={pendingRewards === 0n || isConfirming}
                        className="mt-6 w-full py-4 bg-white text-orange-600 rounded-2xl font-black shadow-lg hover:bg-orange-50 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isConfirming ? <Loader2 className="animate-spin" /> : <Zap size={20} />}
                        Harvest All
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Farming Positions */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-xl font-black text-white flex items-center gap-3">
                            <Zap className="text-orange-500" size={24} /> Active Farms
                        </h3>
                        <Link href="/pools" className="text-sm font-bold text-orange-500 hover:underline">View all pools →</Link>
                    </div>

                    <div className="grid gap-4">
                        {farms.length === 0 ? (
                            <div className="bg-slate-900/30 border border-dashed border-white/10 rounded-[32px] p-12 text-center text-slate-500">
                                <Award size={40} className="mx-auto mb-4 opacity-10" />
                                <p>You aren't farming any rewards yet.</p>
                                <p className="text-xs">Stake your LP tokens to earn CLAP.</p>
                            </div>
                        ) : (
                            farms.map(farm => (
                                <FarmCard key={farm.pid} farm={farm} flrPrice={flrPrice || 1} />
                            ))
                        )}
                    </div>

                    {/* Passive Liquidity */}
                    <div className="flex items-center justify-between px-4 mt-12">
                        <h3 className="text-xl font-black text-white flex items-center gap-3">
                            <Droplets className="text-blue-500" size={24} /> Unstaked Liquidity
                        </h3>
                    </div>
                    <div className="grid gap-4">
                        {positions.map(pos => (
                            <div key={pos.pairAddress} className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 flex items-center justify-between group hover:border-white/10 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center font-bold text-xs">?</div>
                                        <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center font-bold text-xs">?</div>
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">LP Position</div>
                                        <div className="text-xs text-slate-500">{pos.pairAddress.slice(0, 6)}...{pos.pairAddress.slice(-4)}</div>
                                    </div>
                                </div>
                                <Link href="/liquidity" className="bg-white/5 hover:bg-white/10 p-3 rounded-xl transition-all">
                                    <ArrowRight size={20} className="text-slate-400 group-hover:text-white" />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar: Balances */}
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-white/5 rounded-[40px] p-8 h-fit">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-black text-white">Wallet</h3>
                            <div className="bg-white/5 p-2 rounded-lg"><Wallet size={16} /></div>
                        </div>
                        <div className="space-y-6">
                            {TOKENS.map(token => (
                                <BalanceRow key={token.address} token={token} address={address!} />
                            ))}
                        </div>

                        <div className="mt-10 pt-10 border-t border-white/5 space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Gas Price</span>
                                <span className="text-green-500 font-bold">Low</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Network</span>
                                <span className="text-white font-bold flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500" /> Coston2
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FarmCard({ farm, flrPrice }: { farm: any, flrPrice: number }) {
    const isToken0FLR = farm.token0.toLowerCase() === WFLR_ADDRESS.toLowerCase();
    const flrReserve = isToken0FLR ? farm.reserve0 : farm.reserve1;
    const userFlrShare = Number(farm.stakedAmount * flrReserve) / Number(farm.totalSupply);
    const usdValue = (userFlrShare / 1e18) * flrPrice * 2;

    return (
        <div className="bg-slate-900/80 border border-white/5 rounded-[32px] p-6 hover:border-orange-500/20 transition-all group overflow-hidden relative">
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl flex items-center justify-center text-orange-500">
                        <Zap size={28} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-white">Pool #{farm.pid}</span>
                            <span className="bg-orange-500/10 text-orange-500 text-[10px] font-black px-2 py-0.5 rounded uppercase">Earning</span>
                        </div>
                        <div className="text-sm text-slate-500">Staked: {formatUnits(farm.stakedAmount, 18).slice(0, 6)} LP</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xl font-black text-white">${usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-black">Position Value</div>
                </div>
            </div>

            <div className="mt-6 flex gap-2">
                <div className="flex-1 bg-white/5 rounded-2xl p-3 border border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Rewards</div>
                    <div className="text-orange-500 font-black">{formatAmount(formatUnits(farm.pendingReward, 18))} CLAP</div>
                </div>
                <div className="flex-1 bg-white/5 rounded-2xl p-3 border border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">APR</div>
                    <div className="text-green-500 font-black">1.2k%</div>
                </div>
            </div>
        </div>
    );
}

function BalanceRow({ token, address }: { token: any, address: `0x${string}` }) {
    const isNative = token.address === "0x0000000000000000000000000000000000000000";
    const { data: bal } = useBalance({ address, query: { enabled: isNative } });
    const { data: ercBal } = useReadContract({
        address: token.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address],
        query: { enabled: !isNative }
    });

    const amount = isNative ? (bal ? formatUnits(bal.value, 18) : "0") : (ercBal ? formatUnits(ercBal as bigint, token.decimals) : "0");

    return (
        <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
                <img src={token.logo} className="w-8 h-8 rounded-full grayscale group-hover:grayscale-0 transition-all" />
                <span className="font-bold text-slate-300 group-hover:text-white">{token.symbol}</span>
            </div>
            <span className="font-medium text-white">{formatAmount(amount)}</span>
        </div>
    );
}
