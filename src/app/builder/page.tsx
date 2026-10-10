
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Plus,
  Save,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import Container from "@/components/custom/Container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";

// ---- Placeholder data ----

type TcgCard = {
  id: string;
  name: string;
  type: string;
  rarity: string;
  price: string;
  set: string;
  number: string;
  finish: string;
  owned: boolean;
};

const TYPES = [
  "Grass",
  "Fire",
  "Water",
  "Lightning",
  "Psychic",
  "Fighting",
];

const RARITIES = ["Common", "Uncommon", "Rare", "Rare Holo"];

const SETS = [
  "Placeholder Set A",
  "Placeholder Set B",
  "Placeholder Set C",
];

const FINISHES = ["Normal", "Holo", "Reverse Holo"];

const placeholderCards: TcgCard[] = Array.from(
  { length: 12 },
  (_, i) => ({
    id: String(i + 1),
    name: `Placeholder ${i + 1}`,
    type: TYPES[i % TYPES.length],
    rarity: RARITIES[i % RARITIES.length],
    price: "$0.00",
    set: SETS[i % SETS.length],
    number: `#${String(i + 1).padStart(3, "0")}`,
    finish: FINISHES[i % FINISHES.length],
    owned: i % 3 !== 2,
  })
);

// ---- Card colors ----

function getCardColor(type: string) {
  if (type === "Fire") return "bg-pink-500";
  if (type === "Water") return "bg-blue-400";
  if (type === "Grass") return "bg-green-400";
  if (type === "Lightning") return "bg-yellow-300";
  if (type === "Psychic") return "bg-purple-500";
  if (type === "Fighting") return "bg-orange-400";

  return "bg-gray-400";
}

// ---- Filter options ----

const uniqueSorted = (values: string[]) =>
  [...new Set(values)].sort();

const typeOptions = uniqueSorted(
  placeholderCards.map((card) => card.type)
);

const rarityOptions = RARITIES.filter((rarity) =>
  placeholderCards.some((card) => card.rarity === rarity)
);

const setOptions = uniqueSorted(
  placeholderCards.map((card) => card.set)
);

const finishOptions = uniqueSorted(
  placeholderCards.map((card) => card.finish)
);

type Filters = {
  search: string;
  type: string;
  rarity: string;
  set: string;
  finish: string;
  sortOrder: string;
  ownedOnly: boolean;
};

const emptyFilters: Filters = {
  search: "",
  type: "",
  rarity: "",
  set: "",
  finish: "",
  sortOrder: "az",
  ownedOnly: false,
};

const DECK_LIMIT = 60;
const COPY_LIMIT = 4;

type DeckEntry = {
  card: TcgCard;
  qty: number;
};

// ---- Builder Page ----

