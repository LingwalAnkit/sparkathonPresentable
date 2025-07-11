import { useConnect, useConnectors, useAccount, useDisconnect } from "wagmi";

function ConnectWallets() {
  const { connect } = useConnect();
  const connectors = useConnectors();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <button
          className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
          onClick={() => disconnect()}
        >
          Disconnect
        </button>
      </div>
    );
  }

  // Filter to only show MetaMask
  const filteredConnectors = connectors.filter((c) =>
    c.name.toLowerCase().includes("metamask")
  );

  return (
    <div className="flex justify-center items-center">
      {filteredConnectors.map((c) => (
        <button
          key={c.id}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => connect({ connector: c })}
        >
          Connect via {c.name}
        </button>
      ))}
    </div>
  );
}

export default ConnectWallets;
