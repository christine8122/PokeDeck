"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, Globe, Lock } from "lucide-react";

import Container from "@/components/custom/Container";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PokemonCard from "@/components/ui/PokemonCard";
import { getTypeColor } from "@/components/custom/CardArt";
import { createClient } from "@/lib/supabase/client";
import { DeckRow } from "@/lib/supabase/types";
import {
  CARD_COLUMNS,
  CARDS_TABLE,
  cardNumberFromId,
  decodeTypes,
  parseHp,
  type CardRow,
} from "@/lib/tcg-cards";

// How many decks show under Recent Decks
const RECENT_DECK_COUNT = 5;

// How many cards show from your latest deck
const PREVIEW_CARD_COUNT = 4;

// The card details the dashboard needs (enough for the card art and its color)
type PreviewCard = {
  id: string;
  name: string;
  types: string[];
  set: string;
  number: string;
  hp: number | null;
  stage?: string;
};

function rowToPreviewCard(row: CardRow): PreviewCard {
  return {
    id: row.id,
    name: row.name,
    types: decodeTypes(row.types),
    set: row.set,
    number: cardNumberFromId(row.id),
    hp: parseHp(row.hp),
    stage: row.stage ?? undefined,
  };
}

// Each deck stores one card id per copy, so ["a", "a", "b"] becomes a: 2, b: 1
function countCopies(cardIds: string[]) {
  const counts = new Map<string, number>();
  for (const id of cardIds) {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}

export default function DashboardPage() {
  const router = useRouter();
  const [decks, setDecks] = useState<DeckRow[]>([]);
  const [cardsById, setCardsById] = useState<Map<string, PreviewCard>>(new Map());
  const [status, setStatus] = useState<"loading" | "loggedOut" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  // Load your decks, then just the cards the dashboard needs to show
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function loadDashboard() {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (cancelled) return;

      if (userError || !userData.user) {
        setStatus("loggedOut");
        return;
      }

      // Newest decks first (ids count up as decks are created)
      const { data: deckData, error: deckError } = await supabase
        .from("user_decks")
        .select("*")
        .eq("owner_id", userData.user.id)
        .order("id", { ascending: false });
      if (cancelled) return;

      if (deckError) {
        setErrorMessage(deckError.message);
        setStatus("error");
        return;
      }

      const loadedDecks: DeckRow[] = deckData ?? [];

      // Only fetch the cards we'll actually show: the first card of each recent
      // deck (for its color dot) and a few cards from your latest deck
      const neededIds = new Set<string>();
      for (const deck of loadedDecks.slice(0, RECENT_DECK_COUNT)) {
        if (deck.cards.length > 0) neededIds.add(deck.cards[0]);
      }
      if (loadedDecks.length > 0) {
        const latestIds = [...countCopies(loadedDecks[0].cards).keys()];
        for (const id of latestIds.slice(0, PREVIEW_CARD_COUNT)) {
          neededIds.add(id);
        }
      }

      const loadedCards = new Map<string, PreviewCard>();
      if (neededIds.size > 0) {
        const { data: cardData, error: cardError } = await supabase
          .from(CARDS_TABLE)
          .select(CARD_COLUMNS)
          .in("id", [...neededIds]);
        if (cancelled) return;

        // Missing cards just show a gray dot, so this isn't worth failing over
        if (cardError) console.log(cardError.message);

        for (const row of (cardData ?? []) as CardRow[]) {
          loadedCards.set(row.id, rowToPreviewCard(row));
        }
      }

      setDecks(loadedDecks);
      setCardsById(loadedCards);
      setStatus("ready");
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <Container>
        <p className="py-16 text-center text-lg text-muted-foreground">Loading your dashboard...</p>
      </Container>
    );
  }

  if (status === "loggedOut") {
    return (
      <Container>
        <div className="py-16 text-center">
          <h1 className="text-3xl font-bold">You&apos;re not logged in</h1>
          <p className="mt-2 text-lg text-muted-foreground">Log in to see your decks.</p>
          <Link
            href="/auth/login"
            className="mt-6 inline-flex h-12 items-center rounded-lg bg-primary px-6 text-base font-medium text-primary-foreground hover:bg-primary/80"
          >
            Log in
          </Link>
        </div>
      </Container>
    );
  }

  if (status === "error") {
    return (
      <Container>
        <div className="py-16 text-center">
          <p className="text-lg font-medium">Couldn&apos;t load your dashboard.</p>
          <p className="mt-2 text-base text-muted-foreground">{errorMessage}</p>
        </div>
      </Container>
    );
  }

  // ---- Numbers for the stat cards ----

  const publicDecks = decks.filter((deck) => deck.public).length;
  const cardsInDecks = decks.reduce((sum, deck) => sum + deck.cards.length, 0);

  const stats = [
    { value: decks.length, label: "Decks built", ring: "ring-yellow-300" },
    { value: publicDecks, label: "Public decks", ring: "ring-green-300" },
    { value: cardsInDecks, label: "Cards in decks", ring: "ring-pink-300" },
  ];

  const recentDecks = decks.slice(0, RECENT_DECK_COUNT);

  // Cards from your newest deck, with how many copies it has of each
  const latestDeck = decks.at(0);
  let latestCards: { card: PreviewCard; copies: number }[] = [];
  if (latestDeck) {
    latestCards = [...countCopies(latestDeck.cards)]
      .slice(0, PREVIEW_CARD_COUNT)
      .flatMap(([id, copies]) => {
        const card = cardsById.get(id);
        if (!card) return [];
        return [{ card, copies }];
      });
  }

  return (
    <Container>
      {/* Heading */}
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">Welcome Back</h1>
        <p className="mt-2 text-lg text-muted-foreground sm:text-2xl">
          Here&apos;s where your decks stand.
        </p>
      </header>

      {/* Stat cards */}
      <section className="mb-8 grid gap-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className={`ring-2 shadow-sm ${stat.ring}`}>
            <CardContent>
              <p className="text-5xl font-extrabold">{stat.value}</p>
              <p className="mt-1 text-2xl text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Recent decks */}
      <Card className="mb-8 shadow-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Recent Decks</CardTitle>
          <CardAction>
            <Link
              href="/builder"
              className={buttonVariants({ variant: "link", size: "default" })}
            >
              <span className="text-lg">Open builder</span>
              <ChevronRight className="h-6 w-6" />
            </Link>
          </CardAction>
        </CardHeader>

        <CardContent>
          {recentDecks.length === 0 && (
            <p className="py-6 text-center text-lg text-muted-foreground">
              You haven&apos;t saved any decks yet.{" "}
              <Link href="/builder" className="font-semibold text-foreground underline">
                Build your first one
              </Link>
              .
            </p>
          )}

          <ul className="divide-y divide-border">
            {recentDecks.map((deck) => {
              // The deck's color comes from its first card's type
              const firstCard = cardsById.get(deck.cards[0]);
              const color = getTypeColor(firstCard?.types[0]);

              return (
                <li key={deck.id}>
                  <Link
                    href={`/builder/${deck.id}`}
                    className="flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted"
                  >
                    <span className={`size-12 shrink-0 rounded-lg sm:size-16 ${color}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xl sm:text-2xl">{deck.name || "Untitled Deck"}</p>
                      <p className="text-base text-muted-foreground sm:text-lg">
                        {deck.cards.length} / 60 cards
                      </p>
                    </div>

                    {/* Public or private badge */}
                    {deck.public && (
                      <span className="hidden items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 sm:inline-flex">
                        <Globe className="size-3" />
                        Public
                      </span>
                    )}
                    {!deck.public && (
                      <span className="hidden items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground sm:inline-flex">
                        <Lock className="size-3" />
                        Private
                      </span>
                    )}

                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      {/* Cards from your latest deck */}
      {latestDeck && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              From {latestDeck.name || "your latest deck"}
            </CardTitle>
            <CardAction>
              <Link
                href={`/builder/${latestDeck.id}`}
                className={buttonVariants({ variant: "link", size: "default" })}
              >
                <span className="text-lg">Open deck</span>
                <ChevronRight className="h-6 w-6" />
              </Link>
            </CardAction>
          </CardHeader>

          <CardContent>
            {latestCards.length === 0 && (
              <p className="py-6 text-center text-lg text-muted-foreground">
                This deck doesn&apos;t have any cards yet.
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {latestCards.map(({ card, copies }) => (
                <PokemonCard
                  key={card.id}
                  card={card}
                  copies={copies}
                  label={`Open ${latestDeck.name || "deck"} in the builder`}
                  onOpen={() => router.push(`/builder/${latestDeck.id}`)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}