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
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight">Welcome Back</h1>
        <p className="mt-2 text-muted-foreground">
          Here&apos;s where your collection and decks stand.
        </p>
      </header>

      {/* Stat cards */}
      <section className="mb-8 grid gap-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className={`ring-2 shadow-sm ${stat.ring}`}>
            <CardContent>
              <p className="text-3xl font-extrabold">{stat.value}</p>
              <p className="mt-1 text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Recent decks */}
      <Card className="mb-8 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Recent Decks</CardTitle>
          <CardAction>
            <Link
              href="/builder"
              className={buttonVariants({ variant: "link", size: "sm" })}
            >
              View all <ChevronRight />
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
                  <span className={`size-9 shrink-0 rounded-md ${deck.color}`} />
                  <div className="flex-1">
                    <p className="font-medium">{deck.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {deck.cards} cards · edited {deck.edited}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recently added */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Recently added to collection</CardTitle>
          <CardAction>
            <Link
              href="/collection"
              className={buttonVariants({ variant: "link", size: "sm" })}
            >
              View Collection <ChevronRight />
            </Link>
          </CardAction>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
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
    <Card size="sm" className="relative gap-3 pt-0 shadow-md">
      {/* Rarity ribbon */}
      <span
        className={`absolute -left-7 top-3 z-10 w-24 -rotate-45 py-0.5 text-center text-[10px] font-bold text-white shadow ${rarityRibbon[card.rarity]}`}
      >
        {card.rarity}
      </span>

      {/* Colored header bar */}
      <div className={`flex items-center justify-between px-3 py-2 ${card.header}`}>
        <span className="w-full text-center text-xs font-extrabold uppercase tracking-wide">
          {card.name}
        </span>
        <span className="rounded-full bg-white px-1.5 text-[10px] font-semibold">
          x{card.qty}
        </span>
      </div>

      <CardContent className="space-y-2">
        <div className="flex items-start gap-2">
          {/* Swap for <Image /> once you have card art */}
          <div className="flex h-16 flex-1 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
            Picture
          </div>
          <span className="text-xs font-bold">{card.price}</span>
        </div>

        <p className="text-[11px] text-muted-foreground">
          {card.set} · {card.number}
        </p>

        <span
          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold text-white ${card.pill}`}
        >
          {card.finish}
        </span>
      </CardContent>
    </Card>
  );
}