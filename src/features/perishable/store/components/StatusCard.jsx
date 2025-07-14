import {
  Activity,
  ClipboardList,
  MapPin,
  Thermometer,
  Warehouse,
} from "lucide-react";

// components/StatusCard.jsx
export default function StatusCard({
  status,
  isMonitoring,
  spoilageDetected,
  currentReading,
  ethyleneThreshold,
  pendingReading,
  isSubmittingTransaction,
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border mb-6">
      <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
        <Warehouse className="w-5 h-5 text-gray-800" />
        Sequential Storage Monitoring
      </h2>

      {/* Status Indicator */}
      <div className="flex items-center space-x-2 mb-4">
        <div
          className={`w-3 h-3 rounded-full ${
            isSubmittingTransaction
              ? "bg-yellow-500 animate-pulse"
              : isMonitoring
              ? "bg-green-500 animate-pulse"
              : spoilageDetected
              ? "bg-red-500"
              : "bg-gray-400"
          }`}
        ></div>
        <p
          className={`font-medium ${
            spoilageDetected ? "text-red-600" : "text-gray-700"
          }`}
        >
          {status}
        </p>
      </div>

      {/* Processing Status */}
      <div className="bg-blue-50 rounded-lg p-4 mb-4">
        <h4 className="flex items-center gap-2 font-semibold text-blue-800 mb-2">
          <ClipboardList className="w-5 h-5 text-blue-700" />
          Processing Status
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-600">Pending Reading</p>
            <p className="font-bold text-blue-600">
              {pendingReading ? `#${pendingReading.id}` : "None"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Transaction Status</p>
            <p
              className={`font-bold ${
                isSubmittingTransaction ? "text-yellow-600" : "text-green-600"
              }`}
            >
              {isSubmittingTransaction ? "Processing..." : "Ready"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Next Reading</p>
            <p
              className={`font-bold ${
                pendingReading || isSubmittingTransaction
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {pendingReading || isSubmittingTransaction ? "Blocked" : "Ready"}
            </p>
          </div>
        </div>
      </div>

      {/* Current Reading Display */}
      {currentReading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <h4 className="flex items-center justify-center gap-2 font-semibold text-blue-700">
              <Thermometer className="w-5 h-5" />
              Temperature
            </h4>
            <p className="text-2xl font-bold text-blue-600">
              {currentReading.temperature}°C
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <h4 className="flex items-center justify-center gap-2 font-semibold text-green-700">
              <Activity className="w-5 h-5" />
              Ethylene
            </h4>
            <p
              className={`text-2xl font-bold ${
                currentReading.ethylene >= ethyleneThreshold
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {currentReading.ethylene} ppm
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <h4 className="flex items-center justify-center gap-2 font-semibold text-gray-700">
              <MapPin className="w-5 h-5" />
              Location
            </h4>
            <p className="text-lg font-medium text-gray-600">
              {currentReading.location}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
