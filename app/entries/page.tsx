"use client";
import { useCallback, useEffect, useState } from "react";
import { Trash2, MapPin, Flag, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { ToastProvider, useToast } from "@/components/Toast";
import ReportModal from "@/components/ReportModal";
import { useLocale } from "@/components/LocaleProvider";
import { CITIES } from "@/lib/cities";
import type { Entry } from "@/lib/db";
import clsx from "clsx";

function formatDate(iso: string) {
  return new Date(iso + "Z").toLocaleDateString("da-DK", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function CityPicker({ selected, onSelect }: { selected: string; onSelect: (c: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">🏙️</div>
      <h3 className="font-serif text-2xl font-bold text-ink mb-2">Vælg en by</h3>
      <p className="text-sm text-ink-3 mb-8 max-w-xs">
        Vælg den by du vil se drikkevarepriser fra
      </p>
      <div className="flex flex-wrap gap-3 justify-center max-w-sm">
        {CITIES.map(c => (
          <button
            key={c.value}
            onClick={() => onSelect(c.value)}
            className={clsx(
              "px-6 py-3 rounded-xl border-2 text-sm font-medium transition-all",
              selected === c.value
                ? "border-brand bg-brand text-white"
                : "border-surface-3 bg-surface hover:border-brand hover:text-brand text-ink-2"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function EntryCard({ entry, onDelete, onReport }: {
  entry: Entry; onDelete: () => void; onReport: () => void;
}) {
  const { data: session } = useSession();
  const { t } = useLocale();
  const [lightbox, setLightbox] = useState(false);
  const userId = (session?.user as { id?: string })?.id;
  const isOwner = userId && String(entry.user_id) === userId;
  const cityLabel = CITIES.find(c => c.value === entry.venue_city)?.label ?? entry.venue_city ?? "";

  return (
    <>
      <div className="card flex gap-4 items-start group hover:border-surface-3 transition-all">
        {entry.photo_path
          ? <img src={entry.photo_path} alt={entry.drink} onClick={() => setLightbox(true)}
              className="w-16 h-16 object-cover rounded-xl border border-surface-3 cursor-pointer shrink-0 hover:opacity-90" />
          : <div className="w-16 h-16 bg-surface-2 rounded-xl border border-surface-3 shrink-0 flex items-center justify-center text-2xl">🍺</div>
        }
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-ink-3 mb-1">
            <MapPin size={10} />
            {entry.venue_name}
            {entry.venue_location ? ` · ${entry.venue_location}` : ""}
            {cityLabel ? ` · ${cityLabel}` : ""}
          </div>
          <div className="text-[15px] font-medium text-ink">{entry.drink}</div>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {entry.category && <span className="badge bg-brand-light text-brand-dark">{entry.category}</span>}
            {entry.notes && <span className="badge bg-surface-2 text-ink-3">{entry.notes}</span>}
            {(entry.report_count ?? 0) > 0 && (
              <span className="badge bg-red-50 text-red-600">
                ⚑ {entry.report_count} {(entry.report_count ?? 0) === 1 ? t("entries_reports") : t("entries_reportsp")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[11px] text-ink-3">{formatDate(entry.created_at)}</span>
            {entry.user_name && (
              <span className="flex items-center gap-1 text-[11px] text-ink-3">
                <User size={9} />{entry.user_name}
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-serif text-2xl font-bold text-brand">{Math.round(entry.price_dkk)}</div>
          <div className="font-mono text-[10px] text-ink-3">DKK</div>
          <div className="flex gap-1 mt-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
            {session && (
              <button onClick={onReport} className="btn p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg">
                <Flag size={13} />
              </button>
            )}
            {isOwner && (
              <button onClick={onDelete} className="btn-danger p-1.5 rounded-lg">
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
      {lightbox && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={() => setLightbox(false)}>
          <img src={entry.photo_path!} alt={entry.drink} className="max-w-[90vw] max-h-[90vh] rounded-xl" />
        </div>
      )}
    </>
  );
}

function Feed({ city }: { city: string }) {
  const toast = useToast();
  const { data: session } = useSession();
  const { t } = useLocale();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [reporting, setReporting] = useState<Entry | null>(null);

  const CATEGORIES = [
    t("cat_beer_draft"), t("cat_beer_bottle"), t("cat_wine"), t("cat_cocktail"),
    t("cat_spirit"), t("cat_shot"), t("cat_soft"), t("cat_other"),
  ];

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ city });
    if (category) params.set("category", category);
    const res = await fetch(`/api/entries?${params.toString()}`);
    if (res.ok) setEntries(await res.json());
    setLoading(false);
  }, [city, category]);

  useEffect(() => { load(); }, [load]);

  async function del(id: number) {
    if (!confirm("Slet denne pris?")) return;
    const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
    if (res.ok) { setEntries(e => e.filter(x => x.id !== id)); toast(t("toast_entry_deleted")); }
    else toast(t("toast_fail_delete"), "error");
  }

  return (
    <div>
      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6 items-center">
        <span className="font-mono text-[10px] text-ink-3 uppercase tracking-widest">Filtrér:</span>
        <button onClick={() => setCategory("")} className={clsx("chip text-xs py-1", category === "" && "chip-active")}>Alle</button>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)} className={clsx("chip text-xs py-1", category === c && "chip-active")}>{c}</button>
        ))}
      </div>

      {loading
        ? <div className="text-center py-16 text-ink-3 text-sm">Indlæser priser…</div>
        : entries.length === 0
        ? <div className="text-center py-16 text-ink-3">
            <div className="text-4xl mb-3 opacity-30">🍺</div>
            <p className="text-sm">Ingen priser registreret endnu i denne by — tilføj én!</p>
          </div>
        : <div className="flex flex-col gap-3">
            {entries.map(e => (
              <EntryCard key={e.id} entry={e} onDelete={() => del(e.id)} onReport={() => setReporting(e)} />
            ))}
          </div>
      }

      {reporting && (
        <ReportModal
          entryId={reporting.id}
          drinkName={reporting.drink}
          onClose={() => setReporting(null)}
          onSuccess={() => { toast(t("toast_report_sent")); load(); }}
        />
      )}

      {!session && entries.length > 0 && (
        <p className="text-center text-sm text-ink-3 mt-6">
          <a href="/login" className="text-brand font-medium hover:underline">Log ind</a> for at rapportere priser
        </p>
      )}
    </div>
  );
}

export default function EntriesPage() {
  const [city, setCity] = useState("");
  const cityLabel = CITIES.find(c => c.value === city)?.label ?? "";

  return (
    <ToastProvider>
      <div className="border-b border-surface-3 px-10 py-7 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl font-bold text-ink">
            {city ? `Priser i ${cityLabel}` : "Alle priser"}
          </h2>
          <p className="text-sm text-ink-3 mt-1">
            {city ? `Fællesregistrerede drikkevarepriser i ${cityLabel}` : "Vælg en by for at se priser"}
          </p>
        </div>
        {city && (
          <button onClick={() => setCity("")} className="btn-ghost text-sm">
            Skift by
          </button>
        )}
      </div>
      <div className="px-10 py-8">
        {!city
          ? <CityPicker selected={city} onSelect={setCity} />
          : <Feed city={city} />
        }
      </div>
    </ToastProvider>
  );
}
