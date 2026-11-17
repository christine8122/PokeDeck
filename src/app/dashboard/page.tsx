import Link from "next/link";
import { ChevronRight } from "lucide-react";

import Container from "@/components/custom/Container";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ---- Placeholder data will be swapped for API later ----

const stats = [
  { value: 0, label: "Cards owned", ring: "ring-yellow-300" },
  { value: 0, label: "Decks built", ring: "ring-green-300" },
  { value: 0, label: "Wishlist items", ring: "ring-pink-300" },
];

const recentDecks = [
  { id: "1", name: "Placeholder", cards: 0, edited: "0 days ago", color: "bg-rose-500" },
];

type Rarity = "Rare" | "Epic" | "Legendary";

const recentCards: {
  id: string;
  name: string;
  qty: number;
  price: string;
  set: string;
  number: string;
  finish: string;
  rarity: Rarity;
  header: string;
  pill: string;
}[] = [
  { id: "1", name: "Placeholder", qty: 2, price: "$0.00", set: "Base Set", number: "#15", finish: "Rare Holo", rarity: "Rare", header: "bg-green-400", pill: "bg-green-400" },
  { id: "2", name: "Placeholder", qty: 1, price: "$0.00", set: "Base Set", number: "#4", finish: "Rare Holo", rarity: "Epic", header: "bg-yellow-300", pill: "bg-yellow-300" },
  { id: "3", name: "Placeholder", qty: 3, price: "$0.00", set: "Base Set", number: "#1", finish: "Rare Holo", rarity: "Legendary", header: "bg-pink-500", pill: "bg-pink-500" },
  { id: "4", name: "Placeholder", qty: 1, price: "$0.00", set: "Base Set", number: "#6", finish: "Rare Holo", rarity: "Epic", header: "bg-blue-500", pill: "bg-blue-500" },
];

const rarityRibbon: Record<Rarity, string> = {
  Rare: "bg-red-500",
  Epic: "bg-violet-600",
  Legendary: "bg-amber-400",
};

// ---- Page ----

export default function DashboardPage() {
  return (
    <Container>
      {/* Heading */}
      <header className="mb-6 sm:mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">Welcome Back</h1>
        <p className="mt-2 text-lg text-muted-foreground sm:text-2xl">
          Here&apos;s where your collection and decks stand.
        </p>
      </header>

      {/* Stat cards: 3 across even on phones, just smaller */}
      <section className="mb-6 grid grid-cols-3 gap-3 sm:mb-8 sm:gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className={`ring-2 shadow-sm ${stat.ring}`}>
            <CardContent className="px-3 sm:px-6">
              <p className="text-3xl font-extrabold sm:text-5xl">{stat.value}</p>
              <p className="mt-1 text-sm leading-tight text-muted-foreground sm:text-2xl">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Recent decks */}
      <Card className="mb-6 shadow-sm sm:mb-8">
        <CardHeader>
          <CardTitle className="text-xl font-bold sm:text-3xl">Recent Decks</CardTitle>
          <CardAction>
            <Link
              href="/builder"
              className={buttonVariants({ variant: "link", size: "default" })}
            >
              <span className="text-base sm:text-lg">View all</span>
              <ChevronRight className="size-5 sm:size-6" />
            </Link>
          </CardAction>
        </CardHeader>

        <CardContent>
          <ul className="divide-y divide-border">
            {recentDecks.map((deck) => (
              <li key={deck.id}>
                <Link
                  href={`/builder/${deck.id}`}
                  className="flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted"
                >
                  <span className={`size-12 shrink-0 rounded-lg sm:size-16 ${deck.color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg sm:text-2xl">{deck.name}</p>
                    <p className="text-sm text-muted-foreground sm:text-lg">
                      {deck.cards} cards · edited {deck.edited}
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recently added */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold sm:text-3xl">Recently added to collection</CardTitle>
          <CardAction>
            <Link
              href="/collection"
              className={buttonVariants({ variant: "link", size: "default" })}
            >
              <span className="text-base sm:text-lg">View Collection</span>
              <ChevronRight className="size-5 sm:size-6" />
            </Link>
          </CardAction>
        </CardHeader>

        <CardContent>
          <div className="grid min-h-[280px] grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {recentCards.map((card) => (
              <CollectionPreviewCard key={card.id} card={card} />
            ))}
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}

// ---- Mini TCG card used in "Recently added" ----

function CollectionPreviewCard({ card }: { card: (typeof recentCards)[number] }) {
  return (
    <Card className="relative gap-3 overflow-hidden pt-0 shadow-md sm:gap-5">
      {/* Rarity ribbon */}
      <span
        className={`absolute -left-8 top-4 z-10 w-28 -rotate-45 py-1 text-center text-xs font-bold text-white shadow ${rarityRibbon[card.rarity]}`}
      >
        {card.rarity}
      </span>

      {/* Colored header bar */}
      <div className={`flex items-center justify-between gap-2 px-3 py-2 ${card.header}`}>
        <span className="min-w-0 flex-1 translate-x-2 truncate p-1 text-center text-sm font-extrabold uppercase tracking-wide text-white [text-shadow:2px_3px_4px_rgba(0,0,0,0.7)] sm:text-lg">
          {card.name}
        </span>
        <span className="shrink-0 rounded-full bg-white px-2 py-1 text-sm font-semibold sm:text-base">
          x{card.qty}
        </span>
      </div>

      <CardContent className="space-y-3 p-3 sm:space-y-4 sm:p-4">
        <div className="flex items-start gap-2">
          {/* Swap for <Image /> once you have card art */}
          <div className="flex h-40 flex-1 items-center justify-center rounded-md bg-muted text-sm font-semibold text-muted-foreground sm:h-67 sm:text-base">
            Picture
          </div>
        </div>

        <p className="text-sm text-muted-foreground sm:text-lg">
          {card.set} · {card.number}
        </p>

        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold text-white sm:py-2 sm:text-base ${card.pill}`}
        >
          {card.finish}
        </span>
      </CardContent>
    </Card>
  );
}