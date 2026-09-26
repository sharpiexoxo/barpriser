"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { Camera, X, Plus, Check, LogIn, Search, MapPin } from "lucide-react";
import { useSession } from "next-auth/react";
import { useToast, ToastProvider } from "@/components/Toast";
import { useLocale } from "@/components/LocaleProvider";
import { CITIES } from "@/lib/cities";
import type { Venue } from "@/lib/db";
import clsx from "clsx";
import Link from "next/link";

function VenueSearch({ onSelect }: { onSelect: (v: Venue) => void }) {
  const toast = useToast();
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Venue[]>([]);
  const [all, setAll] = useState<Venue[]>([]);
  const [selected, setSelected] = useState<Venue | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [nvName, setNvName] = useState("");
  const [nvCity, setNvCity] = useState("");
  const [nvCitySearch, setNvCitySearch] = useState("");
  const [nvLocation, setNvLocation] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCities = useMemo(() => {
    const q = nvCitySearch.toLowerCase();
    return CITIES.filter(c => !q || c.label.toLowerCase().includes(q));
  }, [nvCitySearch]);

  useEffect(() => {
    fetch("/api/venues").then(r => r.json()).then(d => { if (Array.isArray(d)) setAll(d); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    setResults(all.filter(v =>
      v.name.toLowerCase().includes(q) ||
      (v.location ?? "").toLowerCase().includes(q) ||
      (v.city ?? "").toLowerCase().includes(q)
    ).slice(0, 8));
  }, [query, all]);

  function pick(v: Venue) { setSelected(v); setQuery(v.name); setOpen(false); setShowNew(false); onSelect(v); }
  function clear() { setSelected(null); setQuery(""); setResults([]); setShowNew(false); setOpen(false); }

  async function createVenue() {
    if (!nvName.trim()) { toast(t("toast_fail_venue"), "error"); return; }
    if (!nvCity)        { toast(t("toast_fail_city"),  "error"); return; }
    const res = await fetch("/api/venues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nvName.trim(), city: nvCity, location: nvLocation.trim() }),
    });
    if (!res.ok) { const d = await res.json(); toast(d.error, "error"); return; }
    const v: Venue = await res.json();
    const updated = await fetch("/api/venues").then(r => r.json());
    if (Array.isArray(updated)) setAll(updated);
    setNvName(""); setNvCity(""); setNvCitySearch(""); setNvLocation(""); setShowNew(false);
    pick(v);
    toast(t("toast_venue_added"));
  }

  const noResults = query.trim().length > 0 && results.length === 0 && !selected;
  const cityLabel = selected ? CITIES.find(c => c.value === selected.city)?.label ?? selected.city : "";

  return (
    <div className="relative">
      <div className={clsx(
        "flex items-center gap-2 border rounded-xl px-3 py-2.5 transition-all bg-surface",
        selected ? "border-brand bg-brand-light/30" : "border-surface-3 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10"
      )}>
        {selected ? <MapPin size={15} className="text-brand shrink-0" /> : <Search size={15} className="text-ink-3 shrink-0" />}
        <input ref={inputRef} value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); if (selected) setSelected(null); }}
          onFocus={() => setOpen(true)}
          placeholder={t("add_search")}
          className="flex-1 bg-transparent border-0 outline-none ring-0 text-sm text-ink p-0 focus:ring-0"
          style={{ boxShadow: "none" }}
        />
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
                    <button onMouseDown={() => pick(v)}
                      className="w-full text-left px-4 py-3 hover:bg-surface-2 transition-colors flex items-center gap-3 border-b border-surface-3 last:border-0">
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
          {noResults && !showNew && (
            <div className="px-4 py-4">
              <p className="text-sm text-ink-3 mb-3">
                {t("add_no_results")} <span className="font-medium text-ink">"{query}"</span>
              </p>
              <button onMouseDown={() => { setShowNew(true); setNvName(query); setOpen(false); }}
                className="btn-primary text-xs px-3 py-2 flex items-center gap-1.5">
                <Plus size={13} /> {t("add_add_venue")} "{query}"
              </button>
            </div>
          )}
          {query.trim() === "" && (
            <div className="px-4 py-3 text-xs text-ink-3">
              {t("add_search_hint")} — {all.length} {t("add_entries")}
            </div>
          )}
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
              {/* Searchable city select */}
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
                <input
                  value={nvCity ? (CITIES.find(c => c.value === nvCity)?.label ?? nvCity) : nvCitySearch}
                  onChange={e => { setNvCitySearch(e.target.value); setNvCity(""); }}
                  placeholder="Søg efter by…"
                  className="pl-7 text-sm"
                  onFocus={() => setNvCity("")}
                />
              </div>
              {(nvCitySearch || !nvCity) && filteredCities.length > 0 && !nvCity && nvCitySearch && (
                <div className="border border-surface-3 rounded-lg mt-1 bg-surface shadow-lg max-h-40 overflow-y-auto">
                  {filteredCities.map(c => (
                    <button key={c.value} type="button"
                      onMouseDown={() => { setNvCity(c.value); setNvCitySearch(c.label); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-surface-2 transition-colors border-b border-surface-3 last:border-0">
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
              {!nvCitySearch && !nvCity && (
                <select value={nvCity} onChange={e => { setNvCity(e.target.value); setNvCitySearch(""); }}
                  className="mt-1 text-sm">
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

function AddForm() {
  const toast = useToast();
  const { t } = useLocale();
  const { status } = useSession();
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [drink, setDrink] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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

  const CATEGORIES = [t("cat_beer_draft"),t("cat_beer_bottle"),t("cat_wine"),t("cat_cocktail"),t("cat_spirit"),t("cat_shot"),t("cat_soft"),t("cat_other")];

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setPhotoFile(file); setPhotoUrl(URL.createObjectURL(file));
  }
  function removePhoto() { setPhotoFile(null); setPhotoUrl(null); if (fileRef.current) fileRef.current.value = ""; }

  async function submit() {
    if (!selectedVenue)          { toast(t("toast_fail_venue_sel"), "error"); return; }
    if (!drink.trim())           { toast(t("toast_fail_drink"), "error"); return; }
    if (!price || isNaN(+price)) { toast(t("toast_fail_price"), "error"); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("venue_id", String(selectedVenue.id));
      fd.append("drink", drink.trim());
      fd.append("category", category);
      fd.append("price_dkk", price);
      fd.append("notes", notes.trim());
      if (photoFile) fd.append("photo", photoFile);
      const res = await fetch("/api/entries", { method: "POST", body: fd });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setDrink(""); setCategory(""); setPrice(""); setNotes(""); removePhoto();
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
