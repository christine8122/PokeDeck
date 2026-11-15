"use client";

import type { ComponentProps } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TiltCard } from "@/components/custom/CardArt";

// Whatever TiltCard accepts, plus the fields this component shows.
// This lets the Collection and Builder pages pass their own card shapes.
type PokemonCardData = ComponentProps<typeof TiltCard>["card"] & {
  name: string;
  set: string;
  number: string;
};

type PokemonCardProps = {
  card: PokemonCardData;
  // What happens when you click the card itself
  onOpen: () => void;
  // Screen reader label for the card (optional)
  label?: string;
  // Shows the "x2" badge when this is more than 0
  copies?: number;
  // If passed, shows a + button in the corner
  onAdd?: () => void;
  // Screen reader label for the + button
  addLabel?: string;
  // Greys out the + button (like when a deck is full)
  addDisabled?: boolean;
  // Shows the set and number line under the card
  showSetInfo?: boolean;
};

export default function PokemonCard({
  card,
  onOpen,
  label,
  copies = 0,
  onAdd,
  addLabel,
  addDisabled = false,
  showSetInfo = false,
}: PokemonCardProps) {
  const tile = (
    <TiltCard card={card} onOpen={onOpen} label={label}>
      {copies > 0 && <CopiesBadge qty={copies} />}
      {onAdd && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={addLabel ?? `Add ${card.name}`}
          disabled={addDisabled}
          onClick={(e) => {
            // Stop the click from also reaching the card underneath
            e.stopPropagation();
            onAdd();
          }}
          className="absolute bottom-3 right-3 rounded-full bg-white shadow-lg [transform:translateZ(50px)]"
        >
          <Plus className="size-5" />
        </Button>
      )}
    </TiltCard>
  );

  if (!showSetInfo) return tile;

  return (
    <div>
      {tile}
      <p className="mt-2 truncate text-sm text-muted-foreground">
        {card.set} · {card.number}
        {copies > 0 && <span className="font-semibold text-green-600"> · In collection</span>}
      </p>
    </div>
  );
}

// "x2" bubble on the corner of a card
function CopiesBadge({ qty }: { qty: number }) {
  return (
    <span className="pointer-events-none absolute -right-2 -top-2 rounded-full bg-white px-3 py-1 text-md font-semibold shadow-md ring-1 ring-foreground/10 [transform:translateZ(40px)]">
      x{qty}
    </span>
  );
}