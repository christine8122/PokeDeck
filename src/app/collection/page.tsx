"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

import Container from "@/components/custom/Container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";

// Placeholder cards for testing
type TcgCard = {
  id: string;
  name: string;
  price: string;
  set: string;
  number: string;
  finish: string;
  owned: boolean;
  types: string[];
};

const placeholderCards: TcgCard[] = [
  {
    id: "1",
    name: "Charmander",
    price: "$0.00",
    set: "Placeholder Set",
    number: "#001",
    finish: "Normal",
    owned: true,
    types: ["Fire"],
  },
  {
    id: "2",
    name: "Squirtle",
    price: "$0.00",
    set: "Placeholder Set",
    number: "#002",
    finish: "Holo",
    owned: true,
    types: ["Water"],
  },
  {
    id: "3",
    name: "Bulbasaur",
    price: "$0.00",
    set: "Placeholder Set",
    number: "#003",
    finish: "Reverse Holo",
    owned: true,
    types: ["Grass"],
  },
  {
    id: "4",
    name: "Vulpix",
    price: "$0.00",
    set: "Placeholder Set",
    number: "#004",
    finish: "Holo",
    owned: true,
    types: ["Fire"],
  },
  {
    id: "5",
    name: "Growlithe",
    price: "$0.00",
    set: "Placeholder Set",
    number: "#005",
    finish: "Reverse Holo",
    owned: true,
    types: ["Fire"],
  },
  {
    id: "6",
    name: "Psyduck",
    price: "$0.00",
    set: "Placeholder Set",
    number: "#006",
    finish: "Normal",
    owned: true,
    types: ["Water"],
  },
  {
    id: "7",
    name: "Poliwag",
    price: "$0.00",
    set: "Placeholder Set",
    number: "#007",
    finish: "Reverse Holo",
    owned: true,
    types: ["Water"],
  },
  {
    id: "8",
    name: "Oddish",
    price: "$0.00",
    set: "Placeholder Set",
    number: "#008",
    finish: "Normal",
    owned: true,
    types: ["Grass"],
  },
  {
    id: "9",
    name: "Bellsprout",
    price: "$0.00",
    set: "Placeholder Set",
    number: "#009",
    finish: "Holo",
    owned: true,
    types: ["Grass"],
  },
];

function getCardColor(types: string[]) {
  if (types.includes("Fire")) return "bg-red-400";
  if (types.includes("Water")) return "bg-blue-400";
  if (types.includes("Grass")) return "bg-green-400";

  return "bg-gray-400";
}

