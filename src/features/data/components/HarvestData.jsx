// components/HarvestData.jsx
import { formatTimestamp, formatArray } from "../../../utils/formatters";

export default function HarvestData({ harvestData }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold text-green-600 mb-4">🌱 Harvest Data</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-2">Soil Information</h4>
          <p className="bg-gray-50 p-3 rounded">
            <strong>Type:</strong> {harvestData.soilComposition}
          </p>
          <p className="bg-gray-50 p-3 rounded mt-2">
            <strong>Logged:</strong> {formatTimestamp(harvestData.timestamp)}
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Sensor Readings</h4>
          <p className="bg-blue-50 p-3 rounded mb-2">
            <strong>Humidity (%):</strong> {formatArray(harvestData.humidity)}
          </p>
          <p className="bg-green-50 p-3 rounded">
            <strong>Chemicals (ppm):</strong>{" "}
            {formatArray(harvestData.chemicals)}
          </p>
        </div>
      </div>
    </div>
  );
}
