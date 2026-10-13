"use client";

// Shared card art for every page that shows Pokémon cards (builder, collection, ...).
// Images come from the TCGdex API for now. When the team stores image links in
// Supabase, only fetchCardImageBase needs to change.

import { useEffect, useRef, useState } from "react";

// The bits of a card these components need. Pages can pass their own card
// objects as long as they have these fields.
export type CardArtInfo = {
  id: string; // TCGdex card id, like "base1-58"
  name: string;
  types: string[];
  set: string;
  number: string;
  hp?: number | null;
  stage?: string;
};

// ---- Colors ----

export function getTypeColor(type: string | undefined) {
  if (type === "Fire") return "bg-pink-500";
  if (type === "Water") return "bg-blue-400";
  if (type === "Grass") return "bg-green-400";
  if (type === "Lightning") return "bg-yellow-300";
  if (type === "Psychic") return "bg-purple-500";
  if (type === "Fighting") return "bg-orange-400";
  if (type === "Darkness") return "bg-gray-700";
  if (type === "Metal") return "bg-slate-400";
  if (type === "Dragon") return "bg-amber-600";
  if (type === "Fairy") return "bg-pink-300";

  return "bg-gray-400";
}

// Real Pokémon cards have rounded corners of about this size
export const CARD_CORNERS = "rounded-[4.5%/3.3%]";

// How far the card tilts toward your mouse, in degrees
const MAX_TILT = 12;

// ---- Loading images from TCGdex ----

// Remember each card's image request so we only ask TCGdex once per card
const imageCache = new Map<string, Promise<string | null>>();

