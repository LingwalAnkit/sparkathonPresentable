import { BarChart3 } from "lucide-react";

export default function JourneyMetrics({ metrics }) {
  if (!metrics) return null;

  return (
    <div className="bg-white shadow-md rounded-xl p-6 border mb-6">
      <div className="flex items-center  mb-4 gap-2">
        <BarChart3 />
        <span className="text-xl font-bold">Journey Analytics</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Time</p>
          <p className="text-lg font-semibold">{metrics.totalTime} hours</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Distance</p>
          <p className="text-lg font-semibold">{metrics.distanceCovered} km</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Avg Speed</p>
          <p className="text-lg font-semibold">{metrics.averageSpeed} km/h</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Fuel Efficiency</p>
          <p className="text-lg font-semibold">{metrics.fuelEfficiency} km/l</p>
        </div>
      </div>
    </div>
  );
}
