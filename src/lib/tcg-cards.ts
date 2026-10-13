// Shared helpers for reading cards out of the Supabase `cards` table.
// Used by the builder and collection pages so they decode cards the same way.

// Change this if your table has a different name in Table Editor
export const CARDS_TABLE = "cards";

// The columns the pages need from each row
export const CARD_COLUMNS = "id, name, set, variants, types, rarity, hp, stage";

// One row exactly as it comes out of Supabase (everything is text)
export type CardRow = {
  id: string;
  name: string;
  set: string;
  variants: string | null;
  types: string | null;
  rarity: string | null;
  hp: string | null;
  stage: string | null;
};

// The `types` and `variants` columns are bitmasks: each option gets its own
// number (1, 2, 4, 8, ...) and a card's value is the sum of its options.
// Types are in alphabetical order (Grass is 7th, so Grass = 64).
// Variants are in TCGdex's order: normal, reverse, holo, firstEdition, wPromo
// (so Normal = 1, Reverse Holo = 2, Holo = 4, ...).
const TYPE_BITS = [
  "Colorless",
  "Darkness",
  "Dragon",
  "Fairy",
  "Fighting",
  "Fire",
  "Grass",
  "Lightning",
  "Metal",
  "Psychic",
  "Water",
];

const VARIANT_BITS = [
  "Normal",
  "Reverse Holo",
  "Holo",
  "First Edition",
  "W Promo",
];

// Turn a bitmask like "64" into a list of names like ["Grass"]
function decodeBits(code: string | null, names: string[]) {
  const value = Number(code);
  if (!Number.isInteger(value) || value <= 0) return [];
  return names.filter((_, i) => (value & (1 << i)) !== 0);
}

// "64" -> ["Grass"], "96" -> ["Fire", "Grass"]
export const decodeTypes = (code: string | null) => decodeBits(code, TYPE_BITS);

// "1" -> ["Normal"], "3" -> ["Normal", "Reverse Holo"]
export const decodeVariants = (code: string | null) =>
  decodeBits(code, VARIANT_BITS);

// TCGdex uses "None" for promo cards that have no printed rarity
export const cleanRarity = (rarity: string | null) =>
  !rarity || rarity === "None" ? "Promo" : rarity;

// The card number is the part of the id after the last dash: "2011bw-1" -> "#1"
export const cardNumberFromId = (id: string) => `#${id.split("-").pop()}`;

// HP is stored as text, so turn it into a real number (or null if missing)
export function parseHp(hp: string | null) {
  const value = Number(hp);
  return Number.isFinite(value) && value > 0 ? value : null;
}

// McDonald's promo sets have codes that start with a year, like "2014xy".
// TCGdex has no images for most of them, so pages show them after regular sets.
export const isMcDonaldsSet = (set: string) => /^\d/.test(set);