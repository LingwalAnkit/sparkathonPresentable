"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import apiService from "../../../services/apiServices";
import {
  generateHumidity,
  generateChemicals,
  SoilUsed,
} from "../../../utils/sensorDataGenerator";
import Lottie from "lottie-react";
import farmAnimation from "../../../assets/lottie/farm.json";

export default function HarvestForm({ onHarvestComplete }) {
  /* ------------- local state ------------- */
  const [soil] = useState(() => SoilUsed());
  const [readings, setReadings] = useState([]);
  const [currentReading, setCurrentReading] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dataCollectionComplete, setDataCollectionComplete] = useState(false);

  /* ------------- Backend transaction function ------------- */
  async function sendToBackend(hArr, cArr) {
    console.log("🚀 Starting backend submission");
    console.log("🔍 Humidity array:", hArr);
    console.log("🔍 Chemical array:", cArr);
    console.log("🔍 Soil type:", soil);

    const toastId = toast.loading("📡 Harvest data → Backend → Blockchain...");
    setIsProcessing(true);

    try {
      console.log("📡 Sending harvest data to backend...");

      const result = await apiService.createApple({
        soilComposition: soil,
        humidity: hArr,
        chemicals: cArr,
      });

      console.log("✅ Backend response:", result);

      if (result.success) {
        toast.success("✅ Apple created via backend!", { id: toastId });

        // Extract apple ID from backend response or transaction logs
        // You may need to modify your backend to return the apple ID
        const appleId = await getAppleIdFromBackend(result);

        if (onHarvestComplete && appleId) {
          console.log("🚀 Calling onHarvestComplete with ID:", appleId);
          onHarvestComplete(appleId);
        }
      } else {
        throw new Error(result.error || "Backend processing failed");
      }
    } catch (err) {
      console.error("❌ Backend submission failed:", err);
      toast.error(`Backend error: ${err.message}`, { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  }

  /* ------------- Helper function to get Apple ID from backend ------------- */
  async function getAppleIdFromBackend(result) {
    try {
      // Option 1: If backend returns apple ID directly
      if (result.appleId) {
        return result.appleId;
      }

      // Option 2: Extract from transaction logs (you may need to modify backend)
      if (result.txHash) {
        // Backend could parse the transaction logs and return the apple ID
        // For now, we'll use a simple approach
        const timestamp = Date.now();
        return `${timestamp % 1000}`; // Temporary solution
      }

      // Option 3: Call backend to get latest apple ID
      const latestApple = await apiService.getLatestAppleId();
      return latestApple.id;
    } catch (error) {
      console.error("Failed to get apple ID:", error);
      return null;
    }
  }

  /* ------------- Automatic sensor data collection ------------- */
  useEffect(() => {
    console.log("🚀 Starting automatic sensor data collection");

    const max = 5;
    let i = 0;
    const humArr = [];
    const chemArr = [];

    const interval = setInterval(() => {
      console.log(`📊 Sensor reading ${i + 1}/${max}`);

      if (i === max) {
        clearInterval(interval);
        console.log("✅ Data collection complete, sending to backend");
        setDataCollectionComplete(true);
        sendToBackend(humArr, chemArr);
        return;
      }

      const h = parseInt(generateHumidity());
      const c = parseInt(generateChemicals());
      humArr.push(h);
      chemArr.push(c);

      const reading = { idx: i + 1, humidity: h, chemical: c };
      console.log("📊 New reading:", reading);

      setCurrentReading(reading);
      setReadings((prev) => [...prev, reading]);
      i++;
    }, 9000);

    return () => {
      console.log("🧹 Cleaning up sensor interval");
      clearInterval(interval);
    };
  }, []); // Remove wallet dependency

  /* ------------- Component lifecycle logging ------------- */
  useEffect(() => {
    console.log("🏗️ HarvestForm component mounted (Backend Mode)");
    console.log("🔍 onHarvestComplete prop:", onHarvestComplete);

    return () => {
      console.log("🧹 HarvestForm component unmounting");
    };
  }, []);

  /* ------------- UI ------------- */
  return (
    <>
      <div className="flex flex-col md:flex-col bg-gray-100 mt-6 gap-6">
        {/* Backend Mode Indicator */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <h4 className="font-semibold text-blue-800 mb-2 text-lg">
            Backend Processing Mode
          </h4>
          <p className="text-blue-700 text-base">
            Harvest data is automatically processed through Node.js backend.
            Backend handles all blockchain interactions.
          </p>
          <div className="mt-4 text-center">
            <p className="font-semibold text-blue-800">Contract:</p>
            <a
              href="https://sepolia.etherscan.io/address/0x236bD8706661db41730C69BB628894E4bc7b040A"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-900 font-bold text-lg underline hover:text-blue-700 transition"
            >
              0x236bD8706661db41730C69BB628894E4bc7b040A
            </a>
            <p className="text-sm text-blue-700 mt-1">
              View on Etherscan (Sepolia Testnet)
            </p>
          </div>
        </div>

        <div className="flex flex-row gap-4">
          {/* History */}
          <div className="md:w-1/3 w-full">
            <div className="bg-white shadow-md rounded-xl p-6 border h-full">
              <h3 className="text-3xl font-bold text-center mb-6">
                Sensor History
              </h3>
              {readings.length === 0 ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                  <p className="text-gray-500">Collecting sensor data...</p>
                </div>
              ) : (
                <ul className="space-y-6 text-gray-700 text-md">
                  {readings.map((r) => (
                    <li key={r.idx}>
                      <b>#{r.idx}</b> Hum {r.humidity}%, Nitrate {r.chemical}{" "}
                      ppm
                    </li>
                  ))}
                </ul>
              )}

              {/* Processing Status */}
              {dataCollectionComplete && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isProcessing
                          ? "bg-yellow-500 animate-pulse"
                          : "bg-green-500"
                      }`}
                    ></div>
                    <p className="text-sm font-medium text-gray-700">
                      {isProcessing
                        ? "Processing via backend..."
                        : "Data collection complete"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Live cards + animation */}
          <div className="md:w-2/3 w-full flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-lg">
              {[
                ["Soil Type", soil],
                [
                  "Humidity",
                  currentReading
                    ? `${currentReading.humidity}%`
                    : "Collecting...",
                ],
                [
                  "Nitrate",
                  currentReading
                    ? `${currentReading.chemical} ppm`
                    : "Collecting...",
                ],
              ].map(([title, value]) => (
                <div
                  key={title}
                  className="bg-white shadow-md rounded-xl p-6 border text-center"
                >
                  <h4 className="font-semibold text-gray-700 mb-1">{title}</h4>
                  <p className="text-gray-600">{value}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <Lottie
                animationData={farmAnimation}
                className="w-[425px] h-[425px]"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
