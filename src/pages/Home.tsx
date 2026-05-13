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
import { UserAvatar } from "@/components/safesun/UserAvatar";
import { SafetyMarginToggle } from "@/components/safesun/SafetyMarginToggle";
import { MapPin, RefreshCw, Shield } from "lucide-react";

export default function Home() {
  const { weather, location, useGPS, refresh, loading, t, profile, activeSunscreen } = useApp();
  useEffect(() => { if (!location) useGPS(); }, []); // eslint-disable-line

  return (
    <div className="px-4 pt-6 pb-32 max-w-xl mx-auto">
      <header className="flex items-center justify-between mb-5 animate-fade-up">
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar size={44} />
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.2em] opacity-80 truncate">
              {t("hello")}, {profile?.name}
            </div>
            <div className="flex items-center gap-1 text-base font-semibold">
              <MapPin size={14} className="opacity-80" />
              <span className="text-shadow truncate">{location?.name || "—"}</span>
            </div>
          </div>
        </div>
        <button onClick={refresh} className="glass p-3 hover:bg-white/20 transition" aria-label="refresh">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </header>

      {weather ? (
        <div className="space-y-4">
          <UVAlert />
          <div className="glass-strong p-6 flex flex-col items-center animate-fade-up">
            <UVGauge uv={weather.uv} />
          </div>
          {activeSunscreen && (
            <div className="glass px-4 py-2.5 flex items-center gap-2 text-xs animate-fade-up">
              <Shield size={14} className="opacity-90" />
              <span className="opacity-80">{t("activeProtection")}:</span>
              <span className="font-semibold truncate">{activeSunscreen.name}</span>
              <span className="ml-auto opacity-90 font-bold">SPF {activeSunscreen.spf}</span>
            </div>
          )}
          <SafetyMarginToggle />
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
