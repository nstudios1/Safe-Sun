import { type SyntheticEvent, useRef, useState } from "react";
import { Search as SearchIcon, MapPin, Star, Trash2, Locate } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { geocodeCity, type Geo } from "@/lib/weather";

export default function SearchPage() {
  const { t, lang, setLocation, useGPS, saved, toggleSave, isSaved } = useApp();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Geo[]>([]);
  const [busy, setBusy] = useState(false);

  const focusSearchInput = (event?: SyntheticEvent<HTMLInputElement>) => {
    event?.stopPropagation();
    (event?.currentTarget ?? searchInputRef.current)?.focus({ preventScroll: true });
  };

  const search = async (val: string) => {
    setQ(val);
    if (val.length < 2) { setResults([]); return; }
    setBusy(true);
    try { setResults(await geocodeCity(val, lang)); } finally { setBusy(false); }
  };

  const pick = (g: Geo) => { setLocation(g); };

  return (
    <div className="px-4 pt-6 pb-32 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-shadow-lg animate-fade-up">{t("search")}</h1>

      <div className="glass p-3 flex items-center gap-2 animate-fade-up relative z-[9999] pointer-events-auto select-text">
        <SearchIcon size={18} className="opacity-80 ml-1" />
        <input
          ref={searchInputRef}
          autoFocus
          type="search"
          inputMode="search"
          readOnly={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="words"
          enterKeyHint="search"
          value={q}
          onClick={focusSearchInput}
          onTouchStart={focusSearchInput}
          onPointerDown={focusSearchInput}
          onChange={(e) => search(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="relative z-[9999] pointer-events-auto select-text flex-1 bg-transparent outline-none placeholder-white/60 py-2 text-base"
          style={{ fontSize: 16, zIndex: 9999 }}
        />
      </div>

      <button onClick={useGPS} className="w-full glass-strong py-3 font-semibold flex items-center justify-center gap-2 hover:bg-white/25 transition animate-fade-up">
        <Locate size={16} />{t("useGPS")}
      </button>

      {busy && <div className="text-center opacity-80 text-sm">…</div>}

      {results.length > 0 && (
        <div className="glass p-2 animate-fade-up">
          {results.map((r, i) => (
            <button key={i} onClick={() => pick(r)} className="w-full flex items-center justify-between gap-2 px-3 py-3 rounded-xl hover:bg-white/10 transition text-left">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="opacity-80" />
                <div>
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-xs opacity-80">{r.country}</div>
                </div>
              </div>
              <span onClick={(e) => { e.stopPropagation(); toggleSave(r); }}
                className={`p-2 rounded-xl transition ${isSaved(r) ? "text-[hsl(45_100%_65%)]" : "opacity-70 hover:opacity-100"}`}>
                <Star size={18} fill={isSaved(r) ? "currentColor" : "none"} />
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="animate-fade-up">
        <h2 className="text-sm uppercase tracking-widest opacity-80 mb-2">{t("savedLocations")}</h2>
        {saved.length === 0 ? (
          <div className="glass p-5 text-sm opacity-80 text-center">—</div>
        ) : (
          <div className="glass p-2">
            {saved.map((g, i) => (
              <div key={i} className="flex items-center justify-between gap-2 px-3 py-3 rounded-xl hover:bg-white/10 transition">
                <button onClick={() => pick(g)} className="flex items-center gap-2 flex-1 text-left">
                  <MapPin size={16} className="opacity-80" />
                  <div>
                    <div className="font-semibold">{g.name}</div>
                    <div className="text-xs opacity-80">{g.country}</div>
                  </div>
                </button>
                <button onClick={() => toggleSave(g)} className="p-2 rounded-xl opacity-70 hover:opacity-100">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
