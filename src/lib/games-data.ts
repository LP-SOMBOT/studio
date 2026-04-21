// This file defines the GamePackage type. 
// Demo data has been removed for production readiness.

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

// Start with an empty library. Admin will add products via the dashboard.
export const GAMES_DATA: GamePackage[] = [];
