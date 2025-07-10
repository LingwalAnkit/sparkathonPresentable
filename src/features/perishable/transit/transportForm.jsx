"use client";
import { useState, useEffect } from "react";
import { usePublicClient, useWriteContract } from "wagmi";
import toast from "react-hot-toast";
import AppleLifecycleABI from "../../../abi/apple.json";
import { useTransportData } from "./hook/useTransportData";
import JourneyProgress from "./components/progress";
import TransportTimeline from "./components/transportTimelineortTimeline";
import LiveSensorData from "./components/sensorData";
import JourneyMetrics from "./components/journeyMetric";
import SensorReadingsHistory from "./components/readingHistory";

const CONTRACT = {
  address: "0x83614Fb40F7532590752aD32e60050d661ceffE1",
  abi: AppleLifecycleABI.abi,
};

export default function TransportForm({ appleId, onTransitComplete }) {
  const [isWaitingForTx, setIsWaitingForTx] = useState(false);
  const [status, setStatus] = useState("Initializing transport monitoring...");

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const {
    journeyInfo,
    readings,
    current,
    gps,
    temps,
    ethy,
    startT,
    endT,
    journeyMetrics,
    startJourney,
    isCollecting,
  } = useTransportData();

  useEffect(() => {
    if (!appleId) {
      setStatus("❌ Error: No Apple ID provided");
      return;
    }

    // Auto-start journey and handle auto-submission
    const cleanup = startJourney(() => {
      // This callback will be called when data collection is complete
      setStatus(
        "📝 Data collection complete. Auto-submitting to blockchain..."
      );
      setTimeout(() => {
        submitToChain();
      }, 1500);
    });

    return cleanup;
  }, [appleId]);

  const submitToChain = async () => {
    const toastId = toast.loading("🚛 Transport→chain …");
    setIsWaitingForTx(true);
    setStatus("📡 Sending transport data to blockchain...");

    try {
      const signedTemperatures = temps.map((x) => BigInt(Math.round(x)));

      const hash = await writeContractAsync({
        ...CONTRACT,
        functionName: "logTransport",
        args: [
          BigInt(appleId),
          BigInt(startT),
          BigInt(endT),
          gps,
          signedTemperatures,
          ethy.map((x) => BigInt(x)),
        ],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // Use the receipt for validation
      console.log("✅ Transaction confirmed:", {
        status: receipt.status, // 1 = success, 0 = failure
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber.toString(),
        logs: receipt.logs.length,
      });

      // Check if transaction actually succeeded
      if (receipt.status === 0) {
        throw new Error("Transaction failed on blockchain");
      }

      setIsWaitingForTx(false);
      toast.success("✅ Transport data logged to blockchain!", { id: toastId });

      setIsWaitingForTx(false);
      toast.success("✅ Transport data logged to blockchain!", { id: toastId });
      setStatus("✅ Transport data successfully stored on blockchain");

      await verifyTransportData();

      if (onTransitComplete) {
        setTimeout(() => onTransitComplete(), 1000);
      }
    } catch (error) {
      setIsWaitingForTx(false);
      toast.error(error.shortMessage || error.message, { id: toastId });
      setStatus("❌ Failed to store transport data");
    }
  };

  const verifyTransportData = async () => {
    try {
      const appleData = await publicClient.readContract({
        ...CONTRACT,
        functionName: "getApple",
        args: [BigInt(appleId)],
      });

      if (appleData.transport && appleData.transport.temperatures.length > 0) {
        toast.success("✅ Transport data verified on blockchain");
      } else {
        toast.error("❌ Transport data not found on blockchain");
      }
    } catch (error) {
      console.error("❌ Error verifying transport data:", error);
    }
  };

  return (
    <div className="bg-gray-100 p-6">
      <div className="flex flex-row gap-6 w-full">
        <JourneyProgress journeyInfo={journeyInfo} />
        <TransportTimeline startT={startT} endT={endT} />
      </div>

      <LiveSensorData current={current} />

      <JourneyMetrics metrics={journeyMetrics} />

      <SensorReadingsHistory
        readings={readings}
        isCollecting={isCollecting}
        onSubmit={submitToChain}
        isWaitingForTx={isWaitingForTx}
        status={status}
      />
    </div>
  );
}
