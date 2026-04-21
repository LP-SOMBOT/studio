// This file now only provides the type definition and initial seed data if the database is empty.
// All real data is fetched from Firebase RTDB in real-time.

export type GamePackage = {
  id: string;
  gameId: string;
  category: 'top-up' | 'accounts';
  title: string;
  description: string;
  price: number;
  discountedPrice?: number;
  thumbnail: string;
  imageHint?: string;
  tags?: string[];
};

// Initial seeding data used ONLY when the database is completely empty for the first time.
export const GAMES_DATA: GamePackage[] = [
  {
    id: "ff-110",
    gameId: "freefire",
    category: 'top-up',
    title: "110 Diamonds",
    description: "Direct top-up via Player ID. Fast and secure delivery.",
    price: 1.2,
    thumbnail: "https://picsum.photos/seed/ff/400/400",
    imageHint: "free fire",
    tags: ["Popular", "Instant"]
  },
  {
    id: "ff-acc-rare",
    gameId: "freefire-acc",
    category: 'accounts',
    title: "Rare Account Bundle",
    description: "Level 70+, Season 1-10 Elite Passes, rare skins included.",
    price: 150.0,
    discountedPrice: 125.0,
    thumbnail: "https://picsum.photos/seed/acc1/800/450",
    imageHint: "game account",
    tags: ["Premium", "Rare"]
  }
];
