"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setError("Ugyldigt bekræftelseslink"); return; }
    fetch(`/api/verify-email?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.ok) setStatus("success");
        else { setStatus("error"); setError(d.error); }
      })
      .catch(() => { setStatus("error"); setError("Noget gik galt — prøv igen"); });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-black text-ink">Bar<span className="text-brand">Priser</span></h1>
        </div>

        {status === "loading" && (
          <div className="card text-center">
            <Loader size={40} className="text-brand animate-spin mx-auto mb-4" />
            <p className="text-sm text-ink-3">Bekræfter din e-mail…</p>
          </div>
        )}

        {status === "success" && (
          <div className="card text-center">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="font-serif text-xl font-bold text-ink mb-2">E-mail bekræftet!</h2>
            <p className="text-sm text-ink-3 mb-6">
              Din konto er nu aktiveret. Du kan logge ind og begynde at registrere priser.
            </p>
            <Link href="/login" className="btn-primary w-full justify-center">
              Log ind nu
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="card text-center">
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="font-serif text-xl font-bold text-ink mb-2">Bekræftelse mislykkedes</h2>
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4">{error}</p>
            <p className="text-sm text-ink-3 mb-6">
              Linket kan være udløbet. Du kan anmode om et nyt bekræftelseslink.
            </p>
            <ResendForm />
            <Link href="/login" className="btn-ghost w-full justify-center mt-3">
              Tilbage til login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function ResendForm() {
  const [email, setEmail] = useState("");
  const [sent,  setSent]  = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/resend-verification", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSent(true);
  }

  if (sent) return <p className="text-sm text-green-600 font-medium">Nyt link sendt! Tjek din indbakke.</p>;

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
        placeholder="din@email.dk" required className="flex-1 text-sm" />
      <button type="submit" disabled={loading} className="btn-primary text-sm px-4 py-2 disabled:opacity-60">
        {loading ? "…" : "Send nyt"}
      </button>
    </form>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader size={32} className="text-brand animate-spin" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
