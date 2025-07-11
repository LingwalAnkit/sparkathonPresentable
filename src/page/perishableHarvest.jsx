"use client";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HarvestForm from "../features/perishable/harvest/harvestform";
import TransportForm from "../features/perishable/transit/transportForm";
import StorageMonitor from "../features/perishable/store/store";
import Lottie from "lottie-react";
import tractor from "../assets/lottie/tractor.json";

export default function TransportLifeCycle() {
  const [appleId, setAppleId] = useState(null);
  const [stage, setStage] = useState("HARVEST");
  const [showFx, setShowFx] = useState(false);

  const handleHarvestComplete = (id) => {
    console.log("🎯 handleHarvestComplete called with ID:", id);
    setAppleId(id);
    next("TRANSIT");
  };

  const handleTransitComplete = () => {
    console.log("🎯 handleTransitComplete called");
    next("STORAGE");
  };

  const handleStorageComplete = (route) => {
    console.log("🎯 handleStorageComplete called with route:", route);
    if (route === "COMPLETED") {
      next("DONE");
    } else {
      // Handle other routes like CHARITY, COLD_CHAMBER, SALE
      next("DONE");
    }
  };

  const next = (newStage) => {
    console.log("🔄 Transitioning from", stage, "to", newStage);
    setShowFx(true);
    setTimeout(() => {
      setStage(newStage);
      setShowFx(false);
    }, 1000);
  };

  useEffect(() => {
    console.log("🔄 Stage changed to:", stage);
    console.log("🔍 Apple ID:", appleId);
  }, [stage, appleId]);

  return (
    <div className="p-6 w-full">
      <h1 className="text-3xl font-bold text-blue-500 text-center mb-4">
        Perishable Good Lifecycle Tracker
      </h1>

      <div>
        {appleId && (
          <p className="text-center pb-4">
            <b>Apple ID:</b> {appleId}
          </p>
        )}

        {/* transition overlay */}
        <AnimatePresence>
          {showFx && (
            <motion.div
              key="fx"
              className="fixed inset-0 flex items-center justify-center bg-white/80 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Lottie animationData={tractor} style={{ width: 250 }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* actual stages */}
        <AnimatePresence mode="wait">
          {stage === "HARVEST" && !showFx && (
            <motion.div
              key="harvest"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
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
            <motion.div key="done">
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
