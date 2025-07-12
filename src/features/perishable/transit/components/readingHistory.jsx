import { useEffect } from "react";

export default function SensorReadingsHistory({
  readings,
  isCollecting,
  onSubmit,
  isWaitingForTx,
  status,
}) {
  // Auto-trigger submit when data collection is complete
  useEffect(() => {
    if (!isCollecting && readings.length > 0 && !isWaitingForTx) {
      onSubmit();
    }
  }, [isCollecting, readings, isWaitingForTx, onSubmit]);

  return (
    <div className="bg-white shadow-md rounded-xl p-6 border mb-6">
      <h3 className="text-xl font-bold mb-4">📈 Sensor Readings History</h3>

      {/* Status Display */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isCollecting
                ? "bg-green-500 animate-pulse"
                : isWaitingForTx
                ? "bg-yellow-500 animate-pulse"
                : "bg-gray-400"
            }`}
          ></div>
          <p className="font-medium text-gray-700">{status}</p>
        </div>
      </div>

      {/* Auto-submit button (visible, but not needed if auto triggered) */}
      {!isCollecting && readings.length > 0 && !isWaitingForTx && (
        <div className="mb-4">
          <button
            onClick={onSubmit}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            📡 Submit to Blockchain
          </button>
        </div>
      )}

      {/* Readings Display */}
      {readings.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-500">Collecting transport data...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {readings.map((r) => (
            <div
              key={r.idx}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500"
            >
              <div>
                <span className="font-semibold text-blue-600">
                  Reading #{r.idx}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  ({r.timestamp})
                </span>
                <br />
                <span className="text-xs text-blue-600">{r.phase}</span>
                <span className="text-xs text-gray-400 ml-2">
                  ({r.progress}% complete)
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">🌡️ {r.t}°C</div>
                <div className="text-lg font-semibold">🍃 {r.e} ppm</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
