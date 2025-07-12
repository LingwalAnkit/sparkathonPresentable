export default function StatusCard({
  status,
  isMonitoring,
  spoilageDetected,
  currentReading,
  ethyleneThreshold,
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border mb-6">
      <h2 className="text-xl font-semibold mb-4">🏪 Storage Monitoring</h2>
      <div className="flex items-center space-x-2 mb-4">
        <div
          className={`w-3 h-3 rounded-full ${
            isMonitoring
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

      {currentReading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <h4 className="font-semibold text-blue-700">🌡️ Temperature</h4>
            <p className="text-2xl font-bold text-blue-600">
              {currentReading.temperature}°C
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <h4 className="font-semibold text-green-700">🍃 Ethylene</h4>
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
            <h4 className="font-semibold text-gray-700">📍 Location</h4>
            <p className="text-lg font-medium text-gray-600">
              {currentReading.location}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
