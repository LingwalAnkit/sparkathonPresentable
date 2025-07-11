// components/SpoilageActionButtons.jsx
export default function SpoilageActionButtons({ onRouteChange }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
      <h4 className="font-bold text-red-800 mb-4">
        🚨 Immediate Action Required
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors font-medium"
          onClick={() => onRouteChange("CHARITY")}
        >
          🤝 Send to Charity
        </button>
        <button
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          onClick={() => onRouteChange("COLD_CHAMBER")}
        >
          ❄️ Cold Storage
        </button>
        <button
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          onClick={() => onRouteChange("SALE")}
        >
          💰 Quick Sale
        </button>
      </div>
    </div>
  );
}
