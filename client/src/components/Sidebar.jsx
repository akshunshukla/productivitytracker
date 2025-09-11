import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Target,
  BarChart2,
  Settings,
  LogOut,
  Bot,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";

const navLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/goals", icon: Target, label: "Goals" },
  { to: "/analytics", icon: BarChart2, label: "Analytics" },
  { to: "/ai-analysis", icon: Bot, label: "AI Analysis" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const Sidebar = () => {
  const { logout } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-gray-900 text-white">
      <div className="p-6">
        <h1 className="text-2xl font-bold">FocusFlow</h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navLinks.map((link) => (
          <NavLink
            key={link.label}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <link.icon className="w-5 h-5 mr-3" />
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
