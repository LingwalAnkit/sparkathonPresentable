// components/TransportData.jsx
import { formatTimestamp, formatArray } from "../../../utils/formatters";

export default function TransportData({ transportData }) {
  const calculateDuration = (start, end) => {
    const durationMinutes = Math.floor((Number(end) - Number(start)) / 60);
    return durationMinutes < 60
      ? `${durationMinutes} minutes`
      : `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`;
  };

  // Parse GPS coordinates from contract strings
  const parseGPSCoordinates = () => {
    if (
      !transportData.gpsCoordinates ||
      transportData.gpsCoordinates.length === 0
    ) {
      return [];
    }

    return transportData.gpsCoordinates
      .map((coord, index) => {
        try {
          // Assuming format: "latitude,longitude"
          const [lat, lng] = coord.split(",").map(Number);
          return { lat, lng, index: index + 1 };
        } catch (error) {
          console.log(error);
          console.error(`Invalid GPS coordinate: ${coord}`);
          return null;
        }
      })
      .filter((coord) => coord !== null);
  };

  const gpsCoords = parseGPSCoordinates();

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold text-blue-600 mb-4">
        🚛 Transport Data
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Timeline */}
        <div>
          <h4 className="font-semibold mb-3">Journey Timeline</h4>
          <div className="space-y-2">
            <p className="bg-blue-50 p-3 rounded">
              <strong>Started:</strong>{" "}
              {formatTimestamp(transportData.startTimestamp)}
            </p>
            <p className="bg-green-50 p-3 rounded">
              <strong>Ended:</strong>{" "}
              {formatTimestamp(transportData.endTimestamp)}
            </p>
            <p className="bg-purple-50 p-3 rounded">
              <strong>Duration:</strong>{" "}
              {calculateDuration(
                transportData.startTimestamp,
                transportData.endTimestamp
              )}
            </p>
          </div>
        </div>

        {/* Environmental Data */}
        <div>
          <h4 className="font-semibold mb-3">Environmental Readings</h4>
          <div className="space-y-2">
            <p className="bg-red-50 p-3 rounded">
              <strong>Temperatures (°C):</strong>{" "}
              {formatArray(transportData.temperatures)}
            </p>
            <p className="bg-yellow-50 p-3 rounded">
              <strong>Ethylene (ppm):</strong>{" "}
              {formatArray(transportData.ethyleneLevels)}
            </p>
          </div>
        </div>
      </div>

      {/* GPS Route */}
      <div className="mt-6">
        <h4 className="font-semibold mb-3">
          GPS Route ({transportData.gpsCoordinates.length} points)
        </h4>
        {gpsCoords.length > 0 ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Start Point</p>
                <p className="font-mono text-sm">
                  {gpsCoords[0].lat}, {gpsCoords[0].lng}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">End Point</p>
                <p className="font-mono text-sm">
                  {gpsCoords[gpsCoords.length - 1].lat},{" "}
                  {gpsCoords[gpsCoords.length - 1].lng}
                </p>
              </div>
            </div>

            <div className="max-h-40 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">#</th>
                    <th className="p-2 text-left">Latitude</th>
                    <th className="p-2 text-left">Longitude</th>
                  </tr>
                </thead>
                <tbody>
                  {gpsCoords.map((coord) => (
                    <tr key={coord.index} className="border-b">
                      <td className="p-2">{coord.index}</td>
                      <td className="p-2 font-mono">{coord.lat.toFixed(6)}</td>
                      <td className="p-2 font-mono">{coord.lng.toFixed(6)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-yellow-700">
              ⚠️ No GPS coordinates recorded during transport
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
