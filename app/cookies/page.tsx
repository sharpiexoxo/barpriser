import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Cookiepolitik — BarPriser",
  description: "Læs om hvordan BarPriser anvender cookies",
};

export default function CookiesPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/" className="flex items-center gap-2 text-sm text-ink-3 hover:text-brand mb-8 transition-colors">
        <ArrowLeft size={14} /> Tilbage
      </Link>

      <h1 className="font-serif text-3xl font-bold text-ink mb-2">Cookiepolitik</h1>
      <p className="text-sm text-ink-3 mb-8">Sidst opdateret: oktober 2024</p>

      <div className="prose-custom">

        <section className="mb-8">
          <h2>Hvad er cookies?</h2>
          <p>Cookies er små tekstfiler, der gemmes på din enhed, når du besøger en hjemmeside. De bruges til at huske information om dit besøg, så hjemmesiden kan fungere korrekt.</p>
        </section>

        <section className="mb-8">
          <h2>Hvilke cookies bruger BarPriser?</h2>
          <p>BarPriser anvender udelukkende <strong>strengt nødvendige cookies</strong>. Vi bruger ingen tracking-cookies, annoncecookies eller tredjeparts analysecookies.</p>

          <div className="mt-4 border border-surface-3 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-2 border-b border-surface-3">
                  <th className="text-left px-4 py-3 font-semibold text-ink-2">Cookie</th>
                  <th className="text-left px-4 py-3 font-semibold text-ink-2">Formål</th>
                  <th className="text-left px-4 py-3 font-semibold text-ink-2">Udløber</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-surface-3">
                  <td className="px-4 py-3 font-mono text-xs text-ink">next-auth.session-token</td>
                  <td className="px-4 py-3 text-ink-2">Holder dig logget ind på BarPriser</td>
                  <td className="px-4 py-3 text-ink-3">30 dage</td>
                </tr>
                <tr className="border-b border-surface-3">
                  <td className="px-4 py-3 font-mono text-xs text-ink">next-auth.csrf-token</td>
                  <td className="px-4 py-3 text-ink-2">Beskytter mod CSRF-angreb</td>
                  <td className="px-4 py-3 text-ink-3">Session</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs text-ink">locale</td>
                  <td className="px-4 py-3 text-ink-2">Husker dit valg af sprog (DA/EN)</td>
                  <td className="px-4 py-3 text-ink-3">Permanent (localStorage)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2>Behøver vi dit samtykke?</h2>
          <p>Nej. Ifølge den danske cookiebekendtgørelse (§ 3) kræver <strong>strengt nødvendige cookies</strong> ikke dit samtykke, da de er nødvendige for at hjemmesiden kan fungere. Vores session-cookie er udelukkende nødvendig for at holde dig logget ind — uden den kan du ikke bruge platformen.</p>
          <p className="mt-3">Vi anvender ingen tracking- eller markedsføringscookies, og vi deler ingen cookiedata med tredjeparter til kommercielle formål.</p>
        </section>

        <section className="mb-8">
          <h2>Sådan sletter du cookies</h2>
          <p>Du kan til enhver tid slette cookies i din browser. Bemærk at sletning af session-cookien logger dig ud af BarPriser.</p>
          <ul>
            <li><strong>Chrome:</strong> Indstillinger → Privatliv og sikkerhed → Cookies og andre webstedsdata</li>
            <li><strong>Safari:</strong> Indstillinger → Safari → Avanceret → Webstedsdata</li>
            <li><strong>Firefox:</strong> Indstillinger → Privatliv og sikkerhed → Cookies og webstedsdata</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>Kontakt</h2>
          <p>Har du spørgsmål til vores brug af cookies, er du velkommen til at kontakte os.</p>
        </section>

      </div>

      <div className="border-t border-surface-3 pt-6 mt-8">
        <Link href="/privacy" className="text-brand hover:underline text-sm">Læs vores privatlivspolitik →</Link>
      </div>
    </div>
  );
}
