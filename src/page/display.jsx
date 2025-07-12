"use client";

import { motion } from "framer-motion";

export function Display() {
  return (
    <div className="flex justify-center items-center bg-gray-100">
      <div className="flex gap-8">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-64 bg-white p-8 rounded-2xl shadow-lg cursor-pointer transition-all duration-300 hover:shadow-2xl text-center"
        >
          <a href="/perishable" className="text-xl font-semibold text-gray-800">
            Perishable Goods
          </a>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-64 bg-white p-8 rounded-2xl shadow-lg cursor-pointer transition-all duration-300 hover:shadow-2xl text-center"
        >
          <a
            href="/electronics"
            className="text-xl font-semibold text-gray-800"
          >
            Electronics
          </a>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-64 bg-white p-8 rounded-2xl shadow-lg cursor-pointer transition-all duration-300 hover:shadow-2xl text-center"
        >
          <a href="/data" className="text-xl font-semibold text-gray-800">
            Data
          </a>
        </motion.div>
      </div>
    </div>
  );
}
