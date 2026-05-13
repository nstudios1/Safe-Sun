import { useEffect, useState } from "react";
import { Bell, Globe, User, Download, RotateCcw, ShieldCheck, Droplet, Snowflake, Sparkles, Plus, Trash2, Check, Lock } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { Disclaimer } from "@/components/safesun/Disclaimer";
import { UserAvatar } from "@/components/safesun/UserAvatar";
import { SafetyMarginToggle } from "@/components/safesun/SafetyMarginToggle";

export default function SettingsPage() {
  const { t, lang, setLang, skinType, setSkinType, alertsEnabled, setAlertsEnabled, autoRefresh, setAutoRefresh, profile, resetProfile, spf, setSpf, beachMode, setBeachMode, sunscreens, activeSunscreenId, addSunscreen, updateSunscreen, deleteSunscreen, setActiveSunscreen } = useApp();
  const [deferred, setDeferred] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSpf, setNewSpf] = useState(30);

  useEffect(() => {
    const h = (e: any) => { e.preventDefault(); setDeferred(e); };
    window.addEventListener("beforeinstallprompt", h);
    const onInstalled = () => setInstalled(true);
    window.addEventListener("appinstalled", onInstalled);
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    return () => { window.removeEventListener("beforeinstallprompt", h); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  const install = async () => {
    if (!deferred) { toast.info(t("install")); return; }
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferred(null);
  };

  const skins: [number, string][] = [[1, t("skin1")], [2, t("skin2")], [3, t("skin3")], [4, t("skin4")], [5, t("skin5")], [6, t("skin6")]];

  return (
    <div className="px-4 pt-6 pb-32 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-shadow-lg animate-fade-up">{t("settings")}</h1>

      <Section icon={<User size={16} />} title={t("profile")}>
        <div className="flex items-center gap-3 mb-4">
          <UserAvatar size={48} />
          <div>
            <div className="text-base font-semibold leading-tight">{profile?.name}</div>
            <div className="text-xs opacity-70">{t("skin" + skinType as any)}</div>
          </div>
        </div>
        <div className="text-xs uppercase tracking-widest opacity-80 mb-2">{t("skinType")}</div>
        <div className="grid grid-cols-2 gap-2">
          {skins.map(([n, label]) => (
            <button key={n} onClick={() => setSkinType(n)}
              className={`px-3 py-2 rounded-xl text-sm text-left transition ${skinType === n ? "bg-white/25 shadow-inner" : "bg-white/5 hover:bg-white/10"}`}>
              {label}
            </button>
          ))}
        </div>
      </Section>

      <Section icon={<ShieldCheck size={16} />} title={t("safetyMargin")}>
        <SafetyMarginToggle />
      </Section>

      <Section icon={<Droplet size={16} />} title={t("spfCalc")}>
        <p className="text-xs opacity-80 mb-3">{t("spfHelp")}</p>
        <div className="grid grid-cols-4 gap-2">
          {[15, 30, 50, 100].map((n) => (
            <button key={n} onClick={() => setSpf(n)}
              className={`px-3 py-2 rounded-xl text-sm font-bold transition ${spf === n ? "bg-white/25 shadow-inner" : "bg-white/5 hover:bg-white/10"}`}>
              {n}
            </button>
          ))}
        </div>
      </Section>

      <Section icon={<Lock size={16} />} title={t("sunscreenLocker")}>
        <p className="text-xs opacity-80 mb-3">{t("lockerHelp")}</p>
        <div className="space-y-2 mb-3">
          {sunscreens.length === 0 && (
            <div className="text-xs opacity-70 italic">{t("noSunscreens")}</div>
          )}
          {sunscreens.map((s) => (
            <div key={s.id} className={`flex items-center gap-2 p-3 rounded-xl transition ${activeSunscreenId === s.id ? "bg-white/20 shadow-inner" : "bg-white/5"}`}>
              <input
                value={s.name}
                onChange={(e) => updateSunscreen(s.id, { name: e.target.value })}
                className="flex-1 min-w-0 bg-transparent text-sm font-semibold outline-none"
                inputMode="text"
              />
              <input
                type="number"
                value={s.spf}
                onChange={(e) => updateSunscreen(s.id, { spf: Math.max(1, Number(e.target.value) || 1) })}
                className="w-16 bg-white/10 rounded-md px-2 py-1 text-sm text-center outline-none"
                inputMode="numeric"
              />
              <button
                onClick={() => setActiveSunscreen(s.id)}
                className={`p-2 rounded-lg ${activeSunscreenId === s.id ? "bg-[hsl(28_100%_55%)]" : "bg-white/10 hover:bg-white/20"}`}
                aria-label={t("setActive")}
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => deleteSunscreen(s.id)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
                aria-label={t("delete")}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t("productName")}
            className="flex-1 min-w-0 bg-white/10 rounded-xl px-3 py-2 text-sm outline-none placeholder:opacity-60"
            inputMode="text"
          />
          <input
            type="number"
            value={newSpf}
            onChange={(e) => setNewSpf(Math.max(1, Number(e.target.value) || 1))}
            className="w-16 bg-white/10 rounded-xl px-2 py-2 text-sm text-center outline-none"
            inputMode="numeric"
          />
          <button
            onClick={() => { if (!newName.trim()) return; addSunscreen({ name: newName.trim(), spf: newSpf }); setNewName(""); setNewSpf(30); }}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25"
            aria-label={t("addSunscreen")}
          >
            <Plus size={16} />
          </button>
        </div>
      </Section>

      <Section icon={<Snowflake size={16} />} title={t("beachMode")}>
        <p className="text-xs opacity-80 mb-3">{t("beachHelp")}</p>
        <Toggle label={t("beachMode")} on={beachMode} onChange={setBeachMode} />
      </Section>

      <Section icon={<Sparkles size={16} />} title={t("vitDEduTitle")}>
        <p className="text-xs opacity-90 leading-relaxed">{t("vitDEduBody")}</p>
      </Section>

      <Section icon={<Globe size={16} />} title={t("language")}>
        <div className="grid grid-cols-2 gap-2">
          {(["en", "es"] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${lang === l ? "bg-white/25 shadow-inner" : "bg-white/5 hover:bg-white/10"}`}>
              {l === "en" ? "🇬🇧 English" : "🇪🇸 Español"}
            </button>
          ))}
        </div>
      </Section>

      <Section icon={<Bell size={16} />} title={t("notifications")}>
        <Toggle label={t("enableAlerts")} on={alertsEnabled} onChange={setAlertsEnabled} />
        <Toggle label={t("autoRefresh")} on={autoRefresh} onChange={setAutoRefresh} />
      </Section>

      <button onClick={install} disabled={installed} className="w-full glass-strong py-4 font-bold flex items-center justify-center gap-2 hover:bg-white/25 transition disabled:opacity-60 animate-fade-up">
        <Download size={18} />{installed ? t("installed") : t("install")}
      </button>

      <button onClick={resetProfile} className="w-full glass py-3 font-semibold flex items-center justify-center gap-2 hover:bg-white/15 transition animate-fade-up">
        <RotateCcw size={16} />{t("resetProfile")}
      </button>

      <Disclaimer />
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="glass p-5 animate-fade-up">
      <div className="flex items-center gap-2 mb-3 opacity-90">{icon}<h3 className="font-semibold">{title}</h3></div>
      {children}
    </div>
  );
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (b: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} className="w-full flex items-center justify-between py-2">
      <span className="text-sm">{label}</span>
      <span className={`relative w-11 h-6 rounded-full transition ${on ? "bg-[hsl(28_100%_55%)]" : "bg-white/15"}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}
