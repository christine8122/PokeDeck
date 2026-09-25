"use client";

import { useEffect, useState } from "react";
import { Check, Plus, Save, Search, X } from "lucide-react";

import Container from "@/components/custom/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";

// ---- Placeholder data ----

type TcgCard = {
  id: string;
  name: string;
  price: string;
  set: string;
  number: string;
  finish: string;
  owned: boolean;
};

const placeholderCards: TcgCard[] = Array.from({ length: 9 }, (_, i) => ({
  id: String(i + 1),
  name: "Placeholder",
  price: "$0.00",
  set: "Placeholder Set",
  number: `#${String(i + 1).padStart(3, "0")}`,
  finish: "Placeholder",
  owned: i % 3 !== 2, // every third card is "unowned" so the Owned filter does something
}));

const DECK_LIMIT = 60;
const COPY_LIMIT = 4; // standard TCG rule: max 4 copies of a card

type DeckEntry = { card: TcgCard; qty: number };

// ---- Page ----

export default function BuilderPage() {
  const [deckName, setDeckName] = useState("Placeholder Deck");
  const [deck, setDeck] = useState<DeckEntry[]>([]);
  const [selected, setSelected] = useState<TcgCard | null>(null);
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [saved, setSaved] = useState(false);

  const totalCards = deck.reduce((sum, e) => sum + e.qty, 0);
  const ownedInDeck = deck
    .filter((e) => e.card.owned)
    .reduce((sum, e) => sum + e.qty, 0);

  const visibleCards = ownedOnly
    ? placeholderCards.filter((c) => c.owned)
    : placeholderCards;

  const qtyInDeck = (id: string) => deck.find((e) => e.card.id === id)?.qty ?? 0;
  const canAdd = (id: string) =>
    totalCards < DECK_LIMIT && qtyInDeck(id) < COPY_LIMIT;

  function addToDeck(card: TcgCard) {
    if (!canAdd(card.id)) return;
    setSaved(false);
    setDeck((prev) =>
      prev.some((e) => e.card.id === card.id)
        ? prev.map((e) => (e.card.id === card.id ? { ...e, qty: e.qty + 1 } : e))
        : [...prev, { card, qty: 1 }]
    );
  }

  function removeOne(id: string) {
    setSaved(false);
    setDeck((prev) =>
      prev
        .map((e) => (e.card.id === id ? { ...e, qty: e.qty - 1 } : e))
        .filter((e) => e.qty > 0)
    );
  }

  return (
    <Container>
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* ---- Left: deck list panel ---- */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Card className="shadow-md">
            <CardContent className="space-y-3">
              <input
                value={deckName}
                onChange={(e) => {
                  setDeckName(e.target.value);
                  setSaved(false);
                }}
                aria-label="Deck name"
                className="w-full rounded-md bg-transparent text-base font-extrabold outline-none focus:ring-2 focus:ring-pink-300"
              />

              <DeckProgress total={totalCards} />

              {deck.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  No cards yet. Hit the + on a card to add it.
                </p>
              ) : (
                <ul className="max-h-80 space-y-1 overflow-y-auto">
                  {deck.map(({ card, qty }) => (
                    <li key={card.id} className="flex items-center gap-3 py-1.5">
                      <span className="size-4 shrink-0 rounded-full bg-muted-foreground/30" />
                      <button
                        onClick={() => setSelected(card)}
                        className="flex-1 truncate text-left text-xs font-extrabold uppercase tracking-wide hover:text-pink-500"
                      >
                        {card.name}
                      </button>
                      <span className="text-xs font-extrabold">x{qty}</span>
                      <button
                        onClick={() => removeOne(card.id)}
                        aria-label={`Remove one ${card.name}`}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Collection check */}
              <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs text-muted-foreground">
                <Check className="size-4 shrink-0 text-green-600" />
                {ownedInDeck} of {totalCards} cards already in your collection
              </div>

              {/* Save deck (UI only) */}
              <Button
                className="w-full"
                onClick={() => setSaved(true)}
                disabled={deck.length === 0}
              >
                <Save /> Save deck
              </Button>
              {saved && (
                <p className="text-center text-xs text-muted-foreground">
                  Saved! (UI only, nothing is stored yet)
                </p>
              )}
            </CardContent>
          </Card>
        </aside>

        {/* ---- Right: search + card grid ---- */}
        <section>
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search all cards -- Owned & unowned..."
                className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <button
              onClick={() => setOwnedOnly((v) => !v)}
              aria-pressed={ownedOnly}
              className={`rounded-xl px-5 py-2 text-lg font-medium transition-colors ${
                ownedOnly
                  ? "bg-foreground text-background"
                  : "bg-card text-foreground ring-1 ring-foreground/15 hover:bg-muted"
              }`}
            >
              Owned
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
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
        </section>
      </div>

      {/* ---- Card details modal ---- */}
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

// ---- Deck progress bar with tick marks every 10 cards ----

function DeckProgress({ total }: { total: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-linear-to-r from-yellow-300 via-blue-400 to-indigo-500 transition-all"
          style={{ width: `${(total / DECK_LIMIT) * 100}%` }}
        />
        {/* Tick marks */}
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className="absolute top-0 h-full w-px bg-foreground/30"
            style={{ left: `${(n / 6) * 100}%` }}
          />
        ))}
      </div>
      <span className="shrink-0 text-xs font-bold">
        {total} / {DECK_LIMIT} Cards
      </span>
    </div>
  );
}

// ---- Card tile in the grid ----

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
    <Card size="sm" className="gap-0 pt-0 pb-3 shadow-md transition-shadow hover:shadow-lg">
      {/* Clicking the card body opens the details modal */}
      <button onClick={onOpen} className="text-left">
        <div className="flex items-center justify-between bg-green-400 px-3 py-2">
          <span className="truncate text-xs font-extrabold uppercase tracking-wide">
            {card.name}
          </span>
          {qty > 0 && <span className="text-xs font-semibold">x{qty}</span>}
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

      <div className="mt-2 flex items-center justify-between px-3">
        <span className="rounded-full bg-green-400 px-2 py-0.5 text-[10px] font-semibold text-white">
          {card.finish}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={`Add ${card.name} to deck`}
          onClick={onAdd}
          disabled={disabled}
        >
          <Plus />
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
  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const details = [
    { label: "Set", value: card.set },
    { label: "Number", value: card.number },
    { label: "Finish", value: card.finish },
    { label: "Price", value: card.price },
    { label: "Owned", value: card.owned ? "Yes" : "No" },
    { label: "In this deck", value: `${qty} / ${COPY_LIMIT}` },
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
        className="w-full max-w-lg pt-0 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between bg-green-400 px-4 py-3">
          <CardTitle className="font-extrabold uppercase tracking-wide">
            {card.name}
          </CardTitle>
          <Button variant="ghost" size="icon-sm" aria-label="Close" onClick={onClose}>
            <X />
          </Button>
        </div>

        <CardContent className="grid gap-4 sm:grid-cols-[160px_1fr]">
          <div className="flex h-52 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-muted-foreground">
            Picture
          </div>
          <dl className="space-y-2 text-sm">
            {details.map((d) => (
              <div key={d.label} className="flex justify-between gap-4 border-b border-border pb-1">
                <dt className="text-muted-foreground">{d.label}</dt>
                <dd className="font-medium">{d.value}</dd>
              </div>
            ))}
            <p className="pt-2 text-muted-foreground">
              Placeholder description. Card text, attacks, and prices will go here.
            </p>
          </dl>
        </CardContent>

        <CardFooter className="justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onAdd} disabled={disabled}>
            <Plus /> Add to deck
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}