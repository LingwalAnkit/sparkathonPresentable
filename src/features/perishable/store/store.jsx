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
import PendingReadingCard from "./components/PendingReadingCard";

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
  const [status, setStatus] = useState("🚀 Starting automatic monitoring...");
  const [currentReading, setCurrentReading] = useState(null);
  const [pendingReading, setPendingReading] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [transactionHashes, setTransactionHashes] = useState([]);
  const [spoilageDetected, setSpoilageDetected] = useState(false);
  const [totalReadings, setTotalReadings] = useState(0);

  // Price and freshness for current reading
  const [currentPrice, setCurrentPrice] = useState("");
  const [currentFreshnessScore, setCurrentFreshnessScore] = useState("");
  const [isSubmittingTransaction, setIsSubmittingTransaction] = useState(false);

  // History tracking
  const [priceHistory, setPriceHistory] = useState([]);
  const [freshnessHistory, setFreshnessHistory] = useState([]);
  const [transportCompleted, setTransportCompleted] = useState(false);

  // Reading generation control
  const [readingCount, setReadingCount] = useState(0);
  const [canGenerateNextReading, setCanGenerateNextReading] = useState(true);

  const intervalRef = useRef(null);
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  useEffect(() => {
    checkTransportStatus();
  }, [appleId]);

  // Auto-start monitoring when component mounts
  useEffect(() => {
    if (appleId && transportCompleted) {
      startAutomaticMonitoring();
    }
  }, [appleId, transportCompleted]);

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
    } catch (error) {
      console.error("Error checking transport status:", error);
    }
  };

  // FIXED: Start automatic monitoring with proper sequential control
  const startAutomaticMonitoring = () => {
    if (!transportCompleted) {
      toast.error("Transport must be completed first");
      return;
    }

    console.log(
      "🏪 Starting automatic storage monitoring with sequential processing"
    );
    setIsMonitoring(true);
    setStatus("📦 Automatic monitoring started. Generating first reading...");

    // Generate first reading immediately
    generateNewReading();

    // Set up interval that only generates new readings when ready
    intervalRef.current = setInterval(() => {
      // CRITICAL FIX: Only generate new reading if conditions are met
      if (
        canGenerateNextReading &&
        !pendingReading &&
        !isSubmittingTransaction &&
        !spoilageDetected
      ) {
        generateNewReading();
      } else {
        console.log(
          "⏳ Waiting for current reading to be processed before generating next..."
        );
      }
    }, 30000); // Check every 30 seconds
  };

  // FIXED: Generate new reading with proper state control
  const generateNewReading = () => {
    // Double-check conditions before generating
    if (pendingReading || isSubmittingTransaction || spoilageDetected) {
      console.log(
        "🚫 Cannot generate new reading - previous reading still pending"
      );
      return;
    }

    const newReadingCount = readingCount + 1;
    setReadingCount(newReadingCount);

    const temp = parseInt(generateWarehouseTemperature());
    const ethylene = parseInt(generateWarehouseEthylene());
    const timestamp = Math.floor(Date.now() / 1000);

    const reading = {
      id: newReadingCount,
      temperature: temp,
      ethylene,
      timestamp,
      location,
      state,
      spoilageRisk: ethylene >= ETHYLENE_SPOIL_THRESHOLD,
    };

    // Block next reading generation until this one is processed
    setCanGenerateNextReading(false);
    setPendingReading(reading);
    setCurrentReading(reading);
    setTotalReadings(newReadingCount);
    setStatus(
      `📊 Reading #${newReadingCount} generated. Set price and freshness score to continue.`
    );

    // Check for spoilage
    if (ethylene >= ETHYLENE_SPOIL_THRESHOLD) {
      console.log("⚠️ SPOILAGE DETECTED! Ethylene level:", ethylene);
      setSpoilageDetected(true);
      setStatus("⚠️ Spoilage detected! Complete this reading and take action.");
      setIsMonitoring(false);
      clearInterval(intervalRef.current);
      toast.error(
        `🚨 Spoilage detected! Ethylene: ${ethylene} ppm - Complete this reading!`
      );
    } else {
      toast.success(
        `📊 Reading #${newReadingCount} ready! Complete transaction to continue monitoring.`
      );
    }

    console.log(
      `✅ Generated reading #${newReadingCount} - Next reading blocked until transaction completes`
    );
  };

  // FIXED: Transaction flow with proper state management
  const handleSingleTransactionFlow = async () => {
    if (!pendingReading) {
      toast.error("No pending reading to process");
      return;
    }

    if (!currentPrice || !currentFreshnessScore) {
      toast.error("Please provide both price and freshness score");
      return;
    }

    if (currentFreshnessScore < 0 || currentFreshnessScore > 100) {
      toast.error("Freshness score must be between 0-100");
      return;
    }

    setIsSubmittingTransaction(true);
    const toastId = toast.loading(
      "💾 Processing transaction - next reading will wait..."
    );

    try {
      // Step 1: Update price
      console.log("💰 Step 1: Setting price:", currentPrice);
      toast.loading("💰 Step 1/2: Setting price...", { id: toastId });

      const priceHash = await writeContractAsync({
        ...CONTRACT,
        functionName: "updatePrice",
        args: [BigInt(appleId), BigInt(currentPrice)],
      });

      await publicClient.waitForTransactionReceipt({ hash: priceHash });
      setTransactionHashes((prev) => [...prev, priceHash]);

      // Step 2: Log warehouse data with freshness
      console.log(
        "📦 Step 2: Logging warehouse data with freshness:",
        currentFreshnessScore
      );
      toast.loading("📦 Step 2/2: Logging warehouse data...", { id: toastId });

      const warehouseHash = await writeContractAsync({
        ...CONTRACT,
        functionName: "logWarehouse",
        args: [
          BigInt(appleId),
          BigInt(pendingReading.temperature),
          BigInt(pendingReading.ethylene),
          location,
          BigInt(currentFreshnessScore),
        ],
      });

      await publicClient.waitForTransactionReceipt({ hash: warehouseHash });
      setTransactionHashes((prev) => [...prev, warehouseHash]);

      // Update local state - append to logs
      setPriceHistory((prev) => [...prev, currentPrice]);
      setFreshnessHistory((prev) => [...prev, currentFreshnessScore]);
      setReadings((prev) => [
        ...prev,
        {
          ...pendingReading,
          price: currentPrice,
          freshnessScore: currentFreshnessScore,
          txHashes: [priceHash, warehouseHash],
        },
      ]);

      // CRITICAL FIX: Clear pending reading and allow next reading generation
      setPendingReading(null);
      setCurrentPrice("");
      setCurrentFreshnessScore("");
      setCanGenerateNextReading(true); // Allow next reading to be generated

      toast.success(
        `✅ Reading #${pendingReading.id} completed! Next reading can now be generated.`,
        { id: toastId }
      );

      // Update status for next iteration
      if (spoilageDetected) {
        setStatus(`⚠️ Spoilage reading completed. Take immediate action!`);
      } else {
        setStatus(
          `✅ Reading #${pendingReading.id} processed. Ready for next reading in 30 seconds.`
        );
      }

      console.log(
        `✅ Transaction completed for reading #${pendingReading.id} - Next reading generation enabled`
      );
    } catch (error) {
      console.error("❌ Transaction flow failed:", error);
      toast.error(
        `Failed to complete transaction: ${
          error.shortMessage || error.message
        }`,
        { id: toastId }
      );

      // IMPORTANT: On error, allow retry by keeping pendingReading but enabling next generation
      setCanGenerateNextReading(true);
    } finally {
      setIsSubmittingTransaction(false);
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
        totalReadings={totalReadings}
        pendingReading={pendingReading}
        isSubmittingTransaction={isSubmittingTransaction}
      />

      {/* Transport Status Check */}
      {!transportCompleted && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-red-800 mb-4">
            ❌ Transport Required
          </h3>
          <p className="text-red-700">
            Transport must be completed before storage monitoring can begin.
          </p>
        </div>
      )}

      {/* Pending Reading Card - Sequential Processing */}
      {pendingReading && transportCompleted && (
        <PendingReadingCard
          reading={pendingReading}
          currentPrice={currentPrice}
          setCurrentPrice={setCurrentPrice}
          currentFreshnessScore={currentFreshnessScore}
          setCurrentFreshnessScore={setCurrentFreshnessScore}
          onSubmit={handleSingleTransactionFlow}
          isSubmitting={isSubmittingTransaction}
          spoilageDetected={spoilageDetected}
        />
      )}

      {/* Current Status Display */}
      {(priceHistory.length > 0 || freshnessHistory.length > 0) && (
        <div className="bg-white rounded-xl shadow-md p-6 border mb-6">
          <h3 className="text-xl font-bold mb-4">
            📊 Sequential Processing Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Readings Processed</p>
              <p className="text-xl font-bold text-blue-600">
                {readings.length}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Current Reading</p>
              <p className="text-xl font-bold text-orange-600">
                {pendingReading ? `#${pendingReading.id}` : "None"}
              </p>
            </div>
            {priceHistory.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Latest Price</p>
                <p className="text-xl font-bold text-green-600">
                  {priceHistory[priceHistory.length - 1]} wei
                </p>
              </div>
            )}
            {freshnessHistory.length > 0 && (
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Latest Freshness</p>
                <p className="text-xl font-bold text-purple-600">
                  {freshnessHistory[freshnessHistory.length - 1]}/100
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Readings History - Shows sequential processing */}
      <ReadingsHistoryTable
        readings={readings}
        priceHistory={priceHistory}
        freshnessHistory={freshnessHistory}
      />

      {/* Spoilage Action Buttons - Only show after spoilage reading is completed */}
      {spoilageDetected && !pendingReading && (
        <SpoilageActionButtons onRouteChange={handleRouteChange} />
      )}
    </div>
  );
}
