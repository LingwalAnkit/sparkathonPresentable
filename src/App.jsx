import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "./config";
import { Display } from "./page/display";
import TransportLifeCycle from "./page/perishableHarvest"; // new: 1 file = whole life-cycle
import Electronics from "./page/electronics";
import AdminNavbar from "./components/layout/adminNav";
import { Toaster } from "react-hot-toast";
import AppleDataDisplay from "./page/data";

const queryClient = new QueryClient();

export default function App() {
  return (
    <>
      <Toaster position="top-center" />
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <div className="min-h-screen flex flex-col bg-gray-100">
              {/* --------------- NAV --------------- */}
              <header className="w-full">
                <AdminNavbar />
              </header>

              {/* --------------- ROUTES --------------- */}
              <main className="flex-grow flex justify-center items-center">
                <Routes>
                  <Route path="/" element={<Display />} />
                  <Route
                    path="/perishable"
                    element={<TransportLifeCycle />}
                  />{" "}
                  {/* NEW */}
                  <Route path="/electronics" element={<Electronics />} />
                  <Route path="/data" element={<AppleDataDisplay />} />
                </Routes>
              </main>
            </div>
          </Router>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}
