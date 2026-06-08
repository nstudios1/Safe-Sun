import { Droplet, Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { locationNow } from "@/lib/weather";

const LS_KEY = "ss_hydration_v1";

interface Stored {
  date: string; // YYYY-MM-DD in city local tz
  count: number;
}

function loadStored(): Stored {
  try {
    const v = localStorage.getItem(LS_KEY);
    if (v) return JSON.parse(v);
  } catch {}
  return { date: "", count: 0 };
}

function cityDateKey(offsetSec: number): string {
  return locationNow(offsetSec).toISOString().slice(0, 10);
}

export function HydrationCard() {
  const { weather, t } = useApp();
  const offsetSec = weather?.utcOffsetSec ?? 0;
  const [count, setCount] = useState<number>(0);
  const initRef = useRef(false);

  // Sync from storage; reset when city's local date rolls over.
  useEffect(() => {
    const today = cityDateKey(offsetSec);
    const stored = loadStored();
    const next = stored.date === today ? Math.max(0, stored.count | 0) : 0;
    setCount(next);
    if (stored.date !== today) {
      try { localStorage.setItem(LS_KEY, JSON.stringify({ date: today, count: 0 })); } catch {}
    }
    initRef.current = true;
  }, [offsetSec]);

  // Persist on change.
  useEffect(() => {
    if (!initRef.current) return;
    const today = cityDateKey(offsetSec);
    try { localStorage.setItem(LS_KEY, JSON.stringify({ date: today, count })); } catch {}
  }, [count, offsetSec]);

  // Midnight roll-over check (every minute).
  useEffect(() => {
    const id = setInterval(() => {
      const today = cityDateKey(offsetSec);
      const stored = loadStored();
      if (stored.date && stored.date !== today) {
        setCount(0);
        try { localStorage.setItem(LS_KEY, JSON.stringify({ date: today, count: 0 })); } catch {}
      }
    }, 60 * 1000);
    return () => clearInterval(id);
  }, [offsetSec]);

  const uv = weather?.uv ?? 0;
  const tip = uv <= 2 ? t("waterReminderLow") : uv <= 7 ? t("waterReminderMid") : t("waterReminderHigh");

  const dec = () => setCount((c) => Math.max(0, (c | 0) - 1));
  const inc = () => setCount((c) => Math.max(0, (c | 0) + 1));

  return (
    <div className="glass p-5 animate-fade-up">
      <div className="flex items-center gap-2 mb-3">
        <Droplet size={18} className="text-[hsl(200_90%_70%)]" />
        <h3 className="font-semibold">{t("hydration")}</h3>
      </div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={dec}
          disabled={count <= 0}
          aria-label={t("removeGlass")}
          className="glass w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/20 active:scale-95 transition disabled:opacity-40 disabled:active:scale-100 touch-manipulation select-none"
        >
          <Minus size={20} />
        </button>
        <div className="text-center">
          <div className="text-4xl font-bold tabular-nums text-shadow-lg leading-none">{count}</div>
          <div className="text-[11px] uppercase tracking-widest opacity-80 mt-1">{t("glasses")}</div>
        </div>
        <button
          type="button"
          onClick={inc}
          aria-label={t("addGlass")}
          className="glass w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/20 active:scale-95 transition touch-manipulation select-none"
        >
          <Plus size={20} />
        </button>
      </div>
      <div className="text-center text-xs font-medium tracking-wide opacity-90 mt-4" style={{ textShadow: "0 1px 8px hsl(0 0% 0% / 0.4)" }}>
        {tip}
      </div>
    </div>
  );
}
