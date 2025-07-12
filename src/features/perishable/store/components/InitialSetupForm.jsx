export default function InitialSetupForm({
  initialPrice,
  setInitialPrice,
  initialFreshnessScore,
  setInitialFreshnessScore,
  isSubmittingInitial,
  onSubmit,
  transportCompleted,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border mb-6">
      <h3 className="text-xl font-bold text-blue-600 mb-4">
        🚀 Initial Store Setup Required
      </h3>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-yellow-800 font-medium">
          ⚠️ Complete initial price and freshness score transaction before
          monitoring begins
        </p>
      </div>

      {!transportCompleted && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">
            ❌ Transport must be completed before setting prices
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Price Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Price (wei){" "}
              {!transportCompleted && "(Disabled - Transport Required)"}
            </label>
            <input
              type="number"
              value={initialPrice}
              onChange={(e) => setInitialPrice(e.target.value)}
              placeholder="Enter initial price..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              disabled={isSubmittingInitial || !transportCompleted}
              min="0"
              required={transportCompleted}
            />
          </div>

          {/* Freshness Score Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Freshness Score (0-100) *
            </label>
            <input
              type="number"
              value={initialFreshnessScore}
              onChange={(e) => setInitialFreshnessScore(e.target.value)}
              placeholder="Enter freshness score..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              disabled={isSubmittingInitial}
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

        <button
          type="submit"
          disabled={
            isSubmittingInitial ||
            !initialFreshnessScore ||
            (transportCompleted && !initialPrice)
          }
          className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmittingInitial
            ? "⏳ Processing Initial Transaction..."
            : "🚀 Complete Initial Setup & Start Monitoring"}
        </button>
      </form>

      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>Note:</strong> This transaction will:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          {transportCompleted && <li>Set the initial price for this apple</li>}
          <li>Record the initial freshness score</li>
          <li>Enable storage monitoring to begin</li>
        </ul>
      </div>
    </div>
  );
}
