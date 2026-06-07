import { Droplets, Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";

const LS_KEY = "ss_hydration";

// "YYYY-MM-DD" in the city's local timezone, derived from UTC offset.
function cityDateKey(offsetSec: number): string {
  const local = new Date(Date.now() + offsetSec * 1000);
  return local.toISOString().slice(0, 10);
}

function loadStore(): { date: string; count: number } {
  try {
    const v = localStorage.getItem(LS_KEY);
    if (v) return JSON.parse(v);
  } catch {}
  return { date: "", count: 0 };
}

export function HydrationCard() {
  const { weather, t } = useApp();
  const offsetSec = weather?.utcOffsetSeconds ?? 0;
  const today = useMemo(() => cityDateKey(offsetSec), [offsetSec]);

  const [count, setCount] = useState<number>(() => {
    const s = loadStore();
    return s.date === cityDateKey(offsetSec) ? Math.max(0, s.count | 0) : 0;
  });

  // Auto-reset when the city's local date changes (e.g. searched new city or
  // midnight passes in current city).
  useEffect(() => {
    const s = loadStore();
    if (s.date !== today) {
      setCount(0);
      localStorage.setItem(LS_KEY, JSON.stringify({ date: today, count: 0 }));
    }
  }, [today]);

  // Re-check at every minute in case midnight passes while the app is open.
  useEffect(() => {
    const id = setInterval(() => {
      const key = cityDateKey(offsetSec);
      const s = loadStore();
      if (s.date !== key) {
        setCount(0);
        localStorage.setItem(LS_KEY, JSON.stringify({ date: key, count: 0 }));
      }
    }, 60 * 1000);
    return () => clearInterval(id);
  }, [offsetSec]);

  const persist = (n: number) => {
    const safe = Math.max(0, n | 0);
    setCount(safe);
    localStorage.setItem(LS_KEY, JSON.stringify({ date: today, count: safe }));
  };

  if (!weather) return null;

  const uv = weather.uv;
  const goal = uv >= 11 ? 12 : uv >= 8 ? 10 : uv >= 6 ? 9 : uv >= 3 ? 8 : 6;
  const pct = Math.min(100, (count / goal) * 100);
  const tip = uv <= 2 ? t("waterReminderLow") : uv <= 7 ? t("waterReminderMid") : t("waterReminderHigh");
  const accent = uv >= 8 ? "hsl(0 95% 65%)" : uv >= 6 ? "hsl(15 100% 65%)" : uv >= 3 ? "hsl(195 95% 60%)" : "hsl(190 90% 65%)";

  const btnBase = "w-10 h-10 rounded-full glass flex items-center justify-center active:scale-95 transition disabled:opacity-40 disabled:active:scale-100 touch-manipulation select-none";

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
          <div className="text-base font-bold tabular-nums">{count}/{goal}</div>
          <div className="text-[10px] uppercase tracking-widest opacity-70">{t("glasses")}</div>
        </div>
      </div>

      <div className="relative h-2.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, hsl(195 95% 60%), ${accent})`,
            boxShadow: `0 0 14px ${accent}99`,
          }}
        />
      </div>

      <div className="flex items-center justify-between mt-3">
        <button
          type="button"
          aria-label="remove glass"
          className={btnBase}
          disabled={count <= 0}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); persist(count - 1); }}
        >
          <Minus size={18} />
        </button>
        <div className="text-[11px] opacity-90 px-3 text-center leading-snug" style={{ textShadow: "0 1px 6px hsl(0 0% 0% / 0.4)" }}>
          {tip}
        </div>
        <button
          type="button"
          aria-label="add glass"
          className={btnBase}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); persist(count + 1); }}
          style={{ color: accent, boxShadow: `0 0 14px ${accent}55` }}
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}