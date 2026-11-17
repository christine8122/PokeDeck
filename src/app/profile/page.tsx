"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { KeyRound, Trash2, TriangleAlert } from "lucide-react";

import Container from "@/components/custom/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { DeckRow } from "@/lib/supabase/types";

// Just the account details this page shows
type Profile = {
  id: string;
  email: string;
  memberSince: string; // like "November 2026"
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [decks, setDecks] = useState<DeckRow[]>([]);
  const [status, setStatus] = useState<"loading" | "loggedOut" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  // Load the logged-in user and their decks when the page opens
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function loadProfile() {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (cancelled) return;

      if (userError || !userData.user) {
        setStatus("loggedOut");
        return;
      }

      const user = userData.user;

      const { data: deckData, error: deckError } = await supabase
        .from("user_decks")
        .select("*")
        .eq("owner_id", user.id);
      if (cancelled) return;

      if (deckError) {
        setErrorMessage(deckError.message);
        setStatus("error");
        return;
      }

      setProfile({
        id: user.id,
        email: user.email ?? "",
        memberSince: new Date(user.created_at).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      });
      setDecks(deckData ?? []);
      setStatus("ready");
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <Container>
        <p className="py-16 text-center text-lg text-muted-foreground">Loading your profile...</p>
      </Container>
    );
  }

  if (status === "loggedOut") {
    return (
      <Container>
        <div className="py-16 text-center">
          <h1 className="text-3xl font-bold">You&apos;re not logged in</h1>
          <p className="mt-2 text-lg text-muted-foreground">Log in to see your profile and decks.</p>
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

  if (status === "error" || !profile) {
    return (
      <Container>
        <div className="py-16 text-center">
          <p className="text-lg font-medium">Couldn&apos;t load your profile.</p>
          <p className="mt-2 text-base text-muted-foreground">{errorMessage}</p>
        </div>
      </Container>
    );
  }

  // The part of the email before the @, used as a display name
  const displayName = profile.email.split("@")[0];
  const initial = displayName.charAt(0).toUpperCase();

  const publicDecks = decks.filter((deck) => deck.public).length;
  // Each deck stores one id per copy, so the list length is its card count
  const totalCards = decks.reduce((sum, deck) => sum + deck.cards.length, 0);

  const stats = [
    { value: decks.length, label: "Decks built", ring: "ring-yellow-300" },
    { value: publicDecks, label: "Public decks", ring: "ring-green-300" },
    { value: totalCards, label: "Cards in decks", ring: "ring-pink-300" },
  ];

  return (
    <Container>
      <div className="space-y-8 py-6">
        {/* Who you are */}
        <Card className="shadow-md">
          <CardContent className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
            <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-yellow-300 text-4xl font-extrabold ring-4 ring-yellow-100">
              {initial}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-3xl font-bold sm:text-4xl">{displayName}</h1>
              <p className="truncate text-base text-muted-foreground">{profile.email}</p>
              <p className="mt-1 text-sm text-muted-foreground">Member since {profile.memberSince}</p>
            </div>

          </CardContent>
        </Card>

        <ChangePasswordCard email={profile.email} />

        <DangerZone
          userId={profile.id}
          deckCount={decks.length}
          onDecksReset={() => setDecks([])}
        />
      </div>
    </Container>
  );
}
// A green or red note under a form, after you submit it
type Message = { kind: "success" | "error"; text: string } | null;

function FormMessage({ message }: { message: Message }) {
  if (!message) return null;

  let color = "text-red-600";
  if (message.kind === "success") {
    color = "text-green-700";
  }

  return (
    <p role="status" className={`text-sm font-medium ${color}`}>
      {message.text}
    </p>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-card px-4 py-3 text-base outline-none focus:ring-2 focus:ring-pink-300";

// ---- Change password ----

function ChangePasswordCard({ email }: { email: string }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 8) {
      setMessage({ kind: "error", text: "Your new password needs at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ kind: "error", text: "The new passwords don't match." });
      return;
    }
    if (newPassword === currentPassword) {
      setMessage({ kind: "error", text: "Pick a password that's different from your current one." });
      return;
    }

    setSaving(true);
    const supabase = createClient();

    // Check the current password first, so someone who finds your laptop
    // logged in can't change your password without knowing it
    const { error: checkError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
    if (checkError) {
      setSaving(false);
      setMessage({ kind: "error", text: "Your current password is incorrect." });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);

    if (error) {
      setMessage({ kind: "error", text: error.message });
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage({ kind: "success", text: "Your password was changed." });
  }

  let buttonText = "Change password";
  if (saving) {
    buttonText = "Saving...";
  }

  return (
    <Card className="shadow-md">
      <CardContent>
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
          <KeyRound className="size-6" />
          Change password
        </h2>

        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          <div className="space-y-2">
            <label htmlFor="current-password" className="text-base font-medium">
              Current password
            </label>
            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="new-password" className="text-base font-medium">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirm-password" className="text-base font-medium">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          <FormMessage message={message} />

          <Button type="submit" disabled={saving} className="h-11 px-5 text-base">
            {buttonText}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ---- Reset decks and delete account ----

// What you have to type before Delete account unlocks
const DELETE_CONFIRM_WORD = "DELETE";

function DangerZone({
  userId,
  deckCount,
  onDecksReset,
}: {
  userId: string;
  deckCount: number;
  onDecksReset: () => void;
}) {
  const router = useRouter();
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<Message>(null);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<Message>(null);

  async function resetDecks() {
    setResetMessage(null);

    if (deckCount === 0) {
      setResetMessage({ kind: "success", text: "You don't have any decks to delete." });
      return;
    }
    if (!window.confirm(`Delete all ${deckCount} of your decks? This can't be undone.`)) {
      return;
    }

    setResetting(true);
    const { error } = await createClient()
      .from("user_decks")
      .delete()
      .eq("owner_id", userId);
    // TODO: once collections are saved in Supabase, clear that table here too
    setResetting(false);

    if (error) {
      setResetMessage({ kind: "error", text: error.message });
      return;
    }

    onDecksReset();
    setResetMessage({ kind: "success", text: "All your decks were deleted." });
  }

  async function deleteAccount() {
    setDeleteMessage(null);
    setDeleting(true);

    // Deleting a login needs the Supabase secret key, so the server does it
    const response = await fetch("/api/delete-account", { method: "POST" });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setDeleting(false);
      setDeleteMessage({
        kind: "error",
        text: body?.error ?? "Couldn't delete your account. Please try again.",
      });
      return;
    }

    // The account is gone, so clear the login on this device and go home
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  let resetButtonText = "Reset all decks";
  if (resetting) {
    resetButtonText = "Deleting...";
  }

  let deleteButtonText = "Delete my account";
  if (deleting) {
    deleteButtonText = "Deleting account...";
  }

  return (
    <Card className="shadow-md ring-2 ring-red-200">
      <CardContent className="space-y-6">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-red-700">
          <TriangleAlert className="size-6" />
          Danger zone
        </h2>

        {/* Reset decks */}
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold">Reset all decks</h3>
            <p className="text-base text-muted-foreground">
              Deletes every deck you&apos;ve saved. Your account stays.
            </p>
          </div>
          <FormMessage message={resetMessage} />
          <Button
            type="button"
            variant="outline"
            onClick={resetDecks}
            disabled={resetting}
            className="h-11 px-5 text-base text-red-700"
          >
            <Trash2 className="size-4" />
            {resetButtonText}
          </Button>
        </div>

        {/* Delete account */}
        <div className="space-y-3 border-t border-border pt-6">
          <div>
            <h3 className="text-lg font-semibold">Delete account</h3>
            <p className="text-base text-muted-foreground">
              Permanently deletes your account and all your decks. This can&apos;t be undone.
            </p>
          </div>

          <div className="max-w-md space-y-2">
            <label htmlFor="delete-confirm" className="text-base font-medium">
              Type {DELETE_CONFIRM_WORD} to confirm
            </label>
            <input
              id="delete-confirm"
              type="text"
              autoComplete="off"
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              className={inputClass}
            />
          </div>

          <FormMessage message={deleteMessage} />

          <Button
            type="button"
            onClick={deleteAccount}
            disabled={deleting || deleteText !== DELETE_CONFIRM_WORD}
            className="h-11 bg-red-600 px-5 text-base text-white hover:bg-red-700"
          >
            {deleteButtonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}