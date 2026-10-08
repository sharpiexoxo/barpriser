import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privatlivspolitik — BarPriser",
  description: "Læs om hvordan BarPriser behandler dine personoplysninger",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/" className="flex items-center gap-2 text-sm text-ink-3 hover:text-brand mb-8 transition-colors">
        <ArrowLeft size={14} /> Tilbage
      </Link>

      <h1 className="font-serif text-3xl font-bold text-ink mb-2">Privatlivspolitik</h1>
      <p className="text-sm text-ink-3 mb-8">Sidst opdateret: oktober 2024</p>

      <div className="prose-custom">

        <section className="mb-8">
          <h2>1. Dataansvarlig</h2>
          <p>BarPriser er dataansvarlig for behandlingen af de personoplysninger, vi modtager om dig. Har du spørgsmål til vores behandling af dine oplysninger, er du velkommen til at kontakte os.</p>
          <p>Dette kan du gøre ved at sende os en mail til kontakt@barpriser.dk</p>
        </section>

        <section className="mb-8">
          <h2>2. Hvilke oplysninger indsamler vi?</h2>
          <p>Vi indsamler og behandler følgende personoplysninger om dig:</p>
          <ul>
            <li><strong>Navn og e-mailadresse</strong> — når du opretter en konto</li>
            <li><strong>Adgangskode</strong> — gemt som en krypteret hash (vi kan ikke se din adgangskode)</li>
            <li><strong>Priser og drikkevareoplysninger</strong> — som du selv registrerer på platformen</li>
            <li><strong>Fotos</strong> — hvis du vælger at uploade billeder til dine registreringer</li>
            <li><strong>IP-adresse</strong> — midlertidigt til brug for beskyttelse mod misbrug (rate limiting)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>3. Formål med behandlingen</h2>
          <p>Vi behandler dine oplysninger til følgende formål:</p>
          <ul>
            <li>At oprette og administrere din brugerkonto</li>
            <li>At vise dit navn ved de priser, du registrerer</li>
            <li>At sende e-mails til bekræftelse af din e-mailadresse og nulstilling af adgangskode</li>
            <li>At beskytte platformen mod misbrug og spam</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>4. Retsgrundlag</h2>
          <p>Vi behandler dine personoplysninger på følgende retsgrundlag:</p>
          <ul>
            <li><strong>Opfyldelse af aftale</strong> (GDPR art. 6, stk. 1, litra b) — behandling af navn, e-mail og adgangskode er nødvendig for at oprette og drive din konto</li>
            <li><strong>Legitim interesse</strong> (GDPR art. 6, stk. 1, litra f) — IP-adresser behandles midlertidigt for at beskytte tjenesten mod misbrug</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>5. Opbevaring og sletning</h2>
          <p>Vi opbevarer dine personoplysninger så længe din konto er aktiv. Hvis du sletter din konto, vil dit navn og din e-mail blive slettet. Priser du har registreret bevares uden tilknytning til din konto, da de udgør fælles data på platformen.</p>
          <p>E-mails til bekræftelse og nulstilling af adgangskode udløber automatisk efter henholdsvis 24 timer og 1 time.</p>
        </section>

        <section className="mb-8">
          <h2>6. Deling af oplysninger</h2>
          <p>Vi deler ikke dine personoplysninger med tredjepart med undtagelse af:</p>
          <ul>
            <li><strong>Cloudinary</strong> — hvis du uploader fotos, gemmes disse på Cloudinary's servere (USA). Cloudinary overholder GDPR via Standard Contractual Clauses</li>
            <li><strong>Resend</strong> — til udsendelse af systemnotifikationer (bekræftelsesmails). Resend behandler alene din e-mailadresse til dette formål</li>
            <li><strong>Turso (Chiselstrike Inc.)</strong> — vores database er hostet hos Turso i EU (AWS eu-west-1, Irland)</li>
            <li><strong>Vercel</strong> — vores webapplikation er hostet på Vercel, som overholder GDPR</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>7. Dine rettigheder</h2>
          <p>Du har følgende rettigheder i henhold til GDPR:</p>
          <ul>
            <li><strong>Ret til indsigt</strong> — du kan anmode om en kopi af de oplysninger, vi har om dig</li>
            <li><strong>Ret til berigtigelse</strong> — du kan få rettet forkerte oplysninger</li>
            <li><strong>Ret til sletning</strong> — du kan anmode om sletning af din konto og dine personoplysninger</li>
            <li><strong>Ret til dataportabilitet</strong> — du kan anmode om at modtage dine oplysninger i et maskinlæsbart format</li>
            <li><strong>Ret til indsigelse</strong> — du kan gøre indsigelse mod vores behandling af dine oplysninger</li>
          </ul>
          <p>For at udøve dine rettigheder kan du kontakte os. Vi besvarer din henvendelse inden for 30 dage.</p>
        </section>

        <section className="mb-8">
          <h2>8. Klage til Datatilsynet</h2>
          <p>Du har ret til at indgive en klage til Datatilsynet, hvis du mener, at vores behandling af dine personoplysninger er i strid med databeskyttelseslovgivningen.</p>
          <p>
            Datatilsynet<br />
            Carl Jacobsens Vej 35<br />
            2500 Valby<br />
            <a href="https://www.datatilsynet.dk" target="_blank" rel="noopener noreferrer">www.datatilsynet.dk</a>
          </p>
        </section>

        <section className="mb-8">
          <h2>9. Sikkerhed</h2>
          <p>Vi beskytter dine personoplysninger med følgende tekniske foranstaltninger:</p>
          <ul>
            <li>Adgangskoder krypteres med bcrypt (cost factor 12) — vi kan aldrig se din adgangskode</li>
            <li>Al kommunikation sker over HTTPS/TLS</li>
            <li>Sessioner håndteres via krypterede JWT-tokens</li>
            <li>Kun administratorer har adgang til brugerdata via admin-panelet</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2>10. Ændringer til denne politik</h2>
          <p>Vi forbeholder os retten til at opdatere denne privatlivspolitik. Væsentlige ændringer vil blive kommunikeret via e-mail til registrerede brugere.</p>
        </section>

      </div>

      <div className="border-t border-surface-3 pt-6 mt-8">
        <Link href="/cookies" className="text-brand hover:underline text-sm">Læs vores cookiepolitik →</Link>
      </div>
    </div>
  );
}
