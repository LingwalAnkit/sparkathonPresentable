import { useConnect, useAccount } from "wagmi";
import { injected } from "wagmi/connectors";

export default function ConnectWallet() {
  const { connect } = useConnect();
  const { address, isConnected } = useAccount();

  return (
    <div>
      {isConnected ? (
        <p>Connected: {address}</p>
      ) : (
        <button onClick={() => connect({ connector: injected() })}>
          Connect Wallet
        </button>
      )}
    </div>
  );
}
