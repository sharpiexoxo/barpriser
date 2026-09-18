"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, ArrowLeft, Check } from "lucide-react";

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!token) return (
    <div className="card text-center">
      <p className="text-sm text-red-600 mb-4">Ugyldigt nulstillingslink.</p>
      <Link href="/forgot-password" className="btn-primary justify-center">Anmod om nyt link</Link>
    </div>
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Adgangskoderne matcher ikke"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/reset-password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);
    if (!res.ok) { const d = await res.json(); setError(d.error); return; }
    setDone(true);
    setTimeout(() => router.push("/login"), 2500);
  }

  if (done) return (
    <div className="card text-center">
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check size={22} className="text-green-600" />
      </div>
      <h2 className="font-serif text-xl font-bold text-ink mb-2">Adgangskode opdateret!</h2>
      <p className="text-sm text-ink-3">Du bliver sendt videre til login…</p>
    </div>
  );

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <KeyRound size={18} className="text-brand" />
        <h2 className="font-serif text-xl font-bold text-ink">Ny adgangskode</h2>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-ink-2 mb-1">Ny adgangskode <span className="text-ink-3 font-normal">(min. 6 tegn)</span></label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-2 mb-1">Bekræft adgangskode</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" required minLength={6} />
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 disabled:opacity-60">
          {loading ? "Opdaterer…" : "Opdater adgangskode"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-black text-ink">Bar<span className="text-brand">Priser</span></h1>
        </div>
        <Suspense fallback={<div className="card text-center text-sm text-ink-3">Indlæser…</div>}>
          <ResetForm />
        </Suspense>
        <p className="text-center text-sm text-ink-3 mt-4">
          <Link href="/login" className="text-brand font-medium hover:underline flex items-center justify-center gap-1">
            <ArrowLeft size={13} /> Tilbage til login
          </Link>
        </p>
      </div>
    </div>
  );
}
