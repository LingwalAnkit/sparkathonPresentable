// components/ReadingsHistoryTable.jsx
export default function ReadingsHistoryTable({ readings }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border mb-6">
      <h3 className="text-xl font-bold mb-4">📋 Appended Readings Log</h3>
      {readings.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
            <p className="text-gray-500">
              Waiting for first reading to be processed and appended...
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 border-b font-semibold text-gray-700">
                  #
                </th>
                <th className="px-4 py-3 border-b font-semibold text-gray-700">
                  Timestamp
                </th>
                <th className="px-4 py-3 border-b font-semibold text-gray-700">
                  Temperature (°C)
                </th>
                <th className="px-4 py-3 border-b font-semibold text-gray-700">
                  Ethylene (ppm)
                </th>
                <th className="px-4 py-3 border-b font-semibold text-gray-700">
                  Price (wei)
                </th>
                <th className="px-4 py-3 border-b font-semibold text-gray-700">
                  Freshness
                </th>
                <th className="px-4 py-3 border-b font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 border-b font-semibold text-gray-700">
                  Tx Status
                </th>
              </tr>
            </thead>
            <tbody>
              {readings.map((r, i) => (
                <tr
                  key={i}
                  className={`text-center ${
                    r.spoilageRisk ? "bg-red-50" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-3 border-b font-medium">{r.id}</td>
                  <td className="px-4 py-3 border-b text-sm">
                    {new Date(r.timestamp * 1000).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 border-b font-medium">
                    {r.temperature}
                  </td>
                  <td
                    className={`px-4 py-3 border-b font-medium ${
                      r.spoilageRisk
                        ? "text-red-600 font-bold"
                        : "text-green-600"
                    }`}
                  >
                    {r.ethylene}
                  </td>
                  <td className="px-4 py-3 border-b font-medium text-green-600">
                    {r.price}
                  </td>
                  <td
                    className={`px-4 py-3 border-b font-medium ${
                      r.freshnessScore >= 75
                        ? "text-green-600"
                        : r.freshnessScore >= 50
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {r.freshnessScore}/100
                  </td>
                  <td className="px-4 py-3 border-b">
                    {r.spoilageRisk ? (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                        ⚠️ Spoilage
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        ✅ Good
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 border-b">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      📋 Appended
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
