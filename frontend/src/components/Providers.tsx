"use client";

import * as React from "react";
import {
    RainbowKitProvider,
    getDefaultConfig,
    darkTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider, http } from "wagmi";
import { flare, flareTestnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";

const config = getDefaultConfig({
    appName: "Clapswap",
    projectId: "YOUR_PROJECT_ID", // For demo purposes
    chains: [flare, flareTestnet],
    transports: {
        [flare.id]: http(),
        [flareTestnet.id]: http(),
    },
    ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={darkTheme({
                        accentColor: "#FF4D00",
                        accentColorForeground: "white",
                        borderRadius: "medium",
                        overlayBlur: "small",
                    })}
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
