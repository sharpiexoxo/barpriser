"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError(t("login_error"));
    else router.push("/add");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-black text-ink">Bar<span className="text-brand">Priser</span></h1>
          <p className="text-sm text-ink-3 mt-1">{t("login_subtitle")}</p>
        </div>
        <div className="card">
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-2 mb-1">{t("login_email")}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="du@eksempel.dk" required />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-ink-2">{t("login_password")}</label>
                <Link href="/forgot-password" className="text-xs text-brand hover:underline">{t("login_forgot")}</Link>
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-1 disabled:opacity-60">
              {loading ? t("login_loading") : t("login_btn")}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-ink-3 mt-4">
          {t("login_no_account")}{" "}
          <Link href="/register" className="text-brand font-medium hover:underline">{t("login_register")}</Link>
        </p>
      </div>
    </div>
  );
}
