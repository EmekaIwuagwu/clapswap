"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButtonCustom } from "./ConnectButtonCustom";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { name: "Swap", href: "/" },
    { name: "Pools", href: "/pools" },
    { name: "Liquidity", href: "/liquidity" },
    { name: "Dashboard", href: "/dashboard" },
];

export function Header() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-orange-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            <img src="/logo.png" alt="Clapswap" className="relative w-10 h-10 rounded-lg object-cover" />
                        </div>
                        <span className="text-2xl font-black bg-gradient-to-r from-orange-400 via-orange-500 to-red-600 bg-clip-text text-transparent tracking-tighter">
                            CLAPSWAP
                        </span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "px-4 py-2 rounded-full transition-all duration-200",
                                    pathname === item.href
                                        ? "text-slate-50 bg-white/5"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <ConnectButtonCustom />
                </div>
            </div>
        </header>
    );
}
