import toast from "react-hot-toast";

export default function PriceManagement({
  currentPrice,
  setCurrentPrice,
  priceHistory,
  onUpdatePrice,
  transportCompleted,
}) {
  const handlePriceSubmit = (e) => {
    e.preventDefault();
    if (!currentPrice || currentPrice <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    onUpdatePrice(currentPrice);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border mb-6">
      <h3 className="text-xl font-bold mb-4">💰 Price Management</h3>

      {!transportCompleted && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-yellow-800">
            ⚠️ Transport must be completed before setting prices
          </p>
        </div>
      )}

      <form onSubmit={handlePriceSubmit} className="mb-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Set Price (in wei/units)
            </label>
            <input
              type="number"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              placeholder="Enter price..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={!transportCompleted}
              min="0"
            />
          </div>
          <button
            type="submit"
            disabled={!transportCompleted || !currentPrice}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            💰 Update Price
          </button>
        </div>
      </form>

      {/* Price History */}
      {priceHistory.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">📈 Price History</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {priceHistory.map((price, index) => (
              <div
                key={index}
                className="bg-green-50 border border-green-200 rounded-lg p-3 text-center"
              >
                <span className="text-sm text-gray-600">
                  Update #{index + 1}
                </span>
                <p className="text-lg font-bold text-green-600">
                  {price.toString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
