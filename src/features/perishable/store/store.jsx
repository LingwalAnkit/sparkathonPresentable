"use client";
import { useState, useEffect, useRef } from "react";
import { useWriteContract, usePublicClient } from "wagmi";
import toast from "react-hot-toast";
import AppleLifecycleABI from "../../../abi/apple.json";
import {
  generateWarehouseTemperature,
  generateWarehouseEthylene,
} from "../../../utils/warehouseGenerator";

// Import components
import StatusCard from "./components/StatusCard";
import ReadingsHistoryTable from "./components/ReadingsHistoryTable";
import SpoilageActionButtons from "./components/SpoilageActionButtons";
import InitialSetupForm from "./components/InitialSetupForm";

const CONTRACT = {
  address: "0x236bD8706661db41730C69BB628894E4bc7b040A",
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
  const [status, setStatus] = useState(
    "⏳ Initial setup required before monitoring"
  );
  const [currentReading, setCurrentReading] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [transactionHashes, setTransactionHashes] = useState([]);
  const [spoilageDetected, setSpoilageDetected] = useState(false);
  const [totalReadings, setTotalReadings] = useState(0);

  // Initial setup state
  const [isInitialized, setIsInitialized] = useState(false);
  const [initialPrice, setInitialPrice] = useState("");
  const [initialFreshnessScore, setInitialFreshnessScore] = useState("");
  const [isSubmittingInitial, setIsSubmittingInitial] = useState(false);

  // Price and freshness tracking
  const [priceHistory, setPriceHistory] = useState([]);
  const [freshnessHistory, setFreshnessHistory] = useState([]);
  const [transportCompleted, setTransportCompleted] = useState(false);

  const intervalRef = useRef(null);
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  // Check transport status on component mount
  useEffect(() => {
    checkTransportStatus();
  }, [appleId]);

  const checkTransportStatus = async () => {
    try {
      const appleData = await publicClient.readContract({
        ...CONTRACT,
        functionName: "getApple",
        args: [BigInt(appleId)],
      });

      const transportComplete = appleData.transport.endTimestamp > 0;
      setTransportCompleted(transportComplete);

      // Load existing data
      setPriceHistory(appleData.prices || []);
      setFreshnessHistory(appleData.freshnessHistory || []);

      // Check if store data already exists (meaning initial setup was done)
      if (appleData.store.timestamp > 0) {
        setIsInitialized(true);
        setStatus("✅ Initial setup completed. Ready to monitor.");
      }
    } catch (error) {
      console.error("Error checking transport status:", error);
    }
  };

  // Handle initial transaction (price + freshness score)
  const handleInitialTransaction = async () => {
    if (!initialPrice || !initialFreshnessScore) {
      toast.error("Please provide both price and freshness score");
      return;
    }

    if (initialFreshnessScore < 0 || initialFreshnessScore > 100) {
      toast.error("Freshness score must be between 0-100");
      return;
    }

    setIsSubmittingInitial(true);

    try {
      // Step 1: Update price (if transport is completed)
      if (transportCompleted && initialPrice) {
        console.log("💰 Setting initial price:", initialPrice);
        const priceHash = await writeContractAsync({
          ...CONTRACT,
          functionName: "updatePrice",
          args: [BigInt(appleId), BigInt(initialPrice)],
        });

        await publicClient.waitForTransactionReceipt({ hash: priceHash });
        setTransactionHashes((prev) => [...prev, priceHash]);
        toast.success(`💰 Initial price set: ${initialPrice}`);

        // Update local state
        setPriceHistory((prev) => [...prev, initialPrice]);
      }

      // Step 2: Log initial store data with freshness score
      console.log("🌟 Setting initial freshness score:", initialFreshnessScore);
      const storeHash = await writeContractAsync({
        ...CONTRACT,
        functionName: "logStore",
        args: [
          BigInt(appleId),
          BigInt(50), // Initial ethylene reading
          BigInt(initialFreshnessScore),
        ],
      });

      await publicClient.waitForTransactionReceipt({ hash: storeHash });
      setTransactionHashes((prev) => [...prev, storeHash]);
      toast.success(`🌟 Initial freshness score set: ${initialFreshnessScore}`);

      // Update local state
      setFreshnessHistory((prev) => [...prev, initialFreshnessScore]);

      // Mark as initialized
      setIsInitialized(true);
      setStatus("✅ Initial setup completed! Ready to start monitoring.");
      toast.success(
        "🚀 Initial transaction completed! You can now start monitoring."
      );

      // Clear form
      setInitialPrice("");
      setInitialFreshnessScore("");
    } catch (error) {
      console.error("❌ Initial transaction failed:", error);
      toast.error(
        `Failed to complete initial transaction: ${
          error.shortMessage || error.message
        }`
      );
    } finally {
      setIsSubmittingInitial(false);
    }
  };

  // Start monitoring (only after initialization)
  const startMonitoring = () => {
    if (!isInitialized) {
      toast.error("Please complete initial setup first");
      return;
    }

    console.log("🏪 Starting storage monitoring");
    setIsMonitoring(true);
    setStatus(`📦 Monitoring ${state.toLowerCase()} storage conditions...`);

    let readingCount = 0;
    const maxReadings = 10;

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

      setCurrentReading(reading);
      setReadings((prev) => [...prev, reading]);
      setTotalReadings(readingCount);

      // Log subsequent readings to warehouse (no price/freshness required)
      await logSubsequentReading(temp, ethylene, timestamp);

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
          setTimeout(() => {
            onRouteChange("COMPLETED");
          }, 2000);
        }
      }
    }, 30000);
  };

  // Log subsequent readings (after initial setup)
  const logSubsequentReading = async (temp, ethylene, timestamp) => {
    try {
      if (state === "WAREHOUSE" || state === "COLD_CHAMBER") {
        const hash = await writeContractAsync({
          ...CONTRACT,
          functionName: "logWarehouse",
          args: [
            BigInt(appleId),
            temp,
            BigInt(ethylene),
            location,
            BigInt(75), // Default freshness score for subsequent readings
          ],
        });

        await publicClient.waitForTransactionReceipt({ hash });
        setTransactionHashes((prev) => [...prev, hash]);
        console.log("📦 Subsequent reading logged");
      }
    } catch (error) {
      console.error("❌ Subsequent reading failed:", error);
      toast.error("Failed to log reading");
    }
  };

  // Read-only data verification (no transaction)
  const verifyDataTrail = async () => {
    try {
      const appleData = await publicClient.readContract({
        ...CONTRACT,
        functionName: "getApple",
        args: [BigInt(appleId)],
      });

      console.log("🔍 Complete Apple Data Trail:", appleData);
      toast.success(
        `✅ Data verified: ${appleData.warehouseLogs.length} warehouse entries, ${appleData.prices.length} price updates, ${appleData.freshnessHistory.length} freshness scores`
      );
    } catch (error) {
      console.error("❌ Error reading apple data:", error);
      toast.error("Failed to verify data trail");
    }
  };

  // Route change handler
  const handleRouteChange = (newRoute) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsMonitoring(false);
    if (onRouteChange) {
      onRouteChange(newRoute);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    if (!appleId) {
      setStatus("❌ Error: No Apple ID provided");
      return;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [appleId]);

  return (
    <div className="bg-gray-100 p-6">
      <StatusCard
        status={status}
        isMonitoring={isMonitoring}
        spoilageDetected={spoilageDetected}
        currentReading={currentReading}
        ethyleneThreshold={ETHYLENE_SPOIL_THRESHOLD}
      />

      {/* Initial Setup Form - Show only if not initialized */}
      {!isInitialized && (
        <InitialSetupForm
          initialPrice={initialPrice}
          setInitialPrice={setInitialPrice}
          initialFreshnessScore={initialFreshnessScore}
          setInitialFreshnessScore={setInitialFreshnessScore}
          isSubmittingInitial={isSubmittingInitial}
          onSubmit={handleInitialTransaction}
          transportCompleted={transportCompleted}
        />
      )}

      {/* Monitoring Controls - Show only after initialization */}
      {isInitialized && !isMonitoring && readings.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 border mb-6">
          <h3 className="text-xl font-bold text-green-600 mb-4">
            📊 Start Monitoring
          </h3>
          <p className="text-gray-600 mb-4">
            Initial setup completed. You can now start storage monitoring.
          </p>
          <button
            onClick={startMonitoring}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            🚀 Start Storage Monitoring
          </button>
        </div>
      )}

      {/* Current Status Display */}
      {isInitialized &&
        (priceHistory.length > 0 || freshnessHistory.length > 0) && (
          <div className="bg-white rounded-xl shadow-md p-6 border mb-6">
            <h3 className="text-xl font-bold mb-4">📊 Current Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {priceHistory.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Current Price</p>
                  <p className="text-xl font-bold text-green-600">
                    {priceHistory[priceHistory.length - 1]} wei
                  </p>
                </div>
              )}
              {freshnessHistory.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Current Freshness</p>
                  <p className="text-xl font-bold text-blue-600">
                    {freshnessHistory[freshnessHistory.length - 1]}/100
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Readings History */}
      {isInitialized && (
        <ReadingsHistoryTable
          readings={readings}
          freshnessHistory={freshnessHistory}
        />
      )}

      {/* Data Verification Section */}
      {isInitialized && !isMonitoring && readings.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 border mb-6">
          <h3 className="text-xl font-bold mb-4">🔍 Data Verification</h3>
          <p className="text-gray-600 mb-4">
            View complete data trail (read-only operation - no gas required)
          </p>
          <button
            className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors font-medium"
            onClick={verifyDataTrail}
          >
            🔍 Verify Complete Data Trail
          </button>
        </div>
      )}

      {/* Spoilage Action Buttons */}
      {spoilageDetected && (
        <SpoilageActionButtons onRouteChange={handleRouteChange} />
      )}
    </div>
  );
}
