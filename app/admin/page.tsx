"use client";
import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Star, Users, Flag, Check, Trash2, ShieldCheck, Search, X, Pencil, ChevronDown, ChevronUp, Receipt } from "lucide-react";
import { CITIES } from "@/lib/cities";
import clsx from "clsx";

interface AdminVenue  { id: number; name: string; city: string; location: string | null; is_featured: number; entry_count: number; }
interface AdminUser   { id: number; name: string; email: string; is_admin: number; created_at: string; }
interface AdminReport { id: number; entry_id: number; drink: string; price_dkk: number; venue_name: string; venue_city?: string; reporter_name: string | null; reason: string; details: string | null; created_at: string; }
interface AdminEntry  { id: number; drink: string; category: string | null; price_dkk: number; notes: string | null; venue_name: string; venue_city: string; user_name: string | null; created_at: string; }

type Tab = "venues" | "users" | "entries" | "reports";

const CATEGORIES = ["Fadøl","Øl (flaske/dåse)","Vin (glas)","Cocktail","Spiritus (enkelt)","Shot","Sodavand","Andet"];

// ── Confirm dialog ────────────────────────────────────────────────────────
function ConfirmDialog({ title, message, confirmLabel, danger, onConfirm, onCancel }: {
  title: string; message: string; confirmLabel: string; danger?: boolean;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-surface rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="font-serif text-lg font-bold text-ink mb-2">{title}</h3>
        <p className="text-sm text-ink-3 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-ghost flex-1 justify-center">Annuller</button>
          <button onClick={onConfirm}
            className={clsx("btn flex-1 justify-center text-white", danger ? "bg-red-600 hover:bg-red-700" : "bg-brand hover:bg-brand-dark")}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit venue modal ──────────────────────────────────────────────────────
function EditVenueModal({ venue, onSave, onClose }: { venue: AdminVenue; onSave: (v: AdminVenue) => void; onClose: () => void }) {
  const [name,     setName]     = useState(venue.name);
  const [city,     setCity]     = useState(venue.city);
  const [location, setLocation] = useState(venue.location ?? "");
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");

  async function save() {
    if (!name.trim()) { setError("Navn er påkrævet"); return; }
    if (!city)        { setError("By er påkrævet"); return; }
    setSaving(true);
    const res = await fetch("/api/admin/venues", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: venue.id, name: name.trim(), city, location: location.trim() || null }),
    });
    setSaving(false);
    if (!res.ok) { setError("Kunne ikke gemme"); return; }
    const data = await res.json();
    onSave({ ...venue, ...data.venue, name: name.trim(), city, location: location.trim() || null });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="font-serif text-lg font-bold text-ink mb-5">Rediger sted</h3>
        <div className="flex flex-col gap-4 mb-5">
          <div>
            <label className="block text-xs font-medium text-ink-2 mb-1">Navn *</label>
            <input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-2 mb-1">By *</label>
            <select value={city} onChange={e => setCity(e.target.value)}>
              <option value="">— vælg by —</option>
              {CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-2 mb-1">Område / adresse</label>
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="f.eks. Latinerkvarteret" />
          </div>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1 justify-center">Annuller</button>
          <button onClick={save} disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-60">
            {saving ? "Gemmer…" : "Gem ændringer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit entry modal ──────────────────────────────────────────────────────
function EditEntryModal({ entry, onSave, onClose }: { entry: AdminEntry; onSave: (e: AdminEntry) => void; onClose: () => void }) {
  const [drink,    setDrink]    = useState(entry.drink);
  const [category, setCategory] = useState(entry.category ?? "");
  const [price,    setPrice]    = useState(String(entry.price_dkk));
  const [notes,    setNotes]    = useState(entry.notes ?? "");
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");

  async function save() {
    if (!drink.trim()) { setError("Drik er påkrævet"); return; }
    if (!price || isNaN(+price)) { setError("Gyldig pris er påkrævet"); return; }
    setSaving(true);
    const res = await fetch("/api/admin/entries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: entry.id, drink: drink.trim(), category: category || null, price_dkk: +price, notes: notes.trim() || null }),
    });
    setSaving(false);
    if (!res.ok) { setError("Kunne ikke gemme"); return; }
    onSave({ ...entry, drink: drink.trim(), category: category || null, price_dkk: +price, notes: notes.trim() || null });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="font-serif text-lg font-bold text-ink mb-1">Rediger pris</h3>
        <p className="text-xs text-ink-3 mb-5">{entry.venue_name} · {CITIES.find(c => c.value === entry.venue_city)?.label}</p>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-ink-2 mb-1">Drik *</label>
            <input value={drink} onChange={e => setDrink(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-2 mb-1">Kategori</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">— ingen —</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-2 mb-1">Pris (DKK) *</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} min="0" step="5" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-ink-2 mb-1">Noter</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="f.eks. 50cl, happy hour" />
          </div>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1 justify-center">Annuller</button>
          <button onClick={save} disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-60">
            {saving ? "Gemmer…" : "Gem ændringer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Search input ──────────────────────────────────────────────────────────
function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative mb-4">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="pl-9 pr-8" />
      {value && (
        <button onClick={() => onChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink">
          <X size={13} />
        </button>
      )}
    </div>
  );
}

// ── Main admin page ───────────────────────────────────────────────────────
export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("venues");
  const [venues,  setVenues]  = useState<AdminVenue[]>([]);
  const [users,   setUsers]   = useState<AdminUser[]>([]);
  const [entries, setEntries] = useState<AdminEntry[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // Search
  const [venueSearch,  setVenueSearch]  = useState("");
  const [userSearch,   setUserSearch]   = useState("");
  const [entrySearch,  setEntrySearch]  = useState("");
  const [reportSearch, setReportSearch] = useState("");
  const [reportCity,   setReportCity]   = useState("");
  const [reportVenue,  setReportVenue]  = useState("");
  const [entryCity,    setEntryCity]    = useState("");

  // Modals / confirms
  const [editVenue,       setEditVenue]       = useState<AdminVenue | null>(null);
  const [editEntry,       setEditEntry]       = useState<AdminEntry | null>(null);
  const [confirmDelete,   setConfirmDelete]   = useState<{ type: "venue"|"user"|"entry"; id: number; name: string } | null>(null);
  const [confirmAdmin,    setConfirmAdmin]    = useState<{ user: AdminUser; give: boolean } | null>(null);

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);
  useEffect(() => { if (status === "authenticated") loadAll(); }, [status]);

  async function loadAll() {
    setLoading(true);
    const [v, u, e, r] = await Promise.all([
      fetch("/api/admin/venues").then(r => r.json()),
      fetch("/api/admin/users").then(r => r.json()),
      fetch("/api/admin/entries").then(r => r.json()),
      fetch("/api/admin/reports").then(r => r.json()),
    ]);
    if (Array.isArray(v)) setVenues(v);
    if (Array.isArray(u)) setUsers(u);
    if (Array.isArray(e)) setEntries(e);
    if (Array.isArray(r)) setReports(r);
    setLoading(false);
  }

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(""), 3000); }

  async function toggleFeatured(venue: AdminVenue) {
    const newVal = venue.is_featured ? 0 : 1;
    const res = await fetch("/api/admin/venues", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: venue.id, is_featured: newVal }),
    });
    if (res.ok) {
      setVenues(vs => vs.map(v => v.id === venue.id ? { ...v, is_featured: newVal } : v));
      flash(newVal ? `"${venue.name}" er nu sponsoreret ⭐` : `"${venue.name}" fjernet fra sponsorerede steder`);
    }
  }

  async function doDeleteVenue(id: number) {
    const res = await fetch("/api/admin/venues", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (res.ok) { setVenues(vs => vs.filter(v => v.id !== id)); flash("Sted slettet"); }
    setConfirmDelete(null);
  }

  async function doToggleAdmin(user: AdminUser, give: boolean) {
    const res = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: user.id, is_admin: give }) });
    if (res.ok) setUsers(us => us.map(u => u.id === user.id ? { ...u, is_admin: give ? 1 : 0 } : u));
    setConfirmAdmin(null);
  }

  async function doDeleteUser(id: number) {
    const res = await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (res.ok) { setUsers(us => us.filter(u => u.id !== id)); flash("Bruger slettet"); }
    setConfirmDelete(null);
  }

  async function doDeleteEntry(id: number) {
    const res = await fetch("/api/admin/entries", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (res.ok) { setEntries(es => es.filter(e => e.id !== id)); flash("Pris slettet"); }
    setConfirmDelete(null);
  }

  async function resolveReport(id: number) {
    const res = await fetch("/api/admin/reports", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "resolve" }) });
    if (res.ok) setReports(rs => rs.filter(r => r.id !== id));
  }

  async function deleteReportEntry(id: number) {
    const res = await fetch("/api/admin/reports", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "delete_entry" }) });
    if (res.ok) { setReports(rs => rs.filter(r => r.id !== id)); setEntries(es => es.filter(e => e.id !== id)); }
  }

  // Filtered
  const filteredVenues = useMemo(() => {
    const q = venueSearch.toLowerCase();
    return venues.filter(v => !q || v.name.toLowerCase().includes(q) || (v.location ?? "").toLowerCase().includes(q));
  }, [venues, venueSearch]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase();
    return users.filter(u => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, userSearch]);

  const filteredEntries = useMemo(() => {
    const q = entrySearch.toLowerCase();
    return entries.filter(e => {
      if (entryCity && e.venue_city !== entryCity) return false;
      return !q || e.drink.toLowerCase().includes(q) || e.venue_name.toLowerCase().includes(q);
    });
  }, [entries, entrySearch, entryCity]);

  const filteredReports = useMemo(() => {
    const q = reportSearch.toLowerCase();
    return reports.filter(r => {
      if (reportCity && r.venue_city !== reportCity) return false;
      if (reportVenue && r.venue_name !== reportVenue) return false;
      return !q || r.drink.toLowerCase().includes(q) || r.venue_name.toLowerCase().includes(q) || r.reason.toLowerCase().includes(q);
    });
  }, [reports, reportSearch, reportCity, reportVenue]);

  const reportVenueOptions = useMemo(() => {
    const seen = new Set<string>();
    return reports.filter(r => !reportCity || r.venue_city === reportCity).reduce<string[]>((acc, r) => {
      if (!seen.has(r.venue_name)) { seen.add(r.venue_name); acc.push(r.venue_name); }
      return acc;
    }, []);
  }, [reports, reportCity]);

  if (status === "loading" || loading) {
    return <div className="flex items-center justify-center h-screen text-ink-3 text-sm">Indlæser admin…</div>;
  }

  const TABS: [Tab, string, any, number?][] = [
    ["venues",  "Steder",    Star,    undefined],
    ["users",   "Brugere",   Users,   undefined],
    ["entries", "Priser",    Receipt, undefined],
    ["reports", "Rapporter", Flag,    reports.length],
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck size={26} className="text-brand shrink-0" />
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-ink">Admin panel</h1>
          <p className="text-sm text-ink-3">Logget ind som {session?.user?.name}</p>
        </div>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800 font-medium">{msg}</div>
      )}

      {/* Tabs — scrollable on mobile */}
      <div className="flex gap-1 border border-surface-3 rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map(([id, label, Icon, badge]) => (
          <button key={id} onClick={() => setTab(id)}
            className={clsx("flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0",
              tab === id ? "bg-brand text-white" : "text-ink-2 hover:bg-surface-2")}>
            <Icon size={14} />{label}
            {badge != null && badge > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-full">{badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Venues tab ── */}
      {tab === "venues" && (
        <div>
          <p className="text-sm text-ink-3 mb-4">Fremhæv steder for at vise dem som sponsorerede i sidebaren. Du kan også redigere navn, by og adresse.</p>
          <SearchInput value={venueSearch} onChange={setVenueSearch} placeholder="Søg efter bar eller adresse…" />
          {CITIES.map(city => {
            const cv = filteredVenues.filter(v => v.city === city.value);
            if (!cv.length) return null;
            return (
              <div key={city.value} className="mb-6">
                <div className="section-label mb-3">{city.label} ({cv.length})</div>
                <div className="flex flex-col gap-2">
                  {cv.map(v => (
                    <div key={v.id} className={clsx(
                      "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
                      v.is_featured ? "border-brand bg-brand-light/40" : "border-surface-3 bg-surface"
                    )}>
                      <Star size={14} className={v.is_featured ? "text-brand fill-brand shrink-0" : "text-ink-3 shrink-0"} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-ink text-sm truncate">{v.name}</div>
                        <div className="text-xs text-ink-3">{v.location || "—"} · {v.entry_count ?? 0} priser</div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => toggleFeatured(v)} title={v.is_featured ? "Fjern fremhævning" : "Fremhæv"}
                          className={clsx("text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all",
                            v.is_featured ? "bg-brand text-white hover:bg-brand-dark" : "bg-surface-2 text-ink-2 hover:bg-brand-light hover:text-brand border border-surface-3")}>
                          {v.is_featured ? "⭐ Fjern" : "⭐"}
                        </button>
                        <button onClick={() => setEditVenue(v)} className="btn-ghost text-xs px-2.5 py-1.5 flex items-center gap-1">
                          <Pencil size={12} />
                        </button>
                        <button onClick={() => setConfirmDelete({ type: "venue", id: v.id, name: v.name })}
                          className="btn-danger text-xs px-2.5 py-1.5 flex items-center gap-1">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {filteredVenues.length === 0 && <div className="text-center py-12 text-ink-3 text-sm">Ingen steder matcher søgningen</div>}
        </div>
      )}

      {/* ── Users tab ── */}
      {tab === "users" && (
        <div>
          <SearchInput value={userSearch} onChange={setUserSearch} placeholder="Søg efter navn eller e-mail…" />
          <div className="flex flex-col gap-2">
            {filteredUsers.map(u => (
              <div key={u.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-surface-3 bg-surface">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {u.is_admin ? <ShieldCheck size={13} className="text-brand shrink-0" /> : null}
                    <span className="font-medium text-ink text-sm truncate">{u.name}</span>
                    {u.is_admin && <span className="badge bg-brand-light text-brand-dark text-[10px] shrink-0">Admin</span>}
                  </div>
                  <div className="text-xs text-ink-3 truncate">{u.email}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setConfirmAdmin({ user: u, give: !u.is_admin })}
                    className={clsx("text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap border",
                      u.is_admin ? "bg-brand text-white hover:bg-brand-dark border-brand" : "bg-surface-2 text-ink-2 hover:bg-brand-light hover:text-brand border-surface-3")}>
                    {u.is_admin ? "Fjern admin" : "Giv admin"}
                  </button>
                  <button onClick={() => setConfirmDelete({ type: "user", id: u.id, name: u.name })}
                    className="btn-danger text-xs px-2.5 py-1.5 flex items-center gap-1">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && <div className="text-center py-12 text-ink-3 text-sm">Ingen brugere matcher søgningen</div>}
          </div>
        </div>
      )}

      {/* ── Entries tab ── */}
      {tab === "entries" && (
        <div>
          <div className="flex gap-3 mb-4">
            <select value={entryCity} onChange={e => setEntryCity(e.target.value)} className="flex-1">
              <option value="">Alle byer</option>
              {CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <SearchInput value={entrySearch} onChange={setEntrySearch} placeholder="Søg efter drik eller bar…" />
          <p className="text-xs text-ink-3 mb-3">Viser {filteredEntries.length} priser</p>
          <div className="flex flex-col gap-2">
            {filteredEntries.map(e => (
              <div key={e.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-surface-3 bg-surface">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-ink text-sm truncate">{e.drink}</div>
                  <div className="text-xs text-ink-3 truncate">
                    {e.venue_name} · {CITIES.find(c => c.value === e.venue_city)?.label}
                    {e.category ? ` · ${e.category}` : ""}
                  </div>
                </div>
                <div className="font-mono text-sm text-brand shrink-0">{Math.round(e.price_dkk)} kr</div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setEditEntry(e)} className="btn-ghost text-xs px-2.5 py-1.5 flex items-center gap-1">
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => setConfirmDelete({ type: "entry", id: e.id, name: e.drink })}
                    className="btn-danger text-xs px-2.5 py-1.5 flex items-center gap-1">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
            {filteredEntries.length === 0 && <div className="text-center py-12 text-ink-3 text-sm">Ingen priser matcher filtrene</div>}
          </div>
        </div>
      )}

      {/* ── Reports tab ── */}
      {tab === "reports" && (
        <div>
          <div className="flex gap-3 mb-4 flex-wrap">
            <select value={reportCity} onChange={e => { setReportCity(e.target.value); setReportVenue(""); }} className="flex-1 min-w-[140px]">
              <option value="">Alle byer</option>
              {CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <select value={reportVenue} onChange={e => setReportVenue(e.target.value)} className="flex-1 min-w-[140px]" disabled={!reportCity}>
              <option value="">Alle barer</option>
              {reportVenueOptions.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
          <SearchInput value={reportSearch} onChange={setReportSearch} placeholder="Søg i rapporter…" />
          {filteredReports.length === 0
            ? <div className="text-center py-16 text-ink-3"><div className="text-4xl mb-3 opacity-30">✓</div><p className="text-sm">{reports.length === 0 ? "Ingen åbne rapporter" : "Ingen rapporter matcher filtrene"}</p></div>
            : <div className="flex flex-col gap-3">
                {filteredReports.map(r => (
                  <div key={r.id} className="card">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="badge bg-red-50 text-red-600">{r.reason}</span>
                          {r.venue_city && <span className="badge bg-surface-2 text-ink-3">{CITIES.find(c => c.value === r.venue_city)?.label ?? r.venue_city}</span>}
                        </div>
                        <div className="font-medium text-ink truncate">{r.drink}</div>
                        <div className="text-sm text-ink-3 truncate">{r.venue_name}</div>
                        <div className="font-mono text-sm text-brand">{Math.round(r.price_dkk)} kr</div>
                        {r.details && <div className="text-xs text-ink-3 mt-1 italic">"{r.details}"</div>}
                        <div className="text-xs text-ink-3 mt-1">Rapporteret af {r.reporter_name ?? "anonym"}</div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button onClick={() => resolveReport(r.id)} className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5 whitespace-nowrap">
                          <Check size={12} /> Løs
                        </button>
                        <button onClick={() => deleteReportEntry(r.id)} className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1.5 whitespace-nowrap">
                          <Trash2 size={12} /> Slet pris
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* Modals */}
      {editVenue && (
        <EditVenueModal
          venue={editVenue}
          onSave={updated => setVenues(vs => vs.map(v => v.id === updated.id ? { ...v, ...updated } : v))}
          onClose={() => setEditVenue(null)}
        />
      )}
      {editEntry && (
        <EditEntryModal
          entry={editEntry}
          onSave={updated => setEntries(es => es.map(e => e.id === updated.id ? updated : e))}
          onClose={() => setEditEntry(null)}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog
          title={confirmDelete.type === "user" ? "Slet bruger?" : confirmDelete.type === "venue" ? "Slet sted?" : "Slet pris?"}
          message={
            confirmDelete.type === "user"
              ? `Er du sikker på at du vil slette brugeren "${confirmDelete.name}"? Deres priser bevares men kobles fra kontoen.`
              : confirmDelete.type === "venue"
              ? `Er du sikker på at du vil slette stedet "${confirmDelete.name}"? Alle tilknyttede priser slettes også.`
              : `Er du sikker på at du vil slette prisen "${confirmDelete.name}"?`
          }
          confirmLabel="Ja, slet"
          danger
          onConfirm={() => {
            if (confirmDelete.type === "user")  doDeleteUser(confirmDelete.id);
            if (confirmDelete.type === "venue") doDeleteVenue(confirmDelete.id);
            if (confirmDelete.type === "entry") doDeleteEntry(confirmDelete.id);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {confirmAdmin && (
        <ConfirmDialog
          title={confirmAdmin.give ? "Giv admin?" : "Fjern admin?"}
          message={
            confirmAdmin.give
              ? `Er du sikker på at du vil give "${confirmAdmin.user.name}" admin-adgang?`
              : `Er du sikker på at du vil fjerne admin-adgang fra "${confirmAdmin.user.name}"?`
          }
          confirmLabel={confirmAdmin.give ? "Ja, giv admin" : "Ja, fjern admin"}
          onConfirm={() => doToggleAdmin(confirmAdmin.user, confirmAdmin.give)}
          onCancel={() => setConfirmAdmin(null)}
        />
      )}
    </div>
  );
}
