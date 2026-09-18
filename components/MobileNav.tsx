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
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-ink border-t border-white/10 flex items-stretch">
      {NAV.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} className={clsx(
          "flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium transition-colors",
          path === href ? "text-brand-mid" : "text-white/40 hover:text-white/70"
        )}>
          <Icon size={19} />{label}
        </Link>
      ))}
      <LocalePicker variant="mobile" />
      {session
        ? <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] text-white/40">
            <LogOut size={19} />{t("nav_signout")}
          </button>
        : <Link href="/login" className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] text-white/40">
            <LogIn size={19} />{t("nav_signin")}
          </Link>
      }
    </nav>
  );
}
