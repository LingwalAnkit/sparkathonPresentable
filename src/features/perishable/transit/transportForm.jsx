"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import apiService from "../../../services/apiServices";
import { useTransportData } from "./hook/useTransportData";
import JourneyProgress from "./components/progress";
import TransportTimeline from "./components/transportTimeline";
import LiveSensorData from "./components/sensorData";
import JourneyMetrics from "./components/journeyMetric";
import SensorReadingsHistory from "./components/readingHistory";

export default function TransportForm({ appleId, onTransitComplete }) {
  const [isWaitingForTx, setIsWaitingForTx] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [status, setStatus] = useState("Initializing transport monitoring...");

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

    // Start journey without callback - let auto-submit handle it
    const cleanup = startJourney();
    return cleanup;
  }, [appleId]);

  // Backend submission function
  const submitToBackend = async () => {
    // Prevent double submission
    if (hasSubmitted || isWaitingForTx) {
      console.log("🚫 Submission blocked - already processing or completed");
      return;
    }

    setHasSubmitted(true);
    const toastId = toast.loading(
      "🚛 Transport data → Backend → Blockchain..."
    );
    setIsWaitingForTx(true);
    setStatus("📡 Sending transport data via backend...");

    try {
      console.log("📡 Sending transport data to backend...");

      const result = await apiService.logTransport({
        appleId,
        startTimestamp: startT,
        endTimestamp: endT,
        gpsCoordinates: gps,
        temperatures: temps.map((t) => Math.round(t)),
        ethyleneLevels: ethy,
      });

      console.log("✅ Backend response:", result);

      if (result.success) {
        setIsWaitingForTx(false);
        toast.success("✅ Transport data logged via backend!", { id: toastId });
        setStatus("✅ Transport data successfully stored on blockchain");

        if (onTransitComplete) {
          setTimeout(() => onTransitComplete(), 1000);
        }
      } else {
        throw new Error(result.error || "Backend processing failed");
      }
    } catch (error) {
      console.error("❌ Backend submission failed:", error);
      setIsWaitingForTx(false);
      setHasSubmitted(false); // Reset guard on error to allow retry
      toast.error(`Backend error: ${error.message}`, { id: toastId });
      setStatus("❌ Failed to store transport data via backend");
    }
  };

  return (
    <div className="bg-gray-100 p-6">
      {/* Backend Mode Indicator */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <h4 className="font-semibold text-blue-800 mb-2">
          🔗 Backend Processing Mode
        </h4>
        <p className="text-blue-700 text-sm">
          Transport data is processed through your Node.js backend. Backend
          automatically handles blockchain transactions and gas management.
        </p>
      </div>

      <div className="flex flex-row gap-6 w-full">
        <JourneyProgress journeyInfo={journeyInfo} />
        <TransportTimeline startT={startT} endT={endT} />
      </div>
      <JourneyMetrics metrics={journeyMetrics} />
      <div className="flex flex-row gap-6 w-full">
        <SensorReadingsHistory
          readings={readings}
          isCollecting={isCollecting}
          onSubmit={submitToBackend}
          isWaitingForTx={isWaitingForTx}
          status={status}
          isBackendMode={true}
        />
        <div>
          <LiveSensorData current={current} />
        </div>
      </div>
    </div>
  );
}
