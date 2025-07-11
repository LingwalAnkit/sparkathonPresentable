"use client";
import { useState, useEffect, useRef } from "react";
import { useWriteContract, usePublicClient } from "wagmi";
import toast from "react-hot-toast";
import AppleLifecycleABI from "../../../abi/apple.json";
import {
  generateWarehouseTemperature,
  generateWarehouseEthylene,
} from "../../../utils/warehouseGenerator";

// Import the new components
import StatusCard from "./components/StatusCard";
import ReadingsHistoryTable from "./components/ReadingsHistoryTable";
import SpoilageActionButtons from "./components/SpoilageActionButtons";

const CONTRACT = {
  address: "0x83614Fb40F7532590752aD32e60050d661ceffE1",
  abi: AppleLifecycleABI.abi,
};

const ETHYLENE_SPOIL_THRESHOLD = 10; // ppm

export default function StorageMonitor({
  appleId,
  state = "WAREHOUSE",
  location = "Main Warehouse",
  onRouteChange,
}) {
  // State management
  const [readings, setReadings] = useState([]);
  const [status, setStatus] = useState("Initializing storage monitoring...");
  const [currentReading, setCurrentReading] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [transactionHashes, setTransactionHashes] = useState([]);
  const [spoilageDetected, setSpoilageDetected] = useState(false);
  const [monitoringStartTime, setMonitoringStartTime] = useState(null);
  const [totalReadings, setTotalReadings] = useState(0);

  const intervalRef = useRef(null);
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  // Blockchain logging function
  async function logToBlockchain(temp, ethylene) {
    console.log("🏪 Starting storage transaction");
    console.log("🔍 State:", state);
    console.log("🔍 Apple ID:", appleId);
    console.log("🔍 Temperature:", temp);
    console.log("🔍 Ethylene:", ethylene);
    console.log("🔍 Location:", location);

    try {
      let hash;
      if (state === "WAREHOUSE" || state === "COLD_CHAMBER") {
        console.log("📦 Logging warehouse data");
        hash = await writeContractAsync({
          ...CONTRACT,
          functionName: "logWarehouse",
          args: [BigInt(appleId), temp, BigInt(ethylene), location],
        });
      } else if (state === "STORE") {
        console.log("🏪 Logging store data");
        hash = await writeContractAsync({
          ...CONTRACT,
          functionName: "logStore",
          args: [BigInt(appleId), BigInt(ethylene)],
        });
      }

      if (hash) {
        console.log("✅ Storage transaction sent, hash:", hash);
        setTransactionHashes((prev) => [...prev, hash]);
        await publicClient.waitForTransactionReceipt({ hash });
        console.log("✅ Storage transaction confirmed");
        toast.success(`📦 Storage data logged (${state})`);
      }
    } catch (error) {
      console.error("❌ Storage transaction failed:", error);
      toast.error(
        `Failed to log storage data: ${error.shortMessage || error.message}`
      );
    }
  }

  // Data verification function (now used)
  const verifyDataTrail = async () => {
    try {
      const appleData = await publicClient.readContract({
        ...CONTRACT,
        functionName: "getApple",
        args: [BigInt(appleId)],
      });

      console.log("🔍 Complete Apple Data Trail:", appleData);
      console.log("📊 Harvest readings:", appleData.harvest.humidity.length);
      console.log(
        "🚛 Transport readings:",
        appleData.transport.temperatures.length
      );
      console.log("🏪 Warehouse logs:", appleData.warehouseLogs.length);

      toast.success(
        `Complete trail verified! ${appleData.warehouseLogs.length} warehouse entries`
      );
    } catch (error) {
      console.error("❌ Error reading apple data:", error);
      toast.error("Failed to verify data trail");
    }
  };

  // Monitoring logic with 1-minute intervals
  const startMonitoring = () => {
    console.log("🏪 Starting storage monitoring");
    console.log("🔍 Monitoring state:", state);
    console.log("🔍 Location:", location);

    setIsMonitoring(true);
    setMonitoringStartTime(Date.now());
    setStatus(`📦 Monitoring ${state.toLowerCase()} storage conditions...`);

    let readingCount = 0;
    const maxReadings = 10; // 10 readings over 10 minutes

    intervalRef.current = setInterval(async () => {
      readingCount++;
      console.log(`📊 Storage reading ${readingCount}/${maxReadings}`);

      const temp = parseInt(generateWarehouseTemperature());
      const ethylene = parseInt(generateWarehouseEthylene());
      const timestamp = Math.floor(Date.now() / 1000);

      const reading = {
        id: readingCount,
        temperature: temp,
        ethylene,
        timestamp,
        location,
        state,
        spoilageRisk: ethylene >= ETHYLENE_SPOIL_THRESHOLD,
      };

      console.log("📊 New storage reading:", reading);

      setCurrentReading(reading);
      setReadings((prev) => [...prev, reading]);
      setTotalReadings(readingCount);

      await logToBlockchain(temp, ethylene, timestamp);

      // Check for spoilage
      if (ethylene >= ETHYLENE_SPOIL_THRESHOLD) {
        console.log("⚠️ SPOILAGE DETECTED! Ethylene level:", ethylene);
        setSpoilageDetected(true);
        setStatus("⚠️ Apple is about to spoil! Take immediate action.");
        setIsMonitoring(false);
        clearInterval(intervalRef.current);
        toast.error(`🚨 Spoilage detected! Ethylene: ${ethylene} ppm`);
        return;
      }

      // Complete monitoring after max readings
      if (readingCount >= maxReadings) {
        console.log("✅ Storage monitoring complete");
        setIsMonitoring(false);
        setStatus("✅ Storage monitoring completed successfully");
        clearInterval(intervalRef.current);
        toast.success("📦 Storage monitoring completed");

        if (onRouteChange) {
          console.log("🚀 Auto-advancing to next stage");
          setTimeout(() => {
            onRouteChange("COMPLETED");
          }, 2000);
        }
      }
    }, 30000); // Changed to 1 minute (60000ms)
  };

  // Route change handler
  const handleRouteChange = (newRoute) => {
    console.log("🔄 Route change requested:", newRoute);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setIsMonitoring(false);

    if (onRouteChange) {
      onRouteChange(newRoute);
    }
  };

  // Auto-start monitoring on component mount
  useEffect(() => {
    console.log("🏗️ StorageMonitor component mounted");
    console.log("🔍 Apple ID:", appleId);
    console.log("🔍 Initial state:", state);
    console.log("🔍 Location:", location);
    console.log("🔍 onRouteChange callback:", !!onRouteChange);

    if (!appleId) {
      console.error("❌ No Apple ID provided to StorageMonitor");
      setStatus("❌ Error: No Apple ID provided");
      return;
    }

    console.log("🚀 Auto-starting storage monitoring");
    startMonitoring();

    return () => {
      console.log("🧹 StorageMonitor component unmounting");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [appleId]);

  // Render the main component using the smaller components
  return (
    <div className="bg-gray-100 p-6">
      <StatusCard
        status={status}
        isMonitoring={isMonitoring}
        spoilageDetected={spoilageDetected}
        currentReading={currentReading}
        ethyleneThreshold={ETHYLENE_SPOIL_THRESHOLD}
      />

      <ReadingsHistoryTable readings={readings} />

      {/* Data Verification Section - Now the function is used */}
      {!isMonitoring && readings.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 border mb-6">
          <h3 className="text-xl font-bold mb-4">🔍 Data Verification</h3>
          <button
            className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors font-medium"
            onClick={verifyDataTrail}
          >
            🔍 Verify Complete Data Trail
          </button>
        </div>
      )}

      {spoilageDetected && (
        <SpoilageActionButtons onRouteChange={handleRouteChange} />
      )}
    </div>
  );
}
