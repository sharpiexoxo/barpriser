"use client";
import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Star, Users, Flag, Check, Trash2, ShieldCheck, Search, X } from "lucide-react";
import { CITIES } from "@/lib/cities";
import clsx from "clsx";

interface AdminVenue  { id: number; name: string; city: string; location: string | null; is_featured: number; entry_count: number; }
interface AdminUser   { id: number; name: string; email: string; is_admin: number; created_at: string; }
interface AdminReport { id: number; entry_id: number; drink: string; price_dkk: number; venue_name: string; venue_city?: string; reporter_name: string | null; reason: string; details: string | null; created_at: string; }

type Tab = "venues" | "users" | "reports";

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative mb-4">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-8"
      />
      {value && (
        <button onClick={() => onChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink">
          <X size={13} />
        </button>
      )}
    </div>
  );
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("venues");
  const [venues, setVenues]   = useState<AdminVenue[]>([]);
  const [users, setUsers]     = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // Search state
  const [venueSearch,  setVenueSearch]  = useState("");
  const [userSearch,   setUserSearch]   = useState("");
  const [reportSearch, setReportSearch] = useState("");

  // Report filters
  const [reportCity, setReportCity] = useState("");
  const [reportVenue, setReportVenue] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => { if (status === "authenticated") loadAll(); }, [status]);

  async function loadAll() {
    setLoading(true);
    const [v, u, r] = await Promise.all([
      fetch("/api/admin/venues").then(r => r.json()),
      fetch("/api/admin/users").then(r => r.json()),
      fetch("/api/admin/reports").then(r => r.json()),
    ]);
    if (Array.isArray(v)) setVenues(v);
    if (Array.isArray(u)) setUsers(u);
    if (Array.isArray(r)) setReports(r);
    setLoading(false);
  }

  async function toggleFeatured(venue: AdminVenue) {
    const newVal = venue.is_featured ? 0 : 1;
    const res = await fetch("/api/admin/venues", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: venue.id, is_featured: newVal }),
    });
    if (res.ok) {
      setVenues(vs => vs.map(v => v.id === venue.id ? { ...v, is_featured: newVal } : v));
      setMsg(newVal ? `"${venue.name}" tilføjet til sponsorerede steder ⭐` : `"${venue.name}" fjernet fra sponsorerede steder`);
      setTimeout(() => setMsg(""), 3000);
    }
  }

  async function toggleAdmin(user: AdminUser) {
    const newVal = user.is_admin ? 0 : 1;
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, is_admin: newVal }),
    });
    if (res.ok) setUsers(us => us.map(u => u.id === user.id ? { ...u, is_admin: newVal } : u));
  }

  async function resolveReport(id: number) {
    const res = await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "resolve" }),
    });
    if (res.ok) setReports(rs => rs.filter(r => r.id !== id));
  }

  async function deleteEntry(id: number) {
    if (!confirm("Slet denne pris og marker rapport som løst?")) return;
    const res = await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "delete_entry" }),
    });
    if (res.ok) setReports(rs => rs.filter(r => r.id !== id));
  }

  // Filtered lists
  const filteredVenues = useMemo(() => {
    const q = venueSearch.toLowerCase();
    return venues.filter(v =>
      !q || v.name.toLowerCase().includes(q) || (v.location ?? "").toLowerCase().includes(q)
    );
  }, [venues, venueSearch]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase();
    return users.filter(u => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, userSearch]);

  const filteredReports = useMemo(() => {
    const q = reportSearch.toLowerCase();
    return reports.filter(r => {
      if (reportCity  && r.venue_city !== reportCity) return false;
      if (reportVenue && String(r.entry_id) !== reportVenue) return false;
      if (q && !r.drink.toLowerCase().includes(q) && !r.venue_name.toLowerCase().includes(q) && !r.reason.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [reports, reportSearch, reportCity, reportVenue]);

  // Unique venues in reports for filter dropdown
  const reportVenueOptions = useMemo(() => {
    const seen = new Map<string, string>();
    reports
      .filter(r => !reportCity || r.venue_city === reportCity)
      .forEach(r => seen.set(r.venue_name, r.venue_name));
    return [...seen.entries()];
  }, [reports, reportCity]);

  if (status === "loading" || loading) {
    return <div className="flex items-center justify-center h-screen text-ink-3 text-sm">Indlæser admin…</div>;
  }

  const featuredCount = venues.filter(v => v.is_featured).length;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck size={28} className="text-brand" />
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink">Admin panel</h1>
          <p className="text-sm text-ink-3">Logget ind som {session?.user?.name}</p>
        </div>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800 font-medium">
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border border-surface-3 rounded-xl p-1 mb-6 w-fit">
        {([
          ["venues",  `Sponsorerede steder (${featuredCount})`, Star],
          ["users",   `Brugere (${users.length})`, Users],
          ["reports", "Rapporter", Flag],
        ] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id as Tab)}
            className={clsx("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === id ? "bg-brand text-white" : "text-ink-2 hover:bg-surface-2")}>
            <Icon size={14} />{label}
            {id === "reports" && reports.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-full">{reports.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Venues tab ── */}
      {tab === "venues" && (
        <div>
          <p className="text-sm text-ink-3 mb-4">
            Fremhævede steder vises i sidebaren for alle besøgende under "Sponsorerede steder".
          </p>
          <SearchInput value={venueSearch} onChange={setVenueSearch} placeholder="Søg efter bar eller adresse…" />
          {CITIES.map(city => {
            const cityVenues = filteredVenues.filter(v => v.city === city.value);
            if (!cityVenues.length) return null;
            return (
              <div key={city.value} className="mb-6">
                <div className="section-label mb-3">{city.label} ({cityVenues.length})</div>
                <div className="flex flex-col gap-2">
                  {cityVenues.map(v => (
                    <div key={v.id} className={clsx(
                      "flex items-center justify-between px-4 py-3 rounded-xl border transition-all",
                      v.is_featured ? "border-brand bg-brand-light/40" : "border-surface-3 bg-surface"
                    )}>
                      <div>
                        <div className="flex items-center gap-2">
                          <Star size={14} className={v.is_featured ? "text-brand fill-brand" : "text-ink-3"} />
                          <span className="font-medium text-ink text-sm">{v.name}</span>
                          {v.is_featured && <span className="badge bg-brand-light text-brand-dark text-[10px]">Sponsoreret</span>}
                        </div>
                        <div className="text-xs text-ink-3 mt-0.5 ml-5">
                          {v.location ? `${v.location} · ` : ""}{v.entry_count ?? 0} priser
                        </div>
                      </div>
                      <button onClick={() => toggleFeatured(v)}
                        className={clsx("text-xs px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap",
                          v.is_featured
                            ? "bg-brand text-white hover:bg-brand-dark"
                            : "bg-surface-2 text-ink-2 hover:bg-brand-light hover:text-brand border border-surface-3")}>
                        {v.is_featured ? "Fjern ⭐" : "Fremhæv ⭐"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {filteredVenues.length === 0 && (
            <div className="text-center py-12 text-ink-3 text-sm">Ingen steder matcher søgningen</div>
          )}
        </div>
      )}

      {/* ── Users tab ── */}
      {tab === "users" && (
        <div>
          <SearchInput value={userSearch} onChange={setUserSearch} placeholder="Søg efter navn eller e-mail…" />
          <div className="flex flex-col gap-2">
            {filteredUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-surface-3 bg-surface">
                <div>
                  <div className="flex items-center gap-2">
                    {u.is_admin ? <ShieldCheck size={13} className="text-brand" /> : null}
                    <span className="font-medium text-ink text-sm">{u.name}</span>
                    {u.is_admin && <span className="badge bg-brand-light text-brand-dark text-[10px]">Admin</span>}
                  </div>
                  <div className="text-xs text-ink-3 mt-0.5">{u.email}</div>
                </div>
                <button onClick={() => toggleAdmin(u)}
                  className={clsx("text-xs px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap border",
                    u.is_admin
                      ? "bg-brand text-white hover:bg-brand-dark border-brand"
                      : "bg-surface-2 text-ink-2 hover:bg-brand-light hover:text-brand border-surface-3")}>
                  {u.is_admin ? "Fjern admin" : "Giv admin"}
                </button>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-ink-3 text-sm">Ingen brugere matcher søgningen</div>
            )}
          </div>
        </div>
      )}

      {/* ── Reports tab ── */}
      {tab === "reports" && (
        <div>
          {/* Filters */}
          <div className="flex gap-3 mb-4 flex-wrap">
            <select value={reportCity} onChange={e => { setReportCity(e.target.value); setReportVenue(""); }}
              className="flex-1 min-w-[150px]">
              <option value="">Alle byer</option>
              {CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <select value={reportVenue} onChange={e => setReportVenue(e.target.value)}
              className="flex-1 min-w-[150px]" disabled={!reportCity}>
              <option value="">Alle barer{!reportCity ? " (vælg by først)" : ""}</option>
              {reportVenueOptions.map(([name]) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <SearchInput value={reportSearch} onChange={setReportSearch} placeholder="Søg i rapporter…" />

          {filteredReports.length === 0 ? (
            <div className="text-center py-16 text-ink-3">
              <div className="text-4xl mb-3 opacity-30">✓</div>
              <p className="text-sm">{reports.length === 0 ? "Ingen åbne rapporter" : "Ingen rapporter matcher filtrene"}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredReports.map(r => (
                <div key={r.id} className="card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="badge bg-red-50 text-red-600">{r.reason}</span>
                        {r.venue_city && (
                          <span className="badge bg-surface-2 text-ink-3">
                            {CITIES.find(c => c.value === r.venue_city)?.label ?? r.venue_city}
                          </span>
                        )}
                      </div>
                      <div className="font-medium text-ink">{r.drink}</div>
                      <div className="text-sm text-ink-3">{r.venue_name}</div>
                      <div className="font-mono text-sm text-brand mt-0.5">{Math.round(r.price_dkk)} kr</div>
                      {r.details && <div className="text-xs text-ink-3 mt-1 italic">"{r.details}"</div>}
                      <div className="text-xs text-ink-3 mt-1">
                        Rapporteret af {r.reporter_name ?? "anonym"}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button onClick={() => resolveReport(r.id)}
                        className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5 whitespace-nowrap">
                        <Check size={12} /> Løs rapport
                      </button>
                      <button onClick={() => deleteEntry(r.id)}
                        className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1.5 whitespace-nowrap">
                        <Trash2 size={12} /> Slet pris
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
