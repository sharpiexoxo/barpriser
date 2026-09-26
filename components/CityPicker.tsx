"use client";
import { useState, useMemo } from "react";
import { Search, ChevronRight, X } from "lucide-react";
import { CITIES } from "@/lib/cities";

interface Props {
  onSelect: (city: string) => void;
  icon?: string;
  title?: string;
  subtitle?: string;
}

export default function CityPicker({
  onSelect,
  icon = "🏙️",
  title = "Vælg en by",
  subtitle = "Vælg den by du vil se drikkevarepriser fra",
}: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return CITIES.filter(c => !q || c.label.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-serif text-2xl font-bold text-ink mb-2">{title}</h3>
      <p className="text-sm text-ink-3 mb-6 max-w-xs">{subtitle}</p>

      {/* Search bar — shows when more than 6 cities */}
      {CITIES.length > 6 && (
        <div className="relative w-full max-w-xs mb-5">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Søg efter by…"
            className="pl-9 pr-8 text-sm"
          />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink">
              <X size={13} />
            </button>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-ink-3">Ingen byer matcher "{search}"</p>
      ) : (
        <div className="flex flex-wrap gap-2 justify-center max-w-md">
          {filtered.map(c => (
            <button key={c.value} onClick={() => onSelect(c.value)}
              className="px-5 py-2.5 rounded-xl border-2 border-surface-3 bg-surface hover:border-brand hover:text-brand text-ink-2 text-sm font-medium transition-all flex items-center gap-1.5">
              {c.label} <ChevronRight size={13} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
