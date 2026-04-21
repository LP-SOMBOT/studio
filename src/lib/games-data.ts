import { PlaceHolderImages } from "./placeholder-images";

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

export const GAMES_DATA: GamePackage[] = [
  {
    id: "ff-110",
    gameId: "freefire",
    category: 'top-up',
    title: "110 Diamonds",
    description: "Direct top-up via Player ID. Fast and secure delivery.",
    price: 1.2,
    thumbnail: PlaceHolderImages.find(img => img.id === 'freefire-logo')?.imageUrl || "https://picsum.photos/seed/ff/400/400",
    imageHint: "free fire",
    tags: ["Popular", "Instant"]
  },
  {
    id: "ff-583",
    gameId: "freefire",
    category: 'top-up',
    title: "583 Diamonds",
    description: "Special event bonus included. Requires Player ID.",
    price: 5.5,
    thumbnail: PlaceHolderImages.find(img => img.id === 'freefire-logo')?.imageUrl || "https://picsum.photos/seed/ff/400/400",
    imageHint: "free fire",
    tags: ["Bonus"]
  },
  {
    id: "ff-weekly",
    gameId: "freefire",
    category: 'top-up',
    title: "Weekly Pass",
    description: "Get 450 Diamonds total over 7 days. Best value!",
    price: 2.5,
    thumbnail: PlaceHolderImages.find(img => img.id === 'freefire-logo')?.imageUrl || "https://picsum.photos/seed/ff/400/400",
    imageHint: "free fire",
    tags: ["Best Value"]
  },
  {
    id: "ff-monthly",
    gameId: "freefire",
    category: 'top-up',
    title: "Monthly Pass",
    description: "2600 Diamonds total. The ultimate gaming subscription.",
    price: 10.0,
    discountedPrice: 8.99,
    thumbnail: PlaceHolderImages.find(img => img.id === 'freefire-logo')?.imageUrl || "https://picsum.photos/seed/ffm/400/400",
    imageHint: "free fire",
    tags: ["Hot"]
  },
  {
    id: "bs-base",
    gameId: "bloodstrike",
    category: 'top-up',
    title: "60 Gold Coins",
    description: "Blood Strike direct top-up. Global region supported.",
    price: 0.99,
    thumbnail: PlaceHolderImages.find(img => img.id === 'bloodstrike-logo')?.imageUrl || "https://picsum.photos/seed/bs/400/400",
    imageHint: "blood strike"
  },
  {
    id: "ef-100",
    gameId: "efootball",
    category: 'top-up',
    title: "100 eFootball Coins",
    description: "Konami eFootball 2024 Coins. Instant delivery.",
    price: 0.99,
    thumbnail: PlaceHolderImages.find(img => img.id === 'efootball-logo')?.imageUrl || "https://picsum.photos/seed/ef/400/400",
    imageHint: "efootball"
  },
  {
    id: "ef-500",
    gameId: "efootball",
    category: 'top-up',
    title: "500 eFootball Coins",
    description: "Premium currency for your dream team.",
    price: 4.99,
    thumbnail: PlaceHolderImages.find(img => img.id === 'ef5/400/400')?.imageUrl || "https://picsum.photos/seed/ef5/400/400",
    imageHint: "efootball"
  },
  {
    id: "ff-acc-rare",
    gameId: "freefire-acc",
    category: 'accounts',
    title: "Rare Account Bundle",
    description: "Level 70+, Season 1-10 Elite Passes, rare skins included.",
    price: 150.0,
    discountedPrice: 125.0,
    thumbnail: PlaceHolderImages.find(img => img.id === 'acc-1')?.imageUrl || "https://picsum.photos/seed/acc1/800/450",
    imageHint: "game account",
    tags: ["Premium", "Rare"]
  },
  {
    id: "ff-acc-starter",
    gameId: "freefire-acc",
    category: 'accounts',
    title: "Starter Pro Account",
    description: "Level 40+, decent collection of skins, competitive ready.",
    price: 45.0,
    thumbnail: PlaceHolderImages.find(img => img.id === 'acc-2')?.imageUrl || "https://picsum.photos/seed/acc2/800/450",
    imageHint: "game profile"
  }
];
