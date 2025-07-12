// components/FreshnessScoreHistory.jsx
export default function FreshnessScoreHistory({ freshnessHistory }) {
  const getCurrentScore = () => {
    return freshnessHistory.length > 0
      ? Number(freshnessHistory[freshnessHistory.length - 1])
      : 0;
  };

  const getScoreChange = () => {
    if (freshnessHistory.length < 2) return null;
    const current = Number(freshnessHistory[freshnessHistory.length - 1]);
    const previous = Number(freshnessHistory[freshnessHistory.length - 2]);
    return current - previous;
  };

  const getScoreCategory = (score) => {
    if (score >= 90)
      return {
        label: "Excellent",
        color: "green",
        bg: "bg-green-50",
        text: "text-green-600",
      };
    if (score >= 75)
      return {
        label: "Good",
        color: "green",
        bg: "bg-green-50",
        text: "text-green-600",
      };
    if (score >= 50)
      return {
        label: "Fair",
        color: "yellow",
        bg: "bg-yellow-50",
        text: "text-yellow-600",
      };
    if (score >= 25)
      return {
        label: "Poor",
        color: "orange",
        bg: "bg-orange-50",
        text: "text-orange-600",
      };
    return {
      label: "Very Poor",
      color: "red",
      bg: "bg-red-50",
      text: "text-red-600",
    };
  };

  const currentScore = getCurrentScore();
  const scoreChange = getScoreChange();
  const currentCategory = getScoreCategory(currentScore);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold text-blue-600 mb-4">
        🌟 Freshness Score History
      </h3>

      {/* Current Score Display */}
      <div
        className={`${currentCategory.bg} border border-${currentCategory.color}-200 rounded-lg p-4 mb-4`}
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Current Freshness Score</p>
            <p className={`text-3xl font-bold ${currentCategory.text}`}>
              {currentScore}/100
            </p>
            <p className={`text-sm font-medium ${currentCategory.text}`}>
              {currentCategory.label}
            </p>
          </div>
          {scoreChange !== null && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Score Change</p>
              <p
                className={`text-lg font-bold ${
                  scoreChange >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {scoreChange >= 0 ? "+" : ""}
                {scoreChange}
              </p>
              <p
                className={`text-sm ${
                  scoreChange >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {scoreChange >= 0 ? "📈 Improved" : "📉 Declined"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Freshness Score Timeline */}
      <div className="space-y-2">
        <h4 className="font-semibold text-gray-700">
          Freshness Assessment Timeline
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {freshnessHistory.map((score, index) => {
            const category = getScoreCategory(Number(score));
            return (
              <div
                key={index}
                className={`border rounded-lg p-3 text-center ${
                  index === freshnessHistory.length - 1
                    ? `${category.bg} border-${category.color}-300`
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <p className="text-sm text-gray-600">
                  Assessment #{index + 1}
                  {index === freshnessHistory.length - 1 && (
                    <span className={`ml-1 ${category.text} font-medium`}>
                      (Current)
                    </span>
                  )}
                </p>
                <p
                  className={`text-xl font-bold ${
                    index === freshnessHistory.length - 1
                      ? category.text
                      : "text-gray-800"
                  }`}
                >
                  {Number(score)}
                </p>
                <p
                  className={`text-xs ${
                    index === freshnessHistory.length - 1
                      ? category.text
                      : "text-gray-600"
                  }`}
                >
                  {category.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Freshness Trend Analysis */}
      {freshnessHistory.length > 1 && (
        <div className="mt-4">
          <h4 className="font-semibold text-gray-700 mb-3">
            Freshness Trend Analysis
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600">Highest Score</p>
              <p className="text-lg font-bold text-blue-600">
                {Math.max(...freshnessHistory.map((s) => Number(s)))}/100
              </p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600">Lowest Score</p>
              <p className="text-lg font-bold text-orange-600">
                {Math.min(...freshnessHistory.map((s) => Number(s)))}/100
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-lg font-bold text-purple-600">
                {Math.round(
                  freshnessHistory.reduce((sum, s) => sum + Number(s), 0) /
                    freshnessHistory.length
                )}
                /100
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600">Total Assessments</p>
              <p className="text-lg font-bold text-gray-600">
                {freshnessHistory.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quality Indicators */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h5 className="font-medium text-gray-700 mb-2">
          Quality Scale Reference
        </h5>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
            90-100: Excellent
          </span>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
            75-89: Good
          </span>
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            50-74: Fair
          </span>
          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
            25-49: Poor
          </span>
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
            0-24: Very Poor
          </span>
        </div>
      </div>
    </div>
  );
}