export default function BuilderPage() {
  const [deckName, setDeckName] = useState("Placeholder Deck");
  const [deck, setDeck] = useState<DeckEntry[]>([]);
  const [selected, setSelected] = useState<TcgCard | null>(null);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [saved, setSaved] = useState(false);

  const totalCards = deck.reduce(
    (sum, entry) => sum + entry.qty,
    0
  );

  const ownedInDeck = deck
    .filter((entry) => entry.card.owned)
    .reduce((sum, entry) => sum + entry.qty, 0);

  // Update one filter at a time
  function updateFilter<K extends keyof Filters>(
    key: K,
    value: Filters[K]
  ) {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  const hasActiveFilters =
    filters.search !== "" ||
    filters.type !== "" ||
    filters.rarity !== "" ||
    filters.set !== "" ||
    filters.finish !== "" ||
    filters.sortOrder !== "az" ||
    filters.ownedOnly;

  // Find cards matching the selected filters
  const visibleCards = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    const matchingCards = placeholderCards.filter((card) => {
      if (
        query &&
        !card.name.toLowerCase().includes(query)
      )
        return false;

      if (filters.type && card.type !== filters.type)
        return false;

      if (filters.rarity && card.rarity !== filters.rarity)
        return false;

      if (filters.set && card.set !== filters.set)
        return false;

      if (filters.finish && card.finish !== filters.finish)
        return false;

      if (filters.ownedOnly && !card.owned)
        return false;

      return true;
    });

    return matchingCards.sort((a, b) => {
      if (filters.sortOrder === "za") {
        return b.name.localeCompare(a.name);
      }

      return a.name.localeCompare(b.name);
    });
  }, [filters]);

  // Find how many copies of a card are in the deck
  const qtyInDeck = (id: string) =>
    deck.find((entry) => entry.card.id === id)?.qty ?? 0;

  const canAdd = (id: string) =>
    totalCards < DECK_LIMIT &&
    qtyInDeck(id) < COPY_LIMIT;

  // Add a card to the deck
  function addToDeck(card: TcgCard) {
    if (!canAdd(card.id)) return;

    setSaved(false);

    setDeck((prev) =>
      prev.some((entry) => entry.card.id === card.id)
        ? prev.map((entry) =>
            entry.card.id === card.id
              ? { ...entry, qty: entry.qty + 1 }
              : entry
          )
        : [...prev, { card, qty: 1 }]
    );
  }

  // Remove one copy of a card
  function removeOne(id: string) {
    setSaved(false);

    setDeck((prev) =>
      prev
        .map((entry) =>
          entry.card.id === id
            ? { ...entry, qty: entry.qty - 1 }
            : entry
        )
        .filter((entry) => entry.qty > 0)
    );
  }

  return (
    <Container>
      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">

        {/* Left side: Deck list */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Card className="shadow-md">
            <CardContent className="space-y-5">

              <input
                value={deckName}
                onChange={(e) => {
                  setDeckName(e.target.value);
                  setSaved(false);
                }}
                aria-label="Deck name"
                className="w-full rounded-md bg-transparent text-2xl font-extrabold outline-none focus:ring-2 focus:ring-pink-300"
              />

              <DeckProgress total={totalCards} />

              {deck.length === 0 ? (
                <p className="py-8 text-center text-xl text-muted-foreground">
                  No cards yet. Hit the + on a card to add it.
                </p>
              ) : (
                <ul className="max-h-96 space-y-2 overflow-y-auto">
                  {deck.map(({ card, qty }) => (
                    <li
                      key={card.id}
                      className="flex items-center gap-3 py-2"
                    >
                      <span
                        className={`size-5 shrink-0 rounded-full ${getCardColor(
                          card.type
                        )}`}
                      />

                      <button
                        type="button"
                        onClick={() => setSelected(card)}
                        className="min-w-0 flex-1 truncate text-left text-sm font-extrabold uppercase tracking-wide hover:text-pink-500"
                      >
                        {card.name}
                      </button>

                      <span className="text-sm font-extrabold">
                        x{qty}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeOne(card.id)}
                        aria-label={`Remove one ${card.name}`}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Collection check */}
              <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-lg text-gray-700">
                <Check className="size-5 shrink-0 text-green-600" />
                {ownedInDeck} of {totalCards} cards already in your collection
              </div>

              {/* Save deck - UI only */}
              <Button
                className="w-full py-6 text-base"
                onClick={() => setSaved(true)}
                disabled={deck.length === 0}
              >
                <Save className="size-5" />
                Save deck
              </Button>

              {saved && (
                <p className="text-center text-sm text-muted-foreground">
                  Saved! (UI only, nothing is stored yet)
                </p>
              )}

            </CardContent>
          </Card>
        </aside>

        {/* Right side: Search and cards */}
        <section className="min-w-0">

          {/* Search, Filters and Owned */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">

            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  updateFilter("search", e.target.value)
                }
                placeholder="Search all cards..."
                aria-label="Search cards by name"
                className="w-full rounded-lg border border-border bg-card py-3 pl-12 pr-10 text-lg shadow-sm outline-none focus:ring-2 focus:ring-pink-300"
              />

              {filters.search && (
                <button
                  type="button"
                  onClick={() => updateFilter("search", "")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              )}
            </div>

            <FiltersDropdown
              filters={filters}
              onChange={updateFilter}
              onClear={() =>
                setFilters((prev) => ({
                  ...emptyFilters,
                  search: prev.search,
                  ownedOnly: prev.ownedOnly,
                }))
              }
            />

            <button
              type="button"
              onClick={() =>
                updateFilter("ownedOnly", !filters.ownedOnly)
              }
              aria-pressed={filters.ownedOnly}
              className={`rounded-xl px-5 py-3 text-base font-medium transition-colors ${
                filters.ownedOnly
                  ? "bg-foreground text-background"
                  : "bg-card text-foreground ring-1 ring-foreground/15 hover:bg-muted"
              }`}
            >
              Owned
            </button>
          </div>

          {/* Result count and clear all */}
          <div className="mb-6 flex min-h-9 items-center justify-between gap-3">
            <span className="text-xl text-muted-foreground">
              Showing {visibleCards.length} of {placeholderCards.length} cards
            </span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={() => setFilters(emptyFilters)}
                className="text-base"
              >
                <X className="size-4" />
                Clear all
              </Button>
            )}
          </div>

          {/* Card grid */}
          {visibleCards.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">

              <p className="text-lg font-medium">
                No cards match those filters.
              </p>
              <Button
                variant="outline"
                className="mt-4 text-base"
                onClick={() => setFilters(emptyFilters)}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {visibleCards.map((card) => (
                <BuilderCard
                  key={card.id}
                  card={card}
                  qty={qtyInDeck(card.id)}
                  onOpen={() => setSelected(card)}
                  onAdd={() => addToDeck(card)}
                  disabled={!canAdd(card.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Card details modal */}
      {selected && (
        <CardDetailsModal
          card={selected}
          qty={qtyInDeck(selected.id)}
          onClose={() => setSelected(null)}
          onAdd={() => addToDeck(selected)}
          disabled={!canAdd(selected.id)}
        />
      )}

    </Container>
  );
}

// ---- Filter dropdown ----

type FilterKey =
  | "type"
  | "rarity"
  | "set"
  | "finish";

const filterGroups: {
  key: FilterKey;
  label: string;
  options: string[];
}[] = [
  {
    key: "type",
    label: "Pokémon Type",
    options: typeOptions,
  },
  {
    key: "rarity",
    label: "Rarity",
    options: rarityOptions,
  },
  {
    key: "set",
    label: "Set",
    options: setOptions,
  },
  {
    key: "finish",
    label: "Finish",
    options: finishOptions,
  },
];

function FiltersDropdown({
  filters,
  onChange,
  onClear,
}: {
  filters: Filters;
  onChange: (key: FilterKey | "sortOrder", value: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const activeCount =
    filterGroups.filter(
      (group) => filters[group.key] !== ""
    ).length +
    (filters.sortOrder !== "az" ? 1 : 0);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    if (!open) return;

    function onClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative shrink-0">
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="gap-2 px-5 py-6 text-base"
      >
        <SlidersHorizontal className="size-5" />
        Filters
        {activeCount > 0 && (
          <span className="flex size-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
            {activeCount}
          </span>
        )}

        <ChevronDown
          className={`size-4 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </Button>

      {/* Floating panel - does not move the cards */}
      {open && (
        <div
          role="dialog"
          aria-label="Card filters"
          className="absolute right-0 z-40 mt-2 max-h-[75vh] w-96 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl"
        >
          <h2 className="mb-5 text-xl font-semibold">
            Filter & Sort
          </h2>
          <div className="space-y-5">
            {filterGroups.map((group) => (
              <fieldset key={group.key}>
                <legend className="mb-3 text-base font-medium">
                  {group.label}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {group.options.map((option) => {
                    const isSelected =
                      filters[group.key] === option;

                    return (
                      <Button
                        key={option}
                        type="button"
                        variant={
                          isSelected ? "default" : "outline"
                        }
                        aria-pressed={isSelected}
                        onClick={() =>
                          onChange(
                            group.key,
                            isSelected ? "" : option
                          )
                        }
                        className="text-sm"
                      >
                        {option}
                      </Button>
                    );
                  })}
                </div>

              </fieldset>
            ))}

            {/* Sort dropdown */}
            <div className="space-y-2">

              <label
                htmlFor="builder-sort-order"
                className="text-base font-medium"
              >
                Sort by
              </label>

              <select
                id="builder-sort-order"
                value={filters.sortOrder}
                onChange={(e) =>
                  onChange("sortOrder", e.target.value)
                }
                className="w-full rounded-md border border-border bg-background p-3 text-base"
              >
                <option value="az">Name: A–Z</option>
                <option value="za">Name: Z–A</option>
              </select>

            </div>
          </div>

          {/* Clear and Done */}
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">

            <Button
              type="button"
              variant="outline"
              onClick={onClear}
              disabled={activeCount === 0}
              className="text-base"
            >
              Clear filters
            </Button>

            <Button
              type="button"
              onClick={() => setOpen(false)}
              className="text-base"
            >
              Done
            </Button>

          </div>

        </div>
      )}

    </div>
  );
}
// ---- Deck progress bar ----

function DeckProgress({ total }: { total: number }) {
  return (
    <div className="flex items-center gap-3">

      <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-muted">

        <div
          className="h-full rounded-full bg-linear-to-r from-yellow-300 via-blue-400 to-indigo-500 transition-all"
          style={{
            width: `${(total / DECK_LIMIT) * 100}%`,
          }}
        />

        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className="absolute top-0 h-full w-px bg-foreground/30"
            style={{
              left: `${(n / 6) * 100}%`,
            }}
          />
        ))}
      </div>
      <span className="shrink-0 text-sm font-bold">
        {total} / {DECK_LIMIT} Cards
      </span>
    </div>
  );
}

// ---- Card shown in the grid ----

function BuilderCard({
  card,
  qty,
  onOpen,
  onAdd,
  disabled,
}: {
  card: TcgCard;
  qty: number;
  onOpen: () => void;
  onAdd: () => void;
  disabled: boolean;
}) {
  const cardColor = getCardColor(card.type);

  return (
    <Card className=" gap-0 pt-0 pb-4 shadow-md transition-shadow hover:shadow-lg">

      <button
        type="button"
        onClick={onOpen}
        className="text-left"
      >
        <div
          className={`flex items-center justify-between px-4 py-3 text-black ${cardColor}`}
        >
        {/* Might have to adjust the container specfically for this page to allow the cards to extend since Placeholder Deck is taking up a ton of space */}
          <span className=" flex items-center justify-center  text-md font-extrabold uppercase tracking-wide">
            {card.name}
          </span>
          {qty > 0 && (
            <span className="rounded-full px-3 py-2 bg-white px-2 text-md font-semibold">
              x{qty}
            </span>
          )}
        </div>
        <div className="flex gap-3 px-4 pt-4">
          <div className="flex min-h-50  flex-1 items-center justify-center rounded-md bg-muted text-base font-semibold text-muted-foreground">
            Picture
          </div>
        </div>
        <p className="px-4 pt-3 text-lg text-muted-foreground">
          {card.set} · {card.number}
        </p>
      </button>

      <div className="mt-3 flex items-center justify-between px-4">
        <span
          className={`rounded-full px-3 py-1 text-md font-semibold text-white ${cardColor}`}
        >
          {card.finish}
        </span>
        <Button
          variant="outline"
          size="icon"
          aria-label={`Add ${card.name} to deck`}
          onClick={onAdd}
          disabled={disabled}
        >
          <Plus className="size-5" />
        </Button>
      </div>
    </Card>
  );
}

// ---- Card details modal ----

function CardDetailsModal({
  card,
  qty,
  onClose,
  onAdd,
  disabled,
}: {
  card: TcgCard;
  qty: number;
  onClose: () => void;
  onAdd: () => void;
  disabled: boolean;
}) {
  const cardColor = getCardColor(card.type);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);

    return () =>
      window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const details = [
    { label: "Type", value: card.type },
    { label: "Rarity", value: card.rarity },
    { label: "Set", value: card.set },
    { label: "Number", value: card.number },
    { label: "Finish", value: card.finish },
    { label: "Price", value: card.price },
    { label: "Owned", value: card.owned ? "Yes" : "No" },
    {
      label: "In this deck",
      value: `${qty} / ${COPY_LIMIT}`,
    },
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
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto pt-0 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >

        <div
          className={`flex items-center justify-between px-4 py-3 text-black ${cardColor}`}
        >
          <CardTitle className="flex justify-centertext-xl font-extrabold uppercase tracking-wide">
            {card.name}
          </CardTitle>

          <Button
            variant="ghost"
            size="icon"
            className="text-black"
            aria-label="Close"
            onClick={onClose}
          >
            <X className="size-5" />
          </Button>
        </div>

        <CardContent className="grid gap-5 sm:grid-cols-[180px_1fr]">

          <div className="flex h-56 items-center justify-center rounded-lg bg-muted text-base font-semibold text-muted-foreground">
            Picture
          </div>

          <div>
            <dl className="space-y-3 text-base">

              {details.map((detail) => (
                <div
                  key={detail.label}
                  className="flex justify-between gap-4 border-b border-border pb-2"
                >
                  <dt className="text-muted-foreground">
                    {detail.label}
                  </dt>

                  <dd className="text-right font-medium">
                    {detail.value}
                  </dd>
                </div>
              ))}

            </dl>

            <p className="pt-4 text-base text-muted-foreground">
              Placeholder description. Card text, attacks,
              and prices will go here.
            </p>

          </div>

        </CardContent>

        <CardFooter className="justify-end gap-3">

          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>

          <Button
            onClick={onAdd}
            disabled={disabled}
          >
            <Plus className="size-5" />
            Add to deck
          </Button>

        </CardFooter>

      </Card>
    </div>
  );
}
