import { useEffect, useState } from "react";
import { Bell, Package, Plus, Trash2, Check } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

interface Item { id: string; name: string; spf: number; filter: "mineral" | "chemical"; opened: string; pao: number; expiry: string; }
const KEY = "ss_stash";
const ACTIVE = "ss_stash_active";

const L = {
  en: { title: "Sunscreen Stash", add: "Add sunscreen", name: "Name or brand", mineral: "Mineral", chemical: "Chemical", opened: "Opened on", pao: "PAO (months)", expiry: "Expiry date", ok: "Active", soon: "Expiring soon", expired: "Expired", use: "Use", inUse: "In use", empty: "No sunscreens yet.", until: "Use until", activated: "SPF and timer updated", notifTitle: "Push notifications", notifDesc: "Get reapply reminders when the timer ends and alerts when UV is high or very high.", allow: "Allow notifications", granted: "Notifications enabled", denied: "Blocked — enable them in your browser/phone settings.", unsupported: "Not supported on this device. On iPhone, install the app to the Home Screen first.", test: "Send test" },
  es: { title: "Botiquín de protectores", add: "Añadir protector", name: "Nombre o marca", mineral: "Mineral", chemical: "Químico", opened: "Abierto el", pao: "PAO (meses)", expiry: "Fecha de caducidad", ok: "Activo", soon: "Por vencer", expired: "Caducado", use: "Usar", inUse: "En uso", empty: "Aún no hay protectores.", until: "Usar hasta", activated: "SPF y temporizador actualizados", notifTitle: "Notificaciones push", notifDesc: "Recibe recordatorios de reaplicación al terminar el temporizador y alertas cuando el UV sea alto o muy alto.", allow: "Permitir notificaciones", granted: "Notificaciones activadas", denied: "Bloqueadas — actívalas en los ajustes del navegador/teléfono.", unsupported: "No compatible en este dispositivo. En iPhone, instala primero la app en la pantalla de inicio.", test: "Enviar prueba" },
};

function useDate(item: Item): Date | null {
  const cands: number[] = [];
  if (item.expiry) cands.push(new Date(item.expiry + "T23:59:59").getTime());
  if (item.opened && item.pao > 0) { const d = new Date(item.opened + "T23:59:59"); d.setMonth(d.getMonth() + item.pao); cands.push(d.getTime()); }
  return cands.length ? new Date(Math.min(...cands)) : null;
}
function status(item: Item) {
  const d = useDate(item);
  if (!d) return "ok" as const;
  const days = (d.getTime() - Date.now()) / 86400000;
  return days < 0 ? "expired" as const : days <= 30 ? "soon" as const : "ok" as const;
}

const field = "w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 placeholder-white/50 text-white outline-none focus:bg-white/15 focus:border-white/40 transition";

export function NotificationsCard() {
  const { lang } = useApp();
  const s = L[lang];
  const supported = typeof window !== "undefined" && "Notification" in window;
  const [perm, setPerm] = useState<string>(supported ? Notification.permission : "unsupported");
  const ask = async () => { try { setPerm(await Notification.requestPermission()); } catch {} };
  const test = async () => {
    const reg = await navigator.serviceWorker?.getRegistration().catch(() => undefined);
    if (reg) reg.showNotification("Safe Sun", { body: s.granted, icon: "/icon-192.png" });
    else new Notification("Safe Sun", { body: s.granted, icon: "/icon-192.png" });
  };
  return (
    <div className="glass p-5 animate-fade-up">
      <div className="flex items-center gap-2 mb-2 opacity-90"><Bell size={16} /><h3 className="font-semibold">{s.notifTitle}</h3></div>
      <p className="text-xs opacity-80 mb-3">{s.notifDesc}</p>
      {perm === "granted" ? (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold flex items-center gap-1"><Check size={14} />{s.granted}</span>
          <button onClick={test} className="glass px-3 py-2 text-xs font-semibold hover:bg-white/15">{s.test}</button>
        </div>
      ) : perm === "denied" ? <p className="text-sm">{s.denied}</p>
        : perm === "unsupported" ? <p className="text-sm">{s.unsupported}</p>
        : <button onClick={ask} className="w-full glass-strong py-3 font-bold hover:bg-white/25 transition">{s.allow}</button>}
    </div>
  );
}

