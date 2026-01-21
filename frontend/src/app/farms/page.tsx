"use client";

import { Zap, Loader2, Award, ArrowUpRight, ShieldCheck, ChevronRight, Droplets } from "lucide-react";
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useState, useEffect, useMemo } from "react";
import { CHEF_ADDRESS, TOKENS, FACTORY_ADDRESS, WFLR_ADDRESS } from "@/lib/constants";
import { MasterChef_ABI, FACTORY_ABI, PAIR_ABI, ERC20_ABI } from "@/lib/abis";
import { formatUnits, parseUnits } from "viem";
import { formatAmount, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function FarmsPage() {
    const [mounted, setMounted] = useState(false);
    const { address, isConnected } = useAccount();

    const { data: poolLength } = useReadContract({
        address: CHEF_ADDRESS as `0x${string}`,
        abi: MasterChef_ABI,
        functionName: "poolLength",
    });

    const pids = useMemo(() => Array.from({ length: Number(poolLength || 0) }, (_, i) => i), [poolLength]);

    const poolData = useReadContracts({
        contracts: pids.flatMap(pid => [
            { address: CHEF_ADDRESS as `0x${string}`, abi: MasterChef_ABI, functionName: "poolInfo", args: [BigInt(pid)] },
            { address: CHEF_ADDRESS as `0x${string}`, abi: MasterChef_ABI, functionName: "userInfo", args: [BigInt(pid), address!] },
        ]),
        query: { enabled: !!poolLength }
    });

    const lpAddresses = useMemo(() => (poolData.data || []).filter((_, i) => i % 2 === 0).map((p: any) => p.result?.[0]), [poolData.data]);

    const lpDetails = useReadContracts({
        contracts: (lpAddresses || []).flatMap((lp: any) => [
            { address: lp as `0x${string}`, abi: PAIR_ABI, functionName: "token0" },
            { address: lp as `0x${string}`, abi: PAIR_ABI, functionName: "token1" },
            { address: lp as `0x${string}`, abi: PAIR_ABI, functionName: "balanceOf", args: [address!] },
        ]),
        query: { enabled: lpAddresses.length > 0 && !!address }
    });

    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return null;

    return (
        <div className="flex flex-col items-center w-full max-w-6xl py-12 px-4 gap-12">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-500 text-sm font-bold">
                    <Zap size={16} /> Clapswap Yield Farming
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight">
                    Stake LP, Earn <span className="text-orange-500">CLAP</span>.
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    Provide liquidity to your favorite pairs and earn bonus CLAP rewards on top of the 0.3% trading fees.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {pids.map((pid, idx) => {
                    const poolInfo = poolData.data?.[idx * 2]?.result as any;
                    const userInfo = poolData.data?.[idx * 2 + 1]?.result as any;
                    const token0Addr = lpDetails.data?.[idx * 3]?.result as string;
                    const token1Addr = lpDetails.data?.[idx * 3 + 1]?.result as string;
                    const walletBalance = lpDetails.data?.[idx * 3 + 2]?.result as bigint;

                    if (!poolInfo || !token0Addr || !token1Addr) return null;

                    return (
                        <FarmTile
                            key={pid}
                            pid={pid}
                            lpToken={poolInfo[0]}
                            allocPoint={poolInfo[1]}
                            stakedAmount={userInfo?.[0] || 0n}
                            walletBalance={walletBalance || 0n}
                            token0Addr={token0Addr}
                            token1Addr={token1Addr}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function FarmTile({ pid, lpToken, allocPoint, stakedAmount, walletBalance, token0Addr, token1Addr }: any) {
    const { address } = useAccount();
    const { writeContract: write, data: hash } = useWriteContract();
    const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

    const t0 = TOKENS.find(t => t.address.toLowerCase() === token0Addr.toLowerCase());
    const t1 = TOKENS.find(t => t.address.toLowerCase() === token1Addr.toLowerCase());

    const { data: allowance } = useReadContract({
        address: lpToken as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [address!, CHEF_ADDRESS as `0x${string}`],
        query: { enabled: !!address }
    });

    const isApprovalRequired = walletBalance > 0n && (!allowance || (allowance as bigint) < walletBalance);

    const handleAction = () => {
        if (isApprovalRequired) {
            write({ address: lpToken as `0x${string}`, abi: ERC20_ABI, functionName: "approve", args: [CHEF_ADDRESS as `0x${string}`, walletBalance] });
        } else {
            write({ address: CHEF_ADDRESS as `0x${string}`, abi: MasterChef_ABI, functionName: "deposit", args: [BigInt(pid), walletBalance] });
        }
    };

    const handleUnstake = () => {
        write({ address: CHEF_ADDRESS as `0x${string}`, abi: MasterChef_ABI, functionName: "withdraw", args: [BigInt(pid), stakedAmount] });
    };

    return (
        <div className="bg-slate-900 border border-white/5 rounded-[40px] p-8 flex flex-col group hover:border-orange-500/20 transition-all">
            <div className="flex items-center justify-between mb-8">
                <div className="flex -space-x-3">
                    <img src={t0?.logo || "https://avatar.vercel.sh/t0"} className="w-12 h-12 rounded-full border-4 border-slate-900" />
                    <img src={t1?.logo || "https://avatar.vercel.sh/t1"} className="w-12 h-12 rounded-full border-4 border-slate-900" />
                </div>
                <div className="bg-orange-500/10 text-orange-500 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">
                    {Number(allocPoint) / 100}x Multiplier
                </div>
            </div>

            <h3 className="text-2xl font-black text-white mb-1">{t0?.symbol}/{t1?.symbol}</h3>
            <p className="text-slate-500 text-sm mb-8 font-medium">Clapswap LP Token</p>

            <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">APR</span>
                    <span className="text-green-500 font-bold">{(Number(allocPoint) * 45).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Staked</span>
                    <span className="text-white font-bold">{formatUnits(stakedAmount, 18).slice(0, 8)}</span>
                </div>
            </div>

            <div className="mt-auto space-y-3">
                {stakedAmount > 0n && (
                    <button
                        onClick={handleUnstake}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all"
                    >
                        Unstake LP
                    </button>
                )}
                {walletBalance > 0n ? (
                    <button
                        onClick={handleAction}
                        className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        {isApprovalRequired ? `Approve LP` : `Stake LP`}
                    </button>
                ) : (
                    <Link href="/liquidity" className="w-full py-4 bg-slate-800 text-slate-400 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-all">
                        Get LP Tokens <ChevronRight size={18} />
                    </Link>
                )}
            </div>
        </div>
    );
}
