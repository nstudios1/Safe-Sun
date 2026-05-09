import { useApp } from "@/contexts/AppContext";
import { HourlyStrip } from "@/components/safesun/HourlyStrip";
import { minutesToBurn, uvColor } from "@/lib/uv";
import { GoldenHour } from "@/components/safesun/GoldenHour";
import { Droplets, Wind, CloudRain } from "lucide-react";

export default function Insights() {
  const { weather, skinType, beachMode, t } = useApp();

  return (
    <div className="px-4 pt-6 pb-32 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-shadow-lg animate-fade-up">{t("insightsTitle")}</h1>

      {weather && (
        <>
          <div className="grid grid-cols-2 gap-3 animate-fade-up">
            <div className="glass p-5">
              <div className="text-xs uppercase tracking-widest opacity-80">{t("peakUV")}</div>
              <div className="text-4xl font-bold mt-1 text-shadow-lg" style={{ color: uvColor(weather.peakUV) }}>{weather.peakUV.toFixed(1)}</div>
              <div className="text-xs opacity-80 mt-1">{t("peakAt")} {new Date(weather.peakTime).getHours()}:00</div>
            </div>
            <div className="glass p-5">
              <div className="text-xs uppercase tracking-widest opacity-80">{t("safeExposure")}</div>
              <div className="text-4xl font-bold mt-1 text-shadow-lg">{(() => {
                const base = minutesToBurn(weather.uv, skinType);
                return beachMode ? Math.max(1, Math.round(base * 0.8)) : base;
              })()}</div>
              <div className="text-xs opacity-80 mt-1">{t("minToBurn")}</div>
            </div>
          </div>
          <GoldenHour />
          <HourlyStrip />
          <div className="glass p-5 animate-fade-up">
            <h3 className="text-sm uppercase tracking-widest opacity-80 mb-3">{t("nextHoursDetail")}</h3>
            <div className="space-y-2">
              {weather.hourly.map((h, i) => {
                const d = new Date(h.time);
                const label = d.getHours().toString().padStart(2, "0") + ":00";
                const tempF = Math.round((h.temp * 9) / 5 + 32);
                const gustMph = Math.round(h.windGust * 0.621371);
                return (
                  <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-xs font-mono opacity-80 w-12">{label}</div>
                      <div className="text-base font-semibold">{tempF}°F</div>
                    </div>
                    <div className="flex items-center gap-3 text-xs opacity-90">
                      <span className="flex items-center gap-1"><Droplets size={12} />{Math.round(h.humidity)}%</span>
                      <span className="flex items-center gap-1"><Wind size={12} />{gustMph} mph</span>
                      <span className="flex items-center gap-1"><CloudRain size={12} />{Math.round(h.precipProb)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
