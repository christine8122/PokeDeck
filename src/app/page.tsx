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
      <section className="grid items-center gap-12 py-8 sm:py-12 md:grid-cols-2 md:py-20">
        {/* Left: copy */}
        <div>
          <p className="text-lg text-muted-foreground sm:text-2xl">
            Your collection, actually organized.
          </p>

          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Build the deck you can&apos;t find in your binder.
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-2xl">
            Track every card you own, theorycraft with the ones you don&apos;t,
            and put a deck together without dumping a shoebox onto the table.
          </p>

          {/* CTAs: stacked full width on phones, side by side on bigger screens */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <Link
              href="/dashboard"
              className="rounded-xl border-b-4 border-orange-600 bg-yellow-400 px-8 py-4 text-center text-lg font-medium text-foreground transition-all hover:brightness-105 active:translate-y-0.5 active:border-b-2 sm:text-xl"
            >
              Open my dashboard
            </Link>
            <Link
              href="/collection"
              className="rounded-xl border-b-4 border-border bg-card px-8 py-4 text-center text-lg font-medium text-foreground shadow-sm ring-1 ring-foreground/10 transition-all hover:bg-muted active:translate-y-0.5 active:border-b-2 sm:text-xl"
            >
              Browse the database
            </Link>
          </div>

          {/* Highlights: stacked on phones, 3 across on bigger screens */}
          <dl className="mt-10 grid grid-cols-1 gap-6 text-center sm:grid-cols-3 sm:gap-4">
            {highlights.map((item) => (
              <div key={item.title}>
                <dt className="text-xl font-extrabold uppercase tracking-wider sm:text-2xl">
                  {item.title}
                </dt>
                <dd className="mt-1 text-base text-muted-foreground sm:mt-2 sm:text-lg">
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

// Three overlapping, tilted cards like the Figma
function CardStack() {
  const cards = [
    { className: "right-6 top-0 rotate-[-6deg] bg-yellow-400/90" },
    { className: "right-24 top-16 rotate-[-14deg] bg-pink-500/90" },
    {
      className:
        "right-40 top-36 rotate-[-28deg] bg-indigo-400/80 ring-4 ring-blue-500",
    },
  ];

  return (
    <div aria-hidden className="relative mx-auto hidden h-[480px] w-full max-w-lg md:block">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`absolute h-72 w-52 rounded-2xl shadow-lg transition-transform duration-300 hover:-translate-y-2 ${card.className}`}
        />
      ))}
      {/* Soft shadow under the stack */}
      <div className="absolute bottom-0 left-1/2 h-3 w-36 -translate-x-1/2 rounded-full bg-foreground/15 blur-md" />
    </div>
  );
}