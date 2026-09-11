// ── Add new cities here ────────────────────────────────────────────────────
// Just add a new line: { value: "city-slug", label: "City Name" }
// The value is used internally, label is what users see.
// Then run this SQL in the Turso console to allow the new city:
//   (no SQL needed — just adding it here is enough!)

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
