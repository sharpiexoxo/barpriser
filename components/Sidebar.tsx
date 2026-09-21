"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PlusCircle, List, BarChart2, LogOut, LogIn, User, Star, ShieldCheck } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useLocale } from "./LocaleProvider";
import LocalePicker from "./LocalePicker";
import { CITIES } from "@/lib/cities";
import type { Venue } from "@/lib/db";
import clsx from "clsx";

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useLocale();
  const [featured, setFeatured] = useState<Venue[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/venues/featured")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setFeatured(d); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!session) { setIsAdmin(false); return; }
    fetch("/api/admin/venues")
      .then(r => { if (r.ok) setIsAdmin(true); else setIsAdmin(false); })
      .catch(() => setIsAdmin(false));
  }, [session]);

  const NAV = [
    { href: "/add",      label: t("nav_add"),      icon: PlusCircle },
    { href: "/entries",  label: t("nav_entries"),  icon: List },
    { href: "/overview", label: t("nav_overview"), icon: BarChart2 },
  ];

  const featuredByCity = CITIES.map(c => ({
    city: c,
    venues: featured.filter(v => v.city === c.value),
  })).filter(g => g.venues.length > 0);

  function goToVenue(venue: Venue) {
    router.push(`/entries?city=${venue.city}&venue=${venue.id}`);
  }

  return (
    <aside className="w-64 shrink-0 bg-ink flex flex-col sticky top-0 h-screen overflow-y-auto">
      <div className="px-7 pt-8 pb-6 border-b border-white/[0.07]">
        <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/30 mb-1">Danmark</p>
        <h1 className="font-serif text-2xl font-black text-white leading-tight">
          Bar<span className="text-brand-mid">Priser</span>
        </h1>
        <p className="text-[11px] text-white/30 mt-1">{t("nav_tagline")}</p>
      </div>

      <nav className="px-4 pt-5 pb-2 flex flex-col gap-0.5">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={clsx(
            "flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all",
            path === href ? "bg-brand text-white" : "text-white/50 hover:bg-white/[0.06] hover:text-white"
          )}>
            <Icon size={16} />{label}
          </Link>
        ))}
      </nav>

      {/* Sponsored venues */}
      {featuredByCity.length > 0 && (
        <div className="px-4 pt-5">
          <p className="font-mono text-[9px] tracking-[0.15em] uppercase mb-2 flex items-center gap-1.5 text-brand-mid/60">
            <Star size={9} className="fill-brand-mid text-brand-mid" /> Sponsorerede steder
          </p>
          {featuredByCity.map(({ city, venues }) => (
            <div key={city.value} className="mb-2">
              <p className="font-mono text-[8px] uppercase tracking-widest text-white/20 px-3 mb-1">{city.label}</p>
              {venues.map(v => (
                <button
                  key={v.id}
                  onClick={() => goToVenue(v)}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] text-white/70 hover:text-white hover:bg-white/[0.07] transition-all text-left group"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Star size={10} className="shrink-0 text-brand-mid fill-brand-mid" />
                    <span className="truncate group-hover:text-brand-mid transition-colors">{v.name}</span>
                  </span>
                  <span className="font-mono text-[10px] text-white/25 shrink-0 ml-2">{v.entry_count ?? 0}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="flex-1" />

      <div className="border-t border-white/[0.07] pt-4">
        <LocalePicker variant="sidebar" />
        <div className="px-4 pb-4">
          {session ? (
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className="w-7 h-7 rounded-full bg-brand/30 flex items-center justify-center shrink-0">
                  <User size={13} className="text-brand-mid" />
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-medium text-white/80 truncate">{session.user?.name}</div>
                  <div className="text-[10px] text-white/30 truncate">{session.user?.email}</div>
                </div>
              </div>
              {isAdmin && (
                <Link href="/admin"
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[12px] text-brand-mid hover:bg-white/[0.06] transition-all mb-1">
                  <ShieldCheck size={13} /> Admin panel
                </Link>
              )}
              <button onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[12px] text-white/40 hover:text-white hover:bg-white/[0.06] transition-all">
                <LogOut size={13} />{t("nav_signout")}
              </button>
            </div>
          ) : (
            <Link href="/login"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-white/40 hover:text-white hover:bg-white/[0.06] transition-all">
              <LogIn size={13} />{t("nav_signin")}
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
