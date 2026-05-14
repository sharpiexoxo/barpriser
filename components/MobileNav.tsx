"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusCircle, List, BarChart2, LogIn, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import clsx from "clsx";

const NAV = [
  { href: "/add",      label: "Add",      icon: PlusCircle },
  { href: "/entries",  label: "Entries",  icon: List },
  { href: "/overview", label: "Overview", icon: BarChart2 },
];

export default function MobileNav() {
  const path = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-ink border-t border-white/10 flex">
      {NAV.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} className={clsx(
          "flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium transition-colors",
          path === href ? "text-brand-mid" : "text-white/40 hover:text-white/70"
        )}>
          <Icon size={20} />{label}
        </Link>
      ))}
      {session
        ? <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[11px] text-white/40">
            <LogOut size={20} />Sign out
          </button>
        : <Link href="/login" className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[11px] text-white/40">
            <LogIn size={20} />Sign in
          </Link>
      }
    </nav>
  );
}
