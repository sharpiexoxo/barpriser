// ── Tilføj nye byer her ───────────────────────────────────────────────────
// Tilføj blot en ny linje: { value: "by-slug", label: "Bynavn" }
// Det er alt der skal til — ingen andre ændringer nødvendige.

export const CITIES = [
  { value: "koebenhavn", label: "København" },
  { value: "aarhus",     label: "Aarhus"    },
  { value: "odense",     label: "Odense"    },
  { value: "aalborg",    label: "Aalborg"   },
  { value: "randers",    label: "Randers"   },
] as const;

export type CityValue = (typeof CITIES)[number]["value"];

export function getCityLabel(value: string): string {
  return CITIES.find(c => c.value === value)?.label ?? value;
}
