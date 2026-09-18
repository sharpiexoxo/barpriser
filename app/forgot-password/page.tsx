"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/forgot-password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (!res.ok) { const d = await res.json(); setError(d.error); return; }
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-black text-ink">Bar<span className="text-brand">Priser</span></h1>
        </div>
        {sent ? (
          <div className="card text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={22} className="text-green-600" />
            </div>
            <h2 className="font-serif text-xl font-bold text-ink mb-2">Tjek din indbakke</h2>
            <p className="text-sm text-ink-3 mb-6">
              Hvis <span className="font-medium text-ink">{email}</span> er registreret, modtager du snart et link. Tjek også spam-mappen.
            </p>
            <Link href="/login" className="btn-ghost w-full justify-center"><ArrowLeft size={14} /> Tilbage til login</Link>
          </div>
        ) : (
          <>
            <div className="card">
              <h2 className="font-serif text-xl font-bold text-ink mb-1">Glemt adgangskode?</h2>
              <p className="text-sm text-ink-3 mb-5">Indtast din e-mail og vi sender dig et nulstillingslink.</p>
              <form onSubmit={submit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-medium text-ink-2 mb-1">E-mailadresse</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="du@eksempel.dk" required />
                </div>
                {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 disabled:opacity-60">
                  {loading ? "Sender…" : "Send nulstillingslink"}
                </button>
              </form>
            </div>
            <p className="text-center text-sm text-ink-3 mt-4">
              <Link href="/login" className="text-brand font-medium hover:underline flex items-center justify-center gap-1">
                <ArrowLeft size={13} /> Tilbage til login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
