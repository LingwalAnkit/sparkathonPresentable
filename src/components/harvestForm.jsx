"use client";
import { useState, useEffect } from "react";
import { useWriteContract } from "wagmi";
import AppleLifecycleABI from "../abi/apple.json";
import {
  generateHumidity,
  generateChemicals,
} from "../utils/sensorDataGenerator";

import { SoilUsed } from "../utils/soilUsed";

const CONTRACT_ADDRESS = "0x83614Fb40F7532590752aD32e60050d661ceffE1";
const abi = AppleLifecycleABI.abi;

export default function HarvestForm() {
  const [soil, setSoil] = useState(""); // initially empty
  const [humidity, setHumidity] = useState("");
  const [chemicals, setChemicals] = useState("");
  const [status, setStatus] = useState("");
  const [count, setCount] = useState(0);

  const { writeContract, isSuccess, error } = useWriteContract();

  function parseUintArray(str) {
    return str.split(",").map((s) => BigInt(s.trim()));
  }

  async function submitSyntheticData(soilStr, humidityStr, chemicalsStr) {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "createApple",
        args: [
          soilStr,
          parseUintArray(humidityStr),
          parseUintArray(chemicalsStr),
        ],
      });
      setStatus(`Submission #${count + 1} sent!`);
    } catch (err) {
      setStatus("Error: " + (err.shortMessage || err.message));
    }
  }

  useEffect(() => {
    const initialSoil = SoilUsed();
    setSoil(initialSoil);

    let submissionCount = 0;
    const maxSubmissions = 5;

    const interval = setInterval(() => {
      if (submissionCount >= maxSubmissions) {
        clearInterval(interval);
        setStatus("Auto submission finished.");
        return;
      }

      const newHumidity = generateHumidity();
      const newChemicals = generateChemicals();

      setHumidity(newHumidity);
      setChemicals(newChemicals);
      setCount(submissionCount + 1);
      submitSyntheticData(initialSoil, newHumidity, newChemicals);

      submissionCount++;
    }, 9000); // every 9 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <h3>Auto Logging Harvest Data</h3>

      <label>Soil Composition</label>
      <input type="text" value={soil} readOnly />
      <br />

      <label>Humidity Readings</label>
      <input type="text" value={humidity} readOnly />
      <br />

      <label>Chemical Composition</label>
      <input type="text" value={chemicals} readOnly />
      <br />

      <button type="button" disabled>
        Auto Submitting...
      </button>

      <p>{status}</p>
      {isSuccess && <p>Success!</p>}
      {error && (
        <p style={{ color: "red" }}>{error.shortMessage || error.message}</p>
      )}
    </form>
  );
}
