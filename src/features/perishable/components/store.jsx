"use client";
import { useState, useEffect, useRef } from "react";
import { useWriteContract, usePublicClient } from "wagmi";
import toast from "react-hot-toast";
import AppleLifecycleABI from "../../../abi/apple.json";
import {
  generateWarehouseTemperature,
  generateWarehouseEthylene,
} from "../../../utils/warehouseGenerator";

const CONTRACT = {
  address: "0x83614Fb40F7532590752aD32e60050d661ceffE1",
  abi: AppleLifecycleABI.abi,
};

const ETHYLENE_SPOIL_THRESHOLD = 50; // ppm

export default function StorageMonitor({
  appleId,
  state = "WAREHOUSE",
  location = "Main Warehouse",
  onRouteChange,
}) {
  /* ------------- Enhanced state with logging ------------- */
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

  /* ------------- Enhanced transaction logging ------------- */
  async function logToBlockchain(temp, ethylene, timestamp) {
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

        // Wait for confirmation
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

  // Add this to your StorageMonitor component for verification
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
    }
  };

  /* ------------- Auto-start monitoring on component mount ------------- */
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

    // Auto-start monitoring
    console.log("🚀 Auto-starting storage monitoring");
    startMonitoring();

    return () => {
      console.log("🧹 StorageMonitor component unmounting");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [appleId]);

  /* ------------- Enhanced monitoring with comprehensive logging ------------- */
  const startMonitoring = () => {
    console.log("🏪 Starting storage monitoring");
    console.log("🔍 Monitoring state:", state);
    console.log("🔍 Location:", location);

    setIsMonitoring(true);
    setMonitoringStartTime(Date.now());
    setStatus(`📦 Monitoring ${state.toLowerCase()} storage conditions...`);

    let readingCount = 0;
    const maxReadings = 10; // Monitor for 10 readings (30 seconds)

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

      // Log to blockchain
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

        // Auto-advance to next stage after successful monitoring
        if (onRouteChange) {
          console.log("🚀 Auto-advancing to next stage");
          setTimeout(() => {
            onRouteChange("COMPLETED");
          }, 2000);
        }
      }
    }, 3000);
  };

  /* ------------- Route change handlers ------------- */
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

  /* ------------- Calculate monitoring duration ------------- */
  const getMonitoringDuration = () => {
    if (!monitoringStartTime) return "0s";
    const duration = Math.floor((Date.now() - monitoringStartTime) / 1000);
    return `${duration}s`;
  };

  /* ------------- UI with enhanced debugging and monitoring ------------- */
  return (
    <div className="bg-gray-100 p-6">
      {/* Debug Panel */}
      <div className="bg-purple-50 border border-purple-200 rounded p-4 mb-6">
        <h4 className="font-bold text-purple-800 mb-2">
          🏪 Storage Debug Info
        </h4>
        <div className="text-sm text-purple-700 space-y-1">
          <p>
            Apple ID: <strong>{appleId || "None"}</strong>
          </p>
          <p>
            Storage State: <strong>{state}</strong>
          </p>
          <p>
            Location: <strong>{location}</strong>
          </p>
          <p>Monitoring Active: {isMonitoring ? "✅" : "❌"}</p>
          <p>Spoilage Detected: {spoilageDetected ? "⚠️" : "✅"}</p>
          <p>
            Total Readings: <strong>{totalReadings}</strong>
          </p>
          <p>
            Monitoring Duration: <strong>{getMonitoringDuration()}</strong>
          </p>
          <p>
            Transactions Sent: <strong>{transactionHashes.length}</strong>
          </p>
          <p>Callback Function: {onRouteChange ? "✅" : "❌"}</p>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-xl shadow-md p-6 border mb-6">
        <h2 className="text-xl font-semibold mb-4">🏪 Storage Monitoring</h2>
        <div className="flex items-center space-x-2 mb-4">
          <div
            className={`w-3 h-3 rounded-full ${
              isMonitoring
                ? "bg-green-500 animate-pulse"
                : spoilageDetected
                ? "bg-red-500"
                : "bg-gray-400"
            }`}
          ></div>
          <p
            className={`font-medium ${
              spoilageDetected ? "text-red-600" : "text-gray-700"
            }`}
          >
            {status}
          </p>
        </div>

        {/* Current Reading Display */}
        {currentReading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <h4 className="font-semibold text-blue-700">🌡️ Temperature</h4>
              <p className="text-2xl font-bold text-blue-600">
                {currentReading.temperature}°C
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <h4 className="font-semibold text-green-700">🍃 Ethylene</h4>
              <p
                className={`text-2xl font-bold ${
                  currentReading.ethylene >= ETHYLENE_SPOIL_THRESHOLD
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {currentReading.ethylene} ppm
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <h4 className="font-semibold text-gray-700">📍 Location</h4>
              <p className="text-lg font-medium text-gray-600">
                {currentReading.location}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Readings History Table */}
      <div className="bg-white rounded-xl shadow-md p-6 border mb-6">
        <h3 className="text-xl font-bold mb-4">📊 Storage Readings History</h3>
        {readings.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
              <p className="text-gray-500">Collecting storage data...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 border-b font-semibold text-gray-700">
                    #
                  </th>
                  <th className="px-4 py-3 border-b font-semibold text-gray-700">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 border-b font-semibold text-gray-700">
                    Temperature (°C)
                  </th>
                  <th className="px-4 py-3 border-b font-semibold text-gray-700">
                    Ethylene (ppm)
                  </th>
                  <th className="px-4 py-3 border-b font-semibold text-gray-700">
                    Location
                  </th>
                  <th className="px-4 py-3 border-b font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {readings.map((r, i) => (
                  <tr
                    key={i}
                    className={`text-center ${
                      r.spoilageRisk ? "bg-red-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3 border-b font-medium">{r.id}</td>
                    <td className="px-4 py-3 border-b text-sm">
                      {new Date(r.timestamp * 1000).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 border-b font-medium">
                      {r.temperature}
                    </td>
                    <td
                      className={`px-4 py-3 border-b font-medium ${
                        r.spoilageRisk
                          ? "text-red-600 font-bold"
                          : "text-green-600"
                      }`}
                    >
                      {r.ethylene}
                    </td>
                    <td className="px-4 py-3 border-b">{r.location}</td>
                    <td className="px-4 py-3 border-b">
                      {r.spoilageRisk ? (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                          ⚠️ Risk
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          ✅ Good
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Buttons (shown when spoilage detected) */}
      {spoilageDetected && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h4 className="font-bold text-red-800 mb-4">
            🚨 Immediate Action Required
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors font-medium"
              onClick={() => handleRouteChange("CHARITY")}
            >
              🤝 Send to Charity
            </button>
            <button
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              onClick={() => handleRouteChange("COLD_CHAMBER")}
            >
              ❄️ Cold Storage
            </button>
            <button
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              onClick={() => handleRouteChange("SALE")}
            >
              💰 Quick Sale
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
