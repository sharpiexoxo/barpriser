"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [resending,  setResending]  = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(""); setUnverified(false);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error === "EMAIL_NOT_VERIFIED") {
      setUnverified(true);
      return;
    }
    if (res?.error) { setError(t("login_error")); return; }
    router.push("/add");
  }

  async function resendVerification() {
    setResending(true);
    await fetch("/api/resend-verification", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setResending(false);
    setResendSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-black text-ink">Bar<span className="text-brand">Priser</span></h1>
          <p className="text-sm text-ink-3 mt-1">{t("login_subtitle")}</p>
        </div>

        {unverified ? (
          <div className="card text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={22} className="text-amber-600" />
            </div>
            <h2 className="font-serif text-lg font-bold text-ink mb-2">E-mail ikke bekræftet</h2>
            <p className="text-sm text-ink-3 mb-4">
              Du skal bekræfte din e-mailadresse før du kan logge ind.<br />
              Tjek din indbakke for en bekræftelsesmail.
            </p>
            {resendSent ? (
              <p className="text-sm text-green-600 font-medium mb-4">Nyt link sendt! Tjek din indbakke.</p>
            ) : (
              <button onClick={resendVerification} disabled={resending}
                className="btn-primary w-full justify-center mb-3 disabled:opacity-60">
                {resending ? "Sender…" : "Send nyt bekræftelseslink"}
              </button>
            )}
            <button onClick={() => setUnverified(false)} className="btn-ghost w-full justify-center">
              Tilbage til login
            </button>
          </div>
        ) : (
          <>
            <div className="card">
              <form onSubmit={submit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-medium text-ink-2 mb-1">{t("login_email")}</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="du@eksempel.dk" required autoComplete="email" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-ink-2">{t("login_password")}</label>
                    <Link href="/forgot-password" className="text-xs text-brand hover:underline">{t("login_forgot")}</Link>
                  </div>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required autoComplete="current-password" />
                </div>
                {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
                <button type="submit" disabled={loading}
                  className="btn-primary w-full justify-center py-3 mt-1 disabled:opacity-60">
                  {loading ? t("login_loading") : t("login_btn")}
                </button>
              </form>
            </div>
            <p className="text-center text-sm text-ink-3 mt-4">
              {t("login_no_account")}{" "}
              <Link href="/register" className="text-brand font-medium hover:underline">{t("login_register")}</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
