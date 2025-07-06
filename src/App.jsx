import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "./config";
import ConnectWallet from "./components/walletConnect";
import HarvestForm from "./components/harvestForm";

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div style={{ padding: 24 }}>
          <h1>Apple Lifecycle dApp</h1>
          <ConnectWallet />
          <HarvestForm />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
