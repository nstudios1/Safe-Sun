import { useState } from "react";
import { Sun } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export default function Auth() {
  const { t, login, register, guest } = useApp();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pw) return;
    mode === "login" ? login(email, pw) : register(email, pw);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-md glass-strong p-7 animate-fade-up">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-3xl glass-strong flex items-center justify-center mb-3 animate-pulse-glow" style={{ color: "hsl(28 100% 65%)" }}>
            <Sun size={32} />
          </div>
          <h1 className="text-3xl font-bold text-shadow-lg">{t("appName")}</h1>
          <p className="opacity-90 text-sm mt-1">{mode === "login" ? t("welcome") : t("createAccount")}</p>
        </div>

        <div className="flex gap-1 p-1 bg-white/10 rounded-2xl mb-5">
          {(["login", "register"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${mode === m ? "bg-white/25 shadow-inner" : "hover:bg-white/10"}`}>
              {t(m)}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs uppercase tracking-widest opacity-80">{t("email")}</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-3 rounded-2xl bg-white/15 border border-white/25 placeholder-white/50 text-white outline-none focus:bg-white/20 focus:border-white/40 transition" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest opacity-80">{t("password")}</label>
            <input type="password" required value={pw} onChange={(e) => setPw(e.target.value)}
              className="mt-1 w-full px-4 py-3 rounded-2xl bg-white/15 border border-white/25 placeholder-white/50 text-white outline-none focus:bg-white/20 focus:border-white/40 transition" />
          </div>
          <button type="submit" className="w-full py-3 rounded-2xl font-bold text-shadow-lg"
            style={{ background: "linear-gradient(135deg, hsl(28 100% 60%), hsl(0 85% 55%))", boxShadow: "0 10px 30px -8px hsl(28 100% 50% / 0.6)" }}>
            {mode === "login" ? t("login") : t("register")}
          </button>
        </form>

        <button onClick={guest} className="mt-3 w-full py-3 rounded-2xl glass text-sm font-medium hover:bg-white/20 transition">
          {t("continueGuest")}
        </button>
      </div>
    </div>
  );
}
