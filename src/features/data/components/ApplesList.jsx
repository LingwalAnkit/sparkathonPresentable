// components/ApplesList.jsx
import { formatTimestamp } from "../../../utils/formatters";

export default function ApplesList({ apples, onViewDetails, loading }) {
  if (loading) return null;

  if (apples.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          No apples found. The system will automatically load all available
          apples on startup.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        📊 All Apples ({apples.length} total)
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 border-b font-semibold text-left">
                Apple ID
              </th>
              <th className="px-4 py-3 border-b font-semibold text-left">
                Harvest Date
              </th>
              <th className="px-4 py-3 border-b font-semibold text-left">
                Soil Type
              </th>
              <th className="px-4 py-3 border-b font-semibold text-left">
                Transport
              </th>
              <th className="px-4 py-3 border-b font-semibold text-left">
                Storage Logs
              </th>
              <th className="px-4 py-3 border-b font-semibold text-left">
                Status
              </th>
              <th className="px-4 py-3 border-b font-semibold text-left">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {apples.map((apple) => (
              <tr key={Number(apple.id)} className="hover:bg-gray-50">
                <td className="px-4 py-3 border-b font-semibold">
                  #{Number(apple.id)}
                </td>
                <td className="px-4 py-3 border-b">
                  {formatTimestamp(apple.harvest.timestamp)}
                </td>
                <td className="px-4 py-3 border-b">
                  {apple.harvest.soilComposition}
                </td>
                <td className="px-4 py-3 border-b">
                  {apple.transport.startTimestamp > 0 ? "✅" : "❌"}
                </td>
                <td className="px-4 py-3 border-b">
                  {apple.warehouseLogs.length}
                </td>
                <td className="px-4 py-3 border-b">
                  {apple.store.sold ? "🛒 Sold" : "📦 Available"}
                </td>
                <td className="px-4 py-3 border-b">
                  <button
                    onClick={() => onViewDetails(apple)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
