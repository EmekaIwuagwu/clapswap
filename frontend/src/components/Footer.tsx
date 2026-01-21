import Link from "next/link";
import { Twitter, Github, MessageCircle, ExternalLink, ShieldCheck, Zap, Coins, Award, Rocket } from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-white/5 bg-slate-950/50 backdrop-blur-xl mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-3 group">
                            <img src="/logo.png" alt="Clapswap" className="w-8 h-8 rounded-lg" />
                            <span className="text-xl font-black bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent tracking-tighter">
                                CLAPSWAP
                            </span>
                        </Link>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            The premier decentralized exchange on Flare Network. Lightning-fast swaps, deep liquidity, and a premium DeFi experience for everyone.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href="#" className="p-2 bg-white/5 rounded-xl hover:bg-orange-500/10 hover:text-orange-500 transition-all">
                                <Twitter size={18} />
                            </Link>
                            <Link href="#" className="p-2 bg-white/5 rounded-xl hover:bg-orange-500/10 hover:text-orange-500 transition-all">
                                <Github size={18} />
                            </Link>
                            <Link href="#" className="p-2 bg-white/5 rounded-xl hover:bg-orange-500/10 hover:text-orange-500 transition-all">
                                <MessageCircle size={18} />
                            </Link>
                        </div>
                    </div>

                    {/* Live Features Column */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest">Protocol Status</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li className="flex items-center gap-2 text-slate-200">
                                <ShieldCheck size={14} className="text-green-500" />
                                <span>FTSO Oracle Integration</span>
                            </li>
                            <li className="flex items-center gap-2 text-slate-200">
                                <Zap size={14} className="text-orange-500" />
                                <span>Multi-hop Routing</span>
                            </li>
                            <li className="flex items-center gap-2 text-slate-200">
                                <Award size={14} className="text-blue-500" />
                                <span>MasterChef Yield Farming</span>
                            </li>
                            <li className="flex items-center gap-2 text-slate-200">
                                <Rocket size={14} className="text-purple-500" />
                                <span>Permissionless Launchpad</span>
                            </li>
                        </ul>
                    </div>

                    {/* Resources Column */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest">Ecosystem</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><Link href="/launchpad" className="hover:text-orange-500 transition-colors">Clapswap Launchpad</Link></li>
                            <li><Link href="/farms" className="hover:text-orange-500 transition-colors">Yield Farms</Link></li>
                            <li><Link href="https://coston2-explorer.flare.network/" target="_blank" className="hover:text-orange-500 transition-colors flex items-center gap-1">Flare Explorer <ExternalLink size={12} /></Link></li>
                            <li><Link href="#" className="hover:text-orange-500 transition-colors">Developer Docs</Link></li>
                        </ul>
                    </div>

                    {/* Stats Column */}
                    <div className="bg-white/5 rounded-[32px] p-6 border border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase">Network Status</span>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-[10px] font-bold text-green-500">LIVE</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <ShieldCheck size={20} className="text-orange-500" />
                                <div>
                                    <div className="text-xs text-slate-500">Audited By</div>
                                    <div className="text-sm font-bold text-white">CertiK (Pending)</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Zap size={20} className="text-orange-500" />
                                <div>
                                    <div className="text-xs text-slate-500">Latency</div>
                                    <div className="text-sm font-bold text-white">&lt; 1.5s</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-slate-500 outline-none">
                        &copy; {currentYear} Clapswap Protocol. Built with ❤️ on Flare Network.
                    </p>
                    <div className="flex items-center gap-8 text-xs font-medium text-slate-500">
                        <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                        <div className="flex items-center gap-1">
                            <Coins size={14} className="text-orange-500" />
                            <span>Coston2 Testnet Enabled</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
