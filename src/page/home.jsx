// page/RouteLanding.jsx
import { ShieldCheck, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RouteLanding() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-3xl font-bold mb-8">Choose Access Type</h2>
      <div className="flex justify-center gap-8">
        {/* User Card */}
        <div
          onClick={() => navigate("/apples")}
          className="cursor-pointer bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition w-64"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <UserRound className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold">User</h3>
          </div>
          <p className="text-gray-600 text-sm">
            View product lifecycle and insights
          </p>
        </div>

        {/* Admin Card */}
        <div
          onClick={() => navigate("/display")}
          className="cursor-pointer bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition w-64"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShieldCheck className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-semibold">Admin</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Manage and monitor supply chain
          </p>
        </div>
      </div>
    </div>
  );
}
