import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { dict, type DictKey, type Lang } from "@/lib/i18n";
import { fetchWeather, reverseGeocode, type Geo, type WeatherData } from "@/lib/weather";
import { uvBucket, minutesToBurn } from "@/lib/uv";
import { toast } from "sonner";

// Short, loud beep using WebAudio. Falls back silently if blocked.
function playAlertSound(times = 3) {
  try {
    const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return;
    const ac = new Ctor();
    const beep = (when: number, freq: number) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, ac.currentTime + when);
      g.gain.exponentialRampToValueAtTime(0.6, ac.currentTime + when + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + when + 0.45);
      o.connect(g).connect(ac.destination);
      o.start(ac.currentTime + when);
      o.stop(ac.currentTime + when + 0.5);
    };
    for (let i = 0; i < times; i++) beep(i * 0.6, i % 2 ? 880 : 1175);
    setTimeout(() => ac.close().catch(() => {}), times * 700 + 500);
  } catch {}
}

function vibrate(pattern: number | number[]) {
  try { (navigator as any).vibrate?.(pattern); } catch {}
}

async function ensureNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  try { const r = await Notification.requestPermission(); return r === "granted"; } catch { return false; }
}

function fireNotification(title: string, body: string) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    // Prefer SW notification (more reliable on mobile / when tab is hidden)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          reg.showNotification(title, { body, icon: "/icon-192.png", badge: "/icon-192.png", vibrate: [300, 150, 300, 150, 600], requireInteraction: true, tag: "safesun" } as any);
        } else {
          new Notification(title, { body, icon: "/icon-192.png" });
        }
      }).catch(() => { try { new Notification(title, { body, icon: "/icon-192.png" }); } catch {} });
    } else {
      new Notification(title, { body, icon: "/icon-192.png" });
    }
  } catch {}
}

export interface Profile { name: string; skinType: number; createdAt: number; }

export interface Sunscreen { id: string; name: string; spf: number; }

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

  sunscreens: Sunscreen[];
  activeSunscreenId: string | null;
  addSunscreen: (s: Omit<Sunscreen, "id">) => void;
  updateSunscreen: (id: string, s: Partial<Omit<Sunscreen, "id">>) => void;
  deleteSunscreen: (id: string) => void;
  setActiveSunscreen: (id: string | null) => void;
  activeSunscreen: Sunscreen | null;

  timerEndsAt: number | null;
  startTimer: () => void;
  resetTimer: () => void;
  timerRemaining: number;

  vitDMinutes: number;
  dailyReapplyCount: number;
}

