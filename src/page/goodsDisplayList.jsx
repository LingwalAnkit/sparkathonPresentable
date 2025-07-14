import { useEffect, useState } from "react";
import {
  Apple,
  Thermometer,
  Wind,
  IndianRupee,
  Gauge,
  QrCode,
  X,
} from "lucide-react";
import displayService from "../services/displayService";
import appleImg from "../assets/fruit/apple.svg";

export default function AppleList() {
  const [apples, setApples] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    displayService.subscribeToAppleUpdates((data) => {
      console.log("New apple data received:", data);
      setApples(data);
    });

    return () => {
      displayService.unsubscribeFromAppleUpdates();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br bg-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Apple className="w-12 h-12 text-green-600 mr-3" />
            <h1 className="text-4xl font-bold text-green-800">
              Blockchain Apples
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Track your fresh apples on the blockchain
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {apples.map((apple) => (
            <div
              key={apple.appleId}
              className="bg-white shadow-xl rounded-3xl p-6 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 w-80 border border-green-100"
              onClick={() => setSelected(apple)}
            >
              <div className="relative mb-6">
                <img
                  src={appleImg}
                  alt="Apple"
                  className="w-full h-48 object-cover rounded-2xl"
                />
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-3 shadow-lg">
                  <QrCode className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="text-center space-y-3">
                <div className="flex items-center justify-center">
                  <Apple className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="text-xl font-bold text-gray-800">
                    Apple #{apple.appleId}
                  </h3>
                </div>

                <div className="flex items-center justify-center">
                  <Gauge className="w-4 h-4 text-emerald-500 mr-2" />
                  <span className="text-emerald-600 font-semibold">
                    Price: {apple.price}
                  </span>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                  View Details
                </div>
              </div>
            </div>
          ))}
        </div>

        {apples.length === 0 && (
          <div className="text-center py-16">
            <Apple className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No apples available</p>
          </div>
        )}
      </div>

      {/* Enhanced Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 w-80 h-[450px] relative shadow-2xl transform transition-all flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setSelected(null)}
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-3">
              <div className="bg-green-100 rounded-full p-2 w-12 h-12 mx-auto mb-2">
                <Apple className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-green-800 mb-1">
                Apple #{selected.appleId}
              </h3>
              <div className="w-12 h-0.5 bg-green-500 mx-auto rounded-full"></div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center p-2 bg-blue-50 rounded-lg">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <Thermometer className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">
                    Temperature
                  </p>
                  <p className="text-sm font-bold text-blue-600">
                    {selected.temperature}°C
                  </p>
                </div>
              </div>

              <div className="flex items-center p-2 bg-purple-50 rounded-lg">
                <div className="bg-purple-100 rounded-full p-2 mr-3">
                  <Wind className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">
                    Ethylene Level
                  </p>
                  <p className="text-sm font-bold text-purple-600">
                    {selected.ethyleneLevel} ppm
                  </p>
                </div>
              </div>

              <div className="flex items-center p-2 bg-orange-50 rounded-lg">
                <div className="bg-orange-100 rounded-full p-2 mr-3">
                  <IndianRupee className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Price</p>
                  <p className="text-sm font-bold text-orange-600">
                    ₹{selected.price}
                  </p>
                </div>
              </div>

              <div className="flex items-center p-2 bg-green-50 rounded-lg">
                <div className="bg-green-100 rounded-full p-2 mr-3">
                  <Gauge className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-medium">
                    Freshness Score
                  </p>
                  <div className="flex items-center">
                    <p className="text-sm font-bold text-green-600 mr-2">
                      {selected.freshnessScore}/100
                    </p>
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${selected.freshnessScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg w-full hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg text-sm"
              onClick={() => setSelected(null)}
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
