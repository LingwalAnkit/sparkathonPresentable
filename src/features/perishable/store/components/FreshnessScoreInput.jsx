import { useState } from "react";
import toast from "react-hot-toast";

export default function FreshnessScoreInput({
  currentReading,
  pendingScore,
  setPendingScore,
  onSubmitScore,
  freshnessHistory,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pendingScore || pendingScore < 0 || pendingScore > 100) {
      toast.error("Please enter a valid freshness score (0-100)");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitScore(pendingScore);
    } catch (error) {
      console.error("Error submitting freshness score:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border mb-6">
      <h3 className="text-xl font-bold mb-4">🌟 Freshness Score Assessment</h3>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-blue-800 mb-2">Current Reading</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Temperature</p>
            <p className="text-lg font-bold text-blue-600">
              {currentReading.temperature}°C
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Ethylene</p>
            <p className="text-lg font-bold text-green-600">
              {currentReading.ethylene} ppm
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Location</p>
            <p className="text-lg font-medium text-gray-700">
              {currentReading.location}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Freshness Score (0-100)
            </label>
            <input
              type="number"
              value={pendingScore}
              onChange={(e) => setPendingScore(e.target.value)}
              placeholder="Enter freshness score..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              min="0"
              max="100"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              100 = Excellent, 75-99 = Good, 50-74 = Fair, 25-49 = Poor, 0-24 =
              Very Poor
            </p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "⏳ Submitting..." : "🌟 Submit Score"}
          </button>
        </div>
      </form>

      {/* Freshness History */}
      {freshnessHistory.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">📊 Freshness Score History</h4>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {freshnessHistory.map((score, index) => (
              <div
                key={index}
                className={`border rounded-lg p-3 text-center ${
                  score >= 75
                    ? "bg-green-50 border-green-200"
                    : score >= 50
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <span className="text-sm text-gray-600">#{index + 1}</span>
                <p
                  className={`text-lg font-bold ${
                    score >= 75
                      ? "text-green-600"
                      : score >= 50
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {score.toString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
