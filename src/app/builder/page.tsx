"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Save,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";

import Container from "@/components/custom/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { CardImage, getTypeColor, TiltCard } from "@/components/custom/CardArt";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---- Supabase settings ----

// Supabase returns at most 1000 rows per request, so we load in batches
const BATCH_SIZE = 1000;

// How many cards show on each page of the grid
const PAGE_SIZE = 24;

// ---- Card data ----

// The cleaned-up version the page actually uses
type TcgCard = {
  id: string;
  name: string;
  types: string[];
  rarity: string;
  set: string;
  number: string;
  finishes: string[];
  hp: number | null;
  stage: string;
  price: string;
  owned: boolean;
};

// Convert a Supabase row into the shape the page uses
function rowToCard(row: CardRow): TcgCard {
  return {
    id: row.id,
    name: row.name,
    types: decodeTypes(row.types),
    rarity: cleanRarity(row.rarity),
    set: row.set,
    number: cardNumberFromId(row.id),
    finishes: decodeVariants(row.variants),
    hp: parseHp(row.hp),
    stage: row.stage ?? "Unknown",
    price: "—", // No price data in the table yet
    owned: false, // TODO: hook up to the user's collection
  };
}

// Trainer and Energy cards have no Pokémon type
const NO_TYPE = "No type";

// Types for filtering/display, using "No type" for Trainers and Energy
const typesOrNone = (card: TcgCard) =>
  card.types.length > 0 ? card.types : [NO_TYPE];

// The first type is used for the card's color
const primaryType = (card: TcgCard) => card.types[0] ?? NO_TYPE;

// Card colors come from the shared CardArt component so every page matches
const getCardColor = getTypeColor;

// ---- Filters ----

const RARITY_ORDER = ["Common", "Uncommon", "Rare", "Rare Holo"];

const uniqueSorted = (values: string[]) => [...new Set(values)].sort();

// Known rarities in order first, anything else alphabetically after
const rarityRank = (rarity: string) => {
  const index = RARITY_ORDER.indexOf(rarity);
  return index === -1 ? RARITY_ORDER.length : index;
};

// Type, rarity, set, and finish are lists so you can pick more than one of each
type Filters = {
  search: string;
  type: string[];
  rarity: string[];
  set: string[];
  finish: string[];
  sortOrder: string;
  ownedOnly: boolean;
};

const emptyFilters: Filters = {
  search: "",
  type: [],
  rarity: [],
  set: [],
  finish: [],
  sortOrder: "az",
  ownedOnly: false,
};

// True if the card has at least one of the selected values (or nothing is selected)
const matchesAny = (selected: string[], cardValues: string[]) =>
  selected.length === 0 || cardValues.some((v) => selected.includes(v));

// Names like "_____'s Pikachu" (a real promo card with a blank name line)
// start with symbols. Sort those after the normal names instead of first.
const startsWithLetterOrNumber = (name: string) => /^[a-z0-9]/i.test(name);

function compareNames(a: string, b: string) {
  const aNormal = startsWithLetterOrNumber(a);
  const bNormal = startsWithLetterOrNumber(b);
  if (aNormal !== bNormal) return aNormal ? -1 : 1;
  return a.localeCompare(b);
}

const DECK_LIMIT = 60;
const COPY_LIMIT = 4;

type DeckEntry = {
  card: TcgCard;
  qty: number;
};

// A deck you saved. Saved decks live in page state, so they reset on refresh.
// TODO: store them in a Supabase table for the logged-in user.
type SavedDeck = {
  id: string;
  name: string;
  entries: DeckEntry[];
};

const NEW_DECK_NAME = "New Deck";

const countCards = (entries: DeckEntry[]) =>
  entries.reduce((sum, entry) => sum + entry.qty, 0);

// ---- Builder Page ----

