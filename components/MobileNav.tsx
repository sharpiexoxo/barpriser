"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusCircle, List, BarChart2, LogIn, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useLocale } from "./LocaleProvider";
import LocalePicker from "./LocalePicker";
import clsx from "clsx";

export default function MobileNav() {
  const path = usePathname();
  const { data: session } = useSession();
  const { t } = useLocale();

  const NAV = [
    { href: "/add",      label: t("nav_add"),      icon: PlusCircle },
    { href: "/entries",  label: t("nav_entries"),  icon: List },
    { href: "/overview", label: t("nav_overview"), icon: BarChart2 },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-ink border-t border-white/10 flex items-stretch safe-area-bottom">
      {NAV.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} className={clsx(
          "flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors min-w-0",
          path === href ? "text-brand-mid" : "text-white/40 hover:text-white/70"
        )}>
          <Icon size={18} />
          <span className="truncate w-full text-center px-0.5">{label}</span>
        </Link>
      ))}
      <div className="flex items-center justify-center px-1">
        <LocalePicker variant="mobile" />
      </div>
      {session
        ? <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] text-white/40 min-w-0">
            <LogOut size={18} />
            <span className="truncate w-full text-center px-0.5">{t("nav_signout")}</span>
          </button>
        : <Link href="/login" className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] text-white/40 min-w-0">
            <LogIn size={18} />
            <span className="truncate w-full text-center px-0.5">{t("nav_signin")}</span>
          </Link>
      }
    </nav>
  );
}
