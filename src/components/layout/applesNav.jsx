// components/ApplesNavbar.jsx
import { useNavigate } from "react-router-dom";

export default function ApplesNavbar() {
  const navigate = useNavigate();

  return (
    <nav className="bg-gray-100 shadow-md px-6 py-4 flex items-center justify-between rounded-2xl mt-6">
      <h1 className="text-xl font-bold">User Dashboard</h1>
      <button
        onClick={() => navigate("/")}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Home
      </button>
    </nav>
  );
}
