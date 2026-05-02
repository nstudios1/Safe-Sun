import { useEffect, useState } from "react";
import { Bell, Globe, LogOut, RefreshCw, User, Download } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

export default function SettingsPage() {
  const { t, lang, setLang, skinType, setSkinType, alertsEnabled, setAlertsEnabled, autoRefresh, setAutoRefresh, logout, user } = useApp();
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
        <div className="text-sm opacity-90 mb-3">{user?.email}</div>
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

      <button onClick={logout} className="w-full glass py-3 font-semibold flex items-center justify-center gap-2 hover:bg-white/15 transition animate-fade-up">
        <LogOut size={16} />{t("logout")}
      </button>
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
