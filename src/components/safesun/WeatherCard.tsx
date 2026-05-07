import { CloudRain, Droplets, Wind } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { weatherLabel } from "@/lib/weather";

export function WeatherCard() {
  const { weather, t, location } = useApp();
  if (!weather) return null;
  const tempF = Math.round((weather.temp * 9) / 5 + 32);
  const tempC = Math.round(weather.temp);
  const windMph = Math.round(weather.wind * 0.621371);
  return (
    <div className="glass p-5 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest opacity-80">{t("weather")}</div>
          <div className="text-lg font-semibold mt-1">{location?.name}{location?.country ? `, ${location.country}` : ""}</div>
          <div className="text-sm opacity-80">{weatherLabel(weather.weatherCode)}</div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-shadow-lg leading-none">{tempF}°F</div>
          <div className="text-xs opacity-80 mt-1">{t("feelsLike")} {tempC}°C</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-5">
        <Stat icon={<Droplets size={16} />} label={t("humidity")} value={`${weather.humidity}%`} />
        <Stat icon={<Wind size={16} />} label={t("wind")} value={`${windMph} mph`} />
        <Stat icon={<CloudRain size={16} />} label={t("rain")} value={`${Math.round(weather.precipProb)}%`} />
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center">
      <div className="flex items-center justify-center gap-1 opacity-80 text-[11px] uppercase tracking-wider">
        {icon}<span>{label}</span>
      </div>
      <div className="text-lg font-semibold mt-1">{value}</div>
    </div>
  );
}
