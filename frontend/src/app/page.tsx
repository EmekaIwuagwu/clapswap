"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Rocket, ArrowRight, Shield, Zap, Droplets, PieChart } from "lucide-react";
import { LandingScene } from "@/components/LandingScene";
import { TOKENS } from "@/lib/constants";
import { formatAmount } from "@/lib/utils";

export default function LandingPage() {
    return (
        <div className="relative w-full min-h-screen flex flex-col overflow-hidden bg-slate-950">
            {/* 3D Scene Background */}
            <div className="fixed inset-0 z-0">
                <LandingScene />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/40 to-slate-950" />
            </div>

            {/* Hero Content */}
            <div className="relative z-10 container mx-auto px-4 flex-1 flex flex-col items-center justify-center pt-20 pb-12 max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-500 text-sm font-bold backdrop-blur-md">
                        <Rocket size={16} className="animate-bounce" /> Live on Flare Coston2
                    </div>

                    <div className="relative w-32 h-32 mx-auto">
                        <div className="absolute -inset-4 bg-orange-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                        <img src="/logo.png" alt="Clapswap" className="relative w-full h-full rounded-3xl object-cover shadow-2xl" />
                    </div>

                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-[0.9]">
                        CLAP<span className="text-orange-500">SWAP</span>
                    </h1>

                    <p className="text-slate-400 text-lg md:text-2xl max-w-2xl mx-auto font-medium leading-relaxed">
                        The ultimate decentralized liquidity layer on <span className="text-white">Flare Network</span>. Fast, secure, and drop-dead gorgeous.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                        <Link href="/swap" className="group relative px-10 py-5 bg-gradient-to-r from-orange-500 to-red-600 rounded-[28px] text-white font-black text-xl shadow-2xl shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all">
                            <span className="flex items-center gap-3">
                                Launch App <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>
                        <Link href="https://github.com/EmekaIwuagwu/clapswap" target="_blank" className="px-10 py-5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-[28px] text-white font-bold text-xl transition-all backdrop-blur-xl">
                            Read Docs
                        </Link>
                    </div>
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-32">
                    <FeatureCard
                        icon={<Zap className="text-orange-500" />}
                        title="Smart Routing"
                        description="Automatically find the best price across multiple liquidity pools with multi-hop execution."
                    />
                    <FeatureCard
                        icon={<Droplets className="text-blue-500" />}
                        title="Deep Liquidity"
                        description="Professional liquidity provision with dual-reward incentives for all active stakers."
                    />
                    <FeatureCard
                        icon={<Rocket className="text-purple-500" />}
                        title="Launchpad"
                        description="Deploy your own token in seconds. No code required, just pure innovation."
                    />
                </div>

                {/* Protocol Trust Section */}
                <div className="w-full mt-32 pt-20 border-t border-white/5 text-center">
                    <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.4em] mb-12">Powered by the Future</h2>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* We can just use text representations or small logos if we have them */}
                        <div className="text-2xl font-black text-white flex items-center gap-2">FLARE <span className="text-xs bg-white text-black px-1 rounded">NET</span></div>
                        <div className="text-2xl font-black text-white">FTSO <span className="text-xs text-orange-500">ORACLE</span></div>
                        <div className="text-2xl font-black text-white">MASTER<span className="text-xs text-blue-500">CHEF</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-slate-900/40 border border-white/5 backdrop-blur-xl rounded-[40px] p-8 space-y-4 hover:border-orange-500/20 transition-all group"
        >
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-orange-500/10 transition-colors">
                {icon}
            </div>
            <h3 className="text-2xl font-black text-white">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
                {description}
            </p>
        </motion.div>
    );
}
