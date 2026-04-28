import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Last-Minute Chef — Cook what you have, order what you don't",
  description:
    "AI-powered recipe recommendations from ingredients you already have. See missing ingredient costs and order directly from Swiggy Instamart in one tap.",
  keywords: [
    "recipe finder",
    "ingredient based recipes",
    "Swiggy Instamart",
    "AI recipes",
    "cooking app",
    "Indian recipes",
    "meal planner",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
