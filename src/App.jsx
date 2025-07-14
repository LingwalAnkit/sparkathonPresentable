import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { config } from "./config";

import { Display } from "./page/display";
import TransportLifeCycle from "./page/perishableHarvest";
import Electronics from "./page/electronics";
import AppleDataDisplay from "./page/data";
import AppleList from "./page/goodsDisplayList";
import RouteLanding from "./page/home";

import AdminNavbar from "./components/layout/adminNav";
import ApplesNavbar from "./components/layout/applesNav";

// React Query client
const queryClient = new QueryClient();

// Dynamic Navbar inside Router context
function DynamicNavbar() {
  const location = useLocation();
  const path = location.pathname;

  const isApplesPage = path === "/apples";
  const isAdminPage = [
    "/perishable",
    "/electronics",
    "/display",
    "/data",
  ].includes(path);

  if (isApplesPage) return <ApplesNavbar />;
  if (isAdminPage) return <AdminNavbar />;
  return null;
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#ffffff",
            color: "#374151",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
        }}
      />

      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <div className="min-h-screen flex flex-col">
              {/* Header */}
              <header className="sticky top-0 z-50 bg-gray-100 backdrop-blur-md">
                <div className="max-w-7xl mx-auto">
                  <DynamicNavbar />
                </div>
              </header>

              {/* Main Content */}
              <main className="flex-1 relative">
                <div className="absolute inset-0 bg-gray-100 pointer-events-none" />
                <div className="relative z-10 w-full h-full">
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <div className="container mx-auto px-4 py-8">
                          <RouteLanding />
                        </div>
                      }
                    />
                    <Route
                      path="/display"
                      element={
                        <div className="container mx-auto px-4 py-8">
                          <Display />
                        </div>
                      }
                    />
                    <Route
                      path="/perishable"
                      element={
                        <div className="container mx-auto px-4 py-8">
                          <TransportLifeCycle />
                        </div>
                      }
                    />
                    <Route
                      path="/electronics"
                      element={
                        <div className="container mx-auto px-4 py-8">
                          <Electronics />
                        </div>
                      }
                    />
                    <Route
                      path="/data"
                      element={
                        <div className="container mx-auto px-4 py-8">
                          <AppleDataDisplay />
                        </div>
                      }
                    />
                    <Route path="/apples" element={<AppleList />} />

                    {/* 404 Page */}
                    <Route
                      path="*"
                      element={
                        <div className="container mx-auto px-4 py-16 text-center">
                          <div className="max-w-md mx-auto">
                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
                              <div className="text-6xl mb-4">🔍</div>
                              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                                Page Not Found
                              </h1>
                              <p className="text-gray-600 mb-6">
                                The page you're looking for doesn't exist.
                              </p>
                              <button
                                onClick={() => window.history.back()}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                              >
                                Go Back
                              </button>
                            </div>
                          </div>
                        </div>
                      }
                    />
                  </Routes>
                </div>
              </main>

              {/* Footer */}
              <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200/50 py-6">
                <div className="max-w-8xl mx-auto px-4 text-center">
                  <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                    <span>© 2025 Blockchain Supply Chain</span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span>Powered by Web3 Technology</span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span>Secure & Transparent</span>
                  </div>
                </div>
              </footer>
            </div>
          </Router>
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  );
}
