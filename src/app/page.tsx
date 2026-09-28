import Link from "next/link";

import Container from "@/components/custom/Container";

const highlights = [
  { title: "1,200+", caption: "cards in the database" },
  { title: "Owned + Wishlist", caption: "tracked side by side" },
  { title: "Shareable", caption: "deck lists" },
];

export default function HomePage() {
  return (
    <Container>
      <section className="grid items-center gap-12 py-12 md:grid-cols-2 md:py-20">
        {/* Left: copy */}
        <div>
          <p className="text-sm text-muted-foreground">
            Your collection, actually organized.
          </p>

          <h1 className="mt-4 text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Build the deck you can&apos;t find in your binder.
          </h1>

          <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
            Track every card you own, theorycraft with the ones you don&apos;t,
            and put a deck together without dumping a shoebox onto the table.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/dashboard"
              className="rounded-xl border-b-4 border-orange-600 bg-yellow-400 px-6 py-3 text-lg font-medium text-foreground transition-all hover:brightness-105 active:translate-y-0.5 active:border-b-2"
            >
              Open my dashboard
            </Link>
            <Link
              href="/collection"
              className="rounded-xl border-b-4 border-border bg-card px-6 py-3 text-lg font-medium text-foreground shadow-sm ring-1 ring-foreground/10 transition-all hover:bg-muted active:translate-y-0.5 active:border-b-2"
            >
              Browse the database
            </Link>
          </div>

          {/* Highlights row */}
          <dl className="mt-10 grid grid-cols-3 gap-4 text-center">
            {highlights.map((item) => (
              <div key={item.title}>
                <dt className="text-sm font-extrabold uppercase tracking-wider">
                  {item.title}
                </dt>
                <dd className="mt-1 text-xs text-muted-foreground">
                  {item.caption}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Right: stacked card art */}
        <CardStack />
      </section>
    </Container>
  );
}

// Three overlapping, tilted cards like the Figma hero
function CardStack() {
  const cards = [
    { className: "right-6 top-0 rotate-[-6deg] bg-yellow-400/90" },
    { className: "right-24 top-16 rotate-[-14deg] bg-orange-400/80" },
    {
      className:
        "right-40 top-36 rotate-[-28deg] bg-indigo-400/80 ring-4 ring-blue-500",
    },
  ];

  return (
    <div aria-hidden className="relative mx-auto hidden h-[420px] w-full max-w-md md:block">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`absolute h-60 w-44 rounded-2xl shadow-lg transition-transform duration-300 hover:-translate-y-2 ${card.className}`}
        />
      ))}
      {/* Soft shadow under the stack */}
      <div className="absolute bottom-0 left-1/2 h-3 w-36 -translate-x-1/2 rounded-full bg-foreground/15 blur-md" />
    </div>
  );
}