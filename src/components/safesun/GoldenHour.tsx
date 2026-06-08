import { Sun, Sunrise, Sunset } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { localIsoToUTCms } from "@/lib/weather";

function fmtCountdown(ms: number): string {
  if (ms <= 0) return "—";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  const sec = s % 60;
  return `${m}m ${sec}s`;
}

function fmtTime(iso: string): string {
  if (!iso) return "—";
  // Keep wall-clock as the location reports it (open-meteo returns local time).
  const m = iso.match(/T(\d{2}):(\d{2})/);
  if (!m) return iso;
  const h = +m[1];
  const mi = m[2];
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${mi} ${ampm}`;
}

export function GoldenHour() {
  const { weather, t } = useApp();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!weather?.sunset) return null;

  const sunsetMs = localIsoToUTCms(weather.sunset, weather.utcOffsetSec);
  const sunriseMs = weather.sunrise ? localIsoToUTCms(weather.sunrise, weather.utcOffsetSec) : 0;
  const goldenStart = sunsetMs - 60 * 60 * 1000;
  const inGolden = now >= goldenStart && now < sunsetMs;
  const toGolden = goldenStart - now;
  const toSunset = sunsetMs - now;
  const passed = now >= sunsetMs;

  return (
    <div className="glass p-5 animate-fade-up">
      <div className="flex items-center gap-2 mb-3 opacity-90">
        <Sun size={16} className="text-[hsl(45_100%_65%)]" />
        <h3 className="font-semibold">{t("goldenHour")}</h3>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
          <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-widest opacity-80"><Sunrise size={12} />{t("sunrise")}</div>
          <div className="text-lg font-bold mt-1">{fmtTime(weather.sunrise)}</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-[hsl(45_100%_55%/0.25)] to-[hsl(28_100%_55%/0.25)] border border-white/15 p-3">
          <div className="text-[10px] uppercase tracking-widest opacity-90">{t("goldenHour")}</div>
          <div className="text-lg font-bold mt-1 text-shadow-lg">
            {passed ? "PASSED" : inGolden ? t("nowText") : `${t("inText")} ${fmtCountdown(toGolden)}`}
          </div>
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
          <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-widest opacity-80"><Sunset size={12} />{t("sunset")}</div>
          <div className="text-lg font-bold mt-1">{fmtTime(weather.sunset)}</div>
          {toSunset > 0
            ? <div className="text-[10px] opacity-70 mt-0.5">{t("inText")} {fmtCountdown(toSunset)}</div>
            : <div className="text-[10px] opacity-70 mt-0.5">PASSED</div>}
        </div>
      </div>
    </div>
  );
}
