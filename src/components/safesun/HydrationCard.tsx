import { Droplets } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export function HydrationCard() {
  const { weather, t, timerEndsAt, timerRemaining } = useApp();
  if (!weather) return null;
  const uv = weather.uv;
  // Goal glasses (250ml) scale with UV: 6 baseline up to 12 in extreme
  const goal = uv >= 11 ? 12 : uv >= 8 ? 10 : uv >= 6 ? 9 : uv >= 3 ? 8 : 6;
  // Estimate consumed via timer elapsed (proxy for time outside)
  const TWO_H = 2 * 60 * 60 * 1000;
  const elapsedFrac = timerEndsAt ? Math.min(1, 1 - timerRemaining / TWO_H) : 0;
  const baseFrac = Math.min(1, 0.25 + elapsedFrac * 0.6);
  const consumed = Math.round(goal * baseFrac);
  const pct = Math.min(100, (consumed / goal) * 100);

  const tip =
    uv <= 2 ? t("waterReminderLow") : uv <= 7 ? t("waterReminderMid") : t("waterReminderHigh");

  const accent = uv >= 8 ? "hsl(0 95% 65%)" : uv >= 6 ? "hsl(15 100% 65%)" : uv >= 3 ? "hsl(195 95% 60%)" : "hsl(190 90% 65%)";

  return (
    <div className="glass p-4 animate-fade-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{ color: accent, background: `radial-gradient(circle, ${accent}33, transparent 70%)`, boxShadow: `0 0 18px ${accent}66` }}
          >
            <Droplets size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">{t("hydration")}</div>
            <div className="text-[10px] uppercase tracking-widest opacity-70">{t("hydrationGoal")}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-base font-bold tabular-nums">{consumed}/{goal}</div>
          <div className="text-[10px] uppercase tracking-widest opacity-70">{t("glasses")}</div>
        </div>
      </div>
      <div className="relative h-2.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, hsl(195 95% 60%), ${accent})`,
            boxShadow: `0 0 14px ${accent}99`,
          }}
        />
      </div>
      <div className="text-[11px] opacity-90 mt-2 leading-snug" style={{ textShadow: "0 1px 6px hsl(0 0% 0% / 0.4)" }}>
        {tip}
      </div>
    </div>
  );
}