import { Sunset } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

function fmtCountdown(ms: number) {
  if (ms <= 0) return "—";
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return h > 0 ? `${h}h ${mm}m` : `${mm}m`;
}

function fmtTime(iso: string, offsetSec: number) {
  if (!iso) return "—";
  // iso comes already in location-local clock format from open-meteo (no Z).
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function GoldenHourCard() {
  const { weather, t } = useApp();
  if (!weather || !weather.sunset) return null;
  // Local "now" at the location:
  const nowLocalMs = Date.now() + weather.utcOffsetSeconds * 1000;
  const sunsetLocalMs = new Date(weather.sunset + "Z").getTime(); // treat as UTC clock = local clock
  const goldenLocalMs = sunsetLocalMs - 60 * 60 * 1000; // 1h before sunset
  const untilGolden = goldenLocalMs - nowLocalMs;
  const untilSunset = sunsetLocalMs - nowLocalMs;

  return (
    <div className="glass p-5 animate-fade-up">
      <div className="flex items-center gap-2 mb-3 opacity-90">
        <Sunset size={16} />
        <h3 className="font-semibold">{t("goldenHour")}</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-2xl p-4"
          style={{ background: "linear-gradient(135deg, hsl(35 100% 55% / 0.25), hsl(15 90% 55% / 0.2))" }}
        >
          <div className="text-[10px] uppercase tracking-widest opacity-80">{t("untilGolden")}</div>
          <div className="text-2xl font-bold mt-1 text-shadow-lg">{fmtCountdown(untilGolden)}</div>
          <div className="text-[10px] opacity-70 mt-1">@ {fmtTime(weather.sunset, weather.utcOffsetSeconds).replace(/:\d\d$/, "")}</div>
        </div>
        <div
          className="rounded-2xl p-4"
          style={{ background: "linear-gradient(135deg, hsl(285 60% 45% / 0.3), hsl(220 60% 45% / 0.25))" }}
        >
          <div className="text-[10px] uppercase tracking-widest opacity-80">{t("untilSunset")}</div>
          <div className="text-2xl font-bold mt-1 text-shadow-lg">{fmtCountdown(untilSunset)}</div>
          <div className="text-[10px] opacity-70 mt-1">@ {fmtTime(weather.sunset, weather.utcOffsetSeconds)}</div>
        </div>
      </div>
      <div className="text-[10px] opacity-60 mt-3">{t("localTime")}: {weather.timezone}</div>
    </div>
  );
}
