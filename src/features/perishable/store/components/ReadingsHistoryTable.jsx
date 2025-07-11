// components/ReadingsHistoryTable.jsx
export default function ReadingsHistoryTable({ readings }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border mb-6">
      <h3 className="text-xl font-bold mb-4">📊 Storage Readings History</h3>
      {readings.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
            <p className="text-gray-500">Collecting storage data...</p>
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
                  Location
                </th>
                <th className="px-4 py-3 border-b font-semibold text-gray-700">
                  Status
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
                  <td className="px-4 py-3 border-b">{r.location}</td>
                  <td className="px-4 py-3 border-b">
                    {r.spoilageRisk ? (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                        ⚠️ Risk
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        ✅ Good
                      </span>
                    )}
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
