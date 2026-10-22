import { Database } from "./database.types";

export type Tables = Database["public"]["Tables"]

export type DeckRow = Tables["user_decks"]["Row"]