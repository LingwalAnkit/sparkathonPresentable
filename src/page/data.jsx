"use client";
import { useState, useEffect } from "react";
import { usePublicClient } from "wagmi";
import AppleLifecycleABI from "../abi/apple.json";
import toast from "react-hot-toast";

const CONTRACT = {
  address: "0x83614Fb40F7532590752aD32e60050d661ceffE1",
  abi: AppleLifecycleABI.abi,
};

export default function AppleDataDisplay() {
  const [appleId, setAppleId] = useState("");
  const [appleData, setAppleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allApples, setAllApples] = useState([]);
  const [nextAppleId, setNextAppleId] = useState(0);

  const publicClient = usePublicClient();

  // Fetch next apple ID to know how many apples exist
  useEffect(() => {
    fetchNextAppleId();
  }, []);

  const fetchNextAppleId = async () => {
    try {
      const nextId = await publicClient.readContract({
        ...CONTRACT,
        functionName: "nextAppleId",
      });
      setNextAppleId(Number(nextId));
      console.log("📊 Total apples created:", Number(nextId));
    } catch (error) {
      console.error("❌ Error fetching next apple ID:", error);
    }
  };

  const fetchAppleData = async (id) => {
    if (!id) return;

    setLoading(true);
    try {
      console.log("🔍 Fetching data for Apple ID:", id);

      // Check if apple exists first
      const exists = await publicClient.readContract({
        ...CONTRACT,
        functionName: "appleExists",
        args: [BigInt(id)],
      });

      if (!exists) {
        toast.error(`Apple #${id} does not exist`);
        setAppleData(null);
        setLoading(false);
        return;
      }

      const data = await publicClient.readContract({
        ...CONTRACT,
        functionName: "getApple",
        args: [BigInt(id)],
      });

      console.log("✅ Apple data retrieved:", data);
      setAppleData(data);
      toast.success(`Data loaded for Apple #${id}`);
    } catch (error) {
      console.error("❌ Error fetching apple data:", error);
      toast.error("Failed to fetch apple data: " + error.message);
      setAppleData(null);
    }
    setLoading(false);
  };

  const fetchAllApples = async () => {
    setLoading(true);
    const apples = [];

    for (let i = 0; i < nextAppleId; i++) {
      try {
        const exists = await publicClient.readContract({
          ...CONTRACT,
          functionName: "appleExists",
          args: [BigInt(i)],
        });

        if (exists) {
          const data = await publicClient.readContract({
            ...CONTRACT,
            functionName: "getApple",
            args: [BigInt(i)],
          });
          apples.push(data);
        }
      } catch (error) {
        console.error(`Error fetching apple ${i}:`, error);
      }
    }

    setAllApples(apples);
    setLoading(false);
    toast.success(`Loaded ${apples.length} apples`);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const formatArray = (arr) => {
    return arr.map((item) => Number(item)).join(", ");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 text-center mb-8">
          🍎 Apple Lifecycle Data Viewer
        </h1>

        {/* Search Controls */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">📊 Data Controls</h2>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Apple ID:
              </label>
              <input
                type="number"
                value={appleId}
                onChange={(e) => setAppleId(e.target.value)}
                placeholder="Enter Apple ID (0, 1, 2...)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchAppleData(appleId)}
                disabled={loading || !appleId}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Loading..." : "Fetch Data"}
              </button>
              <button
                onClick={fetchAllApples}
                disabled={loading}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Load All Apples
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Total apples created: <strong>{nextAppleId}</strong>
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-lg">Loading apple data...</span>
          </div>
        )}

        {/* Single Apple Data Display */}
        {appleData && (
          <div className="space-y-6">
            {/* Apple Overview */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-green-600 mb-4">
                🍎 Apple #{Number(appleData.id)} - Complete Lifecycle Data
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-700">
                    Harvest Stage
                  </h4>
                  <p className="text-sm text-green-600">✅ Completed</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-700">
                    Transport Stage
                  </h4>
                  <p className="text-sm text-blue-600">
                    {appleData.transport.startTimestamp > 0
                      ? "✅ Completed"
                      : "❌ Not Started"}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-700">
                    Storage Stage
                  </h4>
                  <p className="text-sm text-purple-600">
                    {appleData.warehouseLogs.length > 0
                      ? `✅ ${appleData.warehouseLogs.length} logs`
                      : "❌ No logs"}
                  </p>
                </div>
              </div>
            </div>

            {/* Harvest Data */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-green-600 mb-4">
                🌱 Harvest Data
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Soil Information</h4>
                  <p className="bg-gray-50 p-3 rounded">
                    <strong>Type:</strong> {appleData.harvest.soilComposition}
                  </p>
                  <p className="bg-gray-50 p-3 rounded mt-2">
                    <strong>Logged:</strong>{" "}
                    {formatTimestamp(appleData.harvest.timestamp)}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Sensor Readings</h4>
                  <p className="bg-blue-50 p-3 rounded mb-2">
                    <strong>Humidity (%):</strong>{" "}
                    {formatArray(appleData.harvest.humidity)}
                  </p>
                  <p className="bg-green-50 p-3 rounded">
                    <strong>Chemicals (ppm):</strong>{" "}
                    {formatArray(appleData.harvest.chemicals)}
                  </p>
                </div>
              </div>
            </div>

            {/* Transport Data */}
            {appleData.transport.startTimestamp > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-blue-600 mb-4">
                  🚛 Transport Data
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Journey Timeline</h4>
                    <p className="bg-gray-50 p-3 rounded mb-2">
                      <strong>Started:</strong>{" "}
                      {formatTimestamp(appleData.transport.startTimestamp)}
                    </p>
                    <p className="bg-gray-50 p-3 rounded mb-2">
                      <strong>Ended:</strong>{" "}
                      {formatTimestamp(appleData.transport.endTimestamp)}
                    </p>
                    <p className="bg-gray-50 p-3 rounded">
                      <strong>Duration:</strong>{" "}
                      {Math.floor(
                        (Number(appleData.transport.endTimestamp) -
                          Number(appleData.transport.startTimestamp)) /
                          60
                      )}{" "}
                      minutes
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Environmental Data</h4>
                    <p className="bg-blue-50 p-3 rounded mb-2">
                      <strong>Temperatures (°C):</strong>{" "}
                      {formatArray(appleData.transport.temperatures)}
                    </p>
                    <p className="bg-green-50 p-3 rounded mb-2">
                      <strong>Ethylene (ppm):</strong>{" "}
                      {formatArray(appleData.transport.ethyleneLevels)}
                    </p>
                    <p className="bg-yellow-50 p-3 rounded">
                      <strong>GPS Points:</strong>{" "}
                      {appleData.transport.gpsCoordinates.length} coordinates
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Warehouse Data */}
            {appleData.warehouseLogs.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-purple-600 mb-4">
                  🏪 Warehouse Storage Data ({appleData.warehouseLogs.length}{" "}
                  entries)
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 border-b font-semibold text-left">
                          #
                        </th>
                        <th className="px-4 py-3 border-b font-semibold text-left">
                          Timestamp
                        </th>
                        <th className="px-4 py-3 border-b font-semibold text-left">
                          Temperature (°C)
                        </th>
                        <th className="px-4 py-3 border-b font-semibold text-left">
                          Ethylene (ppm)
                        </th>
                        <th className="px-4 py-3 border-b font-semibold text-left">
                          Location
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {appleData.warehouseLogs.map((log, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 border-b">{index + 1}</td>
                          <td className="px-4 py-3 border-b">
                            {formatTimestamp(log.timestamp)}
                          </td>
                          <td className="px-4 py-3 border-b">
                            {Number(log.temperature)}
                          </td>
                          <td className="px-4 py-3 border-b">
                            {Number(log.ethyleneLevel)}
                          </td>
                          <td className="px-4 py-3 border-b">{log.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Store Data */}
            {appleData.store.timestamp > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-orange-600 mb-4">
                  🏪 Store Data
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded">
                    <strong>Store Entry:</strong>{" "}
                    {formatTimestamp(appleData.store.timestamp)}
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <strong>Ethylene Level:</strong>{" "}
                    {Number(appleData.store.ethyleneLevel)} ppm
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <strong>Status:</strong>{" "}
                    {appleData.store.sold ? "✅ Sold" : "📦 Available"}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* All Apples Summary */}
        {allApples.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              📊 All Apples Summary ({allApples.length} total)
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 border-b font-semibold text-left">
                      Apple ID
                    </th>
                    <th className="px-4 py-3 border-b font-semibold text-left">
                      Harvest Date
                    </th>
                    <th className="px-4 py-3 border-b font-semibold text-left">
                      Soil Type
                    </th>
                    <th className="px-4 py-3 border-b font-semibold text-left">
                      Transport
                    </th>
                    <th className="px-4 py-3 border-b font-semibold text-left">
                      Storage Logs
                    </th>
                    <th className="px-4 py-3 border-b font-semibold text-left">
                      Status
                    </th>
                    <th className="px-4 py-3 border-b font-semibold text-left">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allApples.map((apple) => (
                    <tr key={Number(apple.id)} className="hover:bg-gray-50">
                      <td className="px-4 py-3 border-b font-semibold">
                        #{Number(apple.id)}
                      </td>
                      <td className="px-4 py-3 border-b">
                        {formatTimestamp(apple.harvest.timestamp)}
                      </td>
                      <td className="px-4 py-3 border-b">
                        {apple.harvest.soilComposition}
                      </td>
                      <td className="px-4 py-3 border-b">
                        {apple.transport.startTimestamp > 0 ? "✅" : "❌"}
                      </td>
                      <td className="px-4 py-3 border-b">
                        {apple.warehouseLogs.length}
                      </td>
                      <td className="px-4 py-3 border-b">
                        {apple.store.sold ? "🛒 Sold" : "📦 Available"}
                      </td>
                      <td className="px-4 py-3 border-b">
                        <button
                          onClick={() => {
                            setAppleId(Number(apple.id).toString());
                            setAppleData(apple);
                          }}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!loading && !appleData && allApples.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Enter an Apple ID above to view its complete lifecycle data, or
              load all apples to see a summary.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
