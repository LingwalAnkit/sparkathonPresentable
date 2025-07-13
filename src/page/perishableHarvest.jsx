"use client";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HarvestForm from "../features/perishable/harvest/harvestform";
import TransportForm from "../features/perishable/transit/transportForm";
import StorageMonitor from "../features/perishable/store/store";
import Lottie from "lottie-react";
import tractor from "../assets/lottie/tractor.json";
import toast from "react-hot-toast";

export default function TransportLifeCycle() {
  const [appleId, setAppleId] = useState(null);
  const [stage, setStage] = useState("HARVEST");
  const [showFx, setShowFx] = useState(false);

  const handleHarvestComplete = (id) => {
    console.log("🎯 handleHarvestComplete called with ID:", id);
    setAppleId(id);
    next("TRANSIT");
  };

  const handleTransitComplete = async () => {
    console.log("🎯 handleTransitComplete called");

    setShowFx(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStage("STORAGE");
    } catch (error) {
      console.error("Transition error:", error);
      toast.error("Failed to transition to storage");
    } finally {
      setShowFx(false);
    }
  };

  const handleStorageComplete = (route) => {
    console.log("🎯 handleStorageComplete called with route:", route);
    next("DONE");
  };

  const next = (newStage) => {
    console.log("🔄 Transitioning from", stage, "to", newStage);
    setShowFx(true);
    setTimeout(() => {
      setStage(newStage);
      setShowFx(false);
    }, 5000); // 5-second animation duration
  };

  useEffect(() => {
    console.log("🔄 Stage changed to:", stage);
    console.log("🔍 Apple ID:", appleId);
  }, [stage, appleId]);

  return (
    <div className="p-6 w-full">
      <div>
        <h1 className="text-3xl font-bold text-blue-500 text-center mb-4">
          Perishable Good Lifecycle Tracker
        </h1>

        {appleId && (
          <p className="text-center pb-4">
            <b>Apple ID:</b> {appleId}
          </p>
        )}

        {/* Transition Lottie animation only */}
        <AnimatePresence>
          {showFx && (
            <motion.div
              key="fx"
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none bg-white bg-opacity-40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0.5, rotate: 10 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                <Lottie
                  animationData={tractor}
                  style={{
                    width: 300,
                    height: 300,
                    filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.2))",
                  }}
                  loop
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actual stage components */}
        <AnimatePresence mode="wait">
          {stage === "HARVEST" && !showFx && (
            <motion.div
              key="harvest"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.5 }}
            >
              <HarvestForm onHarvestComplete={handleHarvestComplete} />
            </motion.div>
          )}

          {stage === "TRANSIT" && !showFx && appleId && (
            <motion.div
              key="transit"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.5 }}
            >
              <TransportForm
                appleId={appleId}
                onTransitComplete={handleTransitComplete}
              />
            </motion.div>
          )}

          {stage === "STORAGE" && !showFx && appleId && (
            <motion.div
              key="storage"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.5 }}
            >
              <StorageMonitor
                appleId={appleId}
                state="WAREHOUSE"
                location="Main Warehouse"
                onRouteChange={handleStorageComplete}
              />
            </motion.div>
          )}

          {stage === "DONE" && !showFx && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-green-600 mb-4">
                  🎉 Lifecycle Complete!
                </h2>
                <p className="text-gray-600">
                  Apple #{appleId} has completed its full lifecycle tracking.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
