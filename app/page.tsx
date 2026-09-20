"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Star, Users, Flag, Check, Trash2, ShieldCheck } from "lucide-react";
import { CITIES } from "@/lib/cities";
import clsx from "clsx";

interface AdminVenue { id: number; name: string; city: string; location: string | null; is_featured: number; entry_count: number; }
interface AdminUser  { id: number; name: string; email: string; is_admin: number; created_at: string; }
interface AdminReport { id: number; drink: string; price_dkk: number; venue_name: string; reporter_name: string; reason: string; details: string | null; created_at: string; }

type Tab = "venues" | "users" | "reports";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("venues");
  const [venues, setVenues]   = useState<AdminVenue[]>([]);
  const [users, setUsers]     = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => { loadAll(); }, []);

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
    await fetch("/api/admin/venues", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: venue.id, is_featured: !venue.is_featured }),
    });
    setVenues(vs => vs.map(v => v.id === venue.id ? { ...v, is_featured: venue.is_featured ? 0 : 1 } : v));
    setMsg(venue.is_featured ? `"${venue.name}" fjernet fra fremhævede steder` : `"${venue.name}" tilføjet til fremhævede steder ⭐`);
    setTimeout(() => setMsg(""), 3000);
  }

  async function toggleAdmin(user: AdminUser) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, is_admin: !user.is_admin }),
    });
    setUsers(us => us.map(u => u.id === user.id ? { ...u, is_admin: user.is_admin ? 0 : 1 } : u));
  }

  async function resolveReport(id: number) {
    await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "resolve" }),
    });
    setReports(rs => rs.filter(r => r.id !== id));
  }

  async function deleteEntry(id: number) {
    if (!confirm("Slet denne pris og marker rapport som løst?")) return;
    await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "delete_entry" }),
    });
    setReports(rs => rs.filter(r => r.id !== id));
  }

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
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800 font-medium">{msg}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border border-surface-3 rounded-xl p-1 mb-6 w-fit">
        {([["venues","Fremhævede steder", Star], ["users","Brugere", Users], ["reports","Rapporter", Flag]] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)}
            className={clsx("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === id ? "bg-brand text-white" : "text-ink-2 hover:bg-surface-2")}>
            <Icon size={14} />{label}
            {id === "reports" && reports.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-full">{reports.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Venues tab */}
      {tab === "venues" && (
        <div>
          <p className="text-sm text-ink-3 mb-4">
            {featuredCount} fremhævet{featuredCount !== 1 ? "e" : ""} sted{featuredCount !== 1 ? "er" : ""} — disse vises øverst i sidebaren med en ⭐
          </p>
          {CITIES.map(city => {
            const cityVenues = venues.filter(v => v.city === city.value);
            if (!cityVenues.length) return null;
            return (
              <div key={city.value} className="mb-6">
                <div className="section-label mb-3">{city.label}</div>
                <div className="flex flex-col gap-2">
                  {cityVenues.map(v => (
                    <div key={v.id} className={clsx(
                      "flex items-center justify-between px-4 py-3 rounded-xl border transition-all",
                      v.is_featured ? "border-brand bg-brand-light/30" : "border-surface-3 bg-surface hover:border-surface-3"
                    )}>
                      <div>
                        <div className="flex items-center gap-2">
                          {v.is_featured ? <Star size={14} className="text-brand fill-brand" /> : <Star size={14} className="text-ink-3" />}
                          <span className="font-medium text-ink text-sm">{v.name}</span>
                        </div>
                        <div className="text-xs text-ink-3 mt-0.5 ml-5">
                          {v.location ? `${v.location} · ` : ""}{v.entry_count ?? 0} priser
                        </div>
                      </div>
                      <button onClick={() => toggleFeatured(v)}
                        className={clsx("text-xs px-3 py-1.5 rounded-lg font-medium transition-all",
                          v.is_featured
                            ? "bg-brand text-white hover:bg-brand-dark"
                            : "bg-surface-2 text-ink-2 hover:bg-brand-light hover:text-brand")}>
                        {v.is_featured ? "Fjern fremhævning" : "Fremhæv ⭐"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Users tab */}
      {tab === "users" && (
        <div className="flex flex-col gap-2">
          {users.map(u => (
            <div key={u.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-surface-3 bg-surface">
              <div>
                <div className="flex items-center gap-2">
                  {u.is_admin ? <ShieldCheck size={13} className="text-brand" /> : null}
                  <span className="font-medium text-ink text-sm">{u.name}</span>
                </div>
                <div className="text-xs text-ink-3 mt-0.5">{u.email}</div>
              </div>
              <button onClick={() => toggleAdmin(u)}
                className={clsx("text-xs px-3 py-1.5 rounded-lg font-medium transition-all",
                  u.is_admin
                    ? "bg-brand text-white hover:bg-brand-dark"
                    : "bg-surface-2 text-ink-2 hover:bg-brand-light hover:text-brand")}>
                {u.is_admin ? "Fjern admin" : "Giv admin"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Reports tab */}
      {tab === "reports" && (
        <div>
          {reports.length === 0
            ? <div className="text-center py-16 text-ink-3"><div className="text-4xl mb-3 opacity-30">✓</div><p className="text-sm">Ingen åbne rapporter</p></div>
            : <div className="flex flex-col gap-3">
                {reports.map(r => (
                  <div key={r.id} className="card">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="badge bg-red-50 text-red-600 text-[11px]">{r.reason}</span>
                        </div>
                        <div className="font-medium text-ink">{r.drink} — {r.venue_name}</div>
                        <div className="font-mono text-sm text-brand">{Math.round(r.price_dkk)} kr</div>
                        {r.details && <div className="text-xs text-ink-3 mt-1">"{r.details}"</div>}
                        <div className="text-xs text-ink-3 mt-1">Rapporteret af {r.reporter_name ?? "anonym"}</div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => resolveReport(r.id)}
                          className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5">
                          <Check size={12} /> Løs
                        </button>
                        <button onClick={() => deleteEntry(r.id)}
                          className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1.5">
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
    </div>
  );
}
