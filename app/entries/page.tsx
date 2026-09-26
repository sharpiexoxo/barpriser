"use client";
import { useCallback, useEffect, useState, Suspense } from "react";
import { Trash2, MapPin, Flag, User, ChevronRight, ChevronLeft, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { ToastProvider, useToast } from "@/components/Toast";
import ReportModal from "@/components/ReportModal";
import { useLocale } from "@/components/LocaleProvider";
import CityPicker from "@/components/CityPicker";
import { CITIES } from "@/lib/cities";
import type { Entry, Venue } from "@/lib/db";
import clsx from "clsx";

function formatDate(iso: string) {
  return new Date(iso + "Z").toLocaleDateString("da-DK", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

// ── Step 2: Pick bar ──────────────────────────────────────────────────────
function StepBar({ city, onSelect }: { city: string; onSelect: (venue: Venue) => void }) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const cityLabel = CITIES.find(c => c.value === city)?.label ?? city;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/venues?city=${city}`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setVenues(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [city]);

  if (loading) return <div className="text-center py-16 text-ink-3 text-sm">Indlæser barer…</div>;

  if (venues.length === 0) return (
    <div className="text-center py-16 text-ink-3 px-4">
      <div className="text-4xl mb-3 opacity-30">🍺</div>
      <p className="text-sm">Ingen barer registreret i {cityLabel} endnu</p>
      <a href="/add" className="btn-primary inline-flex mt-4 text-sm">Tilføj den første bar</a>
    </div>
  );

  const sponsored = venues.filter(v => v.is_featured);
  const regular   = venues.filter(v => !v.is_featured);

  function VenueCard({ v }: { v: Venue }) {
    return (
      <button onClick={() => onSelect(v)}
        className={clsx(
          "card text-left hover:border-brand transition-all group flex items-start justify-between gap-3 w-full",
          v.is_featured && "border-brand/30 bg-brand-light/10"
        )}>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            {v.is_featured && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-brand text-white px-2 py-0.5 rounded-full shrink-0">
                <Star size={8} className="fill-white" /> Sponsoreret
              </span>
            )}
          </div>
          <div className="font-serif text-lg font-bold text-ink group-hover:text-brand transition-colors truncate">{v.name}</div>
          {v.location && (
            <div className="flex items-center gap-1 text-xs text-ink-3 mt-1">
              <MapPin size={10} className="shrink-0" /><span className="truncate">{v.location}</span>
            </div>
          )}
          <div className="font-mono text-xs text-ink-3 mt-2">
            {v.entry_count ?? 0} {(v.entry_count ?? 0) === 1 ? "pris" : "priser"} registreret
          </div>
        </div>
        <ChevronRight size={18} className="text-ink-3 group-hover:text-brand shrink-0 mt-1 transition-colors" />
      </button>
    );
  }

  return (
    <div>
      <p className="text-sm text-ink-3 mb-4">{venues.length} {venues.length === 1 ? "bar" : "barer"} i {cityLabel}</p>
      {sponsored.length > 0 && (
        <div className="mb-5">
          <div className="section-label mb-3">
            <Star size={10} className="text-brand fill-brand" /> Sponsorerede steder
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {sponsored.map(v => <VenueCard key={v.id} v={v} />)}
          </div>
        </div>
      )}
      {regular.length > 0 && (
        <div>
          {sponsored.length > 0 && <div className="section-label mb-3">Alle barer</div>}
          <div className="grid gap-3 md:grid-cols-2">
            {regular.map(v => <VenueCard key={v.id} v={v} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step 3: Pick category ─────────────────────────────────────────────────
function StepCategory({ venue, onSelect }: { venue: Venue; onSelect: (cat: string) => void }) {
  const { t } = useLocale();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const CATEGORIES = [
    t("cat_beer_draft"), t("cat_beer_bottle"), t("cat_wine"), t("cat_cocktail"),
    t("cat_spirit"), t("cat_shot"), t("cat_soft"), t("cat_other"),
  ];

  useEffect(() => {
    fetch(`/api/entries?venue_id=${venue.id}`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setEntries(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [venue.id]);

  if (loading) return <div className="text-center py-16 text-ink-3 text-sm">Indlæser kategorier…</div>;

  const usedCategories = [...new Set(entries.map(e => e.category).filter(Boolean))] as string[];
  const hasUncategorized = entries.some(e => !e.category);

  if (entries.length === 0) return (
    <div className="text-center py-16 text-ink-3 px-4">
      <div className="text-4xl mb-3 opacity-30">🍺</div>
      <p className="text-sm">Ingen priser registreret på {venue.name} endnu</p>
      <a href="/add" className="btn-primary inline-flex mt-4 text-sm">Tilføj den første pris</a>
    </div>
  );

  return (
    <div>
      <p className="text-sm text-ink-3 mb-4">Vælg en drikke-kategori for at se priser</p>
      <button onClick={() => onSelect("__all__")}
        className="card w-full text-left hover:border-brand transition-all group flex items-center justify-between mb-3">
        <div>
          <div className="font-medium text-ink group-hover:text-brand transition-colors">Vis alle priser</div>
          <div className="font-mono text-xs text-ink-3 mt-0.5">{entries.length} {entries.length === 1 ? "pris" : "priser"} i alt</div>
        </div>
        <ChevronRight size={18} className="text-ink-3 group-hover:text-brand transition-colors shrink-0" />
      </button>
      <div className="section-label mt-5 mb-3">Eller vælg kategori</div>
      <div className="grid gap-2 md:grid-cols-2">
        {CATEGORIES.filter(c => usedCategories.includes(c)).map(c => {
          const count = entries.filter(e => e.category === c).length;
          const avgPrice = Math.round(entries.filter(e => e.category === c).reduce((s, e) => s + e.price_dkk, 0) / count);
          return (
            <button key={c} onClick={() => onSelect(c)}
              className="card text-left hover:border-brand transition-all group flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-medium text-ink group-hover:text-brand transition-colors">{c}</div>
                <div className="font-mono text-xs text-ink-3 mt-0.5">{count} {count === 1 ? "pris" : "priser"} · gns. {avgPrice} kr</div>
              </div>
              <ChevronRight size={18} className="text-ink-3 group-hover:text-brand transition-colors shrink-0 ml-2" />
            </button>
          );
        })}
        {hasUncategorized && (
          <button onClick={() => onSelect("__none__")}
            className="card text-left hover:border-brand transition-all group flex items-center justify-between">
            <div>
              <div className="font-medium text-ink group-hover:text-brand transition-colors">Uden kategori</div>
              <div className="font-mono text-xs text-ink-3 mt-0.5">{entries.filter(e => !e.category).length} priser</div>
            </div>
            <ChevronRight size={18} className="text-ink-3 group-hover:text-brand transition-colors shrink-0 ml-2" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Step 4: Show prices ───────────────────────────────────────────────────
function StepPrices({ venue, category }: { venue: Venue; category: string }) {
  const toast = useToast();
  const { data: session } = useSession();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [reporting, setReporting] = useState<Entry | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ venue_id: String(venue.id) });
    if (category !== "__all__" && category !== "__none__") params.set("category", category);
    const res = await fetch(`/api/entries?${params.toString()}`);
    if (res.ok) {
      let data: Entry[] = await res.json();
      if (category === "__none__") data = data.filter(e => !e.category);
      setEntries(data);
    }
    setLoading(false);
  }, [venue.id, category]);

  useEffect(() => { load(); }, [load]);

  async function del(id: number) {
    if (!confirm("Slet denne pris?")) return;
    const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
    if (res.ok) { setEntries(e => e.filter(x => x.id !== id)); toast("Pris slettet"); }
    else toast("Kunne ikke slette", "error");
  }

  const avgPrice = entries.length ? Math.round(entries.reduce((s, e) => s + e.price_dkk, 0) / entries.length) : null;
  const minPrice = entries.length ? Math.min(...entries.map(e => e.price_dkk)) : null;
  const maxPrice = entries.length ? Math.max(...entries.map(e => e.price_dkk)) : null;

  if (loading) return <div className="text-center py-16 text-ink-3 text-sm">Indlæser priser…</div>;

  if (entries.length === 0) return (
    <div className="text-center py-16 text-ink-3">
      <div className="text-4xl mb-3 opacity-30">🍺</div>
      <p className="text-sm">Ingen priser i denne kategori endnu</p>
    </div>
  );

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6">
        {([["Gennemsnit", avgPrice, "text-brand"], ["Laveste", minPrice, "text-ink"], ["Højeste", maxPrice, "text-ink"]] as const).map(([label, val, cls]) => (
          <div key={label} className="card text-center p-3 md:p-5">
            <div className="font-mono text-[9px] md:text-[10px] uppercase tracking-wide text-ink-3 mb-1">{label}</div>
            <div className={clsx("font-serif text-xl md:text-2xl font-bold", cls)}>
              {val} <span className="text-xs md:text-sm font-sans text-ink-3 font-normal">kr</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {entries.map(e => {
          const userId = (session?.user as any)?.id;
          const isOwner = userId && String(e.user_id) === userId;
          return (
            <div key={e.id} className="card flex gap-3 md:gap-4 items-start group hover:border-surface-3 transition-all p-3 md:p-5">
              {e.photo_path
                ? <img src={e.photo_path} alt={e.drink} className="w-14 h-14 md:w-16 md:h-16 object-cover rounded-xl border border-surface-3 shrink-0" />
                : <div className="w-14 h-14 md:w-16 md:h-16 bg-surface-2 rounded-xl border border-surface-3 shrink-0 flex items-center justify-center text-xl">🍺</div>
              }
              <div className="flex-1 min-w-0">
                <div className="text-[14px] md:text-[15px] font-medium text-ink">{e.drink}</div>
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  {e.category && <span className="badge bg-brand-light text-brand-dark">{e.category}</span>}
                  {e.notes && <span className="badge bg-surface-2 text-ink-3">{e.notes}</span>}
                  {(e.report_count ?? 0) > 0 && <span className="badge bg-red-50 text-red-600">⚑ {e.report_count}</span>}
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-[11px] text-ink-3">{formatDate(e.created_at)}</span>
                  {e.user_name && <span className="flex items-center gap-1 text-[11px] text-ink-3"><User size={9} />{e.user_name}</span>}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-serif text-xl md:text-2xl font-bold text-brand">{Math.round(e.price_dkk)}</div>
                <div className="font-mono text-[10px] text-ink-3">DKK</div>
                <div className="flex gap-1 mt-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  {session && (
                    <button onClick={() => setReporting(e)} className="btn p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg">
                      <Flag size={13} />
                    </button>
                  )}
                  {isOwner && (
                    <button onClick={() => del(e.id)} className="btn-danger p-1.5 rounded-lg">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {reporting && (
        <ReportModal entryId={reporting.id} drinkName={reporting.drink}
          onClose={() => setReporting(null)}
          onSuccess={() => { toast("Rapport sendt — tak!"); load(); }}
        />
      )}
      {!session && (
        <p className="text-center text-sm text-ink-3 mt-6">
          <a href="/login" className="text-brand font-medium hover:underline">Log ind</a> for at rapportere priser
        </p>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
function EntriesContent() {
  const searchParams = useSearchParams();
  const [city,     setCity]     = useState("");
  const [venue,    setVenue]    = useState<Venue | null>(null);
  const [category, setCategory] = useState("");

  useEffect(() => {
    const cityParam  = searchParams.get("city");
    const venueParam = searchParams.get("venue");
    if (!cityParam) return;
    setCity(cityParam);
    if (venueParam) {
      fetch(`/api/venues?city=${cityParam}`)
        .then(r => r.json())
        .then(venues => {
          if (Array.isArray(venues)) {
            const match = venues.find((v: Venue) => String(v.id) === venueParam);
            if (match) setVenue(match);
          }
        })
        .catch(() => {});
    }
  }, [searchParams]);

  const cityLabel = CITIES.find(c => c.value === city)?.label ?? "";
  const step = !city ? 1 : !venue ? 2 : !category ? 3 : 4;

  function goBack() {
    if (category) { setCategory(""); return; }
    if (venue)    { setVenue(null);   return; }
    if (city)     { setCity("");      return; }
  }

  const breadcrumb = [
    city     && cityLabel,
    venue    && venue.name,
    category && (category === "__all__" ? "Alle priser" : category === "__none__" ? "Uden kategori" : category),
  ].filter(Boolean) as string[];

  return (
    <ToastProvider>
      <div className="border-b border-surface-3 px-4 md:px-10 py-5 md:py-6">
        {breadcrumb.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-ink-3 font-mono mb-2 flex-wrap overflow-hidden">
            <button onClick={() => { setCity(""); setVenue(null); setCategory(""); }}
              className="hover:text-brand transition-colors shrink-0">Alle byer</button>
            {breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1 min-w-0">
                <ChevronRight size={10} className="shrink-0" />
                <span
                  className={clsx("truncate", i === breadcrumb.length - 1 ? "text-ink font-medium" : "hover:text-brand cursor-pointer transition-colors")}
                  onClick={() => { if (i === 0) { setVenue(null); setCategory(""); } if (i === 1) setCategory(""); }}>
                  {crumb}
                </span>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-ink truncate">
              {step === 1 && "Alle priser"}
              {step === 2 && `Barer i ${cityLabel}`}
              {step === 3 && venue?.name}
              {step === 4 && (category === "__all__" ? `Alle — ${venue?.name}` : category === "__none__" ? "Uden kategori" : category)}
            </h2>
            <p className="text-sm text-ink-3 mt-1 truncate">
              {step === 1 && "Vælg en by for at se priser"}
              {step === 2 && `${cityLabel} — vælg en bar`}
              {step === 3 && "Vælg en drikke-kategori"}
              {step === 4 && venue?.location && `📍 ${venue.location} · ${cityLabel}`}
            </p>
          </div>
          {step > 1 && (
            <button onClick={goBack} className="btn-ghost text-sm flex items-center gap-1.5 shrink-0">
              <ChevronLeft size={14} /> Tilbage
            </button>
          )}
        </div>
      </div>
      <div className="px-4 md:px-10 py-6 md:py-8">
        {step === 1 && <CityPicker onSelect={c => { setCity(c); setVenue(null); setCategory(""); }} />}
        {step === 2 && <StepBar city={city} onSelect={v => { setVenue(v); setCategory(""); }} />}
        {step === 3 && venue && <StepCategory venue={venue} onSelect={setCategory} />}
        {step === 4 && venue && category && <StepPrices venue={venue} category={category} />}
      </div>
    </ToastProvider>
  );
}

export default function EntriesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-ink-3 text-sm">Indlæser…</div>}>
      <EntriesContent />
    </Suspense>
  );
}
