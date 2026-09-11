"use client";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { CITIES } from "@/lib/cities";
import type { Stats } from "@/lib/db";
import clsx from "clsx";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3 mb-1">{label}</div>
      <div className="font-serif text-3xl font-bold text-ink" dangerouslySetInnerHTML={{ __html: value }} />
    </div>
  );
}

export default function OverviewPage() {
  const { t } = useLocale();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("");

  useEffect(() => {
    setLoading(true);
    const qs = city ? `?city=${city}` : "";
    fetch(`/api/stats${qs}`)
      .then(r => r.json())
      .then(s => { setStats(s); setLoading(false); })
      .catch(() => setLoading(false));
  }, [city]);

  const maxAvg = stats ? Math.max(...(stats.by_venue ?? []).map(v => v.avg_price ?? 0), 1) : 1;

  return (
    <>
      <div className="border-b border-surface-3 px-10 py-7">
        <h2 className="font-serif text-3xl font-bold text-ink">{t("ov_title")}</h2>
        <p className="text-sm text-ink-3 mt-1">{t("ov_subtitle")}</p>
      </div>

      <div className="px-10 py-8 space-y-10">
        {/* City filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="font-mono text-[10px] text-ink-3 uppercase tracking-widest">{t("ov_city_filter")}</span>
          <button onClick={() => setCity("")} className={clsx("chip text-xs py-1", city === "" && "chip-active")}>
            {t("ov_all_cities")}
          </button>
          {CITIES.map(c => (
            <button key={c.value} onClick={() => setCity(c.value)}
              className={clsx("chip text-xs py-1", city === c.value && "chip-active")}>
              {c.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-ink-3 text-sm">{t("add_loading")}</div>
        ) : !stats || stats.total_entries === 0 ? (
          <div className="text-center py-16 text-ink-3">
            <div className="text-5xl mb-3 opacity-20">📊</div>
            <p className="text-sm">{t("ov_no_data")}</p>
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label={t("ov_total")} value={String(stats.total_entries)} />
              <StatCard label={t("ov_venues")} value={String(stats.total_venues)} />
              <StatCard label={t("ov_avg")} value={stats.overall_avg ? `${stats.overall_avg} <span class='text-base font-sans text-ink-3 font-normal'>kr</span>` : "—"} />
              <StatCard label={t("ov_range")} value={stats.overall_min && stats.overall_max ? `${stats.overall_min}–${stats.overall_max} <span class='text-base font-sans text-ink-3 font-normal'>kr</span>` : "—"} />
            </div>

            {/* Bar chart */}
            <div>
              <div className="section-label mb-4">{t("ov_by_venue")}</div>
              <div className="flex flex-col gap-2">
                {stats.by_venue.map(v => {
                  const cityLabel = CITIES.find(c => c.value === v.city)?.label ?? v.city;
                  return (
                    <div key={v.id} className="flex items-center gap-3">
                      <div className="w-40 shrink-0">
                        <div className="text-sm text-ink-2 truncate" title={v.name}>{v.name}</div>
                        <div className="text-[10px] text-ink-3 font-mono">{cityLabel}</div>
                      </div>
                      <div className="flex-1 h-7 bg-surface-2 rounded overflow-hidden">
                        <div className="h-full bg-brand rounded flex items-center justify-end pr-3 transition-all duration-700"
                          style={{ width: `${Math.round((v.avg_price / maxAvg) * 100)}%`, minWidth: "60px" }}>
                          <span className="font-mono text-[11px] text-white/90 whitespace-nowrap">{Math.round(v.avg_price)} kr</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category grid */}
            {stats.by_category.length > 0 && (
              <div>
                <div className="section-label mb-4">{t("ov_by_cat")}</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {stats.by_category.map(c => (
                    <div key={c.category} className="card">
                      <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3 mb-1 truncate">{c.category}</div>
                      <div className="font-serif text-2xl font-bold text-ink">
                        {Math.round(c.avg_price)} <span className="text-sm font-sans text-ink-3 font-normal">kr</span>
                      </div>
                      <div className="text-[11px] text-ink-3 mt-1">{c.count} {t("ov_entries")}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Venue breakdown */}
            <div>
              <div className="section-label mb-4">{t("ov_breakdown")}</div>
              <div className="flex flex-col gap-4">
                {stats.by_venue.map(v => <VenueCard key={v.id} venue={v} />)}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function VenueCard({ venue }: { venue: Stats["by_venue"][0] }) {
  const { t } = useLocale();
  const cityLabel = CITIES.find(c => c.value === venue.city)?.label ?? venue.city;
  const [entries, setEntries] = useState<Array<{ id: number; drink: string; category: string | null; price_dkk: number }>>([]);

  useEffect(() => {
    fetch(`/api/entries?venue_id=${venue.id}`).then(r => r.json()).then(setEntries).catch(() => {});
  }, [venue.id]);

  return (
    <div className="border border-surface-3 rounded-xl overflow-hidden bg-surface">
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-3">
        <div>
          <div className="font-serif text-lg font-bold text-ink">{venue.name}</div>
          <div className="flex items-center gap-1.5 text-[12px] text-ink-3 mt-0.5">
            <MapPin size={10} />
            {cityLabel}
            {venue.location ? ` · ${venue.location}` : ""}
          </div>
        </div>
        <div className="flex gap-5 text-right">
          <div>
            <div className="font-mono text-base font-medium text-brand">{Math.round(venue.avg_price)} kr</div>
            <div className="text-[10px] font-mono uppercase text-ink-3 tracking-wide">{t("ov_avg_lbl")}</div>
          </div>
          <div>
            <div className="font-mono text-base font-medium text-ink">{venue.count}</div>
            <div className="text-[10px] font-mono uppercase text-ink-3 tracking-wide">{t("ov_entries")}</div>
          </div>
        </div>
      </div>
      {entries.length > 0
        ? <table className="w-full text-sm">
            <tbody>
              {entries.slice(0, 10).map(e => (
                <tr key={e.id} className="border-b border-surface-3 last:border-0 hover:bg-surface-2 transition-colors">
                  <td className="px-5 py-2.5">
                    <div className="text-ink font-medium">{e.drink}</div>
                    {e.category && <div className="text-[11px] text-ink-3">{e.category}</div>}
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono font-medium text-brand whitespace-nowrap">{Math.round(e.price_dkk)} kr</td>
                </tr>
              ))}
            </tbody>
          </table>
        : <div className="px-5 py-4 text-[13px] text-ink-3">{t("ov_no_entries")}</div>
      }
    </div>
  );
}
