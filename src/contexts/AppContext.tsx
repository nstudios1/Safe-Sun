import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { dict, type DictKey, type Lang } from "@/lib/i18n";
import { fetchWeather, reverseGeocode, type Geo, type WeatherData } from "@/lib/weather";
import { uvBucket } from "@/lib/uv";
import { toast } from "sonner";

interface User { email: string; name?: string; }

interface AppState {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: DictKey) => string;
  user: User | null;
  login: (email: string, password: string) => void;
  register: (email: string, password: string) => void;
  logout: () => void;
  guest: () => void;

  location: Geo | null;
  setLocation: (g: Geo) => void;
  useGPS: () => Promise<void>;
  weather: WeatherData | null;
  loading: boolean;
  refresh: () => Promise<void>;

  saved: Geo[];
  toggleSave: (g: Geo) => void;
  isSaved: (g: Geo) => boolean;

  skinType: number;
  setSkinType: (n: number) => void;

  alertsEnabled: boolean;
  setAlertsEnabled: (b: boolean) => void;
  autoRefresh: boolean;
  setAutoRefresh: (b: boolean) => void;

  // sunscreen timer
  timerEndsAt: number | null;
  startTimer: () => void;
  resetTimer: () => void;
  timerRemaining: number;
}

const Ctx = createContext<AppState | null>(null);

const LS = {
  user: "ss_user",
  lang: "ss_lang",
  loc: "ss_loc",
  saved: "ss_saved",
  skin: "ss_skin",
  alerts: "ss_alerts",
  auto: "ss_auto",
  timer: "ss_timer",
  guest: "ss_guest",
};

