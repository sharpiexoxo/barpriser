import Link from "next/link";

export default function LegalFooter() {
  return (
    <div className="text-center text-xs text-ink-3 mt-8 pb-4">
      <Link href="/privacy" className="hover:text-brand transition-colors">Privatlivspolitik</Link>
      <span className="mx-2">·</span>
      <Link href="/cookies" className="hover:text-brand transition-colors">Cookiepolitik</Link>
    </div>
  );
}
