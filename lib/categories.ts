export const CATEGORIES_DA = [
  "Fadøl","Kande øl","Dåse/flaskeøl","Specialøl","Cider","Shots","Drinks","Cocktails",
  "Vin","Spiritus","Sodavand","Energi- og læskedrikke","Vand","Kaffe & varme drikke","Alkoholfri",
] as const;
export const CATEGORIES_EN = [
  "Draft beer","Pitcher","Can/bottle beer","Craft beer","Cider","Shots","Drinks","Cocktails",
  "Wine","Spirits","Soft drinks","Energy & soft drinks","Water","Coffee & hot drinks","Non-alcoholic",
] as const;
export type CategoryDA = (typeof CATEGORIES_DA)[number];
export type CategoryEN = (typeof CATEGORIES_EN)[number];
