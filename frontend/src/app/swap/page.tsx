import { SwapCard } from "@/components/SwapCard";

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-12 w-full max-w-4xl py-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
          The Future of Swap.
        </h1>
        <p className="text-slate-400 text-lg md:text-xl font-medium max-w-lg mx-auto">
          Lightning-fast liquidity and swaps on <span className="text-orange-500">Flare Network</span>. No friction, just pure decentralized finance.
        </p>
      </div>

      <SwapCard />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12">
        {[
          { label: "Total Value Locked", value: "$42.5M", change: "+12.4%" },
          { label: "24h Volume", value: "$8.2M", change: "+5.1%" },
          { label: "Active Pairs", value: "1,245", change: "+34" },
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/5 backdrop-blur-sm rounded-3xl p-6 transition-all hover:bg-white/10 hover:border-white/10">
            <div className="text-sm font-medium text-slate-500 mb-1">{stat.label}</div>
            <div className="text-3xl font-bold mb-2 tracking-tight">{stat.value}</div>
            <div className="text-xs font-bold text-green-500 bg-green-500/10 w-fit px-2 py-1 rounded-full">{stat.change}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
