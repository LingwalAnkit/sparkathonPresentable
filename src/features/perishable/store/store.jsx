"use client";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import apiService from "../../../services/apiServices";
import { generateWarehouseTemperature } from "../../../utils/warehouseGenerator";

// Import components
import StatusCard from "./components/StatusCard";
import ReadingsHistoryTable from "./components/ReadingsHistoryTable";
import SpoilageActionButtons from "./components/SpoilageActionButtons";
import PendingReadingCard from "./components/PendingReadingCard";

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
      const result = await apiService.getApple(appleId);

      if (result.success) {
        const appleData = result.data;
        const transportComplete = appleData.transport.endTimestamp > 0;
        setTransportCompleted(transportComplete);

        // Load existing data
        setPriceHistory(appleData.prices || []);
        setFreshnessHistory(appleData.freshnessHistory || []);
      }
    } catch (error) {
      console.error("Error checking transport status:", error);

      // TEMPORARY WORKAROUND: Assume transport is completed if we can't verify
      console.warn(
        "⚠️ Could not verify transport status, assuming completed for development"
      );
      setTransportCompleted(true);
      toast.warning("Could not verify transport status - proceeding anyway");
    }
  };

  // Start automatic monitoring
  const startAutomaticMonitoring = () => {
    if (!transportCompleted) {
      toast.error("Transport must be completed first");
      return;
    }

    console.log("🏪 Starting automatic storage monitoring with backend");
    setIsMonitoring(true);
    setStatus("📦 Automatic monitoring started. Generating first reading...");

    // Generate first reading immediately
    generateNewReading();

    // Set up interval for subsequent readings
    intervalRef.current = setInterval(() => {
      if (
        canGenerateNextReading &&
        !pendingReading &&
        !isSubmittingTransaction &&
        !spoilageDetected
      ) {
        generateNewReading();
      } else {
        console.log("⏳ Waiting for current reading to be processed...");
      }
    }, 30000); // Check every 30 seconds
  };

  // Generate new reading
  const generateNewReading = () => {
    if (pendingReading || isSubmittingTransaction || spoilageDetected) {
      console.log(
        "🚫 Cannot generate new reading - previous reading still pending"
      );
      return;
    }

    const newReadingCount = readingCount + 1;
    setReadingCount(newReadingCount);

    const temp = parseInt(generateWarehouseTemperature());

    // Pass the previous ethylene reading to get progressive increase
    const ethylene = Math.min(3 + newReadingCount, 10);

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

    // Rest of your existing code...
    setCanGenerateNextReading(false);
    setPendingReading(reading);
    setCurrentReading(reading);
    setTotalReadings(newReadingCount);
    setStatus(
      `📊 Reading #${newReadingCount} generated. Set price and freshness score.`
    );

    // Check for spoilage
    if (ethylene >= ETHYLENE_SPOIL_THRESHOLD) {
      console.log("⚠️ SPOILAGE DETECTED! Ethylene level:", ethylene);
      setSpoilageDetected(true);
      setStatus("⚠️ Spoilage detected! Complete this reading and take action.");
      setIsMonitoring(false);
      clearInterval(intervalRef.current);
      toast.error(`🚨 Spoilage detected! Ethylene: ${ethylene} ppm`);
    } else {
      toast.success(
        `📊 Reading #${newReadingCount} ready! Complete transaction to continue.`
      );
    }
  };

  // BACKEND INTEGRATION: Handle transaction through backend
  const handleBackendTransaction = async () => {
    if (!pendingReading || !currentPrice || !currentFreshnessScore) {
      toast.error("Please provide both price and freshness score");
      return;
    }

    if (currentFreshnessScore < 0 || currentFreshnessScore > 100) {
      toast.error("Freshness score must be between 0-100");
      return;
    }

    setIsSubmittingTransaction(true);
    const toastId = toast.loading("💾 Processing through backend...");

    try {
      // Call backend API instead of direct blockchain interaction
      const result = await apiService.processStorageReading({
        appleId,
        reading: pendingReading,
        price: currentPrice,
        freshnessScore: currentFreshnessScore,
      });

      if (result.success) {
        // Update local state with backend response
        setPriceHistory((prev) => [...prev, currentPrice]);
        setFreshnessHistory((prev) => [...prev, currentFreshnessScore]);
        setReadings((prev) => [
          ...prev,
          {
            ...pendingReading,
            price: currentPrice,
            freshnessScore: currentFreshnessScore,
            priceTransaction: result.priceTransaction,
            warehouseTransaction: result.warehouseTransaction,
          },
        ]);

        // Clear pending reading and enable next generation
        setPendingReading(null);
        setCurrentPrice("");
        setCurrentFreshnessScore("");
        setCanGenerateNextReading(true);

        toast.success(
          `✅ Reading #${pendingReading.id} processed via backend!`,
          { id: toastId }
        );

        if (spoilageDetected) {
          setStatus(`⚠️ Spoilage reading completed. Take immediate action!`);
        } else {
          setStatus(
            `✅ Reading #${pendingReading.id} processed. Ready for next reading.`
          );
        }
      } else {
        throw new Error(result.error || "Backend processing failed");
      }
    } catch (error) {
      console.error("❌ Backend transaction failed:", error);
      toast.error(`Backend processing failed: ${error.message}`, {
        id: toastId,
      });
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

      {/* Backend Processing Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <h4 className="font-semibold text-blue-800 mb-2">
          🔗 Backend Integration Active
        </h4>
        <p className="text-blue-700 text-sm">
          All transactions are processed through your Node.js backend server. No
          wallet connection required - the backend handles blockchain
          interactions automatically.
        </p>
      </div>

      {/* Pending Reading Card - Backend Processing */}
      {pendingReading && transportCompleted && (
        <PendingReadingCard
          reading={pendingReading}
          currentPrice={currentPrice}
          setCurrentPrice={setCurrentPrice}
          currentFreshnessScore={currentFreshnessScore}
          setCurrentFreshnessScore={setCurrentFreshnessScore}
          onSubmit={handleBackendTransaction}
          isSubmitting={isSubmittingTransaction}
          spoilageDetected={spoilageDetected}
          isBackendMode={true}
        />
      )}

      {/* Current Status Display */}
      {(priceHistory.length > 0 || freshnessHistory.length > 0) && (
        <div className="bg-white rounded-xl shadow-md p-6 border mb-6">
          <h3 className="text-xl font-bold mb-4">
            📊 Backend Processing Status
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

      {/* Readings History */}
      <ReadingsHistoryTable
        readings={readings}
        priceHistory={priceHistory}
        freshnessHistory={freshnessHistory}
        isBackendMode={true}
      />

      {/* Spoilage Action Buttons */}
      {spoilageDetected && !pendingReading && (
        <SpoilageActionButtons onRouteChange={handleRouteChange} />
      )}
    </div>
  );
}
