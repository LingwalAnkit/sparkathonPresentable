import { http, createConfig } from "wagmi";
import { mainnet } from "viem/chains";
import { metaMask } from "wagmi/connectors";

const rpcURL = import.meta.env.VITE_RPC_URL;

export const config = createConfig({
  chains: [mainnet],
  connectors: [metaMask()],
  transports: {
    [mainnet.id]: http(rpcURL),
  },
});