function fetchCardImageBase(cardId: string) {
  if (!imageCache.has(cardId)) {
    const request = fetch(
      `https://api.tcgdex.net/v2/en/cards/${encodeURIComponent(cardId)}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { image?: string } | null) => data?.image ?? null)
      .catch(() => {
        imageCache.delete(cardId); // let it retry next time
        return null;
      });

    imageCache.set(cardId, request);
  }

  return imageCache.get(cardId)!;
}

// Returns the image base URL, null if the card has no image, or undefined while loading
function useCardImage(cardId: string) {
  const [result, setResult] = useState<{
    id: string;
    url: string | null;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchCardImageBase(cardId).then((url) => {
      if (!cancelled) setResult({ id: cardId, url });
    });

    return () => {
      cancelled = true;
    };
  }, [cardId]);

  return result?.id === cardId ? result.url : undefined;
}

// Some TCGdex image links are broken (the file isn't on their server).
// Try each quality in order, and if they all fail, show the mini card instead.
function useCardImageSrc(cardId: string, qualities: ("high" | "low")[]) {
  const base = useCardImage(cardId);

  // How many image files have failed so far for this card
  const [failed, setFailed] = useState({ id: cardId, count: 0 });
  const failCount = failed.id === cardId ? failed.count : 0;

  if (base === undefined) return { status: "loading" as const };
  if (base === null || failCount >= qualities.length) {
    return { status: "missing" as const };
  }

  return {
    status: "ok" as const,
    src: `${base}/${qualities[failCount]}.webp`,
    // When this file fails to load, move on to the next quality
    onError: () => setFailed({ id: cardId, count: failCount + 1 }),
  };
}

// ---- Mini card (for cards TCGdex has no picture for) ----

export function MiniCard({
  card,
  fill = "width",
}: {
  card: CardArtInfo;
  // "width" fills the grid column, "height" fills a fixed-height box like the modal
  fill?: "width" | "height";
}) {
  const cardColor = getTypeColor(card.types[0]);
  const typeLabel = card.types.length > 0 ? card.types.join(" / ") : "No type";

  return (
    <div
      role="img"
      aria-label={`${card.name} (no image available)`}
      className={`flex aspect-[245/337] flex-col rounded-lg p-2 shadow-sm ${cardColor} ${
        fill === "width" ? "w-full" : "h-full"
      }`}
    >
      <div className="flex flex-1 flex-col rounded-md bg-white/90 p-3 text-left text-gray-800">
        {/* Name and HP, like the top of a real card */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-base font-extrabold leading-tight">
            {card.name}
          </span>
          {card.hp != null && (
            <span className="shrink-0 text-sm font-bold">HP {card.hp}</span>
          )}
        </div>

        <span className="mt-1 text-xs font-medium text-gray-500">
          {card.stage && card.stage !== "Unknown" ? card.stage : ""}
        </span>

        {/* Big type badge where the artwork would be */}
        <div className="flex flex-1 items-center justify-center">
          <span
            className={`rounded-full px-4 py-2 text-sm font-bold text-white [text-shadow:1px_1px_2px_rgba(0,0,0,0.5)] ${cardColor}`}
          >
            {typeLabel}
          </span>
        </div>

        <div className="flex items-end justify-between gap-2 text-xs text-gray-500">
          <span>
            {card.set} · {card.number}
          </span>
          <span className="italic">No image</span>
        </div>
      </div>
    </div>
  );
}

// ---- Card art for grids (no frame, just the card) ----

export function CardArt({ card }: { card: CardArtInfo }) {
  // High quality first because grids show the art bigger than the 245px "low" size,
  // then low quality, then the mini card if both image files are broken
  const image = useCardImageSrc(card.id, ["high", "low"]);

  if (image.status === "loading") {
    return (
      <div
        className={`aspect-[245/337] w-full animate-pulse bg-muted ${CARD_CORNERS}`}
      />
    );
  }

  if (image.status === "missing") {
    return <MiniCard card={card} />;
  }

  return (
    // Plain <img> on purpose: next/image would need TCGdex added to next.config
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={image.src}
      src={image.src}
      onError={image.onError}
      alt={card.name}
      loading="lazy"
      draggable={false}
      className={`block aspect-[245/337] w-full object-cover ${CARD_CORNERS}`}
    />
  );
}

// ---- Card image for the details modal (fits inside a box) ----

export function CardImage({
  card,
  className,
}: {
  card: CardArtInfo;
  className: string;
}) {
  const image = useCardImageSrc(card.id, ["high", "low"]);

  return (
    <div className={className}>
      {image.status === "loading" && "Loading..."}
      {image.status === "missing" && <MiniCard card={card} fill="height" />}
      {image.status === "ok" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={image.src}
          src={image.src}
          onError={image.onError}
          alt={card.name}
          loading="lazy"
          className="h-auto max-h-full w-full max-w-[245px] rounded-md object-contain"
        />
      )}
    </div>
  );
}

// ---- 3D tilting card ----

// Shows the card art, tilts toward the mouse with a moving glare, and calls
// onOpen when clicked. Anything passed as children (like an add button or a
// count badge) floats on top of the card and tilts with it.
export function TiltCard({
  card,
  onOpen,
  children,
}: {
  card: CardArtInfo;
  onOpen: () => void;
  children?: React.ReactNode;
}) {
  const tiltRef = useRef<HTMLDivElement>(null);

  // Change the style directly instead of using state so it stays smooth
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = tiltRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0 = left edge, 1 = right edge
    const y = (e.clientY - rect.top) / rect.height; // 0 = top edge, 1 = bottom edge

    el.style.transform = `rotateX(${(0.5 - y) * MAX_TILT * 2}deg) rotateY(${
      (x - 0.5) * MAX_TILT * 2
    }deg) scale(1.04)`;
    el.style.setProperty("--glare-x", `${x * 100}%`);
    el.style.setProperty("--glare-y", `${y * 100}%`);
  }

  // Ease back to flat when the mouse leaves
  function handleMouseLeave() {
    if (tiltRef.current) tiltRef.current.style.transform = "";
  }

  return (
    <div className="[perspective:1000px]">
      <div
        ref={tiltRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="group relative transition-transform duration-200 ease-out will-change-transform [transform-style:preserve-3d]"
      >
        {/* The card itself: click to open the details */}
        <button
          type="button"
          onClick={onOpen}
          aria-label={`View ${card.name} details`}
          className={`relative block w-full shadow-md transition-shadow duration-200 group-hover:shadow-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-300 ${CARD_CORNERS}`}
        >
          <CardArt card={card} />

          {/* Shiny glare that follows the mouse */}
          <span
            aria-hidden
            className={`pointer-events-none absolute inset-0 opacity-0 mix-blend-overlay transition-opacity duration-200 group-hover:opacity-100 ${CARD_CORNERS}`}
            style={{
              background:
                "radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255,255,255,0.6), transparent 55%)",
            }}
          />
        </button>

        {children}
      </div>
    </div>
  );
}