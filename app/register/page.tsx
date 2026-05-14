"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    router.push("/login?registered=1");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-black text-ink">Bar<span className="text-brand">Priser</span></h1>
          <p className="text-sm text-ink-3 mt-1">Opret en konto for at registrere pris</p>
        </div>
        <div className="card">
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-2 mb-1">Dit navn</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mads" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-2 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-2 mb-1">Password <span className="text-ink-3 font-normal">(min. 6 tegn)</span></label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-1 disabled:opacity-60">
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-ink-3 mt-4">
          Har du allerede en konto?{" "}
          <Link href="/login" className="text-brand font-medium hover:underline">Log ind</Link>
        </p>
      </div>
    </div>
  );
}
