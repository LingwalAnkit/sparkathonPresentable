// components/SearchControls.jsx
import { useState } from "react";

export default function SearchControls({
  onSearchById,
  onRefresh,
  loading,
  totalApples,
}) {
  const [searchId, setSearchId] = useState("");

  const handleSearch = () => {
    if (searchId) {
      onSearchById(searchId);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4">🔍 Search & Controls</h2>
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search by Apple ID:
          </label>
          <input
            type="number"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter Apple ID (0, 1, 2...)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            disabled={loading || !searchId}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed mt-7"
          >
            {loading ? "Searching..." : "Search"}
          </button>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed  mt-7"
          >
            {loading ? "Refreshing..." : "Refresh All"}
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        Total apples in system: <strong>{totalApples}</strong>
      </p>
    </div>
  );
}
