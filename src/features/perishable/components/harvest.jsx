"use client";
import { useEffect, useState } from "react";
import {
  useAccount,
  usePublicClient,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import toast from "react-hot-toast";
import AppleLifecycleABI from "../../../abi/apple.json";
import {
  generateHumidity,
  generateChemicals,
  SoilUsed,
} from "../../../utils/sensorDataGenerator";
import Lottie from "lottie-react";
import farmAnimation from "../../../assets/lottie/farm.json";

const CONTRACT = {
  address: "0x83614Fb40F7532590752aD32e60050d661ceffE1",
  abi: AppleLifecycleABI.abi,
};

export default function HarvestForm({ onHarvestComplete }) {
  /* ------------- local state ------------- */
  const [soil] = useState(() => SoilUsed());
  const [readings, setReadings] = useState([]);
  const [currentReading, setCurrentReading] = useState(null);
  const [isWaitingForEvent, setIsWaitingForEvent] = useState(false);
  const [transactionHash, setTransactionHash] = useState(null);

  /* ------------- wagmi ------------- */
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  /* ------------- Enhanced event listener with debugging ------------- */
  useWatchContractEvent({
    ...CONTRACT,
    eventName: "AppleCreated",
    onLogs(logs) {
      console.log("🎯 AppleCreated event received:", logs);
      console.log("🔍 Event args:", logs[0]?.args);
      console.log("🔍 Is waiting for event:", isWaitingForEvent);
      console.log(
        "🔍 Transaction hash match:",
        logs[0]?.transactionHash === transactionHash
      );

      if (isWaitingForEvent && logs[0]?.args?.appleId) {
        const appleId = logs[0].args.appleId.toString();
        console.log("✅ Processing AppleCreated event for ID:", appleId);

        setIsWaitingForEvent(false);
        toast.success(`🍎 Apple #${appleId} created on-chain`);

        console.log(
          "🔍 onHarvestComplete function exists:",
          !!onHarvestComplete
        );
        console.log("🔍 onHarvestComplete type:", typeof onHarvestComplete);

        if (onHarvestComplete) {
          console.log("🚀 Calling onHarvestComplete with ID:", appleId);
          try {
            onHarvestComplete(appleId);
            console.log("✅ onHarvestComplete called successfully");
          } catch (error) {
            console.error("❌ Error calling onHarvestComplete:", error);
          }
        } else {
          console.error("❌ onHarvestComplete callback is not defined!");
        }
      } else {
        console.log("⚠️ Event received but conditions not met");
        console.log("   - isWaitingForEvent:", isWaitingForEvent);
        console.log("   - appleId exists:", !!logs[0]?.args?.appleId);
      }
    },
    onError(error) {
      console.error("❌ Event listener error:", error);
      toast.error("Event listener error: " + error.message);
    },
  });

  /* ------------- Enhanced transaction function ------------- */
  async function sendToChain(hArr, cArr) {
    console.log("🚀 Starting sendToChain function");
    console.log("🔍 Wallet connected:", isConnected);
    console.log("🔍 Humidity array:", hArr);
    console.log("🔍 Chemical array:", cArr);
    console.log("🔍 Soil type:", soil);

    if (!isConnected) {
      console.error("❌ Wallet not connected");
      return toast.error("🔌 Connect wallet first");
    }

    const toastId = toast.loading("📡 Harvest→chain …");
    setIsWaitingForEvent(true);

    try {
      console.log("📡 Sending transaction to contract...");
      const hash = await writeContractAsync({
        ...CONTRACT,
        functionName: "createApple",
        args: [soil, hArr.map(BigInt), cArr.map(BigInt)],
      });

      console.log("✅ Transaction sent, hash:", hash);
      setTransactionHash(hash);
      toast.loading("⏳ Waiting for confirmation...", { id: toastId });

      console.log("⏳ Waiting for transaction receipt...");
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("✅ Transaction confirmed, receipt:", receipt);

      toast.success("✅ Transaction confirmed", { id: toastId });

      // Additional debugging: Check if event was emitted in the receipt
      if (receipt.logs && receipt.logs.length > 0) {
        console.log("📋 Transaction logs:", receipt.logs);
        const appleCreatedLog = receipt.logs.find(
          (log) => log.address.toLowerCase() === CONTRACT.address.toLowerCase()
        );
        if (appleCreatedLog) {
          console.log("🎯 Found AppleCreated log in receipt:", appleCreatedLog);
        } else {
          console.warn("⚠️ No AppleCreated log found in receipt");
        }
      }

      // Fallback: If event doesn't trigger within 5 seconds, try manual approach
      setTimeout(() => {
        if (isWaitingForEvent) {
          console.warn(
            "⚠️ Event not received within 5 seconds, trying fallback"
          );
          handleEventFallback();
        }
      }, 5000);
    } catch (err) {
      console.error("❌ Transaction failed:", err);
      setIsWaitingForEvent(false);
      toast.error(err.shortMessage || err.message, { id: toastId });
    }
  }

  /* ------------- Fallback method if event doesn't trigger ------------- */
  async function handleEventFallback() {
    console.log("🔄 Executing fallback method");
    try {
      // Read the current nextAppleId from contract
      const nextAppleId = await publicClient.readContract({
        ...CONTRACT,
        functionName: "nextAppleId",
      });

      const newAppleId = (BigInt(nextAppleId) - 1n).toString();
      console.log("🔄 Fallback: Retrieved Apple ID:", newAppleId);

      setIsWaitingForEvent(false);
      toast.success(`🍎 Apple #${newAppleId} created (fallback)`);

      if (onHarvestComplete) {
        console.log("🔄 Fallback: Calling onHarvestComplete");
        onHarvestComplete(newAppleId);
      }
    } catch (error) {
      console.error("❌ Fallback method failed:", error);
      setIsWaitingForEvent(false);
      toast.error("Failed to retrieve Apple ID");
    }
  }

  /* ------------- Enhanced sensor data collection ------------- */
  useEffect(() => {
    console.log("🔄 useEffect triggered, wallet connected:", isConnected);

    if (!isConnected) {
      console.log("⚠️ Wallet not connected, skipping data collection");
      return;
    }

    console.log("🚀 Starting sensor data collection");
    const max = 5;
    let i = 0,
      humArr = [],
      chemArr = [];

    const int = setInterval(() => {
      console.log(`📊 Sensor reading ${i + 1}/${max}`);

      if (i === max) {
        clearInterval(int);
        console.log("✅ Data collection complete, sending to chain");
        console.log("📊 Final humidity array:", humArr);
        console.log("📊 Final chemical array:", chemArr);
        sendToChain(humArr, chemArr);
        return;
      }

      const h = parseInt(generateHumidity());
      const c = parseInt(generateChemicals());
      humArr.push(h);
      chemArr.push(c);

      const r = { idx: i + 1, humidity: h, chemical: c };
      console.log("📊 New reading:", r);

      setCurrentReading(r);
      setReadings((p) => [...p, r]);
      i++;
    }, 9000);

    return () => {
      console.log("🧹 Cleaning up sensor interval");
      clearInterval(int);
    };
  }, [isConnected]);

  /* ------------- Component mount/unmount logging ------------- */
  useEffect(() => {
    console.log("🏗️ HarvestForm component mounted");
    console.log("🔍 onHarvestComplete prop:", onHarvestComplete);
    console.log("🔍 onHarvestComplete type:", typeof onHarvestComplete);

    return () => {
      console.log("🧹 HarvestForm component unmounting");
    };
  }, []);

  /* ------------- UI ------------- */
  return (
    <div className="flex flex-col md:flex-row bg-gray-100 mt-6 gap-6">
      {/* Debug info panel */}
      <div className="w-full bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
        <h4 className="font-bold text-yellow-800 mb-2">🐛 Debug Info</h4>
        <div className="text-sm text-yellow-700 space-y-1">
          <p>Wallet Connected: {isConnected ? "✅" : "❌"}</p>
          <p>Waiting for Event: {isWaitingForEvent ? "⏳" : "❌"}</p>
          <p>Transaction Hash: {transactionHash || "None"}</p>
          <p>Callback Function: {onHarvestComplete ? "✅" : "❌"}</p>
          <p>Readings Count: {readings.length}</p>
        </div>
      </div>

      {/* History */}
      <div className="md:w-1/3 w-full">
        <div className="bg-white shadow-md rounded-xl p-6 border h-full">
          <h3 className="text-xl font-bold mb-4 text-center">Sensor History</h3>
          {readings.length === 0 ? (
            <p className="text-gray-500">Waiting…</p>
          ) : (
            <ul className="space-y-2 text-gray-700 text-sm">
              {readings.map((r) => (
                <li key={r.idx}>
                  <b>#{r.idx}</b> Hum {r.humidity}%, Nitrate {r.chemical} ppm
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Live cards + animation */}
      <div className="md:w-2/3 w-full flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            ["Soil Type", soil],
            ["Humidity", currentReading ? `${currentReading.humidity}%` : "…"],
            [
              "Nitrate",
              currentReading ? `${currentReading.chemical} ppm` : "…",
            ],
          ].map(([t, v]) => (
            <div
              key={t}
              className="bg-white shadow-md rounded-xl p-6 border text-center"
            >
              <h4 className="font-semibold text-gray-700 mb-1">{t}</h4>
              <p className="text-gray-600">{v}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Lottie
            animationData={farmAnimation}
            className="w-[300px] h-[300px]"
          />
        </div>
      </div>
    </div>
  );
}
