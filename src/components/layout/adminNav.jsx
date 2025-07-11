import { useState } from "react";
import { Menu, X } from "lucide-react"; // or use heroicons if preferred
import ConnectWallets from "../ui/walletConnect";

function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <div className="text-2xl font-bold text-blue-600">AdminPanel</div>

      <ul className="hidden md:flex space-x-6 text-gray-700 font-medium items-center text-lg">
        <li>
          <a href="/perishable" className="hover:text-blue-600">
            Perishable
          </a>
        </li>
        <li>
          <a href="/electronic" className="hover:text-blue-600">
            Electronics
          </a>
        </li>
        <li>
          <ConnectWallets></ConnectWallets>
        </li>
      </ul>

      {/* Mobile Menu Button */}
      <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <ul className="absolute top-16 left-0 w-full bg-white shadow-md md:hidden flex flex-col items-center space-y-4 py-4 z-50">
          <li>
            <a href="/dashboard" className="hover:text-blue-600">
              Dashboard
            </a>
          </li>
          <li>
            <a href="/users" className="hover:text-blue-600">
              Users
            </a>
          </li>
          <li>
            <a href="/settings" className="hover:text-blue-600">
              Settings
            </a>
          </li>
          <li>
            <a href="/logout" className="hover:text-red-500">
              Logout
            </a>
          </li>
        </ul>
      )}
    </nav>
  );
}

export default AdminNavbar;
