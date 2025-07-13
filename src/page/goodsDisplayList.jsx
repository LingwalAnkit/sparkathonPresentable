import React, { useEffect, useState } from "react";
import { fetchApples } from "../services/displayService";

export default function AppleList() {
  const [apples, setApples] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchApples().then(setApples).catch(console.error);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-green-800">
        🍎 Blockchain Apples
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {apples.map((apple) => (
          <div
            key={apple.appleId}
            className="bg-white shadow-lg rounded-2xl p-4 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setSelected(apple)}
          >
            <img
              src="https://via.placeholder.com/300x180?text=Apple"
              alt="Apple"
              className="w-full h-40 object-cover rounded-xl mb-3"
            />
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=Apple%20ID%3A%20"
              alt="QR"
              className="w-20 h-20 mx-auto mb-2"
            />
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-700">
                ID: {apple.appleId}
              </p>
              <p className="text-sm text-green-600">
                Freshness: {apple.freshnessScore}/100
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-80 relative shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-center text-green-700 mb-4">
              Apple #{selected.appleId}
            </h3>
            <p className="text-sm text-gray-600">
              <strong>Temperature:</strong> {selected.temperature}°C
            </p>
            <p className="text-sm text-gray-600">
              <strong>Ethylene Level:</strong> {selected.ethyleneLevel} ppm
            </p>
            <p className="text-sm text-gray-600">
              <strong>Price:</strong> ₹{selected.price}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Freshness:</strong> {selected.freshnessScore}/100
            </p>
            <button
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg w-full hover:bg-green-700"
              onClick={() => setSelected(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
