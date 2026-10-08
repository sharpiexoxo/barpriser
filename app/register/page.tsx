"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import LegalFooter from "@/components/LegalFooter";

export default function RegisterPage() {
  const { t } = useLocale();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!accepted) { setError("Du skal acceptere privatlivspolitikken for at oprette en konto"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json(); setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setDone(true);
  }

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-black text-ink">Bar<span className="text-brand">Priser</span></h1>
        </div>
        <div className="card text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={26} className="text-green-600" />
          </div>
          <h2 className="font-serif text-xl font-bold text-ink mb-2">Tjek din indbakke!</h2>
          <p className="text-sm text-ink-3 mb-2">Vi har sendt en bekræftelsesmail til:</p>
          <p className="font-medium text-ink mb-4">{email}</p>
          <p className="text-sm text-ink-3 mb-6">
            Klik på linket i e-mailen for at aktivere din konto. Tjek også spam-mappen.
          </p>
          <Link href="/login" className="btn-ghost w-full justify-center">Gå til login</Link>
        </div>
        <LegalFooter />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-black text-ink">Bar<span className="text-brand">Priser</span></h1>
          <p className="text-sm text-ink-3 mt-1">{t("register_subtitle")}</p>
        </div>
        <div className="card">
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-2 mb-1">{t("register_name")}</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder={t("register_name_ph")} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-2 mb-1">{t("register_email")}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="du@eksempel.dk" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-2 mb-1">
                {t("register_password")} <span className="text-ink-3 font-normal">{t("register_pw_hint")}</span>
              </label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required minLength={6} />
            </div>

            {/* Privacy acceptance */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={e => setAccepted(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                  accepted ? "bg-brand border-brand" : "border-surface-3 bg-surface group-hover:border-brand/50"
                }`}>
                  {accepted && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-xs text-ink-2 leading-relaxed">
                Jeg accepterer BarPrisers{" "}
                <Link href="/privacy" target="_blank" className="text-brand hover:underline font-medium">
                  privatlivspolitik
                </Link>
                {" "}og{" "}
                <Link href="/cookies" target="_blank" className="text-brand hover:underline font-medium">
                  cookiepolitik
                </Link>
              </span>
            </label>

            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <button type="submit" disabled={loading || !accepted}
              className="btn-primary w-full justify-center py-3 mt-1 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? t("register_loading") : t("register_btn")}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-ink-3 mt-4">
          {t("register_have_account")}{" "}
          <Link href="/login" className="text-brand font-medium hover:underline">{t("register_signin")}</Link>
        </p>
        <LegalFooter />
      </div>
    </div>
  );
}