export const Ctx = createContext<AppState | null>(null);

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
  lockers: "ss_lockers",
  activeLocker: "ss_active_locker",
  daily: "ss_daily",
  lastSummary: "ss_last_summary",
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
  const [sunscreens, setSunscreens] = useState<Sunscreen[]>(() => load(LS.lockers, []));
  const [activeSunscreenId, setActiveSunscreenIdState] = useState<string | null>(() => load(LS.activeLocker, null));
  const [dailyReapplyCount, setDailyReapplyCount] = useState<number>(() => {
    const v = load<{ date: string; count: number }>(LS.daily, { date: "", count: 0 });
    return v.date === new Date().toDateString() ? v.count : 0;
  });
  const [timerEndsAt, setTimerEndsAt] = useState<number | null>(() => load(LS.timer, null));
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [vitDMinutes, setVitDMinutes] = useState<number>(() => {
    const v = load<{ date: string; minutes: number }>(LS.vitD, { date: "", minutes: 0 });
    const today = new Date().toDateString();
    return v.date === today ? v.minutes : 0;
  });
  const lastTickRef = useRef<number | null>(null);
  const lastAlertedRef = useRef<number>(0);
  const timerCapMsRef = useRef<number | null>(null);

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

  const persistLockers = (list: Sunscreen[]) => { setSunscreens(list); localStorage.setItem(LS.lockers, JSON.stringify(list)); };
  const addSunscreen = (s: Omit<Sunscreen, "id">) => {
    const item: Sunscreen = { id: Math.random().toString(36).slice(2, 10), ...s };
    const next = [...sunscreens, item];
    persistLockers(next);
    if (!activeSunscreenId) setActiveSunscreen(item.id);
  };
  const updateSunscreen = (id: string, patch: Partial<Omit<Sunscreen, "id">>) => {
    const next = sunscreens.map((p) => (p.id === id ? { ...p, ...patch } : p));
    persistLockers(next);
    if (id === activeSunscreenId && patch.spf != null) setSpf(patch.spf);
  };
  const deleteSunscreen = (id: string) => {
    const next = sunscreens.filter((p) => p.id !== id);
    persistLockers(next);
    if (id === activeSunscreenId) setActiveSunscreen(next[0]?.id ?? null);
  };
  const setActiveSunscreen = (id: string | null) => {
    setActiveSunscreenIdState(id);
    localStorage.setItem(LS.activeLocker, JSON.stringify(id));
    const found = id ? sunscreens.find((p) => p.id === id) : null;
    if (found) setSpf(found.spf);
  };
  const activeSunscreen = sunscreens.find((p) => p.id === activeSunscreenId) ?? null;

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
        fireNotification(t("highUVAlert"), t("highUVMsg"));
        playAlertSound(3);
        vibrate([400, 200, 400, 200, 800]);
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
        fireNotification(t("appName"), t("reapplyNow"));
        playAlertSound(4);
        vibrate([500, 200, 500, 200, 500, 200, 800]);
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
    // Ask for OS notification permission as soon as the user interacts (required on iOS/Android)
    ensureNotificationPermission();
    // Prime the audio context with a quiet tick so later alerts are allowed by mobile autoplay policies
    try {
      const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (Ctor) {
        const ac = new Ctor();
        const o = ac.createOscillator();
        const g = ac.createGain();
        g.gain.value = 0.0001;
        o.connect(g).connect(ac.destination);
        o.start(); o.stop(ac.currentTime + 0.05);
        setTimeout(() => ac.close().catch(() => {}), 200);
      }
    } catch {}
    vibrate(60);
    // count reapplications when starting after a previous timer expired or was reset
    setDailyReapplyCount((prev) => {
      const today = new Date().toDateString();
      const next = prev + 1;
      localStorage.setItem(LS.daily, JSON.stringify({ date: today, count: next }));
      return next;
    });
    const TWO_H = 2 * 60 * 60 * 1000;
    let cap = TWO_H;
    if (weather) {
      // factor SPF from active sunscreen into the safe time, capped at 2h
      const baseMin = minutesToBurn(weather.uv, skinType);
      const spfMul = Math.max(1, spf);
      const reflect = beachMode ? 0.8 : 1;
      const safeMin = baseMin * spfMul * reflect;
      cap = Math.max(60 * 1000, Math.min(TWO_H, safeMin * 60 * 1000));
    }
    timerCapMsRef.current = cap;
    const end = Date.now() + cap;
    setTimerEndsAt(end);
    localStorage.setItem(LS.timer, JSON.stringify(end));
  };
  const resetTimer = () => { setTimerEndsAt(null); localStorage.removeItem(LS.timer); timerCapMsRef.current = null; };

  // Smart timer: when UV changes, scale remaining time so the depletion rate
  // tracks current UV (higher UV → faster countdown).
  useEffect(() => {
    if (!timerEndsAt || !weather) return;
    const TWO_H = 2 * 60 * 60 * 1000;
    const newCapMs = Math.max(60 * 1000, Math.min(TWO_H, minutesToBurn(weather.uv, skinType) * 60 * 1000));
    const prevCapMs = timerCapMsRef.current ?? newCapMs;
    if (prevCapMs === newCapMs) return;
    const remaining = Math.max(0, timerEndsAt - Date.now());
    const fraction = remaining / prevCapMs;
    const newRemaining = Math.round(newCapMs * fraction);
    timerCapMsRef.current = newCapMs;
    const end = Date.now() + newRemaining;
    setTimerEndsAt(end);
    localStorage.setItem(LS.timer, JSON.stringify(end));
  }, [weather?.uv, skinType]); // eslint-disable-line

  // Daily reset at midnight + 6pm summary notification
  useEffect(() => {
    let cancelled = false;
    const schedule = () => {
      const now = new Date();
      // 6pm summary
      const six = new Date(now); six.setHours(18, 0, 0, 0);
      if (six.getTime() <= now.getTime()) six.setDate(six.getDate() + 1);
      const lastSummary = localStorage.getItem(LS.lastSummary);
      const today = now.toDateString();
      const sixToday = new Date(now); sixToday.setHours(18, 0, 0, 0);
      if (now.getTime() >= sixToday.getTime() && lastSummary !== today) {
        // fire immediately if past 6pm and not yet summarised today
        emitDailySummary();
        localStorage.setItem(LS.lastSummary, today);
      }
      const t1 = setTimeout(() => {
        if (cancelled) return;
        emitDailySummary();
        localStorage.setItem(LS.lastSummary, new Date().toDateString());
      }, six.getTime() - now.getTime());
      // midnight reset
      const mid = new Date(now); mid.setHours(24, 0, 0, 0);
      const t2 = setTimeout(() => {
        if (cancelled) return;
        setVitDMinutes(0);
        setDailyReapplyCount(0);
        localStorage.setItem(LS.vitD, JSON.stringify({ date: new Date().toDateString(), minutes: 0 }));
        localStorage.setItem(LS.daily, JSON.stringify({ date: new Date().toDateString(), count: 0 }));
      }, mid.getTime() - now.getTime());
      return () => { clearTimeout(t1); clearTimeout(t2); };
    };
    const cleanup = schedule();
    return () => { cancelled = true; cleanup?.(); };
  }, [vitDMinutes, dailyReapplyCount, weather?.uv, skinType, spf]); // eslint-disable-line

  const emitDailySummary = useCallback(() => {
    const sun = Math.round(vitDMinutes);
    const target = weather ? Math.max(1, Math.round((25 / Math.max(1, weather.uv)) * 1.3)) : 15;
    const vdPct = Math.min(100, Math.round((sun / target) * 100));
    const expected = Math.max(1, sun / 120);
    const ratio = dailyReapplyCount / expected;
    const grade = ratio >= 0.9 ? "A" : ratio >= 0.7 ? "B" : ratio >= 0.5 ? "C" : sun === 0 ? "—" : "D";
    const body = t("dailySummaryBody")
      .replace("{sun}", String(sun))
      .replace("{vd}", String(vdPct))
      .replace("{grade}", grade);
    toast.success(t("dailySummaryTitle"), { description: body, duration: 8000 });
    fireNotification(t("dailySummaryTitle"), body);
  }, [vitDMinutes, dailyReapplyCount, weather, t]);

  const value = useMemo<AppState>(() => ({
    lang, setLang, t,
    profile, saveProfile, resetProfile,
    location, setLocation, useGPS, weather, loading, refresh,
    saved, toggleSave, isSaved,
    skinType, setSkinType,
    alertsEnabled, setAlertsEnabled, autoRefresh, setAutoRefresh,
    safetyMargin, setSafetyMargin,
    spf, setSpf, beachMode, setBeachMode,
    sunscreens, activeSunscreenId, addSunscreen, updateSunscreen, deleteSunscreen, setActiveSunscreen, activeSunscreen,
    timerEndsAt, startTimer, resetTimer, timerRemaining,
    vitDMinutes, dailyReapplyCount,
  }), [lang, t, profile, location, weather, loading, saved, skinType, alertsEnabled, autoRefresh, safetyMargin, spf, beachMode, sunscreens, activeSunscreenId, timerEndsAt, timerRemaining, refresh, vitDMinutes, dailyReapplyCount]);

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
