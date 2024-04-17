import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import {createWeb3Modal} from "@web3modal/wagmi/react";
import {celo} from "wagmi/chains";
import {WagmiProvider} from "wagmi";
import {defaultWagmiConfig} from "@web3modal/wagmi";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

const chains = [
  celo
] as const

const projectId: string = import.meta.env.VITE_PROJECT_ID || "";

const metadata = {
  name: "Revo Withdrawal Dapp",
  description: "A dapp for withdrawing Revo assets",
  url: "https://revo.market",
  icons: ["https://github.com/revo-market/revo-withdrawal-dapp/blob/44791176774cbecc42d2604aebbb58b4a74dcac7/public/revo-logo.png"],
};

const wagmiConfig = defaultWagmiConfig({
  chains, projectId, metadata
})

const queryClient = new QueryClient()

createWeb3Modal({wagmiConfig, projectId, defaultChain: celo,});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <App/>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
