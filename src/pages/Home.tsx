import { useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { UVGauge } from "@/components/safesun/UVGauge";
import { WeatherCard } from "@/components/safesun/WeatherCard";
import { ProtectionPlan } from "@/components/safesun/ProtectionPlan";
import { SunscreenTimer } from "@/components/safesun/SunscreenTimer";
import { VitaminDRing } from "@/components/safesun/VitaminDRing";
import { HourlyStrip } from "@/components/safesun/HourlyStrip";
import { UVAlert } from "@/components/safesun/UVAlert";
import { Disclaimer } from "@/components/safesun/Disclaimer";
import { TropicalCaution } from "@/components/safesun/TropicalCaution";
import { MapPin, RefreshCw } from "lucide-react";

export default function Home() {
  const { weather, location, useGPS, refresh, loading, t } = useApp();
  useEffect(() => { if (!location) useGPS(); }, []); // eslint-disable-line

  return (
    <div className="px-4 pt-6 pb-32 max-w-xl mx-auto">
      <header className="flex items-center justify-between mb-5 animate-fade-up">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] opacity-80">{t("appName")}</div>
          <div className="flex items-center gap-1 text-lg font-semibold">
            <MapPin size={16} className="opacity-80" />
            <span className="text-shadow">{location?.name || "—"}</span>
          </div>
        </div>
        <button onClick={refresh} className="glass p-3 hover:bg-white/20 transition" aria-label="refresh">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </header>

      {weather ? (
        <div className="space-y-4">
          <UVAlert />
          <TropicalCaution />
          <div className="glass-strong p-6 flex flex-col items-center animate-fade-up">
            <UVGauge uv={weather.uv} />
          </div>
          <WeatherCard />
          <ProtectionPlan />
          <SunscreenTimer />
          <VitaminDRing />
          <HourlyStrip />
          <Disclaimer />
        </div>
      ) : (
        <div className="glass p-10 text-center animate-fade-up">{t("loading")}</div>
      )}
    </div>
  );
}
