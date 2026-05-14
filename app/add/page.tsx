"use client";
import { useEffect, useRef, useState } from "react";
import { Camera, X, Plus, Check, LogIn, Search, MapPin } from "lucide-react";
import { useSession } from "next-auth/react";
import { useToast, ToastProvider } from "@/components/Toast";
import type { Venue } from "@/lib/db";
import clsx from "clsx";
import Link from "next/link";

const CATEGORIES = ["Beer (draft)","Beer (bottle/can)","Wine (glass)","Cocktail","Spirit (single)","Shot","Soft drink","Other"];

function VenueSearch({ onSelect }: { onSelect: (v: Venue) => void }) {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Venue[]>([]);
  const [all, setAll] = useState<Venue[]>([]);
  const [selected, setSelected] = useState<Venue | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [nvName, setNvName] = useState("");
  const [nvLocation, setNvLocation] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/venues").then(r => r.json()).then(d => { if (Array.isArray(d)) setAll(d); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    setResults(all.filter(v => v.name.toLowerCase().includes(q) || (v.location ?? "").toLowerCase().includes(q)).slice(0, 8));
  }, [query, all]);

  function pick(v: Venue) {
    setSelected(v);
    setQuery(v.name);
    setOpen(false);
    setShowNew(false);
    onSelect(v);
  }

  function clear() {
    setSelected(null);
    setQuery("");
    setResults([]);
    setShowNew(false);
    setOpen(false);
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
    const updated = await fetch("/api/venues").then(r => r.json());
    if (Array.isArray(updated)) setAll(updated);
    setNvName(""); setNvLocation(""); setShowNew(false);
    pick(v);
    toast(`"${v.name}" added ✓`);
  }

  const noResults = query.trim().length > 0 && results.length === 0 && !selected;

  return (
    <div className="relative">
      <div className={clsx(
        "flex items-center gap-2 border rounded-xl px-3 py-2.5 transition-all bg-surface",
        selected ? "border-brand bg-brand-light/30" : "border-surface-3 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10"
      )}>
        {selected ? <MapPin size={15} className="text-brand shrink-0" /> : <Search size={15} className="text-ink-3 shrink-0" />}
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); if (selected) setSelected(null); }}
          onFocus={() => setOpen(true)}
          placeholder="Search for a bar or venue…"
          className="flex-1 bg-transparent border-0 outline-none ring-0 text-sm text-ink p-0 focus:ring-0"
          style={{ boxShadow: "none" }}
        />
        {query && <button onClick={clear} className="text-ink-3 hover:text-ink"><X size={14} /></button>}
      </div>

      {selected && (
        <div className="mt-2 flex items-center gap-2 text-sm text-brand-dark font-medium">
          <Check size={14} className="text-brand" />
          <span>{selected.name}</span>
          {selected.location && <span className="text-ink-3 font-normal text-xs">· {selected.location}</span>}
          <button onClick={clear} className="ml-auto text-xs text-ink-3 hover:text-brand underline">Change</button>
        </div>
      )}

      {open && !selected && (
        <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-surface border border-surface-3 rounded-xl shadow-xl overflow-hidden">
          {results.length > 0 && (
            <ul>
              {results.map(v => (
                <li key={v.id}>
                  <button
                    onMouseDown={() => pick(v)}
                    className="w-full text-left px-4 py-3 hover:bg-surface-2 transition-colors flex items-center gap-3 border-b border-surface-3 last:border-0"
                  >
                    <MapPin size={13} className="text-brand shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-ink">{v.name}</div>
                      {v.location && <div className="text-xs text-ink-3">{v.location}</div>}
                    </div>
                    <div className="ml-auto font-mono text-[10px] text-ink-3">{v.entry_count ?? 0} entries</div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {noResults && !showNew && (
            <div className="px-4 py-4">
              <p className="text-sm text-ink-3 mb-3">
                No venue found matching <span className="font-medium text-ink">"{query}"</span>
              </p>
              <button
                onMouseDown={() => { setShowNew(true); setNvName(query); setOpen(false); }}
                className="btn-primary text-xs px-3 py-2 flex items-center gap-1.5"
              >
                <Plus size={13} /> Add "{query}" as new venue
              </button>
            </div>
          )}

          {query.trim() === "" && (
            <div className="px-4 py-3 text-xs text-ink-3">
              Start typing to search {all.length} venues…
            </div>
          )}
        </div>
      )}

      {showNew && !selected && (
        <div className="mt-3 p-4 bg-surface-2 rounded-xl border border-surface-3">
          <p className="text-xs font-medium text-ink-2 mb-3">Adding new venue</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[11px] font-medium text-ink-2 mb-1">Venue name *</label>
              <input value={nvName} onChange={e => setNvName(e.target.value)} placeholder="e.g. Under Masken" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-ink-2 mb-1">Neighbourhood / address</label>
              <input value={nvLocation} onChange={e => setNvLocation(e.target.value)} placeholder="e.g. Latin Quarter" />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary text-xs px-4 py-2" onClick={createVenue}><Check size={13} /> Save venue</button>
            <button className="btn-ghost text-xs px-4 py-2" onClick={() => { setShowNew(false); setQuery(""); }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddForm() {
  const toast = useToast();
  const { status } = useSession();
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [drink, setDrink] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
  if (status === "loading") return <div className="py-20 text-center text-ink-3 text-sm">Loading…</div>;

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
    if (!selectedVenue) { toast("Select a venue", "error"); return; }
    if (!drink.trim())  { toast("Enter the drink name", "error"); return; }
    if (!price || isNaN(+price)) { toast("Enter a valid price", "error"); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("venue_id", String(selectedVenue.id));
      fd.append("drink", drink.trim());
      fd.append("category", category);
      fd.append("price_dkk", price);
      fd.append("notes", notes.trim());
      if (photoFile) fd.append("photo", photoFile);
      const res = await fetch("/api/entries", { method: "POST", body: fd });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setDrink(""); setCategory(""); setPrice(""); setNotes("");
      removePhoto();
      toast("Entry saved! 🍺");
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Failed to save", "error");
    } finally { setSubmitting(false); }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-7">
        <div className="section-label">Step 1 — Venue</div>
        <div className="card">
          <VenueSearch onSelect={setSelectedVenue} />
        </div>
      </div>

      <div className="mb-7">
        <div className="section-label">Step 2 — Drink & price</div>
        <div className="card">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-ink-2 mb-1">Drink name *</label>
              <input value={drink} onChange={e => setDrink(e.target.value)} placeholder="e.g. Carlsberg 50cl, Negroni" />
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
              <label className="block text-[11px] font-medium text-ink-2 mb-1">Notes (size, happy hour…)</label>
              <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. 50cl, happy hour before 18:00" />
            </div>
          </div>
        </div>
      </div>

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
                <span className="text-sm text-ink-3">Tap to attach a photo of your drink or the menu</span>
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