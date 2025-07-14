import {
  AlertTriangle,
  BarChartHorizontal,
  Thermometer,
  Activity,
  MapPin,
  Clock,
  Sparkles,
  Loader,
  Database,
} from "lucide-react";

export default function PendingReadingCard({
  reading,
  currentPrice,
  setCurrentPrice,
  currentFreshnessScore,
  setCurrentFreshnessScore,
  onSubmit,
  isSubmitting,
  spoilageDetected,
  isBackendMode = false,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div
      className={`border-2 rounded-xl p-6 mb-6 ${
        spoilageDetected
          ? "bg-red-50 border-red-300"
          : "bg-yellow-50 border-yellow-300"
      }`}
    >
      <h3
        className={`flex items-center gap-2 text-xl font-bold mb-4 ${
          spoilageDetected ? "text-red-800" : "text-yellow-800"
        }`}
      >
        {spoilageDetected ? (
          <AlertTriangle className="w-5 h-5 text-red-700" />
        ) : (
          <BarChartHorizontal className="w-5 h-5 text-yellow-700" />
        )}
        Reading #{reading.id} - Backend Processing
        {spoilageDetected && " (SPOILAGE DETECTED!)"}
      </h3>

      {/* Backend Mode Indicator */}
      {isBackendMode && (
        <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-blue-800 mb-3 text-lg">
            Backend Processing Mode
          </h4>
          <div className="text-base text-blue-700 space-y-2">
            <p>
              <strong>Flow:</strong> Frontend → Node.js Backend → Blockchain →
              Response
            </p>
            <p>
              <strong>Benefits:</strong> No wallet required, automated gas
              management, faster processing
            </p>
            <div className="mt-4 text-center">
              <p className="font-semibold text-blue-800">Contract:</p>
              <p className="text-blue-900 font-bold text-lg">
                0x236bD8706661db41730C69BB628894E4bc7b040A
              </p>
              <p className="text-sm text-blue-700">
                View on Etherscan (Sepolia Testnet)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Spoilage Warning */}
      {spoilageDetected && (
        <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4">
          <p className="flex items-center gap-2 text-red-800 font-semibold">
            <AlertTriangle className="w-5 h-5" />
            CRITICAL: Ethylene level exceeded threshold! Complete this reading
            and take action.
          </p>
        </div>
      )}

      {/* Reading Display */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <h4 className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
          <BarChartHorizontal className="w-5 h-5 text-blue-600" />
          Current Reading Data
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Temperature</p>
            <p className="text-lg font-bold text-blue-600">
              {reading.temperature}°C
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Ethylene</p>
            <p
              className={`text-lg font-bold ${
                reading.spoilageRisk ? "text-red-600" : "text-green-600"
              }`}
            >
              {reading.ethylene} ppm
            </p>
            {reading.spoilageRisk && (
              <p className="text-xs text-red-600 font-semibold">
                THRESHOLD EXCEEDED!
              </p>
            )}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Location</p>
            <p className="text-lg font-medium text-gray-700">
              {reading.location}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Timestamp</p>
            <p className="text-sm font-medium text-gray-700">
              {new Date(reading.timestamp * 1000).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Price and Freshness Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Price Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (wei) *
            </label>
            <input
              type="number"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              placeholder="Enter price for this reading..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              disabled={isSubmitting}
              min="0"
              required
            />
          </div>

          {/* Freshness Score Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Freshness Score (0-100) *
            </label>
            <input
              type="number"
              value={currentFreshnessScore}
              onChange={(e) => setCurrentFreshnessScore(e.target.value)}
              placeholder="Enter freshness score..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
              min="0"
              max="100"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              100 = Excellent, 75-99 = Good, 50-74 = Fair, 25-49 = Poor, 0-24 =
              Very Poor
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting || !currentPrice || !currentFreshnessScore}
            className={`px-8 py-3 rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${
              spoilageDetected
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader className="w-5 h-5 animate-spin" />
                Processing via Backend...
              </span>
            ) : spoilageDetected ? (
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Complete Final Reading (Backend)
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Process via Backend
              </span>
            )}
          </button>
        </div>
      </form>

      <div
        className={`mt-4 text-sm ${
          spoilageDetected ? "text-red-800" : "text-yellow-800"
        }`}
      >
        <p>
          <strong>Backend Processing Flow:</strong>
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Frontend sends data to Node.js backend</li>
          <li>Backend executes price update transaction</li>
          <li>Backend executes warehouse logging transaction</li>
          <li>Backend returns transaction results to frontend</li>
          {spoilageDetected && (
            <li className="font-semibold">
              Monitoring stops due to spoilage detection
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