export default function CollectionPage() {
  const [selected, setSelected] = useState<TcgCard | null>(null);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  const [showFilters, setShowFilters] = useState(true);
  const [selectedFinish, setSelectedFinish] = useState("All");
  const [sortOrder, setSortOrder] = useState("az");

  // Find matching cards
  const filteredCards = placeholderCards.filter((card) => {
    const matchesSearch = card.name
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    const matchesType =
      selectedType === "All" || card.types.includes(selectedType);

    const matchesFinish =
      selectedFinish === "All" || card.finish === selectedFinish;

    return matchesSearch && matchesType && matchesFinish;
  });

  // Sort matching cards
  const visibleCards = [...filteredCards].sort((a, b) => {
    if (sortOrder === "za") {
      return b.name.localeCompare(a.name);
    }

    return a.name.localeCompare(b.name);
  });

  function clearFilters() {
    setSearch("");
    setSelectedType("All");
    setSelectedFinish("All");
    setSortOrder("az");
  }

  return (
    <Container>
      <div className="space-y-6">
        {/* Collection heading */}
        <header>
          <h1 className="text-3xl font-bold">My Collection</h1>
          <p className="mt-2 text-muted-foreground">
            Browse your Pokemon cards.
          </p>
        </header>

        <section>
          {/* Search bar and filter button */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              aria-expanded={showFilters}
              aria-controls="collection-filters"
              onClick={() => setShowFilters(!showFilters)}
            >
              Filter & Sort
            </Button>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="text"
                placeholder="Search your collection..."
                className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-pink-300"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search your collection"
              />
            </div>
          </div>

          {/* Sidebar and cards */}
          <div
            className={
              showFilters
                ? "grid gap-6 lg:grid-cols-[240px_1fr]"
                : "grid gap-6"
            }
          >
            {/* Left side: filters */}
            {showFilters && (
              <aside
                id="collection-filters"
                className="self-start rounded-lg border border-border bg-card p-4 shadow-sm"
              >
                <h2 className="mb-4 text-lg font-semibold">
                  Filter & Sort
                </h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="sort-order"
                      className="text-sm font-medium"
                    >
                      Sort by
                    </label>

                    <select
                      id="sort-order"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="w-full rounded-md border border-border bg-background p-2 text-sm"
                    >
                      <option value="az">Name: A–Z</option>
                      <option value="za">Name: Z–A</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="card-finish"
                      className="text-sm font-medium"
                    >
                      Finish
                    </label>

                    <select
                      id="card-finish"
                      value={selectedFinish}
                      onChange={(e) => setSelectedFinish(e.target.value)}
                      className="w-full rounded-md border border-border bg-background p-2 text-sm"
                    >
                      <option value="All">All finishes</option>
                      <option value="Normal">Normal</option>
                      <option value="Holo">Holo</option>
                      <option value="Reverse Holo">Reverse Holo</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setShowFilters(false)}
                  >
                    Done
                  </Button>
                </div>
              </aside>
            )}

            {/* Right side: type buttons and cards */}
            <div className="min-w-0">
              <div className="mb-6 flex flex-wrap gap-2">
                {["All", "Fire", "Water", "Grass"].map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={
                      selectedType === type ? "default" : "outline"
                    }
                    aria-pressed={selectedType === type}
                    onClick={() => setSelectedType(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {visibleCards.map((card) => (
                  <CollectionCard
                    key={card.id}
                    card={card}
                    onOpen={() => setSelected(card)}
                  />
                ))}
              </div>

              {visibleCards.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">
                  No cards match your search or filters.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Card details */}
      {selected && (
        <CardDetailsModal
          card={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </Container>
  );
}

// Card shown in the grid
function CollectionCard({
  card,
  onOpen,
}: {
  card: TcgCard;
  onOpen: () => void;
}) {
  return (
    <Card
      size="sm"
      className="gap-0 pt-0 pb-3 shadow-md transition-shadow hover:shadow-lg"
    >
      <button
        type="button"
        onClick={onOpen}
        className="text-left"
      >
        <div className="flex items-center justify-between bg-green-400 px-3 py-2">
          <span className="truncate text-xs font-extrabold uppercase tracking-wide">
            {card.name}
          </span>
        </div>

        <div className="flex gap-2 px-3 pt-3">
          <div className="flex h-36 flex-1 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
            Picture
          </div>

          <span className="text-xs font-bold">{card.price}</span>
        </div>

        <p className="px-3 pt-2 text-[11px] text-muted-foreground">
          {card.set} · {card.number}
        </p>
      </button>

      <div className="mt-2 flex items-center px-3">
        <span className="rounded-full bg-green-400 px-2 py-0.5 text-[10px] font-semibold text-white">
          {card.finish}
        </span>
      </div>
    </Card>
  );
}

// Popup with the selected card's details
function CardDetailsModal({
  card,
  onClose,
}: {
  card: TcgCard;
  onClose: () => void;
}) {
  // Close when Escape is pressed
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const details = [
    { label: "Type", value: card.types.join(", ") },
    { label: "Set", value: card.set },
    { label: "Number", value: card.number },
    { label: "Finish", value: card.finish },
    { label: "Price", value: card.price },
    { label: "Owned", value: card.owned ? "Yes" : "No" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <Card
        role="dialog"
        aria-modal="true"
        aria-label={`${card.name} details`}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto pt-0 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between bg-green-400 px-4 py-3">
          <CardTitle className="font-extrabold uppercase tracking-wide">
            {card.name}
          </CardTitle>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close"
            onClick={onClose}
          >
            <X />
          </Button>
        </div>

        <CardContent className="grid gap-4 sm:grid-cols-[160px_1fr]">
          <div className="flex h-52 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-muted-foreground">
            Picture
          </div>

          <div>
            <dl className="space-y-2 text-sm">
              {details.map((detail) => (
                <div
                  key={detail.label}
                  className="flex justify-between gap-4 border-b border-border pb-1"
                >
                  <dt className="text-muted-foreground">
                    {detail.label}
                  </dt>
                  <dd className="font-medium">{detail.value}</dd>
                </div>
              ))}
            </dl>

            <p className="pt-2 text-sm text-muted-foreground">
              Placeholder description. Card text, attacks, and prices
              will go here.
            </p>
          </div>
        </CardContent>

        <CardFooter className="justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}