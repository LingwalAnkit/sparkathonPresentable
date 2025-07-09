"use client";
import { useState, useEffect } from "react";
import { usePublicClient, useWriteContract } from "wagmi";
import toast from "react-hot-toast";
import AppleLifecycleABI from "../../../abi/apple.json";
import {
  generateTransportTemperature,
  generateTransportEthylene,
  generateJourneyInfo,
  calculateJourneyMetrics,
  generateGPSCoordinates,
  startTransportJourney,
  resetTransportJourney,
} from "../../../utils/transitDataGenerator";

const CONTRACT = {
  address: "0x83614Fb40F7532590752aD32e60050d661ceffE1",
  abi: AppleLifecycleABI.abi,
};

export default function TransportForm({ appleId, onTransitComplete }) {
  /* ------------- Enhanced state with logging ------------- */
  const [journeyInfo, setJourneyInfo] = useState(null);
  const [isCollecting, setIsCollecting] = useState(false);
  const [status, setStatus] = useState("Initializing transport monitoring...");
  const [readings, setReadings] = useState([]);
  const [current, setCurrent] = useState(null);
  const [gps, setGps] = useState([]);
  const [temps, setTemps] = useState([]);
  const [ethy, setEthy] = useState([]);
  const [startT, setStartT] = useState("");
  const [endT, setEndT] = useState("");
  const [journeyMetrics, setJourneyMetrics] = useState(null);
  const [isWaitingForTx, setIsWaitingForTx] = useState(false);
  const [transactionHash, setTransactionHash] = useState(null);

  /* ------------- wagmi ------------- */
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  /* ------------- Enhanced transaction function with logging ------------- */
  async function submitToChain() {
    console.log("🚛 Starting transport transaction submission");
    console.log("🔍 Apple ID:", appleId);
    console.log("🔍 Start timestamp:", startT);
    console.log("🔍 End timestamp:", endT);
    console.log("🔍 GPS coordinates:", gps);
    console.log("🔍 Temperature readings:", temps);
    console.log("🔍 Ethylene readings:", ethy);

    const toastId = toast.loading("🚛 Transport→chain …");
    setIsWaitingForTx(true);
    setStatus("📡 Sending transport data to blockchain...");

    try {
      console.log("📡 Sending transport transaction...");
      const hash = await writeContractAsync({
        ...CONTRACT,
        functionName: "logTransport",
        args: [
          BigInt(appleId),
          BigInt(startT),
          BigInt(endT),
          gps,
          temps.map((x) => Math.round(x)),
          ethy.map(BigInt),
        ],
      });

      console.log("✅ Transport transaction sent, hash:", hash);
      setTransactionHash(hash);
      toast.loading("⏳ Waiting for transport confirmation...", {
        id: toastId,
      });

      console.log("⏳ Waiting for transport transaction receipt...");
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("✅ Transport transaction confirmed, receipt:", receipt);

      setIsWaitingForTx(false);
      toast.success("✅ Transport data logged to blockchain!", { id: toastId });
      setStatus("✅ Transport data successfully stored on blockchain");

      // Calculate and display final metrics
      const finalMetrics = calculateJourneyMetrics();
      setJourneyMetrics(finalMetrics);
      console.log("📊 Final journey metrics:", finalMetrics);

      console.log("🔍 onTransitComplete callback exists:", !!onTransitComplete);
      if (onTransitComplete) {
        console.log("🚀 Calling onTransitComplete callback");
        setTimeout(() => {
          onTransitComplete();
          console.log("✅ onTransitComplete callback executed");
        }, 2000); // Show success message before transitioning
      }
    } catch (error) {
      console.error("❌ Transport transaction failed:", error);
      setIsWaitingForTx(false);
      toast.error(error.shortMessage || error.message, { id: toastId });
      setStatus(
        "❌ Failed to store transport data: " +
          (error.shortMessage || error.message)
      );
    }
  }

  /* ------------- Auto-start data collection on component mount ------------- */
  useEffect(() => {
    console.log("🏗️ TransportForm component mounted");
    console.log("🔍 Apple ID received:", appleId);
    console.log("🔍 onTransitComplete callback:", !!onTransitComplete);

    if (!appleId) {
      console.error("❌ No Apple ID provided to TransportForm");
      setStatus("❌ Error: No Apple ID provided");
      return;
    }

    // Auto-start data collection
    console.log("🚀 Auto-starting transport data collection");
    startJourney();

    return () => {
      console.log("🧹 TransportForm component unmounting");
    };
  }, [appleId]);

  /* ------------- Enhanced data collection with comprehensive logging ------------- */
  const startJourney = () => {
    console.log("🚛 Starting transport journey data collection");

    resetTransportJourney();
    const info = startTransportJourney();

    const startTime = Math.floor(info.journeyStartTime / 1000);
    const endTime = Math.floor(info.journeyEndTime / 1000);

    console.log(
      "📅 Journey start time:",
      new Date(startTime * 1000).toLocaleString()
    );
    console.log(
      "📅 Journey end time:",
      new Date(endTime * 1000).toLocaleString()
    );

    setStartT(String(startTime));
    setEndT(String(endTime));

    const coordinates = generateGPSCoordinates();
    setGps(coordinates);
    console.log("📍 Generated GPS coordinates:", coordinates);

    setIsCollecting(true);
    setStatus("🚛 Collecting transport sensor data...");

    let i = 0;
    const max = 3;
    const tArr = [];
    const eArr = [];

    // Journey info update interval (every second for smooth progress)
    const journeyInterval = setInterval(() => {
      const journeyData = generateJourneyInfo();
      setJourneyInfo(journeyData);

      if (i >= max) {
        clearInterval(journeyInterval);
      }
    }, 1000);

    // Sensor data collection interval
    const sensorInterval = setInterval(() => {
      console.log(`📊 Transport sensor reading ${i + 1}/${max}`);

      if (i >= max) {
        clearInterval(sensorInterval);
        clearInterval(journeyInterval);

        console.log("✅ Transport data collection complete");
        console.log("📊 Final temperature array:", tArr);
        console.log("📊 Final ethylene array:", eArr);

        setTemps(tArr);
        setEthy(eArr);
        setIsCollecting(false);
        setStatus("📝 Data collection complete. Submitting to blockchain...");

        // Auto-submit to blockchain
        setTimeout(() => {
          submitToChain();
        }, 1500);

        return;
      }

      // Generate sensor readings
      const tempStr = generateTransportTemperature();
      const ethyleneStr = generateTransportEthylene();
      const journeyData = generateJourneyInfo();

      const t = parseFloat(tempStr);
      const e = parseInt(ethyleneStr);

      tArr.push(t);
      eArr.push(e);

      const reading = {
        idx: i + 1,
        t,
        e,
        phase: journeyData.stateDescription,
        timestamp: journeyData.realisticCurrentTime,
        progress: journeyData.progress,
      };

      console.log("📊 New transport reading:", reading);

      setCurrent(reading);
      setReadings((prev) => [...prev, reading]);
      setJourneyInfo(journeyData);

      i++;
    }, 3000);

    return () => {
      clearInterval(sensorInterval);
      clearInterval(journeyInterval);
    };
  };

  /* ------------- UI with enhanced debugging ------------- */
  return (
    <div className="bg-gray-100 p-6">
      {/* Debug Panel */}
      <div className="bg-orange-50 border border-orange-200 rounded p-4 mb-6">
        <h4 className="font-bold text-orange-800 mb-2">
          🚛 Transport Debug Info
        </h4>
        <div className="text-sm text-orange-700 space-y-1">
          <p>
            Apple ID: <strong>{appleId || "None"}</strong>
          </p>
          <p>Collecting Data: {isCollecting ? "✅" : "❌"}</p>
          <p>Waiting for Transaction: {isWaitingForTx ? "⏳" : "❌"}</p>
          <p>
            Transaction Hash: <strong>{transactionHash || "None"}</strong>
          </p>
          <p>
            Readings Count: <strong>{readings.length}</strong>
          </p>
          <p>
            Journey Progress: <strong>{journeyInfo?.progress || 0}%</strong>
          </p>
          <p>Callback Function: {onTransitComplete ? "✅" : "❌"}</p>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-xl shadow-md p-6 border mb-6">
        <h2 className="text-xl font-semibold mb-4">
          🚛 Smart Transport Monitoring
        </h2>
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isCollecting ? "bg-green-500 animate-pulse" : "bg-gray-400"
            }`}
          ></div>
          <p className="text-gray-700">{status}</p>
        </div>
      </div>

      {/* Journey Progress */}
      {journeyInfo && (
        <div className="bg-white rounded-xl shadow-md p-6 border mb-6">
          <h3 className="text-lg font-semibold mb-4">📍 Journey Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Current Phase:</p>
              <p className="font-semibold text-blue-600">
                {journeyInfo.stateDescription}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Progress:</p>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${journeyInfo.progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {journeyInfo.progress}% Complete
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Live Sensor Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6 border text-center">
          <h4 className="font-semibold text-gray-700 mb-2">🌡️ Temperature</h4>
          <p className="text-3xl font-bold text-blue-600">
            {current ? `${current.t}°C` : "Initializing..."}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {current ? `During ${current.phase}` : ""}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border text-center">
          <h4 className="font-semibold text-gray-700 mb-2">
            🍃 Ethylene Level
          </h4>
          <p className="text-3xl font-bold text-green-600">
            {current ? `${current.e} ppm` : "Initializing..."}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {current ? `Reading #${current.idx}` : ""}
          </p>
        </div>
      </div>

      {/* Journey Metrics (shown after completion) */}
      {journeyMetrics && (
        <div className="bg-white shadow-md rounded-xl p-6 border mb-6">
          <h3 className="text-xl font-bold mb-4">📊 Journey Analytics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Time</p>
              <p className="text-lg font-semibold">
                {journeyMetrics.totalTime} hours
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Distance</p>
              <p className="text-lg font-semibold">
                {journeyMetrics.distanceCovered} km
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Avg Speed</p>
              <p className="text-lg font-semibold">
                {journeyMetrics.averageSpeed} km/h
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Fuel Efficiency</p>
              <p className="text-lg font-semibold">
                {journeyMetrics.fuelEfficiency} km/l
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transport Timeline */}
      {(startT || endT) && (
        <div className="bg-white shadow-md rounded-xl p-6 border mb-6">
          <h3 className="text-xl font-bold mb-4">⏱️ Transport Timeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Journey Started:</p>
              <p className="font-semibold">
                {startT
                  ? new Date(parseInt(startT) * 1000).toLocaleString()
                  : "Not started"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Journey Completed:</p>
              <p className="font-semibold">
                {endT
                  ? new Date(parseInt(endT) * 1000).toLocaleString()
                  : "In progress..."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Sensor Readings History */}
      <div className="bg-white shadow-md rounded-xl p-6 border mb-6">
        <h3 className="text-xl font-bold mb-4">📈 Sensor Readings History</h3>
        {readings.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-500">Collecting transport data...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {readings.map((r) => (
              <div
                key={r.idx}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500"
              >
                <div>
                  <span className="font-semibold text-blue-600">
                    Reading #{r.idx}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({r.timestamp})
                  </span>
                  <br />
                  <span className="text-xs text-blue-600">{r.phase}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    ({r.progress}% complete)
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">🌡️ {r.t}°C</div>
                  <div className="text-lg font-semibold">🍃 {r.e} ppm</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
