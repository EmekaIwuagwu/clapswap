"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Info, Loader2, ArrowRight } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useReadContract, useReadContracts } from "wagmi";
import { isAddress, getAddress } from "viem";
import { TOKENS } from "@/lib/constants";
import { ERC20_ABI } from "@/lib/abis";

interface Token {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
    logo: string;
}

interface TokenSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (token: Token) => void;
    title?: string;
}

const DEFAULT_LOGO = "https://cdn-icons-png.flaticon.com/512/10438/10438189.png";

export function TokenSelectModal({ isOpen, onClose, onSelect, title = "Select a token" }: TokenSelectModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [customToken, setCustomToken] = useState<Token | null>(null);

    const isSearchAddress = isAddress(searchQuery);

    const { data: tokenData, isLoading: isTokenInfoLoading } = useReadContracts({
        contracts: isSearchAddress ? [
            { address: searchQuery as `0x${string}`, abi: ERC20_ABI, functionName: "name" },
            { address: searchQuery as `0x${string}`, abi: ERC20_ABI, functionName: "symbol" },
            { address: searchQuery as `0x${string}`, abi: ERC20_ABI, functionName: "decimals" },
        ] : [],
        query: { enabled: isSearchAddress }
    });

    useEffect(() => {
        if (tokenData && tokenData.every(d => d.status === "success")) {
            setCustomToken({
                name: tokenData[0].result as string,
                symbol: tokenData[1].result as string,
                decimals: tokenData[2].result as number,
                address: getAddress(searchQuery),
                logo: DEFAULT_LOGO
            });
        } else {
            setCustomToken(null);
        }
    }, [tokenData, searchQuery]);

    const filteredTokens = useMemo(() => {
        return TOKENS.filter(t =>
            t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.address.toLowerCase() === searchQuery.toLowerCase()
        );
    }, [searchQuery]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
                    <div className="p-6 border-b border-white/5">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">{title}</h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-xl">✕</button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-4 top-3.5 text-slate-500" size={18} />
                            <input
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search name or paste address"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1">
                        {isSearchAddress && isTokenInfoLoading && (
                            <div className="p-8 text-center flex flex-col items-center gap-3">
                                <Loader2 className="animate-spin text-orange-500" size={32} />
                                <span className="text-slate-400 font-medium">Fetching token details...</span>
                            </div>
                        )}

                        {customToken && (
                            <div className="px-2 mb-4">
                                <div className="text-[10px] font-black text-orange-500/50 uppercase tracking-widest mb-2 px-2">Found by Address</div>
                                <TokenRow token={customToken} onClick={() => onSelect(customToken)} isCustom />
                            </div>
                        )}

                        {filteredTokens.length > 0 ? (
                            <>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-4 mt-2">Active Tokens</div>
                                {filteredTokens.map((token) => (
                                    <TokenRow key={token.address} token={token} onClick={() => onSelect(token)} />
                                ))}
                            </>
                        ) : !customToken && !isTokenInfoLoading && (
                            <div className="p-12 text-center text-slate-500">
                                <Search size={40} className="mx-auto mb-4 opacity-10" />
                                <p className="font-medium">No tokens found</p>
                                <p className="text-xs opacity-50">Try pasting a contract address</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-white/5 border-t border-white/5 text-[10px] text-slate-500 flex items-center gap-2">
                        <Info size={12} />
                        <span>Tip: Paste a token address to import custom tokens from the launchpad.</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

function TokenRow({ token, onClick, isCustom }: { token: Token, onClick: () => void, isCustom?: boolean }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center justify-between w-full p-4 hover:bg-white/5 rounded-[24px] transition-all group relative overflow-hidden"
        >
            <div className="flex items-center gap-4 relative z-10">
                <div className="relative">
                    <img src={token.logo} className="w-10 h-10 rounded-full object-cover" />
                    <div className="absolute inset-0 rounded-full border border-white/10" />
                </div>
                <div className="text-left">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-white group-hover:text-orange-500 transition-colors uppercase">{token.symbol}</span>
                        {isCustom && <span className="text-[10px] bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded-md font-black">NEW</span>}
                    </div>
                    <div className="text-xs text-slate-500">{token.name}</div>
                </div>
            </div>
            <div className="flex flex-col items-end relative z-10">
                <ArrowRight size={18} className="text-slate-700 group-hover:text-orange-500 transition-all -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
                {isCustom && <span className="text-[10px] text-slate-600 mt-1 font-mono tracking-tighter">{token.address.slice(0, 6)}...{token.address.slice(-4)}</span>}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-[100%] bg-gradient-to-r from-orange-500/0 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
    );
}
