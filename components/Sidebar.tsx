"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PlusCircle, List, BarChart2, MapPin } from "lucide-react";
import type { Venue } from "@/lib/db";
import clsx from "clsx";

const NAV = [
  { href: "/add",      label: "Add entry",   icon: PlusCircle },
  { href: "/entries",  label: "All entries", icon: List },
  { href: "/overview", label: "Overview",    icon: BarChart2 },
];

export default function Sidebar() {
  const path = usePathname();
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    fetch("/api/venues")
      .then((r) => r.json())
      .then(setVenues)
      .catch(() => {});
  }, []);

  return (
    <aside className="w-64 shrink-0 bg-ink flex flex-col sticky top-0 h-screen overflow-y-auto">
      {/* Logo */}
      <div className="px-7 pt-8 pb-6 border-b border-white/[0.07]">
        <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/30 mb-1">
          Aarhus, Denmark
        </p>
        <h1 className="font-serif text-2xl font-black text-white leading-tight">
          Bar<span className="text-brand-mid">Priser</span>
        </h1>
        <p className="text-[11px] text-white/30 mt-1">
          Community drink price research
        </p>
      </div>

      {/* Nav */}
      <nav className="px-4 pt-5 pb-2 flex flex-col gap-0.5">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-100",
              path === href
                ? "bg-brand text-white"
                : "text-white/50 hover:bg-white/[0.06] hover:text-white"
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Venues list */}
      <div className="px-4 pt-5 flex-1">
        <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-white/25 px-1.5 mb-2">
          Tracked venues
        </p>
        {venues.length === 0 ? (
          <p className="text-[12px] text-white/20 px-1.5">No venues yet</p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {venues.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] text-white/50 hover:text-white hover:bg-white/[0.05] transition-all cursor-default"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <MapPin size={11} className="shrink-0 text-brand-mid/60" />
                  {v.name}
                </span>
                <span className="font-mono text-[10px] text-white/25 shrink-0 ml-2">
                  {v.entry_count ?? 0}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-7 py-4 border-t border-white/[0.07]">
        <p className="text-[10px] text-white/20 leading-relaxed">
          Data is shared across all visitors. Contribute responsibly 🍺
        </p>
      </div>
    </aside>
  );
}
