import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Clapswap | Flare Network's Premier DEX",
  description: "Swap, Provide Liquidity, and Earn on Flare Network.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          inter.className,
          "min-h-screen bg-slate-950 text-slate-50 antialiased selection:bg-orange-500/30"
        )}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-orange-600/10 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />

            <Header />

            <main className="flex-1 relative z-10 flex items-center justify-center p-4">
              {children}
            </main>

            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
