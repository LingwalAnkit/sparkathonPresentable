import Lottie from "lottie-react";
import transit from "../../../../assets/lottie/transport.json";

export default function LiveSensorData({ current }) {
  return (
    <div className="flex flex-col  items-center">
      <div className="flex flex-row gap-6 mb-6 w-full">
        <div className="bg-white rounded-xl shadow-md p-6 border text-center w-96">
          <h4 className="font-semibold text-gray-700 mb-2">🌡️ Temperature</h4>
          <p className="text-3xl font-bold text-blue-600">
            {current ? `${current.t}°C` : "Initializing..."}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {current ? `During ${current.phase}` : ""}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border text-center w-96">
          <h4 className="font-semibold text-gray-700 mb-2">
            🍃 Ethylene Level
          </h4>
          <p className="text-3xl font-bold text-green-600">
            {current ? `${current.e} ppm` : "Initializing..."}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {current ? `Reading #${current.idx}` : ""}
          </p>
        </div>
      </div>
      <Lottie
        animationData={transit}
        style={{
          width: 400,
          height: 400,
          filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.2))",
        }}
        loop={true}
      />
    </div>
  );
}