export default function BuilderPage() {
  const [cards, setCards] = useState<TcgCard[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const gridTopRef = useRef<HTMLDivElement>(null);

  // The deck you're editing right now
  const [deckName, setDeckName] = useState(NEW_DECK_NAME);
  const [deck, setDeck] = useState<DeckEntry[]>([]);
  const [selected, setSelected] = useState<TcgCard | null>(null);
  const [filters, setFilters] = useState<Filters>(emptyFilters);

  // Every deck you've saved, and which one is open (null = a new, unsaved deck)
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([]);
  const [currentDeckId, setCurrentDeckId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false); // changed since the last save
  const [justSaved, setJustSaved] = useState(false);

  const [loadedSoFar, setLoadedSoFar] = useState(0);

  // Load every card from Supabase, 1000 at a time, when the page opens
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function loadAllCards() {
      const rows: CardRow[] = [];

      while (true) {
        const { data, error } = await supabase
          .from(CARDS_TABLE)
          .select(CARD_COLUMNS)
          // Sort by id (unique) so batches never skip or repeat a card
          .order("id")
          .range(rows.length, rows.length + BATCH_SIZE - 1);

        if (cancelled) return;

        if (error) {
          setLoadError(error.message);
          return;
        }

        rows.push(...((data ?? []) as CardRow[]));
        setLoadedSoFar(rows.length);

        // A batch smaller than BATCH_SIZE means we reached the end
        if (!data || data.length < BATCH_SIZE) break;
      }

      setCards(rows.map(rowToCard));
    }

    loadAllCards();

    return () => {
      cancelled = true;
    };
  }, []);

  const allCards = useMemo(() => cards ?? [], [cards]);

  // Build the filter chips from the real data
  const filterGroups: FilterGroup[] = useMemo(
    () => [
      {
        key: "type",
        label: "Pokémon Type",
        // Real types A-Z, with "No type" (Trainers/Energy) always last
        options: uniqueSorted(allCards.flatMap(typesOrNone)).sort(
          (a, b) => Number(a === NO_TYPE) - Number(b === NO_TYPE),
        ),
      },
      {
        key: "rarity",
        label: "Rarity",
        options: uniqueSorted(allCards.map((c) => c.rarity)).sort(
          (a, b) => rarityRank(a) - rarityRank(b) || a.localeCompare(b),
        ),
      },
      {
        key: "set",
        label: "Set",
        options: uniqueSorted(allCards.map((c) => c.set)),
      },
      {
        key: "finish",
        label: "Finish",
        options: uniqueSorted(allCards.flatMap((c) => c.finishes)),
      },
    ],
    [allCards],
  );

  const totalCards = deck.reduce((sum, entry) => sum + entry.qty, 0);

  const ownedInDeck = deck
    .filter((entry) => entry.card.owned)
    .reduce((sum, entry) => sum + entry.qty, 0);

  // Any filter change also sends the grid back to page 1
  function changeFilters(update: (prev: Filters) => Filters) {
    setFilters(update);
    setPage(1);
  }

  // Update one filter at a time
  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    changeFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  const hasActiveFilters =
    filters.search !== "" ||
    filters.type.length > 0 ||
    filters.rarity.length > 0 ||
    filters.set.length > 0 ||
    filters.finish.length > 0 ||
    filters.sortOrder !== "az" ||
    filters.ownedOnly;

  // Find cards matching the selected filters
  const visibleCards = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    // Inside a group a card can match ANY selected option (Fire OR Water),
    // but it has to pass EVERY group that has something selected.
    const matchingCards = allCards.filter((card) => {
      if (query && !card.name.toLowerCase().includes(query)) return false;

      if (!matchesAny(filters.type, typesOrNone(card))) return false;
      if (!matchesAny(filters.rarity, [card.rarity])) return false;
      if (!matchesAny(filters.set, [card.set])) return false;
      if (!matchesAny(filters.finish, card.finishes)) return false;

      if (filters.ownedOnly && !card.owned) return false;

      return true;
    });

    return matchingCards.sort((a, b) => {
      // Pokémon first, then cards with no type (Trainers/Energy) at the end
      const aHasType = a.types.length > 0;
      const bHasType = b.types.length > 0;
      if (aHasType !== bHasType) return aHasType ? -1 : 1;

      let byName: number;

      if (filters.sortOrder === "za") {
        // Still keep symbol names at the end when sorting Z-A
        const aNormal = startsWithLetterOrNumber(a.name);
        const bNormal = startsWithLetterOrNumber(b.name);
        byName =
          aNormal !== bNormal
            ? aNormal
              ? -1
              : 1
            : b.name.localeCompare(a.name);
      } else {
        byName = compareNames(a.name, b.name);
      }

      if (byName !== 0) return byName;

      // Same name: regular sets always come before McDonald's promo sets
      const aPromo = isMcDonaldsSet(a.set);
      const bPromo = isMcDonaldsSet(b.set);
      if (aPromo !== bPromo) return aPromo ? 1 : -1;

      // Then by set code and card number so the order never jumps around
      return (
        a.set.localeCompare(b.set) ||
        a.number.localeCompare(b.number, undefined, { numeric: true })
      );
    });
  }, [allCards, filters]);

  // Only render one page of cards at a time so we don't fetch every image at once
  const totalPages = Math.max(1, Math.ceil(visibleCards.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const firstIndex = (currentPage - 1) * PAGE_SIZE;
  const shownCards = visibleCards.slice(firstIndex, firstIndex + PAGE_SIZE);

  // Change page and scroll back up to the top of the grid
  function goToPage(next: number) {
    setPage(Math.min(Math.max(next, 1), totalPages));
    gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Find how many copies of a card are in the deck
  const qtyInDeck = (id: string) =>
    deck.find((entry) => entry.card.id === id)?.qty ?? 0;

  const canAdd = (id: string) =>
    totalCards < DECK_LIMIT && qtyInDeck(id) < COPY_LIMIT;

  // Call this whenever the open deck changes
  function markChanged() {
    setIsDirty(true);
    setJustSaved(false);
  }

  // Add a card to the deck
  function addToDeck(card: TcgCard) {
    if (!canAdd(card.id)) return;

    markChanged();

    setDeck((prev) =>
      prev.some((entry) => entry.card.id === card.id)
        ? prev.map((entry) =>
            entry.card.id === card.id
              ? { ...entry, qty: entry.qty + 1 }
              : entry,
          )
        : [...prev, { card, qty: 1 }],
    );
  }

  // Remove one copy of a card
  function removeOne(id: string) {
    markChanged();

    setDeck((prev) =>
      prev
        .map((entry) =>
          entry.card.id === id ? { ...entry, qty: entry.qty - 1 } : entry,
        )
        .filter((entry) => entry.qty > 0),
    );
  }

  // ---- Saving and switching decks ----

  // Save the open deck: update it if it was saved before, otherwise add it to My decks
  function saveDeck() {
    const name = deckName.trim() || "Untitled Deck";
    const entries = deck.map((entry) => ({ ...entry }));

    if (currentDeckId) {
      setSavedDecks((prev) =>
        prev.map((saved) =>
          saved.id === currentDeckId ? { ...saved, name, entries } : saved,
        ),
      );
    } else {
      const id = crypto.randomUUID();
      setSavedDecks((prev) => [...prev, { id, name, entries }]);
      setCurrentDeckId(id);
    }

    setDeckName(name);
    setIsDirty(false);
    setJustSaved(true);
  }

  // Ask before throwing away unsaved changes. Returns true if it's okay to continue.
  function okToLeaveDeck() {
    return (
      !isDirty ||
      window.confirm(`"${deckName}" has unsaved changes. Discard them?`)
    );
  }

  function openDeck(saved: SavedDeck) {
    if (saved.id === currentDeckId || !okToLeaveDeck()) return;

    setCurrentDeckId(saved.id);
    setDeckName(saved.name);
    setDeck(saved.entries.map((entry) => ({ ...entry })));
    setIsDirty(false);
    setJustSaved(false);
  }

  function clearToNewDeck() {
    setCurrentDeckId(null);
    setDeckName(NEW_DECK_NAME);
    setDeck([]);
    setIsDirty(false);
    setJustSaved(false);
  }

  function startNewDeck() {
    if (!okToLeaveDeck()) return;
    clearToNewDeck();
  }

  function deleteDeck() {
    if (!currentDeckId) return;
    if (!window.confirm(`Delete "${deckName}"? This can't be undone.`)) return;

    setSavedDecks((prev) => prev.filter((saved) => saved.id !== currentDeckId));
    clearToNewDeck();
  }

  // Little status line under the Save button
  const saveStatus = justSaved
    ? "Saved! Decks stay until you refresh the page."
    : currentDeckId && isDirty
      ? "Unsaved changes"
      : !currentDeckId && deck.length > 0
        ? "Not saved yet"
        : null;

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
                  markChanged();
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
                    <li key={card.id} className="flex items-center gap-3 py-2">
                      <span
                        className={`size-5 shrink-0 rounded-full ${getCardColor(
                          primaryType(card),
                        )}`}
                      />

                      <button
                        type="button"
                        onClick={() => setSelected(card)}
                        className="min-w-0 flex-1 truncate text-left text-sm font-extrabold uppercase tracking-wide hover:text-pink-500"
                      >
                        {card.name}
                      </button>

                      <span className="text-sm font-extrabold">x{qty}</span>

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

              {/* Save (and delete, once it's been saved) */}
              <div className="flex gap-2">
                <Button
                  className="flex-1 py-6 text-base"
                  onClick={saveDeck}
                  disabled={
                    deck.length === 0 || (currentDeckId !== null && !isDirty)
                  }
                >
                  <Save className="size-5" />
                  {currentDeckId ? "Save changes" : "Save deck"}
                </Button>

                {currentDeckId && (
                  <Button
                    variant="outline"
                    className="py-6"
                    aria-label={`Delete ${deckName}`}
                    onClick={deleteDeck}
                  >
                    <Trash2 className="size-5" />
                  </Button>
                )}
              </div>

              {saveStatus && (
                <p className="text-center text-sm text-muted-foreground">
                  {saveStatus}
                </p>
              )}
            </CardContent>
          </Card>

          {/* All saved decks */}
          <Card className="mt-6 shadow-md">
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xl font-bold">My decks</h2>
                <Button variant="outline" size="sm" onClick={startNewDeck}>
                  <Plus className="size-4" />
                  New deck
                </Button>
              </div>

              {savedDecks.length === 0 ? (
                <p className="py-2 text-sm text-muted-foreground">
                  Decks you save will show up here.
                </p>
              ) : (
                <ul className="space-y-1">
                  {savedDecks.map((saved) => {
                    const isOpen = saved.id === currentDeckId;
                    const firstCard = saved.entries[0]?.card;

                    return (
                      <li key={saved.id}>
                        <button
                          type="button"
                          onClick={() => openDeck(saved)}
                          aria-current={isOpen ? "true" : undefined}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                            isOpen
                              ? "bg-muted ring-1 ring-foreground/15"
                              : "hover:bg-muted"
                          }`}
                        >
                          <span
                            className={`size-4 shrink-0 rounded-full ${getCardColor(
                              firstCard ? primaryType(firstCard) : undefined,
                            )}`}
                          />
                          <span className="min-w-0 flex-1 truncate font-semibold">
                            {saved.name}
                            {isOpen && isDirty && (
                              <span
                                className="text-pink-500"
                                title="Unsaved changes"
                              >
                                {" "}
                                •
                              </span>
                            )}
                          </span>
                          <span className="shrink-0 text-sm text-muted-foreground">
                            {countCards(saved.entries)} cards
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
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
                onChange={(e) => updateFilter("search", e.target.value)}
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
              groups={filterGroups}
              onChange={updateFilter}
              onClear={() =>
                changeFilters((prev) => ({
                  ...emptyFilters,
                  search: prev.search,
                  ownedOnly: prev.ownedOnly,
                }))
              }
            />

            <button
              type="button"
              onClick={() => updateFilter("ownedOnly", !filters.ownedOnly)}
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
          <div
            ref={gridTopRef}
            className="mb-6 flex min-h-9 scroll-mt-6 items-center justify-between gap-3"
          >
            <span className="text-xl text-muted-foreground">
              {cards === null
                ? `Loading cards... (${loadedSoFar} so far)`
                : visibleCards.length === 0
                  ? `Showing 0 of ${allCards.length} cards`
                  : `Showing ${firstIndex + 1}–${firstIndex + shownCards.length} of ${visibleCards.length} cards`}
            </span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={() => changeFilters(() => emptyFilters)}
                className="text-base"
              >
                <X className="size-4" />
                Clear all
              </Button>
            )}
          </div>

          {/* Card grid */}
          {loadError ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">
              <p className="text-lg font-medium">Couldn&apos;t load cards.</p>
              <p className="mt-2 text-base text-muted-foreground">
                {loadError}
              </p>
            </div>
          ) : cards === null ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">
              <p className="text-lg font-medium">
                Loading cards... ({loadedSoFar} so far)
              </p>
            </div>
          ) : visibleCards.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">
              <p className="text-lg font-medium">
                No cards match those filters.
              </p>
              <Button
                variant="outline"
                className="mt-4 text-base"
                onClick={() => changeFilters(() => emptyFilters)}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {shownCards.map((card) => (
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

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                />
              )}
            </>
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

type FilterKey = "type" | "rarity" | "set" | "finish";

type FilterGroup = {
  key: FilterKey;
  label: string;
  options: string[];
};

function FiltersDropdown({
  filters,
  groups,
  onChange,
  onClear,
}: {
  filters: Filters;
  groups: FilterGroup[];
  onChange: <K extends FilterKey | "sortOrder">(
    key: K,
    value: Filters[K],
  ) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Total options picked across all groups, plus 1 if the sort was changed
  const activeCount =
    groups.reduce((sum, group) => sum + filters[group.key].length, 0) +
    (filters.sortOrder !== "az" ? 1 : 0);

  // Add the option if it isn't picked yet, remove it if it is
  function toggleOptions(key: FilterKey, options: string[]) {
    onChange(key, options);
  }

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    if (!open) return;

    function onClickOutside(e: MouseEvent) {

      // Base UI (shadcn base component library) renders things like selects as a
      // React portal with this data attribute attached.
      const baseUiPortal = document.querySelector("[data-base-ui-portal]");

      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node) &&
        !baseUiPortal?.contains(e.target as Node)
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
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </Button>

      {/* Floating panel - does not move the cards */}
      {open && (
        <div
          role="dialog"
          aria-label="Card filters"
          className="absolute right-0 z-40 mt-2 max-h-[75vh] w-96 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl"
        >
          <h2 className="mb-5 text-xl font-semibold">Filter & Sort</h2>
          <div className="space-y-5">
            {groups.map((group) => (
              <fieldset key={group.key}>
                <legend className="mb-3 text-base font-medium">
                  {group.label}
                </legend>
                <div className="flex flex-wrap gap-2">
                  <Select
                    multiple
                    value={filters[group.key]}
                    onValueChange={(values, details) => {
                      toggleOptions(group.key, values);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={group.label} />
                    </SelectTrigger>
                    <SelectContent>
                      {group.options.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

              {/* <select
                id="builder-sort-order"
                value={filters.sortOrder}
                onChange={(e) => onChange("sortOrder", e.target.value)}
                className="w-full rounded-md border border-border bg-background p-3 text-base"
              >
                <option value="az">Name: A–Z</option>
                <option value="za">Name: Z–A</option>
              </select> */}
              <Select value={filters.sortOrder} onValueChange={(e, v) => onChange("sortOrder", e)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="az" value="az">Name: A-Z</SelectItem>
                  <SelectItem key="za" value="za">Name: Z-A</SelectItem>
                </SelectContent>
              </Select>
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
// ---- Page numbers under the grid ----

// Which page buttons to show, e.g. [1, "...", 4, 5, 6, "...", 20]
function getPageItems(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const items: (number | "...")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push("...");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push("...");

  items.push(total);
  return items;
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <nav
      aria-label="Card pages"
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
    >
      <Button
        variant="outline"
        className="text-base"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="size-4" />
        Prev
      </Button>

      {getPageItems(currentPage, totalPages).map((item, i) =>
        item === "..." ? (
          <span
            key={`dots-${i}`}
            className="px-1 text-base text-muted-foreground"
          >
            …
          </span>
        ) : (
          <Button
            key={item}
            variant={item === currentPage ? "default" : "outline"}
            size="icon"
            className="text-base"
            aria-label={`Page ${item}`}
            aria-current={item === currentPage ? "page" : undefined}
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        className="text-base"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
        <ChevronRight className="size-4" />
      </Button>
    </nav>
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
  return (
    <TiltCard card={card} onOpen={onOpen}>
      {/* How many copies are in the deck */}
      {qty > 0 && (
        <span className="pointer-events-none absolute -right-2 -top-2 rounded-full bg-white px-3 py-1 text-md font-semibold shadow-md ring-1 ring-foreground/10 [transform:translateZ(40px)]">
          x{qty}
        </span>
      )}

      {/* Add to deck */}
      <Button
        variant="outline"
        size="icon"
        aria-label={`Add ${card.name} to deck`}
        onClick={onAdd}
        disabled={disabled}
        className="absolute bottom-3 right-3 rounded-full bg-white shadow-lg [transform:translateZ(50px)]"
      >
        <Plus className="size-5" />
      </Button>
    </TiltCard>
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
  const cardColor = getCardColor(primaryType(card));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const details = [
    { label: "Type", value: typesOrNone(card).join(" / ") },
    { label: "Stage", value: card.stage },
    { label: "HP", value: card.hp ?? "—" },
    { label: "Rarity", value: card.rarity },
    { label: "Set", value: card.set },
    { label: "Number", value: card.number },
    { label: "Finish", value: card.finishes.join(" / ") || "Normal" },
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
          <CardImage
            card={card}
            className="flex h-56 items-center justify-center rounded-lg bg-muted text-base font-semibold text-muted-foreground"
          />

          <div>
            <dl className="space-y-3 text-base">
              {details.map((detail) => (
                <div
                  key={detail.label}
                  className="flex justify-between gap-4 border-b border-border pb-2"
                >
                  <dt className="text-muted-foreground">{detail.label}</dt>

                  <dd className="text-right font-medium">{detail.value}</dd>
                </div>
              ))}
            </dl>

            <p className="pt-4 text-base text-muted-foreground">
              Placeholder description. Card text, attacks, and prices will go
              here.
            </p>
          </div>
        </CardContent>

        <CardFooter className="justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>

          <Button onClick={onAdd} disabled={disabled}>
            <Plus className="size-5" />
            Add to deck
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
