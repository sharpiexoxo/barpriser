// ── Tilføj nye byer her ───────────────────────────────────────────────────
// Tilføj blot en ny linje: { value: "by-slug", label: "Bynavn" }
// Søgebaren vises automatisk når der er over 6 byer.

export const CITIES = [
  { value: "koebenhavn",  label: "København"  },
  { value: "aarhus",      label: "Aarhus"     },
  { value: "odense",      label: "Odense"     },
  { value: "aalborg",     label: "Aalborg"    },
  { value: "randers",     label: "Randers"    },
  { value: "esbjerg",     label: "Esbjerg"    },
  { value: "horsens",     label: "Horsens"    },
  { value: "vejle",       label: "Vejle"      },
  { value: "roskilde",    label: "Roskilde"   },
  { value: "herning",     label: "Herning"    },
  { value: "silkeborg",   label: "Silkeborg"  },
  { value: "naestved",    label: "Næstved"    },
  { value: "fredericia",  label: "Fredericia" },
  { value: "viborg",      label: "Viborg"     },
  { value: "kolding",     label: "Kolding"    },
  { value: "holstebro",   label: "Holstebro"  },
  { value: "slagelse",    label: "Slagelse"   },
  { value: "hilleroed",   label: "Hillerød"   },
  { value: "soenderborg", label: "Sønderborg" },
  { value: "hjorring",    label: "Hjørring"   },
] as const;

export type CityValue = (typeof CITIES)[number]["value"];

export function getCityLabel(value: string): string {
  return CITIES.find(c => c.value === value)?.label ?? value;
}
