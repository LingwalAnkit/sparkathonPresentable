// components/AppleDetails.jsx
import AppleOverview from "./AppleOverview";
import HarvestData from "./HarvestData";
import TransportData from "./TransportData";
import WarehouseData from "./WarehouseData";
import StoreData from "./storeData";
import PriceHistory from "./PriceHistory";
import FreshnessScoreHistory from "./FreshnessScoreHistory";

export default function AppleDetails({ appleData, onBackToList }) {
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex justify-start">
        <button
          onClick={onBackToList}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2"
        >
          ← Back to List
        </button>
      </div>

      <AppleOverview appleData={appleData} />
      <HarvestData harvestData={appleData.harvest} />

      {appleData.transport.startTimestamp > 0 && (
        <TransportData transportData={appleData.transport} />
      )}

      {/* Price History Section */}
      {appleData.prices && appleData.prices.length > 0 && (
        <PriceHistory prices={appleData.prices} />
      )}

      {/* Freshness Score History Section */}
      {appleData.freshnessHistory && appleData.freshnessHistory.length > 0 && (
        <FreshnessScoreHistory freshnessHistory={appleData.freshnessHistory} />
      )}

      {appleData.warehouseLogs.length > 0 && (
        <WarehouseData warehouseLogs={appleData.warehouseLogs} />
      )}

      {appleData.store.timestamp > 0 && (
        <StoreData storeData={appleData.store} />
      )}
    </div>
  );
}
