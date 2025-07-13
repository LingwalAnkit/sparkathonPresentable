// components/PriceHistory.jsx
export default function PriceHistory({ prices }) {
  const getCurrentPrice = () => {
    return prices.length > 0 ? Number(prices[prices.length - 1]) : 0;
  };

  const getPriceChange = () => {
    if (prices.length < 2) return null;
    const current = Number(prices[prices.length - 1]);
    const previous = Number(prices[prices.length - 2]);
    const change = current - previous;
    const percentage = ((change / previous) * 100).toFixed(1);
    return { change, percentage };
  };

  const priceChange = getPriceChange();

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold text-green-600 mb-4">
        💰 Price History
      </h3>

      {/* Current Price Display */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Current Price</p>
            <p className="text-2xl font-bold text-green-600">
              {getCurrentPrice()} wei
            </p>
          </div>
          {priceChange && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Price Change</p>
              <p
                className={`text-lg font-bold ${
                  priceChange.change >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {priceChange.change >= 0 ? "+" : ""}
                {priceChange.change} wei
              </p>
              <p
                className={`text-sm ${
                  priceChange.change >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                ({priceChange.percentage}%)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Price History Timeline */}
      <div className="space-y-2">
        <h4 className="font-semibold text-gray-700">Price Updates Timeline</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {prices.map((price, index) => (
            <div
              key={index}
              className={`border rounded-lg p-3 text-center ${
                index === prices.length - 1
                  ? "bg-green-50 border-green-300"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <p className="text-sm text-gray-600">
                Update #{index + 1}
                {index === prices.length - 1 && (
                  <span className="ml-1 text-green-600 font-medium">
                    (Current)
                  </span>
                )}
              </p>
              <p className="text-lg font-bold text-gray-800">
                {Number(price)} wei
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Price Statistics */}
      {prices.length > 1 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <p className="text-sm text-gray-600">Highest Price</p>
            <p className="text-lg font-bold text-blue-600">
              {Math.max(...prices.map((p) => Number(p)))} wei
            </p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg text-center">
            <p className="text-sm text-gray-600">Lowest Price</p>
            <p className="text-lg font-bold text-orange-600">
              {Math.min(...prices.map((p) => Number(p)))} wei
            </p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <p className="text-sm text-gray-600">Average Price</p>
            <p className="text-lg font-bold text-purple-600">
              {Math.round(
                prices.reduce((sum, p) => sum + Number(p), 0) / prices.length
              )}{" "}
              wei
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