export function SunscreenStash() {
  const { lang, setSpf } = useApp();
  const s = L[lang];
  const [items, setItems] = useState<Item[]>(() => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } });
  const [active, setActive] = useState<string | null>(() => localStorage.getItem(ACTIVE));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", spf: "50", filter: "mineral" as Item["filter"], opened: "", pao: "12", expiry: "" });

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);

  const add = () => {
    if (!form.name.trim()) return;
    const it: Item = { id: crypto.randomUUID?.() ?? String(Date.now()), name: form.name.trim(), spf: Math.max(0, parseInt(form.spf) || 0), filter: form.filter, opened: form.opened, pao: Math.max(0, parseInt(form.pao) || 0), expiry: form.expiry };
    setItems((p) => [...p, it]);
    setForm({ name: "", spf: "50", filter: "mineral", opened: "", pao: "12", expiry: "" });
    setOpen(false);
  };
  const activate = (it: Item) => {
    setActive(it.id); localStorage.setItem(ACTIVE, it.id);
    setSpf(it.spf); toast.success(s.activated, { description: `${it.name} · SPF ${it.spf}` });
  };
  const remove = (id: string) => {
    setItems((p) => p.filter((x) => x.id !== id));
    if (active === id) { setActive(null); localStorage.removeItem(ACTIVE); setSpf(0); }
  };
  const badge = { ok: "bg-[hsl(150_70%_40%)]/40 border-[hsl(150_70%_50%)]/60", soon: "bg-[hsl(35_100%_50%)]/40 border-[hsl(35_100%_55%)]/60", expired: "bg-[hsl(0_85%_55%)]/40 border-[hsl(0_85%_55%)]/70" };

  return (
    <div className="glass p-5 animate-fade-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 opacity-90"><Package size={16} /><h3 className="font-semibold">{s.title}</h3></div>
        <button onClick={() => setOpen((o) => !o)} aria-label={s.add} className="glass p-2 hover:bg-white/15"><Plus size={16} /></button>
      </div>

      {open && (
        <div className="space-y-2 mb-4 relative z-[9999]">
          <input className={field} style={{ fontSize: 16 }} placeholder={s.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input className={field} style={{ fontSize: 16 }} type="number" inputMode="numeric" placeholder="SPF" value={form.spf} onChange={(e) => setForm({ ...form, spf: e.target.value })} />
            <div className="grid grid-cols-2 gap-1">
              {(["mineral", "chemical"] as const).map((f) => (
                <button key={f} onClick={() => setForm({ ...form, filter: f })} className={`rounded-xl text-xs font-semibold ${form.filter === f ? "bg-white/25" : "bg-white/5"}`}>{s[f]}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs opacity-80">{s.opened}<input className={field} style={{ fontSize: 16 }} type="date" value={form.opened} onChange={(e) => setForm({ ...form, opened: e.target.value })} /></label>
            <label className="text-xs opacity-80">{s.pao}<input className={field} style={{ fontSize: 16 }} type="number" inputMode="numeric" value={form.pao} onChange={(e) => setForm({ ...form, pao: e.target.value })} /></label>
          </div>
          <label className="text-xs opacity-80 block">{s.expiry}<input className={field} style={{ fontSize: 16 }} type="date" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} /></label>
          <button onClick={add} className="w-full glass-strong py-3 font-bold hover:bg-white/25">{s.add}</button>
        </div>
      )}

      {items.length === 0 && !open && <p className="text-sm opacity-70">{s.empty}</p>}
      <div className="space-y-2">
        {items.map((it) => {
          const st = status(it); const d = useDate(it); const isActive = active === it.id;
          return (
            <div key={it.id} className={`rounded-2xl p-3 border ${isActive ? "bg-white/20 border-white/50" : "bg-white/5 border-white/15"}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{it.name}</div>
                  <div className="text-xs opacity-80">SPF {it.spf} · {s[it.filter]}{d ? ` · ${s.until} ${d.toLocaleDateString(lang)}` : ""}</div>
                </div>
                <span className={`shrink-0 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full border ${badge[st]}`}>{s[st]}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => activate(it)} disabled={isActive} className="flex-1 glass py-2 text-xs font-semibold hover:bg-white/15 disabled:opacity-90">{isActive ? `✓ ${s.inUse}` : s.use}</button>
                <button onClick={() => remove(it.id)} aria-label="delete" className="glass px-3 py-2 hover:bg-white/15"><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
