import { useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { UVGauge } from "@/components/safesun/UVGauge";
import { WeatherCard } from "@/components/safesun/WeatherCard";
import { ProtectionPlan } from "@/components/safesun/ProtectionPlan";
import { SunscreenTimer } from "@/components/safesun/SunscreenTimer";
import { VitaminDRing } from "@/components/safesun/VitaminDRing";
import { HydrationCard } from "@/components/safesun/HydrationCard";
import { HourlyStrip } from "@/components/safesun/HourlyStrip";
import { UVAlert } from "@/components/safesun/UVAlert";
import { Disclaimer } from "@/components/safesun/Disclaimer";
import { UserAvatar } from "@/components/safesun/UserAvatar";
import { SafetyMarginToggle } from "@/components/safesun/SafetyMarginToggle";
import { MapPin, RefreshCw } from "lucide-react";

export default function Home() {
  const { weather, location, useGPS, refresh, loading, t, profile, spf, dangerPulse } = useApp();
  useEffect(() => { if (!location) useGPS(); }, []); // eslint-disable-line
  const noProtection = !spf || spf <= 0;

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
          <div
            className={`glass px-4 py-3 flex items-center justify-center text-center text-sm font-bold tracking-widest uppercase animate-fade-up ${dangerPulse ? "animate-shake-danger animate-pulse-danger" : ""}`}
            style={
              noProtection
                ? {
                    color: "hsl(15 100% 70%)",
                    textShadow: "0 0 12px hsl(15 100% 55% / 0.9), 0 0 24px hsl(0 85% 55% / 0.6)",
                    boxShadow: "0 0 24px hsl(15 100% 55% / 0.35), inset 0 0 0 1px hsl(15 100% 60% / 0.4)",
                  }
                : {
                    color: "hsl(150 70% 70%)",
                    textShadow: "0 0 10px hsl(150 70% 50% / 0.6)",
                  }
            }
          >
            {noProtection ? t("protectionNone") : `${t("protectionSpf")} ${spf}`}
          </div>
          <div className="glass-strong p-6 flex flex-col items-center animate-fade-up">
            <UVGauge uv={weather.uv} />
          </div>
          <SafetyMarginToggle />
          <WeatherCard />
          <ProtectionPlan />
          <SunscreenTimer />
          <HydrationCard />
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
