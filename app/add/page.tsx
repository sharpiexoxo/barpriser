"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { Camera, X, Plus, Check, LogIn, Search, MapPin, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { useSession } from "next-auth/react";
import { useToast, ToastProvider } from "@/components/Toast";
import { useLocale } from "@/components/LocaleProvider";
import { CITIES } from "@/lib/cities";
import { CATEGORIES_DA, CATEGORIES_EN } from "@/lib/categories";
import type { Venue } from "@/lib/db";
import clsx from "clsx";
import Link from "next/link";

const DAYS = [
  { value: "1", label: "Man" },
  { value: "2", label: "Tir" },
  { value: "3", label: "Ons" },
  { value: "4", label: "Tor" },
  { value: "5", label: "Fre" },
  { value: "6", label: "Lør" },
  { value: "0", label: "Søn" },
];

const UNTIL_OPTIONS = [
  "12:00","13:00","14:00","15:00","16:00","17:00",
  "18:00","19:00","20:00","21:00","22:00","23:00",
];

function VenueSearch({ onSelect }: { onSelect: (v: Venue) => void }) {
  const toast = useToast();
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [all, setAll] = useState<Venue[]>([]);
  const [selected, setSelected] = useState<Venue | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [nvName, setNvName] = useState("");
  const [nvCity, setNvCity] = useState("");
  const [nvCitySearch, setNvCitySearch] = useState("");
  const [nvLocation, setNvLocation] = useState("");
  const [open, setOpen] = useState(false);

  const filteredCities = useMemo(() => {
    const q = nvCitySearch.toLowerCase();
    return CITIES.filter(c => !q || c.label.toLowerCase().includes(q));
  }, [nvCitySearch]);

  useEffect(() => {
    fetch("/api/venues").then(r => r.json()).then(d => { if (Array.isArray(d)) setAll(d); }).catch(() => {});
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return all.filter(v => v.name.toLowerCase().includes(q) || (v.location ?? "").toLowerCase().includes(q)).slice(0, 8);
  }, [query, all]);

  function pick(v: Venue) { setSelected(v); setQuery(v.name); setOpen(false); setShowNew(false); onSelect(v); }
  function clear() { setSelected(null); setQuery(""); setOpen(false); setShowNew(false); }

  async function createVenue() {
    if (!nvName.trim()) { toast(t("toast_fail_venue"), "error"); return; }
    if (!nvCity) { toast(t("toast_fail_city"), "error"); return; }
    const res = await fetch("/api/venues", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: nvName.trim(), city: nvCity, location: nvLocation.trim() }) });
    if (!res.ok) { const d = await res.json(); toast(d.error, "error"); return; }
    const v: Venue = await res.json();
    const updated = await fetch("/api/venues").then(r => r.json());
    if (Array.isArray(updated)) setAll(updated);
    setNvName(""); setNvCity(""); setNvCitySearch(""); setNvLocation(""); setShowNew(false);
    pick(v); toast(t("toast_venue_added"));
  }

  const cityLabel = selected ? CITIES.find(c => c.value === selected.city)?.label ?? selected.city : "";

  return (
    <div className="relative">
      <div className={clsx("flex items-center gap-2 border rounded-xl px-3 py-2.5 transition-all bg-surface", selected ? "border-brand bg-brand-light/30" : "border-surface-3 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10")}>
        {selected ? <MapPin size={15} className="text-brand shrink-0" /> : <Search size={15} className="text-ink-3 shrink-0" />}
        <input value={query} onChange={e => { setQuery(e.target.value); setOpen(true); if (selected) setSelected(null); }}
          onFocus={() => setOpen(true)}
          placeholder={t("add_search")}
          className="flex-1 bg-transparent border-0 outline-none ring-0 text-sm text-ink p-0 focus:ring-0"
          style={{ boxShadow: "none" }} />
        {query && <button onClick={clear} className="text-ink-3 hover:text-ink"><X size={14} /></button>}
      </div>
      {selected && (
        <div className="mt-2 flex items-center gap-2 text-sm text-brand-dark font-medium flex-wrap">
          <Check size={14} className="text-brand shrink-0" />
          <span>{selected.name}</span>
          <span className="text-ink-3 font-normal text-xs">· {cityLabel}{selected.location ? `, ${selected.location}` : ""}</span>
          <button onClick={clear} className="ml-auto text-xs text-ink-3 hover:text-brand underline">{t("add_change")}</button>
        </div>
      )}
      {open && !selected && (
        <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-surface border border-surface-3 rounded-xl shadow-xl overflow-hidden">
          {results.length > 0 && (
            <ul>
              {results.map(v => {
                const city = CITIES.find(c => c.value === v.city)?.label ?? v.city;
                return (
                  <li key={v.id}>
                    <button onMouseDown={() => pick(v)} className="w-full text-left px-4 py-3 hover:bg-surface-2 transition-colors flex items-center gap-3 border-b border-surface-3 last:border-0">
                      <MapPin size={13} className="text-brand shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-ink truncate">{v.name}</div>
                        <div className="text-xs text-ink-3 truncate">{city}{v.location ? ` · ${v.location}` : ""}</div>
                      </div>
                      <div className="ml-auto font-mono text-[10px] text-ink-3 shrink-0">{v.entry_count ?? 0} {t("add_entries")}</div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {query.trim().length > 0 && results.length === 0 && !showNew && (
            <div className="px-4 py-4">
              <p className="text-sm text-ink-3 mb-3">{t("add_no_results")} <span className="font-medium text-ink">"{query}"</span></p>
              <button onMouseDown={() => { setShowNew(true); setNvName(query); setOpen(false); }} className="btn-primary text-xs px-3 py-2 flex items-center gap-1.5">
                <Plus size={13} /> {t("add_add_venue")} "{query}"
              </button>
            </div>
          )}
          {query.trim() === "" && <div className="px-4 py-3 text-xs text-ink-3">{t("add_search_hint")} — {all.length} {t("add_entries")}</div>}
        </div>
      )}
      {showNew && !selected && (
        <div className="mt-3 p-4 bg-surface-2 rounded-xl border border-surface-3">
          <p className="text-xs font-medium text-ink-2 mb-3">{t("add_new_venue")}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[11px] font-medium text-ink-2 mb-1">{t("add_venue_name")}</label>
              <input value={nvName} onChange={e => setNvName(e.target.value)} placeholder={t("add_venue_ph")} />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-ink-2 mb-1">{t("add_venue_city")}</label>
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
                <input value={nvCity ? (CITIES.find(c => c.value === nvCity)?.label ?? nvCity) : nvCitySearch}
                  onChange={e => { setNvCitySearch(e.target.value); setNvCity(""); }}
                  placeholder="Søg efter by…" className="pl-7 text-sm"
                  onFocus={() => { if (nvCity) { setNvCitySearch(""); setNvCity(""); } }} />
              </div>
              {!nvCity && nvCitySearch && filteredCities.length > 0 && (
                <div className="border border-surface-3 rounded-lg mt-1 bg-surface shadow-lg max-h-40 overflow-y-auto">
                  {filteredCities.map(c => (
                    <button key={c.value} type="button" onMouseDown={() => { setNvCity(c.value); setNvCitySearch(c.label); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-surface-2 transition-colors border-b border-surface-3 last:border-0">{c.label}</button>
                  ))}
                </div>
              )}
              {!nvCitySearch && !nvCity && (
                <select value={nvCity} onChange={e => { setNvCity(e.target.value); setNvCitySearch(""); }} className="mt-1 text-sm">
                  <option value="">{t("add_venue_city_select")}</option>
                  {CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] font-medium text-ink-2 mb-1">{t("add_venue_loc")}</label>
              <input value={nvLocation} onChange={e => setNvLocation(e.target.value)} placeholder={t("add_venue_loc_ph")} />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary text-xs px-4 py-2" onClick={createVenue}><Check size={13} /> {t("add_save_venue")}</button>
            <button className="btn-ghost text-xs px-4 py-2" onClick={() => { setShowNew(false); setQuery(""); }}>{t("add_cancel")}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Offer section with multi-rule support ────────────────────────────────
interface OfferRule { days: string[]; until: string; }
const DAY_ORDER = ["1","2","3","4","5","6","0"];

function RuleEditor({ rule, onChange, onRemove, showRemove }: {
  rule: OfferRule;
  onChange: (r: OfferRule) => void;
  onRemove: () => void;
  showRemove: boolean;
}) {
  function toggleDay(d: string) {
    const days = rule.days.includes(d) ? rule.days.filter(x => x !== d) : [...rule.days, d];
    onChange({ ...rule, days });
  }
  function setPreset(preset: string) {
    if (preset === "weekdays") onChange({ ...rule, days: ["1","2","3","4","5"] });
    if (preset === "weekend")  onChange({ ...rule, days: ["6","0"] });
    if (preset === "all")      onChange({ ...rule, days: ["0","1","2","3","4","5","6"] });
  }

  const sortedDays = [...rule.days].sort((a,b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
  const dayLabels  = sortedDays.map(d => DAYS.find(x => x.value === d)?.label).join(", ");

  return (
    <div className="border border-surface-3 rounded-xl p-3 bg-surface">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-medium text-ink-2 uppercase tracking-wide">
          {dayLabels || "Ingen dage valgt"}{rule.until ? ` · til ${rule.until}` : " · hele dagen"}
        </span>
        {showRemove && (
          <button type="button" onClick={onRemove} className="text-xs text-red-500 hover:underline">Fjern</button>
        )}
      </div>

      <div className="flex gap-1.5 flex-wrap mb-2">
        {DAYS.map(d => (
          <button key={d.value} type="button" onClick={() => toggleDay(d.value)}
            className={clsx("px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all",
              rule.days.includes(d.value) ? "bg-brand text-white border-brand" : "bg-surface border-surface-3 text-ink-2 hover:border-brand hover:text-brand")}>
            {d.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap mb-3">
        <button type="button" onClick={() => setPreset("weekdays")} className="text-xs text-brand hover:underline">Hverdage</button>
        <span className="text-ink-3 text-xs">·</span>
        <button type="button" onClick={() => setPreset("weekend")} className="text-xs text-brand hover:underline">Weekend</button>
        <span className="text-ink-3 text-xs">·</span>
        <button type="button" onClick={() => setPreset("all")} className="text-xs text-brand hover:underline">Alle</button>
      </div>

      <div>
        <label className="block text-[11px] font-medium text-ink-2 mb-1">
          Frem til kl. <span className="text-ink-3 font-normal">(lad stå tom = hele dagen)</span>
        </label>
        <select value={rule.until} onChange={e => onChange({ ...rule, until: e.target.value })} className="text-sm">
          <option value="">Hele dagen</option>
          {UNTIL_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
    </div>
  );
}

function OfferSection({ offerPrice, setOfferPrice, offerRules, setOfferRules }: {
  offerPrice: string; setOfferPrice: (v: string) => void;
  offerRules: OfferRule[]; setOfferRules: (v: OfferRule[]) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasOffer = offerPrice || offerRules.some(r => r.days.length > 0);

  function addRule() {
    setOfferRules([...offerRules, { days: [], until: "" }]);
  }
  function updateRule(i: number, rule: OfferRule) {
    const next = [...offerRules]; next[i] = rule; setOfferRules(next);
  }
  function removeRule(i: number) {
    setOfferRules(offerRules.filter((_, idx) => idx !== i));
  }
  function clearOffer() {
    setOfferPrice(""); setOfferRules([{ days: [], until: "" }]);
  }

  return (
    <div className={clsx("rounded-xl border transition-all", hasOffer ? "border-brand/40 bg-brand-light/20" : "border-surface-3 bg-surface-2")}>
      <button type="button" onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left">
        <Tag size={15} className={hasOffer ? "text-brand" : "text-ink-3"} />
        <div className="flex-1 min-w-0">
          <div className={clsx("text-sm font-medium", hasOffer ? "text-brand-dark" : "text-ink-2")}>
            Tilbudspris (valgfrit)
          </div>
          <div className="text-xs text-ink-3 mt-0.5 truncate">
            {hasOffer
              ? `${offerPrice ? offerPrice + " kr" : ""}${offerRules.filter(r => r.days.length > 0).length > 0 ? ` · ${offerRules.filter(r=>r.days.length>0).length} regel${offerRules.filter(r=>r.days.length>0).length>1?"r":""}` : ""}`
              : "Har stedet et særtilbud på denne drik?"}
          </div>
        </div>
        {expanded ? <ChevronUp size={14} className="text-ink-3 shrink-0" /> : <ChevronDown size={14} className="text-ink-3 shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-surface-3 pt-4 flex flex-col gap-4">
          <div>
            <label className="block text-[11px] font-medium text-ink-2 mb-1">Tilbudspris (DKK) *</label>
            <input type="number" value={offerPrice} onChange={e => setOfferPrice(e.target.value)}
              placeholder="f.eks. 35" min="0" step="5" />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-ink-2 mb-2">
              Hvornår gælder tilbuddet?
            </label>
            <div className="flex flex-col gap-3">
              {offerRules.map((rule, i) => (
                <RuleEditor key={i} rule={rule} onChange={r => updateRule(i, r)}
                  onRemove={() => removeRule(i)} showRemove={offerRules.length > 1} />
              ))}
            </div>
            <button type="button" onClick={addRule}
              className="mt-3 flex items-center gap-1.5 text-xs text-brand hover:underline font-medium">
              <Plus size={12} /> Tilføj endnu en regel
            </button>
          </div>

          {hasOffer && (
            <button type="button" onClick={clearOffer} className="text-xs text-red-500 hover:underline self-start">
              Ryd hele tilbuddet
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function AddForm() {
  const toast = useToast();
  const { t, locale } = useLocale();
  const { status } = useSession();
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [drink,      setDrink]      = useState("");
  const [category,   setCategory]   = useState("");
  const [price,      setPrice]      = useState("");
  const [notes,      setNotes]      = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerRules, setOfferRules] = useState<OfferRule[]>([{ days: [], until: "" }]);
  const [photoFile,  setPhotoFile]  = useState<File | null>(null);
  const [photoUrl,   setPhotoUrl]   = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const CATEGORIES = locale === "da" ? CATEGORIES_DA : CATEGORIES_EN;

  if (status === "unauthenticated") return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="text-5xl mb-4">🍺</div>
      <h3 className="font-serif text-xl font-bold text-ink mb-2">{t("add_signin_title")}</h3>
      <p className="text-sm text-ink-3 mb-6 max-w-xs">{t("add_signin_desc")}</p>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link href="/login" className="btn-primary"><LogIn size={15} />{t("add_signin_btn")}</Link>
        <Link href="/register" className="btn-ghost">{t("add_register_btn")}</Link>
      </div>
    </div>
  );
  if (status === "loading") return <div className="py-20 text-center text-ink-3 text-sm">{t("add_loading")}</div>;

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setPhotoFile(file); setPhotoUrl(URL.createObjectURL(file));
  }
  function removePhoto() { setPhotoFile(null); setPhotoUrl(null); if (fileRef.current) fileRef.current.value = ""; }

  async function submit() {
    if (!selectedVenue)          { toast(t("toast_fail_venue_sel"), "error"); return; }
    if (!drink.trim())           { toast(t("toast_fail_drink"),     "error"); return; }
    if (!price || isNaN(+price)) { toast(t("toast_fail_price"),     "error"); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("venue_id",  String(selectedVenue.id));
      fd.append("drink",     drink.trim());
      fd.append("category",  category);
      fd.append("price_dkk", price);
      fd.append("notes",     notes.trim());
      const activeRules = offerRules.filter(r => r.days.length > 0);
      if (offerPrice && activeRules.length > 0) {
        fd.append("offer_price", offerPrice);
        fd.append("offer_days",  JSON.stringify(activeRules.map(r => ({ days: r.days, until: r.until || null }))));
        // offer_until not used in new format — send empty
        fd.append("offer_until", "");
      }
      if (photoFile)           fd.append("photo",       photoFile);
      const res = await fetch("/api/entries", { method: "POST", body: fd });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setDrink(""); setCategory(""); setPrice(""); setNotes("");
      setOfferPrice(""); setOfferRules([{ days: [], until: "" }]);
      removePhoto();
      toast(t("toast_entry_saved"));
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : t("toast_fail_save"), "error");
    } finally { setSubmitting(false); }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-7">
        <div className="section-label">{t("add_step1")}</div>
        <div className="card"><VenueSearch onSelect={setSelectedVenue} /></div>
      </div>
      <div className="mb-7">
        <div className="section-label">{t("add_step2")}</div>
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[11px] font-medium text-ink-2 mb-1">{t("add_drink")}</label>
              <input value={drink} onChange={e => setDrink(e.target.value)} placeholder={t("add_drink_ph")} />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-ink-2 mb-1">{t("add_category")}</label>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">{t("add_cat_select")}</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-ink-2 mb-1">{t("add_price")}</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder={t("add_price_ph")} min="0" step="5" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-ink-2 mb-1">{t("add_notes")}</label>
              <input value={notes} onChange={e => setNotes(e.target.value)} placeholder={t("add_notes_ph")} />
            </div>
          </div>

          {/* Offer price section */}
          <OfferSection
            offerPrice={offerPrice} setOfferPrice={setOfferPrice}
            offerRules={offerRules} setOfferRules={setOfferRules}
          />
        </div>
      </div>
      <div className="mb-8">
        <div className="section-label">{t("add_step3")}</div>
        <div className="card">
          {photoUrl
            ? <div className="relative">
                <img src={photoUrl} alt="Preview" className="w-full max-h-56 object-cover rounded-xl" />
                <button onClick={removePhoto} className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-black/70"><X size={14} /></button>
              </div>
            : <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-surface-3 rounded-xl p-8 cursor-pointer hover:border-brand hover:bg-brand-light transition-all">
                <Camera size={28} className="text-brand" />
                <span className="text-sm text-ink-3 text-center">{t("add_photo_hint")}</span>
                <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handlePhoto} />
              </label>
          }
        </div>
      </div>
      <button onClick={submit} disabled={submitting} className="btn-primary w-full py-4 text-base justify-center disabled:opacity-60">
        <Check size={16} />{submitting ? t("add_saving") : t("add_save")}
      </button>
    </div>
  );
}

export default function AddPage() {
  const { t } = useLocale();
  return (
    <ToastProvider>
      <div className="border-b border-surface-3 px-4 md:px-10 py-5 md:py-7">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-ink">{t("add_title")}</h2>
        <p className="text-sm text-ink-3 mt-1">{t("add_subtitle")}</p>
      </div>
      <div className="px-4 md:px-10 py-6 md:py-8"><AddForm /></div>
    </ToastProvider>
  );
}
