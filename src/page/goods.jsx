import React, { useRef } from "react";
import goods from "../data/goods.json";

const ProductSlider = () => {
  const sliderRef = useRef(null);
  let isDown = false;
  let startX;
  let scrollLeft;

  const handleMouseDown = (e) => {
    isDown = true;
    startX = e.pageX - sliderRef.current.offsetLeft;
    scrollLeft = sliderRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown = false;
  };

  const handleMouseUp = () => {
    isDown = false;
  };

  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="bg-gray-100 min-h-screen px-6 py-10 overflow-hidden">
      <h2 className="text-2xl font-bold mb-6">Perishable Goods</h2>

      <div
        ref={sliderRef}
        className="flex gap-6 overflow-x-auto px-4 py-4 no-scrollbar cursor-pointer select-none"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {goods.map((item) => (
          <div
            key={item.id}
            className="min-w-[320px] max-w-[320px] flex-shrink-0 bg-white rounded-2xl shadow-md"
          >
            <div className="p-6 flex flex-col items-center">
              <div className="text-7xl">{item.image}</div>
              <div className="text-center mt-3 font-semibold text-base">
                {item.name}
              </div>
              <div className="text-sm text-gray-500">{item.description}</div>
              <div className="text-base font-semibold mt-2">₹{item.price}</div>
              <button className="mt-3 text-sm bg-pink-100 text-pink-600 rounded-full px-5 py-2 hover:bg-pink-200 transition">
                SHOW QR
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductSlider;
