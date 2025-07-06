import { http, createConfig, injected } from "wagmi";
import { mainnet } from "viem/chains";

const rpcURL = import.meta.env.VITE_RPC_URL;

export const config = createConfig({
  chains: [mainnet],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(rpcURL),
  },
});
