import { useApp } from "@/contexts/AppContext";
import { vitaminDMinutes } from "@/lib/uv";

export function VitaminDRing() {
  const { weather, skinType, t, vitDMinutes } = useApp();
  if (!weather) return null;
  const goal = Math.max(5, vitaminDMinutes(weather.uv, skinType));
  const done = Math.min(goal, Math.round(vitDMinutes));
  const pct = goal > 0 ? done / goal : 0;
  const r = 42;
  const c = 2 * Math.PI * r;

  return (
    <div className="glass p-5 animate-fade-up flex items-center gap-5">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} stroke="hsl(0 0% 100% / 0.12)" strokeWidth="10" fill="none" />
        <circle
          cx="55" cy="55" r={r}
          stroke="url(#vd)" strokeWidth="10" fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          transform="rotate(-90 55 55)"
        />
        <defs>
          <linearGradient id="vd" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(45 100% 65%)" />
            <stop offset="100%" stopColor="hsl(28 100% 60%)" />
          </linearGradient>
        </defs>
        <text x="55" y="60" textAnchor="middle" fontSize="22" fontWeight="700" fill="white">{Math.round(pct * 100)}%</text>
      </svg>
      <div>
        <div className="text-xs uppercase tracking-widest opacity-80">{t("vitaminD")}</div>
        <div className="text-xl font-semibold mt-1">{done} / {goal} {t("minutes")}</div>
        <div className="text-xs opacity-80 mt-1">{t("dailyGoal")}</div>
      </div>
    </div>
  );
}
