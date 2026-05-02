import { Home, Search, BarChart3, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";

export function BottomNav() {
  const { t } = useApp();
  const items = [
    { to: "/", icon: Home, label: t("home") },
    { to: "/search", icon: Search, label: t("search") },
    { to: "/insights", icon: BarChart3, label: t("insights") },
    { to: "/settings", icon: Settings, label: t("settings") },
  ];
  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 glass-strong px-2 py-2 flex items-center gap-1 pb-safe" style={{ borderRadius: 28 }}>
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl transition ${isActive ? "bg-white/25 shadow-inner" : "hover:bg-white/10"}`
          }
        >
          <Icon size={20} />
          <span className="text-[10px] font-medium">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
