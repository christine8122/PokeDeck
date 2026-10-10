import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/custom/Navbar";
import Container from "@/components/custom/Container";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PokéDecks",
  description: "Track and build your Pokémon card collection.",
};

export default async function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Navbar />
        <Container>{children}</Container>
      </body>
    </html>
  );
}