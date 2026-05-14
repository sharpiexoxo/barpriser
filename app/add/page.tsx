"use client";
import { useEffect, useRef, useState } from "react";
import { Camera, X, Plus, Check, LogIn } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast, ToastProvider } from "@/components/Toast";
import type { Venue } from "@/lib/db";
import clsx from "clsx";
import Link from "next/link";

const CATEGORIES = ["Beer (draft)","Beer (bottle/can)","Wine (glass)","Cocktail","Spirit (single)","Shot","Soft drink","Other"];

function AddForm() {
  const toast = useToast();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showNewVenue, setShowNewVenue] = useState(false);
  const [nvName, setNvName] = useState("");
  const [nvLocation, setNvLocation] = useState("");
  const [drink, setDrink] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function loadVenues() {
    const res = await fetch("/api/venues");
    if (res.ok) { const d = await res.json(); if (Array.isArray(d)) setVenues(d); }
  }
  useEffect(() => { loadVenues(); }, []);

  // Not logged in — show prompt
  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">🍺</div>
        <h3 className="font-serif text-xl font-bold text-ink mb-2">Sign in to contribute</h3>
        <p className="text-sm text-ink-3 mb-6 max-w-xs">You need an account to add drink prices. It's free and takes 30 seconds.</p>
        <div className="flex gap-3">
          <Link href="/login" className="btn-primary"><LogIn size={15} /> Sign in</Link>
          <Link href="/register" className="btn-ghost">Create account</Link>
        </div>
      </div>
    );
  }

  if (status === "loading") {
    return <div className="py-20 text-center text-ink-3 text-sm">Loading…</div>;
  }

  async function createVenue() {
    if (!nvName.trim()) { toast("Enter a venue name", "error"); return; }
    const res = await fetch("/api/venues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nvName.trim(), location: nvLocation.trim() }),
    });
    if (!res.ok) { const d = await res.json(); toast(d.error, "error"); return; }
    const v: Venue = await res.json();
    setNvName(""); setNvLocation(""); setShowNewVenue(false);
    await loadVenues();
    setSelectedId(v.id);
    toast(`"${v.name}" added ✓`);
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoUrl(URL.createObjectURL(file));
  }

  function removePhoto() {
    setPhotoFile(null); setPhotoUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function submit() {
    if (!selectedId) { toast("Select a venue", "error"); return; }
    if (!drink.trim()) { toast("Enter the drink name", "error"); return; }
    if (!price || isNaN(+price)) { toast("Enter a valid price", "error"); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("venue_id", String(selectedId));
      fd.append("drink", drink.trim());
      fd.append("category", category);
      fd.append("price_dkk", price);
      fd.append("notes", notes.trim());
      if (photoFile) fd.append("photo", photoFile);
      const res = await fetch("/api/entries", { method: "POST", body: fd });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setDrink(""); setCategory(""); setPrice(""); setNotes("");
      removePhoto(); await loadVenues();
      toast("Entry saved! 🍺");
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Failed to save", "error");
    } finally { setSubmitting(false); }
  }

  return (
    <div className="max-w-2xl">
      {/* Venue */}
      <div className="mb-7">
        <div className="section-label">Step 1 — Venue</div>
        <div className="card">
          <div className="flex flex-wrap gap-2">
            {venues.map(v => (
              <button key={v.id} onClick={() => setSelectedId(v.id)}
                className={clsx("chip", selectedId === v.id && "chip-active")}>{v.name}</button>
            ))}
            <button onClick={() => setShowNewVenue(s => !s)}
              className="chip border-dashed text-ink-3 hover:border-brand hover:text-brand flex items-center gap-1">
              <Plus size={13} /> New venue
            </button>
          </div>
          {showNewVenue && (
            <div className="mt-4 p-4 bg-surface-2 rounded-xl border border-surface-3">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[11px] font-medium text-ink-2 mb-1">Venue name *</label>
                  <input value={nvName} onChange={e => setNvName(e.target.value)} placeholder="e.g. Under Masken" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-ink-2 mb-1">Neighbourhood</label>
                  <input value={nvLocation} onChange={e => setNvLocation(e.target.value)} placeholder="e.g. Latin Quarter" />
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn-primary text-xs px-4 py-2" onClick={createVenue}><Check size={13} /> Save venue</button>
                <button className="btn-ghost text-xs px-4 py-2" onClick={() => setShowNewVenue(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drink */}
      <div className="mb-7">
        <div className="section-label">Step 2 — Drink & price</div>
        <div className="card">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[11px] font-medium text-ink-2 mb-1">Drink name *</label>
              <input value={drink} onChange={e => setDrink(e.target.value)} placeholder="e.g. Carlsberg 50cl" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-ink-2 mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">— select —</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-ink-2 mb-1">Price (DKK) *</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="65" min="0" step="5" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-ink-2 mb-1">Notes</label>
              <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. 50cl, happy hour" />
            </div>
          </div>
        </div>
      </div>

      {/* Photo */}
      <div className="mb-8">
        <div className="section-label">Step 3 — Photo (optional)</div>
        <div className="card">
          {photoUrl
            ? <div className="relative">
                <img src={photoUrl} alt="Preview" className="w-full max-h-56 object-cover rounded-xl" />
                <button onClick={removePhoto} className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-black/70"><X size={14} /></button>
              </div>
            : <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-surface-3 rounded-xl p-8 cursor-pointer hover:border-brand hover:bg-brand-light transition-all">
                <Camera size={28} className="text-brand" />
                <span className="text-sm text-ink-3">Tap to attach a photo</span>
                <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handlePhoto} />
              </label>
          }
        </div>
      </div>

      <button onClick={submit} disabled={submitting} className="btn-primary w-full py-4 text-base justify-center disabled:opacity-60">
        <Check size={16} />{submitting ? "Saving…" : "Save entry"}
      </button>
    </div>
  );
}

export default function AddPage() {
  return (
    <ToastProvider>
      <div className="border-b border-surface-3 px-10 py-7">
        <h2 className="font-serif text-3xl font-bold text-ink">Log a drink</h2>
        <p className="text-sm text-ink-3 mt-1">Select a venue and enter what you paid</p>
      </div>
      <div className="px-10 py-8"><AddForm /></div>
    </ToastProvider>
  );
}
