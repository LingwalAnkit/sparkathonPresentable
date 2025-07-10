export default function LiveSensorData({ current }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div className="bg-white rounded-xl shadow-md p-6 border text-center">
        <h4 className="font-semibold text-gray-700 mb-2">🌡️ Temperature</h4>
        <p className="text-3xl font-bold text-blue-600">
          {current ? `${current.t}°C` : "Initializing..."}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {current ? `During ${current.phase}` : ""}
        </p>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6 border text-center">
        <h4 className="font-semibold text-gray-700 mb-2">🍃 Ethylene Level</h4>
        <p className="text-3xl font-bold text-green-600">
          {current ? `${current.e} ppm` : "Initializing..."}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {current ? `Reading #${current.idx}` : ""}
        </p>
      </div>
    </div>
  );
}
