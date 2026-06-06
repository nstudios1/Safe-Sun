import { useEffect, useState } from "react";
import { Bell, Globe, User, Download, RotateCcw, ShieldCheck, Droplet, Snowflake, Sparkles } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { Disclaimer } from "@/components/safesun/Disclaimer";
import { UserAvatar } from "@/components/safesun/UserAvatar";
import { SafetyMarginToggle } from "@/components/safesun/SafetyMarginToggle";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const { t, lang, setLang, skinType, setSkinType, alertsEnabled, setAlertsEnabled, autoRefresh, setAutoRefresh, profile, resetProfile, spf, setSpf, beachMode, setBeachMode, triggerDangerPulse } = useApp();
  const [deferred, setDeferred] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

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
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[15, 30, 50, 100].map((n) => (
            <button key={n} onClick={() => setSpf(n)}
              className={`px-3 py-2 rounded-xl text-sm font-bold transition ${spf === n ? "bg-white/25 shadow-inner" : "bg-white/5 hover:bg-white/10"}`}>
              {n}
            </button>
          ))}
        </div>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={100}
          value={spf === 0 ? "" : spf}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") { setSpf(0); return; }
            const n = parseInt(v, 10);
            setSpf(Number.isFinite(n) ? n : 0);
          }}
          placeholder="0"
          className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 placeholder-white/50 text-white outline-none focus:bg-white/15 focus:border-white/40 transition text-base mb-2"
          style={{ fontSize: 16 }}
        />
        <button
          onClick={() => { setSpf(0); triggerDangerPulse(); }}
          className={`w-full px-3 py-3 rounded-2xl text-sm font-bold transition ${spf === 0 ? "bg-[hsl(0_85%_55%)]/30 shadow-inner border border-[hsl(0_85%_55%)]/60" : "bg-white/5 hover:bg-white/10 border border-white/15"}`}
        >
          {t("noSunscreen")}
        </button>
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

      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); resetProfile(); toast.success(t("resetProfile")); }}
        className="w-full glass py-3 font-semibold flex items-center justify-center gap-2 hover:bg-white/15 active:scale-[0.98] transition animate-fade-up touch-manipulation cursor-pointer select-none"
      >
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
