import { MapPin } from "lucide-react";

export default function JourneyProgress({ journeyInfo }) {
  if (!journeyInfo) return null;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border mb-6 w-1/2">
      <h3 className="flex items-center  mb-4 gap-2">
        <MapPin />
        <span className="text-lg font-semibold">Journey Progress</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Current Phase:</p>
          <p className="font-semibold text-blue-600">
            {journeyInfo.stateDescription}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Progress:</p>
          <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${journeyInfo.progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {journeyInfo.progress}% Complete
          </p>
        </div>
      </div>
    </div>
  );
}
