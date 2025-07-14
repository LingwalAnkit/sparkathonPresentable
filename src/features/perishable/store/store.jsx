"use client";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import apiService from "../../../services/apiServices";
import pythonApiService from "../../../services/pythonApiService";
import { generateWarehouseTemperature } from "../../../utils/warehouseGenerator";

// Import components
import StatusCard from "./components/StatusCard";
import ReadingsHistoryTable from "./components/ReadingsHistoryTable";
import SpoilageActionButtons from "./components/SpoilageActionButtons";
import PendingReadingCard from "./components/PendingReadingCard";

const ETHYLENE_SPOIL_THRESHOLD = 10;

function generateIncreasingEthylene(
  readingNumber,
  startValue = 3,
  maxValue = 10
) {
  const ethylene = Math.min(startValue + readingNumber, maxValue);
  return ethylene;
}

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

  // Initial setup state
  const [needsInitialSetup, setNeedsInitialSetup] = useState(true);
  const [initialPrice, setInitialPrice] = useState("");
  const [isSubmittingInitial, setIsSubmittingInitial] = useState(false);

  // Current reading state
  const [isSubmittingTransaction, setIsSubmittingTransaction] = useState(false);
  const [canGenerateNextReading, setCanGenerateNextReading] = useState(true);

  const intervalRef = useRef(null);
  const actualReadingCount = useRef(0);

  // Start monitoring after initial setup
  useEffect(() => {
    if (appleId && !needsInitialSetup) {
      console.log("🚀 Starting monitoring after initial setup");
      startAutomaticMonitoring();
    }
  }, [appleId, needsInitialSetup]);

  // Handle initial setup
  const handleInitialSetup = async () => {
    if (!initialPrice || parseInt(initialPrice) <= 0) {
      toast.error("Please provide a valid initial price");
      return;
    }

    setIsSubmittingInitial(true);
    const toastId = toast.loading("🚀 Setting up initial price...");

    try {
      // Set initial price in blockchain
      const result = await apiService.processStorageReading({
        appleId,
        reading: {
          id: 0,
          temperature: 20,
          ethylene: 3,
          timestamp: Math.floor(Date.now() / 1000),
          location,
          state,
          spoilageRisk: false,
        },
        price: parseInt(initialPrice),
        freshnessScore: 100, // Start with perfect freshness
      });

      if (result.success) {
        setNeedsInitialSetup(false);
        toast.success("✅ Initial setup completed!", { id: toastId });
        setStatus("✅ Initial setup completed. Starting monitoring...");
      } else {
        throw new Error(result.error || "Initial setup failed");
      }
    } catch (error) {
      console.error("❌ Initial setup failed:", error);
      toast.error(`Initial setup failed: ${error.message}`, { id: toastId });
    } finally {
      setIsSubmittingInitial(false);
    }
  };

  // Start automatic monitoring
  const startAutomaticMonitoring = () => {
    console.log("🏪 Starting automatic storage monitoring with AI predictions");
    setIsMonitoring(true);
    setStatus("📦 Automatic monitoring started. Generating first reading...");

    // Generate first reading immediately
    generateNewReading();

    // Set up interval for subsequent readings (1 minute = 60000ms)
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
    }, 60000); // Changed to 1 minute
  };

  // Generate new reading with AI prediction
  const generateNewReading = async () => {
    if (pendingReading || isSubmittingTransaction || spoilageDetected) {
      console.log(
        "🚫 Cannot generate new reading - previous reading still pending"
      );
      return;
    }

    actualReadingCount.current += 1;
    const newReadingCount = actualReadingCount.current;

    const temp = parseInt(generateWarehouseTemperature());
    const ethylene = generateIncreasingEthylene(newReadingCount);

    console.log(
      `🔍 Reading #${newReadingCount}: Temp=${temp}°C, Ethylene=${ethylene}ppm`
    );

    const timestamp = Math.floor(Date.now() / 1000);

    // Get current price from last reading or use initial price
    const currentPrice =
      readings.length > 0
        ? parseInt(readings[readings.length - 1].price)
        : parseInt(initialPrice);

    setCanGenerateNextReading(false);
    setStatus(`🤖 Generating AI prediction for reading #${newReadingCount}...`);

    try {
      // Get AI prediction
      const prediction = await pythonApiService.predictPriceAndFreshness(
        "Apple", // Product name
        temp,
        ethylene,
        currentPrice
      );

      if (prediction.success) {
        const reading = {
          id: newReadingCount,
          temperature: temp,
          ethylene,
          timestamp,
          location,
          state,
          spoilageRisk: ethylene >= ETHYLENE_SPOIL_THRESHOLD,
          predictedPrice: prediction.predicted_price,
          predictedFreshness: prediction.freshness_score,
        };

        setPendingReading(reading);
        setCurrentReading(reading);
        setTotalReadings(newReadingCount);
        setStatus(
          `📊 Reading #${newReadingCount} with AI prediction ready for processing.`
        );

        // Check for spoilage
        if (ethylene >= ETHYLENE_SPOIL_THRESHOLD) {
          console.log("⚠️ SPOILAGE DETECTED! Ethylene level:", ethylene);
          setSpoilageDetected(true);
          setStatus(
            "⚠️ Spoilage detected! Complete this reading and take action."
          );
          setIsMonitoring(false);
          clearInterval(intervalRef.current);
          toast.error(`🚨 Spoilage detected! Ethylene: ${ethylene} ppm`);
        } else {
          toast.success(
            `📊 Reading #${newReadingCount} with AI prediction ready!`
          );
        }
      } else {
        throw new Error(prediction.error || "AI prediction failed");
      }
    } catch (error) {
      console.error("❌ AI prediction failed:", error);
      toast.error(`AI prediction failed: ${error.message}`);
      setCanGenerateNextReading(true);
    }
  };

  // Process reading with AI-predicted values
  const handleBackendTransaction = async () => {
    if (!pendingReading) {
      toast.error("No pending reading to process");
      return;
    }

    setIsSubmittingTransaction(true);
    const toastId = toast.loading(
      "💾 Processing reading with AI predictions..."
    );

    try {
      const result = await apiService.processStorageReading({
        appleId,
        reading: pendingReading,
        price: pendingReading.predictedPrice,
        freshnessScore: pendingReading.predictedFreshness,
      });

      if (result.success) {
        setReadings((prev) => [
          ...prev,
          {
            ...pendingReading,
            price: pendingReading.predictedPrice,
            freshnessScore: pendingReading.predictedFreshness,
            priceTransaction: result.priceTransaction,
            warehouseTransaction: result.warehouseTransaction,
          },
        ]);

        setPendingReading(null);
        setCanGenerateNextReading(true);

        toast.success(
          `✅ Reading #${pendingReading.id} processed with AI predictions!`,
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
      toast.error(`Processing failed: ${error.message}`, { id: toastId });
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
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-gray-100 p-6">
      {/* Initial Setup Form */}
      {needsInitialSetup && (
        <div className="bg-white rounded-xl shadow-md p-6 border mb-6">
          <h3 className="text-xl font-bold text-blue-600 mb-4">
            🚀 Initial Price Setup Required
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 font-medium">
              Set the initial price for this apple. AI will predict price
              adjustments based on sensor readings.
            </p>
          </div>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Price (₹)
              </label>
              <input
                type="number"
                value={initialPrice}
                onChange={(e) => setInitialPrice(e.target.value)}
                placeholder="Enter initial price..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
            </div>
            <button
              onClick={handleInitialSetup}
              disabled={isSubmittingInitial || !initialPrice}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:bg-gray-400"
            >
              {isSubmittingInitial ? "⏳ Setting up..." : "🚀 Start Monitoring"}
            </button>
          </div>
        </div>
      )}

      {/* Status Card */}
      {!needsInitialSetup && (
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
      )}

      {/* AI Integration Notice */}
      {!needsInitialSetup && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-green-800 mb-2">
            🤖 AI-Powered Price & Freshness Prediction
          </h4>
          <p className="text-green-700 text-sm">
            Each reading uses AI to predict optimal price and freshness score
            based on temperature and ethylene levels. Reading interval: 1
            minute. Python API: http://localhost:8000
          </p>
        </div>
      )}

      {/* Pending Reading Card with AI Predictions */}
      {pendingReading && (
        <div className="bg-white rounded-xl shadow-md p-6 border mb-6">
          <h3 className="text-xl font-bold text-green-600 mb-4">
            🤖 AI-Predicted Reading #{pendingReading.id}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sensor Data */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">
                📊 Sensor Data
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Temperature:</span>
                  <span className="font-bold">
                    {pendingReading.temperature}°C
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Ethylene:</span>
                  <span
                    className={`font-bold ${
                      pendingReading.spoilageRisk
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {pendingReading.ethylene} ppm
                  </span>
                </div>
              </div>
            </div>

            {/* AI Predictions */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">
                🤖 AI Predictions
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Predicted Price:</span>
                  <span className="font-bold text-green-600">
                    ₹{pendingReading.predictedPrice}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Freshness Score:</span>
                  <span
                    className={`font-bold ${
                      pendingReading.predictedFreshness >= 75
                        ? "text-green-600"
                        : pendingReading.predictedFreshness >= 50
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {pendingReading.predictedFreshness}/100
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={handleBackendTransaction}
              disabled={isSubmittingTransaction}
              className={`px-8 py-3 rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${
                spoilageDetected
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              {isSubmittingTransaction
                ? "⏳ Processing AI Predictions..."
                : spoilageDetected
                ? "🚨 Process Final Reading"
                : "🤖 Process AI Predictions"}
            </button>
          </div>
        </div>
      )}

      {/* Readings History */}
      {!needsInitialSetup && (
        <ReadingsHistoryTable
          readings={readings}
          priceHistory={readings.map((r) => r.price)}
          freshnessHistory={readings.map((r) => r.freshnessScore)}
          isBackendMode={true}
        />
      )}

      {/* Spoilage Action Buttons */}
      {spoilageDetected && !pendingReading && (
        <SpoilageActionButtons onRouteChange={handleRouteChange} />
      )}
    </div>
  );
}
