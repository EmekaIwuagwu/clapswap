import { SwapCard } from "@/components/SwapCard";

export default function SwapPage() {
  return (
    <div className="flex flex-col items-center gap-16 w-full max-w-4xl py-20 min-h-[80vh] justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-6xl md:text-7xl font-black tracking-tight bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent leading-none">
          SWAP <span className="text-orange-500 italic font-serif tracking-tighter">Faster.</span>
        </h1>
        <p className="text-slate-500 text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed uppercase tracking-widest text-[10px]">
          Institutional grade liquidity at your fingertips.
        </p>
      </div>

      <SwapCard />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-12 px-4">
        {[
          { label: "Stability Index", value: "99.9%", desc: "Uptime on Flare" },
          { label: "FTSO Verified", value: "Real-time", desc: "Decentralized Oracle" },
          { label: "Bridge Status", value: "Active", desc: "Multi-chain ready" },
        ].map((stat, i) => (
          <div key={i} className="group bg-slate-900/40 border border-white/5 backdrop-blur-xl rounded-[32px] p-8 transition-all hover:bg-white/5 hover:border-orange-500/20">
            <div className="text-[10px] font-black text-slate-500 mb-4 tracking-[0.2em] uppercase">{stat.label}</div>
            <div className="text-3xl font-black text-white mb-2 tracking-tight group-hover:text-orange-500 transition-colors">{stat.value}</div>
            <div className="text-xs font-medium text-slate-600">{stat.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
