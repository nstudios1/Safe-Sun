import { type SyntheticEvent, useRef, useState } from "react";
import { Sun, ArrowRight, Sparkles } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

const SKIN_TONES = [
  { type: 1, color: "#f7d9c4", label: "skin1" },
  { type: 2, color: "#e8b894", label: "skin2" },
  { type: 3, color: "#c99979", label: "skin3" },
  { type: 4, color: "#a3714f", label: "skin4" },
  { type: 5, color: "#6f4a2d", label: "skin5" },
  { type: 6, color: "#3d2415", label: "skin6" },
] as const;

export default function Onboarding() {
  const { t, saveProfile } = useApp();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [name, setName] = useState("");
  const [skin, setSkin] = useState<number>(3);

  const focusNameInput = (event?: SyntheticEvent<HTMLInputElement>) => {
    event?.stopPropagation();
    (event?.currentTarget ?? nameInputRef.current)?.focus({ preventScroll: true });
  };

  const next = () => {
    if (step === 0 && name.trim()) setStep(1);
    else if (step === 1) setStep(2);
  };
  const finish = () => {
    saveProfile({ name: name.trim() || "Friend", skinType: skin, createdAt: Date.now() });
  };

  return (
    <div className="relative z-[9999] pointer-events-auto select-text min-h-screen flex items-center justify-center p-5">
      <div className="relative z-[9999] pointer-events-auto select-text w-full max-w-md glass-strong p-7 animate-fade-up">
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-16 h-16 rounded-3xl glass-strong flex items-center justify-center mb-3 animate-pulse-glow"
            style={{ color: "hsl(28 100% 65%)" }}
          >
            <Sun size={32} />
          </div>
          <h1 className="text-3xl font-bold text-shadow-lg text-center">{t("onboardingTitle")}</h1>
          <p className="opacity-90 text-sm mt-1 text-center">{t("onboardingSub")}</p>
        </div>

        {step === 0 && (
          <div className="space-y-4 animate-fade-up relative z-[9999] pointer-events-auto select-text">
            <div className="relative z-[9999] pointer-events-auto select-text">
              <label className="text-xs uppercase tracking-widest opacity-80">{t("yourName")}</label>
              <input
                ref={nameInputRef}
                autoFocus
                type="text"
                inputMode="text"
                readOnly={false}
                autoComplete="given-name"
                autoCorrect="off"
                autoCapitalize="words"
                enterKeyHint="next"
                value={name}
                onClick={focusNameInput}
                onTouchStart={focusNameInput}
                onPointerDown={focusNameInput}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && next()}
                placeholder={t("yourNamePh")}
                className="relative z-[9999] pointer-events-auto select-text mt-1 w-full px-4 py-3 rounded-2xl bg-white/15 border border-white/25 placeholder-white/50 text-white outline-none focus:bg-white/20 focus:border-white/40 transition text-base"
                style={{ fontSize: 16, zIndex: 9999 }}
              />
            </div>
            <button
              onClick={next}
              disabled={!name.trim()}
              className="w-full py-3 rounded-2xl font-bold text-shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition"
              style={{
                background: "linear-gradient(135deg, hsl(28 100% 60%), hsl(0 85% 55%))",
                boxShadow: "0 10px 30px -8px hsl(28 100% 50% / 0.6)",
              }}
            >
              {t("getStarted")} <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5 animate-fade-up">
            <div>
              <div className="text-xs uppercase tracking-widest opacity-80 mb-1">{t("chooseSkinTone")}</div>
              <p className="text-xs opacity-70">{t("skinToneHelp")}</p>
            </div>

            <div className="flex items-center justify-center mb-2">
              <div
                className="w-24 h-24 rounded-full border-4 border-white/40 shadow-2xl flex items-center justify-center text-white font-bold text-3xl transition-all duration-500"
                style={{
                  background: SKIN_TONES.find((s) => s.type === skin)?.color,
                  boxShadow: `0 10px 40px ${SKIN_TONES.find((s) => s.type === skin)?.color}80`,
                }}
              >
                {(name.trim()[0] || "S").toUpperCase()}
              </div>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {SKIN_TONES.map((s) => (
                <button
                  key={s.type}
                  onClick={() => setSkin(s.type)}
                  aria-label={t(s.label as any)}
                  className={`aspect-square rounded-full border-2 transition-all ${
                    skin === s.type ? "border-white scale-110 shadow-lg" : "border-white/30 hover:border-white/60"
                  }`}
                  style={{ background: s.color }}
                />
              ))}
            </div>
            <div className="text-center text-xs opacity-80">{t(SKIN_TONES.find((s) => s.type === skin)!.label as any)}</div>

            <button
              onClick={next}
              className="w-full py-3 rounded-2xl font-bold text-shadow-lg flex items-center justify-center gap-2 transition"
              style={{
                background: "linear-gradient(135deg, hsl(28 100% 60%), hsl(0 85% 55%))",
                boxShadow: "0 10px 30px -8px hsl(28 100% 50% / 0.6)",
              }}
            >
              {t("getStarted")} <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-fade-up text-center">
            <div
              className="mx-auto w-16 h-16 rounded-3xl glass-strong flex items-center justify-center"
              style={{ color: "hsl(45 100% 65%)" }}
            >
              <Sparkles size={28} />
            </div>
            <h2 className="text-xl font-bold text-shadow-lg">{t("vitDExplainTitle")}</h2>
            <p className="text-sm opacity-90 leading-relaxed">{t("vitDExplainBody")}</p>
            <button
              onClick={finish}
              className="w-full py-3 rounded-2xl font-bold text-shadow-lg flex items-center justify-center gap-2 transition"
              style={{
                background: "linear-gradient(135deg, hsl(28 100% 60%), hsl(0 85% 55%))",
                boxShadow: "0 10px 30px -8px hsl(28 100% 50% / 0.6)",
              }}
            >
              {t("gotIt")} <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
