"use client";
import { useState } from "react";
import { Flag, X } from "lucide-react";
import clsx from "clsx";

const REASONS = ["Duplicate entry", "Wrong price", "Fake/made up", "Wrong venue", "Other"];

interface Props {
  entryId: number;
  drinkName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReportModal({ entryId, drinkName, onClose, onSuccess }: Props) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!reason) { setError("Please select a reason"); return; }
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entry_id: entryId, reason, details }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) { setError(data.error); return; }
    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Flag size={18} className="text-brand" />
            <h3 className="font-serif text-lg font-bold text-ink">Report entry</h3>
          </div>
          <button onClick={onClose} className="text-ink-3 hover:text-ink"><X size={18} /></button>
        </div>

        <p className="text-sm text-ink-3 mb-4">
          Reporting: <span className="font-medium text-ink">"{drinkName}"</span>
        </p>

        <div className="flex flex-col gap-2 mb-4">
          {REASONS.map(r => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={clsx(
                "text-left px-4 py-2.5 rounded-xl border text-sm transition-all",
                reason === r
                  ? "border-brand bg-brand-light text-brand-dark font-medium"
                  : "border-surface-3 bg-surface-2 text-ink-2 hover:border-brand/40"
              )}
            >{r}</button>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-ink-2 mb-1">Additional details (optional)</label>
          <textarea
            value={details}
            onChange={e => setDetails(e.target.value)}
            placeholder="Any extra info that might help..."
            className="w-full px-3 py-2 border border-surface-3 rounded-lg text-sm resize-none h-20"
          />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-3">{error}</p>}

        <div className="flex gap-2">
          <button onClick={submit} disabled={submitting} className="btn-primary flex-1 justify-center disabled:opacity-60">
            {submitting ? "Submitting…" : "Submit report"}
          </button>
          <button onClick={onClose} className="btn-ghost">Cancel</button>
        </div>
      </div>
    </div>
  );
}