function load<T>(k: string, fallback: T): T {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => load(LS.lang, "en"));
  const [user, setUser] = useState<User | null>(() => load(LS.user, null));
  const [location, setLocationState] = useState<Geo | null>(() => load(LS.loc, null));
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<Geo[]>(() => load(LS.saved, []));
  const [skinType, setSkinTypeState] = useState<number>(() => load(LS.skin, 3));
  const [alertsEnabled, setAlertsState] = useState<boolean>(() => load(LS.alerts, true));
  const [autoRefresh, setAutoRefreshState] = useState<boolean>(() => load(LS.auto, true));
  const [timerEndsAt, setTimerEndsAt] = useState<number | null>(() => load(LS.timer, null));
  const [timerRemaining, setTimerRemaining] = useState(0);
  const lastAlertedRef = useRef<number>(0);

  const t = useCallback((k: DictKey) => dict[lang][k] ?? dict.en[k], [lang]);

  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem(LS.lang, JSON.stringify(l)); };
  const setSkinType = (n: number) => { setSkinTypeState(n); localStorage.setItem(LS.skin, JSON.stringify(n)); };
  const setAlertsEnabled = (b: boolean) => {
    setAlertsState(b); localStorage.setItem(LS.alerts, JSON.stringify(b));
    if (b && "Notification" in window && Notification.permission === "default") Notification.requestPermission();
  };
  const setAutoRefresh = (b: boolean) => { setAutoRefreshState(b); localStorage.setItem(LS.auto, JSON.stringify(b)); };

  const setLocation = (g: Geo) => {
    setLocationState(g);
    localStorage.setItem(LS.loc, JSON.stringify(g));
  };

  const refresh = useCallback(async () => {
    if (!location) return;
    setLoading(true);
    try {
      const w = await fetchWeather(location.lat, location.lon);
      setWeather(w);
      // High UV alert
      if (alertsEnabled && w.uv >= 8 && Date.now() - lastAlertedRef.current > 60 * 60 * 1000) {
        lastAlertedRef.current = Date.now();
        toast.warning(t("highUVAlert"), { description: t("highUVMsg") });
        if ("Notification" in window && Notification.permission === "granted") {
          try { new Notification(t("highUVAlert"), { body: t("highUVMsg"), icon: "/icon-192.png" }); } catch {}
        }
      }
    } catch (e) {
      toast.error("Weather error");
    } finally {
      setLoading(false);
    }
  }, [location, alertsEnabled, t]);

  // Refresh when location changes
  useEffect(() => { refresh(); }, [location?.lat, location?.lon]); // eslint-disable-line

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => refresh(), 30 * 60 * 1000);
    return () => clearInterval(id);
  }, [autoRefresh, refresh]);

  // Sunscreen timer ticker
  useEffect(() => {
    if (!timerEndsAt) { setTimerRemaining(0); return; }
    const tick = () => {
      const r = Math.max(0, timerEndsAt - Date.now());
      setTimerRemaining(r);
      if (r === 0) {
        toast.success(t("reapplyNow"));
        if ("Notification" in window && Notification.permission === "granted") {
          try { new Notification(t("appName"), { body: t("reapplyNow"), icon: "/icon-192.png" }); } catch {}
        }
        setTimerEndsAt(null);
        localStorage.removeItem(LS.timer);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timerEndsAt, t]);

  const useGPS = async () => {
    if (!("geolocation" in navigator)) { toast.error(t("locationError")); return; }
    setLoading(true);
    return new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const g = await reverseGeocode(pos.coords.latitude, pos.coords.longitude, lang);
          setLocation(g);
          resolve();
        },
        () => { toast.error(t("locationError")); setLoading(false); resolve(); },
        { timeout: 8000 }
      );
    });
  };

  const toggleSave = (g: Geo) => {
    setSaved((prev) => {
      const exists = prev.some((s) => s.lat === g.lat && s.lon === g.lon);
      const next = exists ? prev.filter((s) => !(s.lat === g.lat && s.lon === g.lon)) : [...prev, g];
      localStorage.setItem(LS.saved, JSON.stringify(next));
      return next;
    });
  };
  const isSaved = (g: Geo) => saved.some((s) => s.lat === g.lat && s.lon === g.lon);

  const login = (email: string, _pw: string) => {
    const u = { email };
    setUser(u);
    localStorage.setItem(LS.user, JSON.stringify(u));
    localStorage.removeItem(LS.guest);
  };
  const register = (email: string, _pw: string) => login(email, _pw);
  const logout = () => { setUser(null); localStorage.removeItem(LS.user); localStorage.removeItem(LS.guest); };
  const guest = () => { localStorage.setItem(LS.guest, "1"); setUser({ email: "guest" }); };

  const startTimer = () => {
    // Strictly limit timer to the user's safe exposure window for current UV/skin type
    const TWO_H = 2 * 60 * 60 * 1000;
    let cap = TWO_H;
    if (weather) {
      const { minutesToBurn } = require("@/lib/uv");
      const safeMin = minutesToBurn(weather.uv, skinType);
      cap = Math.max(60 * 1000, Math.min(TWO_H, safeMin * 60 * 1000));
    }
    const end = Date.now() + cap;
    setTimerEndsAt(end);
    localStorage.setItem(LS.timer, JSON.stringify(end));
    if (alertsEnabled && "Notification" in window && Notification.permission === "default") Notification.requestPermission();
  };
  const resetTimer = () => { setTimerEndsAt(null); localStorage.removeItem(LS.timer); };

  const value = useMemo<AppState>(() => ({
    lang, setLang, t, user, login, register, logout, guest,
    location, setLocation, useGPS, weather, loading, refresh,
    saved, toggleSave, isSaved,
    skinType, setSkinType,
    alertsEnabled, setAlertsEnabled, autoRefresh, setAutoRefresh,
    timerEndsAt, startTimer, resetTimer, timerRemaining,
  }), [lang, t, user, location, weather, loading, saved, skinType, alertsEnabled, autoRefresh, timerEndsAt, timerRemaining, refresh]);

  // Update mesh background class on body
  useEffect(() => {
    const bucket = weather ? uvBucket(weather.uv) : "low";
    document.body.dataset.uv = bucket;
  }, [weather]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("AppProvider missing");
  return c;
}
