// components/WarehouseData.jsx
import { formatTimestamp } from "../../../utils/formatters";

export default function WarehouseData({ warehouseLogs }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold text-blue-600 mb-4">
        🏭 Warehouse Data
      </h3>

      <div className="space-y-4">
        {warehouseLogs.map((log, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-3">
              Warehouse Entry #{index + 1}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-600">Timestamp</p>
                <p className="font-medium text-sm">
                  {formatTimestamp(log.timestamp)}
                </p>
              </div>

              <div className="bg-green-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-600">Temperature</p>
                <p className="text-lg font-bold text-green-600">
                  {Number(log.temperature)}°C
                </p>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-600">Ethylene Level</p>
                <p className="text-lg font-bold text-yellow-600">
                  {Number(log.ethyleneLevel)} ppm
                </p>
              </div>

              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-600">Freshness Score</p>
                <p
                  className={`text-lg font-bold ${
                    Number(log.freshnessScore) >= 75
                      ? "text-green-600"
                      : Number(log.freshnessScore) >= 50
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {Number(log.freshnessScore)}/100
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium text-sm">{log.location}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
