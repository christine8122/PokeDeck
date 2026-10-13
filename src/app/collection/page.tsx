"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Minus, Plus, Search, SlidersHorizontal, Trash2, X } from "lucide-react";
import Container from "@/components/custom/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { CardImage, TiltCard } from "@/components/custom/CardArt";
import { createClient } from "@/lib/supabase/client";
import {
  CARD_COLUMNS,
  CARDS_TABLE,
  cardNumberFromId,
  cleanRarity,
  decodeTypes,
  decodeVariants,
  isMcDonaldsSet,
  parseHp,
  type CardRow,
} from "@/lib/tcg-cards";

type TcgCard = {
  id: string;
  name: string;
  price: string;
  set: string;
  number: string;
  finish: string;
  rarity: string;
  owned: boolean;
  types: string[];
  qty: number; // how many copies you own
  hp?: number | null;
  stage?: string;
};

// Starting collection: just the Base Set Pikachu.
// The id is a real TCGdex card id (set-number) so the card image loads.
const placeholderCards: TcgCard[] = [
  { id: "base1-58", name: "Pikachu", price: "—", set: "base1", number: "#58", finish: "Normal", rarity: "Common", owned: true, types: ["Lightning"], qty: 1, hp: 40, stage: "Basic" },
];

const TYPES = ["All", "Grass", "Fire", "Water", "Lightning", "Psychic", "Fighting", "Darkness", "Metal", "Dragon", "Colorless", "Fairy"];
const BASE_RARITIES = ["Common", "Uncommon", "Rare", "Rare Holo"];
const BASE_FINISHES = ["Normal", "Holo", "Reverse Holo"];

// Keep the usual options first, then add any new ones from cards you've added
const withExtras = (base: string[], values: string[]) => [
  "All",
  ...base,
  ...[...new Set(values)].filter((v) => !base.includes(v)).sort(),
];

// Turn a Supabase row into a collection card
function rowToCollectionCard(row: CardRow): TcgCard {
  return {
    id: row.id,
    name: row.name,
    price: "—", // No price data in the table yet
    set: row.set,
    number: cardNumberFromId(row.id),
    finish: decodeVariants(row.variants)[0] ?? "Normal",
    rarity: cleanRarity(row.rarity),
    owned: true,
    types: decodeTypes(row.types),
    qty: 1,
    hp: parseHp(row.hp),
    stage: row.stage ?? undefined,
  };
}

function getCardColor(types: string[]) {
  if (types.includes("Fire")) return "bg-pink-500";
  if (types.includes("Water")) return "bg-blue-400";
  if (types.includes("Grass")) return "bg-green-400";
  if (types.includes("Lightning")) return "bg-yellow-300";
  if (types.includes("Psychic")) return "bg-purple-500";
  if (types.includes("Fighting")) return "bg-orange-400";
  return "bg-gray-400";
}

