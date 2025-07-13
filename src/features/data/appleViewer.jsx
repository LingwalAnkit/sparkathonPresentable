// AppleDataViewer.jsx
"use client";
import { useState, useEffect } from "react";
import { usePublicClient } from "wagmi";
import AppleLifecycleABI from "../../abi/apple.json";
import toast from "react-hot-toast";

import Header from "./components/Header";
import SearchControls from "./components/SearchControls";
import LoadingSpinner from "./components/LoadingSpinner";
import ApplesList from "./components/ApplesList";
import AppleDetails from "./components/AppleDetails";

const CONTRACT = {
  address: "0x236bD8706661db41730C69BB628894E4bc7b040A",
  abi: AppleLifecycleABI.abi,
};

export default function AppleDataViewer() {
  const [currentView, setCurrentView] = useState("list"); // "list" or "details"
  const [selectedAppleId, setSelectedAppleId] = useState("");
  const [selectedAppleData, setSelectedAppleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allApples, setAllApples] = useState([]);
  const [nextAppleId, setNextAppleId] = useState(0);

  const publicClient = usePublicClient();

  // Load all apples on component mount
  useEffect(() => {
    fetchAllApplesOnLoad();
  }, []);

  const fetchAllApplesOnLoad = async () => {
    setLoading(true);
    try {
      // First get the total count
      const nextId = await publicClient.readContract({
        ...CONTRACT,
        functionName: "nextAppleId",
      });
      setNextAppleId(Number(nextId));

      // Then fetch all existing apples
      const apples = [];
      for (let i = 0; i < Number(nextId); i++) {
        try {
          const exists = await publicClient.readContract({
            ...CONTRACT,
            functionName: "appleExists",
            args: [BigInt(i)],
          });

          if (exists) {
            const data = await publicClient.readContract({
              ...CONTRACT,
              functionName: "getApple",
              args: [BigInt(i)],
            });
            apples.push(data);
          }
        } catch (error) {
          console.error(`Error fetching apple ${i}:`, error);
        }
      }

      setAllApples(apples);
      toast.success(`Loaded ${apples.length} apples`);
    } catch (error) {
      console.error("Error loading apples:", error);
      toast.error("Failed to load apples");
    }
    setLoading(false);
  };

  const fetchAppleById = async (id) => {
    if (!id) return;

    setLoading(true);
    try {
      const exists = await publicClient.readContract({
        ...CONTRACT,
        functionName: "appleExists",
        args: [BigInt(id)],
      });

      if (!exists) {
        toast.error(`Apple #${id} does not exist`);
        setLoading(false);
        return;
      }

      const data = await publicClient.readContract({
        ...CONTRACT,
        functionName: "getApple",
        args: [BigInt(id)],
      });

      setSelectedAppleData(data);
      setSelectedAppleId(id);
      setCurrentView("details");
      toast.success(`Data loaded for Apple #${id}`);
    } catch (error) {
      console.error("Error fetching apple data:", error);
      toast.error("Failed to fetch apple data: " + error.message);
    }
    setLoading(false);
  };

  const handleViewDetails = (apple) => {
    setSelectedAppleData(apple);
    setSelectedAppleId(Number(apple.id).toString());
    setCurrentView("details");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedAppleData(null);
    setSelectedAppleId("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <Header />

        <SearchControls
          onSearchById={fetchAppleById}
          onRefresh={fetchAllApplesOnLoad}
          loading={loading}
          totalApples={nextAppleId}
        />

        {loading && <LoadingSpinner />}

        {currentView === "list" && !loading && (
          <ApplesList
            apples={allApples}
            onViewDetails={handleViewDetails}
            loading={loading}
          />
        )}

        {currentView === "details" && selectedAppleData && (
          <AppleDetails
            appleData={selectedAppleData}
            onBackToList={handleBackToList}
          />
        )}
      </div>
    </div>
  );
}
