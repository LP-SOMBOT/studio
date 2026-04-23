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

// Always empty. Real data is loaded from Firebase Realtime Database.
export const GAMES_DATA: GamePackage[] = [];