export default function CollectionPage() {
  // The collection lives in page state for now, so it resets on refresh.
  // TODO: save it to a Supabase table for the logged-in user.
  const [collection, setCollection] = useState<TcgCard[]>(placeholderCards);
  const [showAddCards, setShowAddCards] = useState(false);
  const [selected, setSelected] = useState<TcgCard | null>(null);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedFinish, setSelectedFinish] = useState("All");
  const [selectedRarity, setSelectedRarity] = useState("All");
  const [selectedSet, setSelectedSet] = useState("All");
  const [sortOrder, setSortOrder] = useState("az");
  const [showFilters, setShowFilters] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showFilters) return;
    function closeOutside(event: MouseEvent) {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) setShowFilters(false);
    }
    function closeEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setShowFilters(false);
    }
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, [showFilters]);

  // Filter options come from what's actually in the collection
  const RARITIES = withExtras(BASE_RARITIES, collection.map((card) => card.rarity));
  const FINISHES = withExtras(BASE_FINISHES, collection.map((card) => card.finish));
  const SETS = ["All", ...new Set(collection.map((card) => card.set))];

  const qtyInCollection = (id: string) =>
    collection.find((card) => card.id === id)?.qty ?? 0;

  // Add one copy: bump the count if you already own it, otherwise add it
  function addToCollection(card: TcgCard) {
    setCollection((previous) =>
      previous.some((owned) => owned.id === card.id)
        ? previous.map((owned) =>
            owned.id === card.id ? { ...owned, qty: owned.qty + 1 } : owned
          )
        : [...previous, { ...card, qty: 1, owned: true }]
    );
  }

  // Remove one copy. At zero copies the card leaves the collection.
  function removeOneFromCollection(id: string) {
    if (qtyInCollection(id) <= 1) setSelected(null);
    setCollection((previous) =>
      previous
        .map((owned) => (owned.id === id ? { ...owned, qty: owned.qty - 1 } : owned))
        .filter((owned) => owned.qty > 0)
    );
  }

  const filteredCards = collection.filter((card) => {
    const matchesSearch = card.name.toLowerCase().includes(search.trim().toLowerCase());
    const matchesType = selectedType === "All" || card.types.includes(selectedType);
    const matchesFinish = selectedFinish === "All" || card.finish === selectedFinish;
    const matchesRarity = selectedRarity === "All" || card.rarity === selectedRarity;
    const matchesSet = selectedSet === "All" || card.set === selectedSet;
    return matchesSearch && matchesType && matchesFinish && matchesRarity && matchesSet;
  });

  const visibleCards = [...filteredCards].sort((a, b) =>
    sortOrder === "za" ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name)
  );

  const activeCount = [selectedType, selectedFinish, selectedRarity, selectedSet].filter((v) => v !== "All").length + (sortOrder !== "az" ? 1 : 0);

  function clearFilters() {
    setSearch("");
    setSelectedType("All");
    setSelectedFinish("All");
    setSelectedRarity("All");
    setSelectedSet("All");
    setSortOrder("az");
  }

  const selectClass = "w-full rounded-md border border-border bg-background p-3 text-base";

  return (
    <Container>
      <div className="space-y-8 py-6">
        <header>
          <h1 className="text-6xl font-bold">My Collection</h1>
          <p className="mt-2 text-2xl text-muted-foreground">Browse your Pokemon cards.</p>
        </header>

        <section>
          {/* Search and filters stay in the same row; filters float above cards. */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button
              type="button"
              className="h-12 gap-2 px-5 text-base"
              onClick={() => setShowAddCards(true)}
            >
              <Plus className="size-5" /> Add cards
            </Button>

            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search your collection..."
                className="w-full rounded-lg border border-border bg-card py-3 pl-12 pr-10 text-lg shadow-sm outline-none focus:ring-2 focus:ring-pink-300"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search your collection"
              />
              {search && <button type="button" aria-label="Clear search" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><X className="size-5" /></button>}
           
          </div>
            <div ref={filtersRef} className="relative shrink-0">            
              <Button
                type="button"
                variant="outline"
                aria-expanded={showFilters}
                aria-controls="collection-filters"
                className="h-12 gap-2 px-5 text-base"
                onClick={() => setShowFilters((previous) => !previous)}
              >
                <SlidersHorizontal className="size-5" />  Filters
                {activeCount > 0 && <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">{activeCount}</span>}
                <ChevronDown className={`size-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </Button>

              {showFilters && (
                <aside
                  id="collection-filters"
                  aria-label="Collection filters"
                  className="absolute right-0 top-full z-40 mt-2 max-h-[75vh] w-96 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-xl"
                >
                  <h2 className="mb-4 text-xl font-semibold">Filter & Sort</h2>
                  <div className="mb-5">
                    <p className="mb-3 text-base font-medium">Pokémon Type</p>
                    <div className="flex flex-wrap gap-2">
                      {TYPES.map((type) => (
                        <Button
                          key={type}
                          type="button"
                          variant={selectedType === type ? "default" : "outline"}
                          aria-pressed={selectedType === type}
                          className="px-3 py-2 text-base"
                          onClick={() => setSelectedType(type)}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>
                  

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="collection-rarity" className="text-base font-medium">Rarity</label>
                      <select id="collection-rarity" value={selectedRarity} onChange={(e) => setSelectedRarity(e.target.value)} className={selectClass}>
                        {RARITIES.map((rarity) => <option key={rarity} value={rarity}>{rarity === "All" ? "All rarities" : rarity}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="collection-set" className="text-base font-medium">Set</label>
                      <select id="collection-set" value={selectedSet} onChange={(e) => setSelectedSet(e.target.value)} className={selectClass}>
                        {SETS.map((set) => <option key={set} value={set}>{set === "All" ? "All sets" : set}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="collection-finish" className="text-base font-medium">Finish</label>
                      <select id="collection-finish" value={selectedFinish} onChange={(e) => setSelectedFinish(e.target.value)} className={selectClass}>
                        {FINISHES.map((finish) => <option key={finish} value={finish}>{finish === "All" ? "All finishes" : finish}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="collection-sort" className="text-base font-medium">Sort by</label>
                      <select id="collection-sort" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className={selectClass}>
                        <option value="az">Name: A–Z</option>
                        <option value="za">Name: Z–A</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3 border-t border-border pt-4">
                    <Button type="button" variant="outline" className="flex-1 text-base" onClick={clearFilters}>Clear filters</Button>
                    <Button type="button" className="flex-1 text-base" onClick={() => setShowFilters(false)}>Done</Button>
                  </div>
                </aside>
              )}
            </div>
           </div>    
          <p className="mb-5 text-xl text-muted-foreground">Showing {visibleCards.length} of {collection.length} cards</p>
          {/* No sidebar on this page, so 4 across on big screens keeps the cards from getting huge */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleCards.map((card) => <CollectionCard key={card.id} card={card} onOpen={() => setSelected(card)} />)}
          </div>
          {visibleCards.length === 0 && (
            <div className="py-10 text-center">
              <p className="mb-3 text-lg text-muted-foreground">No cards match your search or filters.</p>
              <Button type="button" variant="outline" onClick={clearFilters}>Clear filters</Button>
            </div>
          )}
        </section>
      </div>
      {selected && (
        <CardDetailsModal
          card={selected}
          qty={qtyInCollection(selected.id)}
          onAdd={() => addToCollection(selected)}
          onRemoveOne={() => removeOneFromCollection(selected.id)}
          onClose={() => setSelected(null)}
        />
      )}
      {showAddCards && (
        <AddCardsModal
          qtyInCollection={qtyInCollection}
          onAdd={addToCollection}
          onClose={() => setShowAddCards(false)}
        />
      )}
    </Container>
  );
}

// Just the card art, tilting toward the mouse. Click it to open the details.
function CollectionCard({ card, onOpen }: { card: TcgCard; onOpen: () => void }) {
  return (
    <TiltCard card={card} onOpen={onOpen}>
      {card.qty > 1 && <CopiesBadge qty={card.qty} />}
    </TiltCard>
  );
}

// "x2" bubble on the corner of a card
function CopiesBadge({ qty }: { qty: number }) {
  return (
    <span className="pointer-events-none absolute -right-2 -top-2 rounded-full bg-white px-3 py-1 text-md font-semibold shadow-md ring-1 ring-foreground/10 [transform:translateZ(40px)]">
      x{qty}
    </span>
  );
}

function CardDetailsModal({
  card,
  qty,
  onAdd,
  onRemoveOne,
  onClose,
}: {
  card: TcgCard;
  qty: number;
  onAdd: () => void;
  onRemoveOne: () => void;
  onClose: () => void;
}) {
  const cardColor = getCardColor(card.types);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const details = [
    { label: "Type", value: card.types.join(", ") },
    { label: "Rarity", value: card.rarity },
    { label: "Set", value: card.set },
    { label: "Number", value: card.number },
    { label: "Finish", value: card.finish },
    { label: "Price", value: card.price },
    { label: "Copies owned", value: qty },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <Card role="dialog" aria-modal="true" aria-label={`${card.name} details`} className="max-h-[90vh] w-full max-w-xl overflow-y-auto pt-0 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className={`flex items-center justify-between px-5 py-4 text-black ${cardColor}`}>
          <CardTitle className="text-xl font-extrabold uppercase tracking-wide">{card.name}</CardTitle>
          <Button type="button" variant="ghost" size="icon-sm" className="text-black" aria-label="Close" onClick={onClose}><X /></Button>
        </div>
        <CardContent className="grid gap-5 sm:grid-cols-[180px_1fr]">
          <CardImage card={card} className="flex h-56 items-center justify-center rounded-lg bg-muted text-base font-semibold text-muted-foreground" />
          <div>
            <dl className="space-y-3 text-base">
              {details.map((detail) => (
                <div key={detail.label} className="flex justify-between gap-4 border-b border-border pb-1">
                  <dt className="text-muted-foreground">{detail.label}</dt>
                  <dd className="text-right font-medium">{detail.value}</dd>
                </div>
              ))}
            </dl>
            <p className="pt-4 text-base text-muted-foreground">Placeholder description. Card text, attacks, and prices will go here.</p>
          </div>
        </CardContent>
        <CardFooter className="flex-wrap justify-between gap-3">
          {/* Change how many copies you own */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={qty <= 1 ? `Remove ${card.name} from collection` : `Remove one ${card.name}`}
              onClick={onRemoveOne}
            >
              {qty <= 1 ? <Trash2 className="size-4" /> : <Minus className="size-4" />}
            </Button>
            <span className="min-w-8 text-center text-lg font-semibold">{qty}</span>
            <Button type="button" variant="outline" size="icon" aria-label={`Add one ${card.name}`} onClick={onAdd}>
              <Plus className="size-4" />
            </Button>
          </div>
          <Button type="button" variant="outline" onClick={onClose}>Close</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// ---- Add cards window ----

// Max results per search. Searching in Supabase means we never load all 20k+ cards.
const RESULT_LIMIT = 48;

// Wait this long after the last keystroke before searching
const SEARCH_DELAY_MS = 300;

// % and _ are wildcards in a Postgres search, so escape them to search for them literally.
// (Some real card names contain underscores, like "_____'s Pikachu".)
const escapeForSearch = (text: string) => text.replace(/[\\%_]/g, "\\$&");

function AddCardsModal({
  qtyInCollection,
  onAdd,
  onClose,
}: {
  qtyInCollection: (id: string) => number;
  onAdd: (card: TcgCard) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TcgCard[]>([]);
  const [status, setStatus] = useState<"idle" | "searching" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const latestSearch = useRef(0);

  const trimmed = query.trim();
  const tooShort = trimmed.length < 2;

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Search Supabase by name, a moment after the user stops typing
  useEffect(() => {
    if (tooShort) return;

    const searchId = ++latestSearch.current;

    const timer = setTimeout(async () => {
      setStatus("searching");

      const { data, error } = await createClient()
        .from(CARDS_TABLE)
        .select(CARD_COLUMNS)
        .ilike("name", `%${escapeForSearch(trimmed)}%`)
        .order("name")
        .limit(RESULT_LIMIT);

      // Ignore this answer if the user already typed something newer
      if (searchId !== latestSearch.current) return;

      if (error) {
        setErrorMessage(error.message);
        setStatus("error");
        return;
      }

      const lower = trimmed.toLowerCase();
      const cards = ((data ?? []) as CardRow[]).map(rowToCollectionCard);

      // Best matches first: names that start with what you typed, then regular
      // sets before McDonald's promos, then A-Z
      cards.sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(lower);
        const bStarts = b.name.toLowerCase().startsWith(lower);
        if (aStarts !== bStarts) return aStarts ? -1 : 1;

        const aPromo = isMcDonaldsSet(a.set);
        const bPromo = isMcDonaldsSet(b.set);
        if (aPromo !== bPromo) return aPromo ? 1 : -1;

        return a.name.localeCompare(b.name) || a.set.localeCompare(b.set);
      });

      setResults(cards);
      setStatus("done");
    }, SEARCH_DELAY_MS);

    return () => clearTimeout(timer);
  }, [trimmed, tooShort]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8" onClick={onClose}>
      <Card
        role="dialog"
        aria-modal="true"
        aria-label="Add cards to your collection"
        className="w-full max-w-5xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5">
          <CardTitle className="text-2xl font-bold">Add cards</CardTitle>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Close" onClick={onClose}><X /></Button>
        </div>

        <CardContent className="space-y-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search every card by name, like Pikachu..."
              aria-label="Search all cards"
              className="w-full rounded-lg border border-border bg-card py-3 pl-12 pr-10 text-lg shadow-sm outline-none focus:ring-2 focus:ring-pink-300"
            />
            {query && (
              <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <X className="size-5" />
              </button>
            )}
          </div>

          <p className="text-base text-muted-foreground">
            {tooShort
              ? "Type at least 2 letters to search. Click a card or its + to add a copy."
              : status === "searching" || status === "idle"
                ? "Searching..."
                : status === "error"
                  ? `Couldn't search cards: ${errorMessage}`
                  : results.length === 0
                    ? `No cards found for "${trimmed}".`
                    : results.length === RESULT_LIMIT
                      ? `Showing the first ${RESULT_LIMIT} matches. Type more of the name to narrow it down.`
                      : `${results.length} ${results.length === 1 ? "match" : "matches"}`}
          </p>

          {!tooShort && status === "done" && results.length > 0 && (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {results.map((card) => {
                const owned = qtyInCollection(card.id);
                return (
                  <div key={card.id}>
                    {/* Clicking the card adds a copy too */}
                    <TiltCard card={card} onOpen={() => onAdd(card)} label={`Add ${card.name} (${card.set} ${card.number}) to collection`}>
                      {owned > 0 && <CopiesBadge qty={owned} />}
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={`Add ${card.name} to collection`}
                        onClick={() => onAdd(card)}
                        className="absolute bottom-3 right-3 rounded-full bg-white shadow-lg [transform:translateZ(50px)]"
                      >
                        <Plus className="size-5" />
                      </Button>
                    </TiltCard>
                    <p className="mt-2 truncate text-sm text-muted-foreground">
                      {card.set} · {card.number}
                      {owned > 0 && <span className="font-semibold text-green-600"> · In collection</span>}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>

        <CardFooter className="justify-end">
          <Button type="button" onClick={onClose}>Done</Button>
        </CardFooter>
      </Card>
    </div>
  );
}