// components/PendingReadingCard.jsx

export default function PendingReadingCard({
  reading,
  currentPrice,
  setCurrentPrice,
  currentFreshnessScore,
  setCurrentFreshnessScore,
  onSubmit,
  isSubmitting,
  spoilageDetected,
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
        className={`text-xl font-bold mb-4 ${
          spoilageDetected ? "text-red-800" : "text-yellow-800"
        }`}
      >
        {spoilageDetected ? "🚨" : "📊"} Reading #{reading.id} - Single
        Transaction Flow
        {spoilageDetected && " (SPOILAGE DETECTED!)"}
      </h3>

      {/* Flow Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-blue-800 mb-2">
          📋 Transaction Flow
        </h4>
        <div className="text-sm text-blue-700">
          <p>
            <strong>Step 1:</strong> Reading generated →{" "}
            <strong>Step 2:</strong> Set price & freshness →{" "}
            <strong>Step 3:</strong> Single transaction execution →{" "}
            <strong>Step 4:</strong> Data appended to logs →{" "}
            <strong>Step 5:</strong> Repeat
          </p>
        </div>
      </div>

      {/* Spoilage Warning */}
      {spoilageDetected && (
        <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4">
          <p className="text-red-800 font-semibold">
            ⚠️ CRITICAL: Ethylene level exceeded threshold! Complete this
            reading and take action.
          </p>
        </div>
      )}

      {/* Reading Display */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-gray-800 mb-2">
          📊 Current Reading Data
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
            {isSubmitting
              ? "⏳ Processing Transaction Flow..."
              : spoilageDetected
              ? "🚨 Complete Final Reading & Append"
              : "💾 Execute Single Transaction & Append to Logs"}
          </button>
        </div>
      </form>

      <div
        className={`mt-4 text-sm ${
          spoilageDetected ? "text-red-800" : "text-yellow-800"
        }`}
      >
        <p>
          <strong>Single Transaction Flow:</strong>
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Step 1: Updates price for this apple</li>
          <li>Step 2: Logs warehouse reading with freshness score</li>
          <li>Step 3: Appends data to blockchain logs</li>
          <li>Step 4: Prepares for next reading generation</li>
          {spoilageDetected && (
            <li className="font-semibold">
              Step 5: Stops monitoring due to spoilage
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
