import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { dict, type DictKey, type Lang } from "@/lib/i18n";
import { fetchWeather, reverseGeocode, type Geo, type WeatherData } from "@/lib/weather";
import { uvBucket, minutesToBurn } from "@/lib/uv";
import { toast } from "sonner";

export interface Profile { name: string; skinType: number; createdAt: number; }

interface AppState {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: DictKey) => string;

  profile: Profile | null;
  saveProfile: (p: Profile) => void;
  resetProfile: () => void;

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

  safetyMargin: boolean;
  setSafetyMargin: (b: boolean) => void;

  spf: number;
  setSpf: (n: number) => void;
  beachMode: boolean;
  setBeachMode: (b: boolean) => void;

  timerEndsAt: number | null;
  startTimer: () => void;
  resetTimer: () => void;
  timerRemaining: number;

  vitDMinutes: number;
}

const Ctx = createContext<AppState | null>(null);

const LS = {
  profile: "ss_profile",
  lang: "ss_lang",
  loc: "ss_loc",
  saved: "ss_saved",
  skin: "ss_skin",
  alerts: "ss_alerts",
  auto: "ss_auto",
  timer: "ss_timer",
  safety: "ss_safety",
  safetyShown: "ss_safety_shown",
  vitD: "ss_vitd",
  spf: "ss_spf",
  beach: "ss_beach",
};

function load<T>(k: string, fallback: T): T {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => load(LS.lang, "en"));
  const [profile, setProfileState] = useState<Profile | null>(() => load(LS.profile, null));
  const [location, setLocationState] = useState<Geo | null>(() => load(LS.loc, null));
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<Geo[]>(() => load(LS.saved, []));
  const [skinType, setSkinTypeState] = useState<number>(() => {
    const p = load<Profile | null>(LS.profile, null);
    return p?.skinType ?? load(LS.skin, 3);
  });
  const [alertsEnabled, setAlertsState] = useState<boolean>(() => load(LS.alerts, true));
  const [autoRefresh, setAutoRefreshState] = useState<boolean>(() => load(LS.auto, true));
  const [safetyMargin, setSafetyMarginState] = useState<boolean>(() => load(LS.safety, true));
  const [spf, setSpfState] = useState<number>(() => load(LS.spf, 30));
  const [beachMode, setBeachModeState] = useState<boolean>(() => load(LS.beach, false));
  const [timerEndsAt, setTimerEndsAt] = useState<number | null>(() => load(LS.timer, null));
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [vitDMinutes, setVitDMinutes] = useState<number>(() => {
    const v = load<{ date: string; minutes: number }>(LS.vitD, { date: "", minutes: 0 });
    const today = new Date().toDateString();
    return v.date === today ? v.minutes : 0;
  });
  const lastTickRef = useRef<number | null>(null);
  const lastAlertedRef = useRef<number>(0);

  const t = useCallback((k: DictKey) => dict[lang][k] ?? dict.en[k], [lang]);

  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem(LS.lang, JSON.stringify(l)); };
  const setSkinType = (n: number) => {
    setSkinTypeState(n);
    localStorage.setItem(LS.skin, JSON.stringify(n));
    if (profile) {
      const next = { ...profile, skinType: n };
      setProfileState(next);
      localStorage.setItem(LS.profile, JSON.stringify(next));
    }
  };
  const setAlertsEnabled = (b: boolean) => {
    setAlertsState(b); localStorage.setItem(LS.alerts, JSON.stringify(b));
    if (b && "Notification" in window && Notification.permission === "default") Notification.requestPermission();
  };
  const setAutoRefresh = (b: boolean) => { setAutoRefreshState(b); localStorage.setItem(LS.auto, JSON.stringify(b)); };
  const setSafetyMargin = (b: boolean) => { setSafetyMarginState(b); localStorage.setItem(LS.safety, JSON.stringify(b)); };
  const setSpf = (n: number) => { setSpfState(n); localStorage.setItem(LS.spf, JSON.stringify(n)); };
  const setBeachMode = (b: boolean) => { setBeachModeState(b); localStorage.setItem(LS.beach, JSON.stringify(b)); };

  const saveProfile = (p: Profile) => {
    setProfileState(p);
    setSkinTypeState(p.skinType);
    localStorage.setItem(LS.profile, JSON.stringify(p));
    localStorage.setItem(LS.skin, JSON.stringify(p.skinType));
  };
  const resetProfile = () => {
    setProfileState(null);
    localStorage.removeItem(LS.profile);
    localStorage.removeItem(LS.safetyShown);
  };

  const setLocation = (g: Geo) => {
    setLocationState(g);
    localStorage.setItem(LS.loc, JSON.stringify(g));
  };

  const refresh = useCallback(async () => {
    if (!location) return;
    setLoading(true);
    try {
      const w = await fetchWeather(location.lat, location.lon, safetyMargin);
      setWeather(w);
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
  }, [location, alertsEnabled, safetyMargin, t]);

  useEffect(() => { refresh(); }, [location?.lat, location?.lon, safetyMargin]); // eslint-disable-line

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => refresh(), 30 * 60 * 1000);
    return () => clearInterval(id);
  }, [autoRefresh, refresh]);

  // First-launch safety margin notification (after profile is created)
  useEffect(() => {
    if (!profile) return;
    if (localStorage.getItem(LS.safetyShown)) return;
    if (!safetyMargin) return;
    const id = setTimeout(() => {
      toast.success(t("safetyEnabledToast"), { description: t("safetyEnabledToastDesc"), duration: 6000 });
      localStorage.setItem(LS.safetyShown, "1");
    }, 800);
    return () => clearTimeout(id);
  }, [profile, safetyMargin, t]);

  useEffect(() => {
    if (!timerEndsAt) { setTimerRemaining(0); return; }
    const tick = () => {
      const r = Math.max(0, timerEndsAt - Date.now());
      setTimerRemaining(r);
      // accumulate vitamin D minutes while timer active (1s tick = 1/60 min)
      const now = Date.now();
      if (lastTickRef.current && r > 0) {
        const deltaMin = (now - lastTickRef.current) / 60000;
        setVitDMinutes((prev) => {
          const today = new Date().toDateString();
          const next = prev + deltaMin;
          localStorage.setItem(LS.vitD, JSON.stringify({ date: today, minutes: next }));
          return next;
        });
      }
      lastTickRef.current = now;
      if (r === 0) {
        toast.success(t("reapplyNow"));
        if ("Notification" in window && Notification.permission === "granted") {
          try { new Notification(t("appName"), { body: t("reapplyNow"), icon: "/icon-192.png" }); } catch {}
        }
        setTimerEndsAt(null);
        localStorage.removeItem(LS.timer);
        lastTickRef.current = null;
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => { clearInterval(id); lastTickRef.current = null; };
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

  const startTimer = () => {
    const TWO_H = 2 * 60 * 60 * 1000;
    let cap = TWO_H;
    if (weather) {
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
    lang, setLang, t,
    profile, saveProfile, resetProfile,
    location, setLocation, useGPS, weather, loading, refresh,
    saved, toggleSave, isSaved,
    skinType, setSkinType,
    alertsEnabled, setAlertsEnabled, autoRefresh, setAutoRefresh,
    safetyMargin, setSafetyMargin,
    spf, setSpf, beachMode, setBeachMode,
    timerEndsAt, startTimer, resetTimer, timerRemaining,
    vitDMinutes,
  }), [lang, t, profile, location, weather, loading, saved, skinType, alertsEnabled, autoRefresh, safetyMargin, spf, beachMode, timerEndsAt, timerRemaining, refresh, vitDMinutes]);

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
