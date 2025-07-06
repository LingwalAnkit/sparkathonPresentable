"use client";
import { useState } from "react";
import { useWriteContract } from "wagmi";
import AppleLifecycleABI from "../abi/apple.json";

const CONTRACT_ADDRESS = "0x83614Fb40F7532590752aD32e60050d661ceffE1";

export default function HarvestForm() {
  const [soil, setSoil] = useState("");
  const [humidity, setHumidity] = useState("");
  const [chemicals, setChemicals] = useState("");
  const [status, setStatus] = useState("");
  const abi = AppleLifecycleABI.abi;

  const { writeContract, isPending, isSuccess, error } = useWriteContract();

  function parseUintArray(str) {
    return str.split(",").map((s) => BigInt(s.trim()));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!soil || !humidity || !chemicals) {
      setStatus("Please fill all fields.");
      return;
    }
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "createApple",
        args: [soil, parseUintArray(humidity), parseUintArray(chemicals)],
      });
      setStatus("Transaction sent!");
    } catch (err) {
      setStatus("Error: " + (err.shortMessage || err.message));
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Log Harvest Data</h3>
      <input
        type="text"
        placeholder="Soil Composition"
        value={soil}
        onChange={(e) => setSoil(e.target.value)}
      />
      <br />
      <input
        type="text"
        placeholder="Humidity readings (comma separated)"
        value={humidity}
        onChange={(e) => setHumidity(e.target.value)}
      />
      <br />
      <input
        type="text"
        placeholder="Chemical composition (comma separated)"
        value={chemicals}
        onChange={(e) => setChemicals(e.target.value)}
      />
      <br />
      <button type="submit" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit"}
      </button>
      <p>{status}</p>
      {isSuccess && <p>Success!</p>}
      {error && (
        <p style={{ color: "red" }}>{error.shortMessage || error.message}</p>
      )}
    </form>
  );
}
