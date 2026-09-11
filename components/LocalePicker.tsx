"use client";
import { useState, useRef, useEffect } from "react";
import { locales, type Locale } from "@/lib/i18n";
import { useLocale } from "./LocaleProvider";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";

export default function LocalePicker({ variant = "sidebar" }: { variant?: "sidebar" | "mobile" }) {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = locales.find(l => l.code === locale)!;

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  if (variant === "mobile") {
    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1 px-2 py-3 text-[10px] text-white/40 hover:text-white/70 transition-colors"
        >
          <span className="text-base leading-none">{current.flag}</span>
          <ChevronDown size={10} className={clsx("transition-transform", open && "rotate-180")} />
        </button>
        {open && (
          <div className="absolute bottom-full right-0 mb-1 bg-ink border border-white/10 rounded-xl overflow-hidden shadow-xl z-50 min-w-[130px]">
            {locales.map(l => (
              <button key={l.code} onClick={() => { setLocale(l.code as Locale); setOpen(false); }}
                className={clsx(
                  "w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors",
                  locale === l.code ? "bg-brand text-white" : "text-white/60 hover:bg-white/[0.07] hover:text-white"
                )}>
                <span className="text-base">{l.flag}</span>{l.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative px-4 mb-4">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition-all">
        <span className="text-lg">{current.flag}</span>
        <span className="text-[13px] text-white/60 flex-1 text-left">{current.label}</span>
        <ChevronDown size={12} className={clsx("text-white/30 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute bottom-full left-4 right-4 mb-1 bg-ink border border-white/10 rounded-xl overflow-hidden shadow-xl z-50">
          {locales.map(l => (
            <button key={l.code} onClick={() => { setLocale(l.code as Locale); setOpen(false); }}
              className={clsx(
                "w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors",
                locale === l.code ? "bg-brand text-white" : "text-white/60 hover:bg-white/[0.07] hover:text-white"
              )}>
              <span className="text-base">{l.flag}</span>{l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
