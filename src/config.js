import { http, createConfig, injected } from "wagmi";
import { mainnet } from "viem/chains";

export const config = createConfig({
  chains: [mainnet],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(
      "https://eth-sepolia.g.alchemy.com/v2/2ix7mu9pXV8L1bcloWrBgzXOjX1UQ3Yu"
    ),
  },
});
