// components/AppleOverview.jsx
export default function AppleOverview({ appleData }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-green-600 mb-4">
        🍎 Apple #{Number(appleData.id)} - Complete Lifecycle Data
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-700">Harvest Stage</h4>
          <p className="text-sm text-green-600">✅ Completed</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-700">Transport Stage</h4>
          <p className="text-sm text-blue-600">
            {appleData.transport.startTimestamp > 0
              ? "✅ Completed"
              : "❌ Not Started"}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-700">Storage Stage</h4>
          <p className="text-sm text-purple-600">
            {appleData.warehouseLogs.length > 0
              ? `✅ ${appleData.warehouseLogs.length} logs`
              : "❌ No logs"}
          </p>
        </div>
      </div>
    </div>
  );
}
