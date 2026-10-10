"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import Container from "@/components/custom/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";

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
};

// Placeholder data. Replace with API data later.
const placeholderCards: TcgCard[] = [
  { id: "1", name: "Charmander", price: "$0.00", set: "Placeholder Set", number: "#001", finish: "Normal", rarity: "Common", owned: true, types: ["Fire"] },
  { id: "2", name: "Squirtle", price: "$0.00", set: "Placeholder Set", number: "#002", finish: "Holo", rarity: "Rare Holo", owned: true, types: ["Water"] },
  { id: "3", name: "Bulbasaur", price: "$0.00", set: "Placeholder Set", number: "#003", finish: "Reverse Holo", rarity: "Uncommon", owned: true, types: ["Grass"] },
  { id: "4", name: "Vulpix", price: "$0.00", set: "Placeholder Set", number: "#004", finish: "Holo", rarity: "Rare", owned: true, types: ["Fire"] },
  { id: "5", name: "Growlithe", price: "$0.00", set: "Placeholder Set", number: "#005", finish: "Reverse Holo", rarity: "Uncommon", owned: true, types: ["Fire"] },
  { id: "6", name: "Psyduck", price: "$0.00", set: "Placeholder Set", number: "#006", finish: "Normal", rarity: "Common", owned: true, types: ["Water"] },
  { id: "7", name: "Poliwag", price: "$0.00", set: "Placeholder Set", number: "#007", finish: "Reverse Holo", rarity: "Common", owned: true, types: ["Water"] },
  { id: "8", name: "Oddish", price: "$0.00", set: "Placeholder Set", number: "#008", finish: "Normal", rarity: "Common", owned: true, types: ["Grass"] },
  { id: "9", name: "Bellsprout", price: "$0.00", set: "Placeholder Set", number: "#009", finish: "Holo", rarity: "Rare Holo", owned: true, types: ["Grass"] },
  { id: "10", name: "Pikachu", price: "$0.00", set: "Placeholder Set", number: "#010", finish: "Normal", rarity: "Common", owned: true, types: ["Lightning"] },
  { id: "11", name: "Magnemite", price: "$0.00", set: "Placeholder Set", number: "#011", finish: "Reverse Holo", rarity: "Uncommon", owned: false, types: ["Lightning"] },
  { id: "12", name: "Jolteon", price: "$0.00", set: "Placeholder Set", number: "#012", finish: "Holo", rarity: "Rare Holo", owned: true, types: ["Lightning"] },
  { id: "13", name: "Abra", price: "$0.00", set: "Placeholder Set", number: "#013", finish: "Normal", rarity: "Common", owned: true, types: ["Psychic"] },
  { id: "14", name: "Kadabra", price: "$0.00", set: "Placeholder Set", number: "#014", finish: "Reverse Holo", rarity: "Uncommon", owned: false, types: ["Psychic"] },
  { id: "15", name: "Alakazam", price: "$0.00", set: "Placeholder Set", number: "#015", finish: "Holo", rarity: "Rare Holo", owned: true, types: ["Psychic"] },
  { id: "16", name: "Machop", price: "$0.00", set: "Placeholder Set", number: "#016", finish: "Normal", rarity: "Common", owned: true, types: ["Fighting"] },
  { id: "17", name: "Machoke", price: "$0.00", set: "Placeholder Set", number: "#017", finish: "Reverse Holo", rarity: "Uncommon", owned: false, types: ["Fighting"] },
  { id: "18", name: "Machamp", price: "$0.00", set: "Placeholder Set", number: "#018", finish: "Holo", rarity: "Rare Holo", owned: true, types: ["Fighting"] },
];

const TYPES = ["All", "Grass", "Fire", "Water", "Lightning", "Psychic", "Fighting", "Darkness", "Metal", "Dragon", "Colorless", "Fairy"];
const RARITIES = ["All", "Common", "Uncommon", "Rare", "Rare Holo"];
const FINISHES = ["All", "Normal", "Holo", "Reverse Holo"];
const SETS = ["All", ...new Set(placeholderCards.map((card) => card.set))];

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

  const filteredCards = placeholderCards.filter((card) => {
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
                {activeCount > 0 && <span className="rounded-full bg-pink-500 px-2 py-0.5 text-xs font-bold text-white">{activeCount}</span>}
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
          <p className="mb-5 text-xl text-muted-foreground">Showing {visibleCards.length} of {placeholderCards.length} cards</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
      {selected && <CardDetailsModal card={selected} onClose={() => setSelected(null)} />}
    </Container>
  );
}

function CollectionCard({ card, onOpen }: { card: TcgCard; onOpen: () => void }) {
  const cardColor = getCardColor(card.types);
  return (
    <Card className="gap-0 pt-0 pb-4 shadow-md transition-shadow hover:shadow-lg">
      <button type="button" onClick={onOpen} className="text-left">
        <div className={` flex items-center justify-center px-4 py-3 text-black ${cardColor}`}>
          <span className="  flex items-center text-lg font-extrabold uppercase tracking-wide">{card.name}</span>
        </div>
        <div className="flex gap-3 px-4 pt-4">
          <div className="flex h-44 flex-1 items-center justify-center rounded-md bg-muted text-base font-semibold text-muted-foreground">Picture</div>
        </div>
        <p className="px-4 pt-3 text-xl text-muted-foreground">{card.set} · {card.number}</p>
      </button>
      <div className="mt-3 flex items-center px-4">
        <span className={`rounded-full px-3 py-2 text-lg font-semibold text-white ${cardColor}`}>{card.finish}</span>
      </div>
    </Card>
  );
}

function CardDetailsModal({ card, onClose }: { card: TcgCard; onClose: () => void }) {
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
    { label: "Owned", value: card.owned ? "Yes" : "No" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <Card role="dialog" aria-modal="true" aria-label={`${card.name} details`} className="max-h-[90vh] w-full max-w-xl overflow-y-auto pt-0 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className={`flex items-center justify-between px-5 py-4 text-black ${cardColor}`}>
          <CardTitle className="text-xl font-extrabold uppercase tracking-wide">{card.name}</CardTitle>
          <Button type="button" variant="ghost" size="icon-sm" className="text-black" aria-label="Close" onClick={onClose}><X /></Button>
        </div>
        <CardContent className="grid gap-5 sm:grid-cols-[180px_1fr]">
          <div className="flex h-56 items-center justify-center rounded-lg bg-muted text-base font-semibold text-muted-foreground">Picture</div>
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
        <CardFooter className="justify-end"><Button type="button" variant="outline" onClick={onClose}>Close</Button></CardFooter>
      </Card>
    </div>
  );
}
