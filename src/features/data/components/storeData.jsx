// components/StoreData.jsx
import { formatTimestamp } from "../../../utils/formatters";

export default function StoreData({ storeData }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold text-orange-600 mb-4">🏪 Store Data</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">Store Entry</p>
          <p className="font-medium">{formatTimestamp(storeData.timestamp)}</p>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">Ethylene Level</p>
          <p className="text-lg font-bold">
            {Number(storeData.ethyleneLevel)} ppm
          </p>
        </div>

        {/* Freshness Score Display */}
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">Freshness Score</p>
          <p
            className={`text-lg font-bold ${
              Number(storeData.freshnessScore) >= 75
                ? "text-green-600"
                : Number(storeData.freshnessScore) >= 50
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {Number(storeData.freshnessScore)}/100
          </p>
          <div
            className={`text-xs mt-1 px-2 py-1 rounded-full ${
              Number(storeData.freshnessScore) >= 75
                ? "bg-green-100 text-green-800"
                : Number(storeData.freshnessScore) >= 50
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {Number(storeData.freshnessScore) >= 75
              ? "Excellent"
              : Number(storeData.freshnessScore) >= 50
              ? "Good"
              : "Poor"}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">Sales Status</p>
          <p className="font-bold">
            {storeData.sold ? "✅ Sold" : "📦 Available"}
          </p>
        </div>

        {storeData.sold && (
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">Buyer</p>
            <p className="font-mono text-xs break-all">{storeData.buyer}</p>
          </div>
        )}

        {/* Quality Assessment */}
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">Quality Status</p>
          <p
            className={`font-bold ${
              Number(storeData.ethyleneLevel) < 50 &&
              Number(storeData.freshnessScore) >= 75
                ? "text-green-600"
                : Number(storeData.ethyleneLevel) < 100 &&
                  Number(storeData.freshnessScore) >= 50
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {Number(storeData.ethyleneLevel) < 50 &&
            Number(storeData.freshnessScore) >= 75
              ? "🌟 Premium"
              : Number(storeData.ethyleneLevel) < 100 &&
                Number(storeData.freshnessScore) >= 50
              ? "⭐ Standard"
              : "⚠️ Needs Attention"}
          </p>
        </div>
      </div>
    </div>
  );
}
