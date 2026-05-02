import { useApp } from "@/contexts/AppContext";
import { HourlyStrip } from "@/components/safesun/HourlyStrip";
import { minutesToBurn, uvColor } from "@/lib/uv";

export default function Insights() {
  const { weather, skinType, t } = useApp();

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
              <div className="text-4xl font-bold mt-1 text-shadow-lg">{minutesToBurn(weather.uv, skinType)}</div>
              <div className="text-xs opacity-80 mt-1">{t("minToBurn")}</div>
            </div>
          </div>
          <HourlyStrip />
        </>
      )}
    </div>
  );
}
