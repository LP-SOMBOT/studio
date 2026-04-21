"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
};

type CartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  gameId: string;
  details?: Record<string, string>;
};

type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'successful' | 'cancelled';
  createdAt: string;
};

type AppContextType = {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  orders: Order[];
  createOrder: (paymentMethod: string, details?: Record<string, string>) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Load from local storage on mount
    const savedUser = localStorage.getItem('oskar_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    const savedCart = localStorage.getItem('oskar_cart');
    if (savedCart) setCart(JSON.parse(savedCart));

    const savedOrders = localStorage.getItem('oskar_orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  const login = (email: string) => {
    const newUser = { id: 'u1', name: email.split('@')[0], email, isAdmin: email.includes('admin') };
    setUser(newUser);
    localStorage.setItem('oskar_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('oskar_user');
  };

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      let updated;
      if (existing) {
        updated = prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        updated = [...prev, { ...item, quantity: 1 }];
      }
      localStorage.setItem('oskar_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const updated = prev.filter(i => i.id !== id);
      localStorage.setItem('oskar_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('oskar_cart');
  };

  const createOrder = (paymentMethod: string, details?: Record<string, string>) => {
    if (!user) return;
    const newOrder: Order = {
      id: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      userId: user.id,
      items: cart.map(i => ({...i, details})),
      total: cart.reduce((acc, i) => acc + (i.price * i.quantity), 0),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('oskar_orders', JSON.stringify(updatedOrders));
    clearCart();
  };

  return (
    <AppContext.Provider value={{ user, login, logout, cart, addToCart, removeFromCart, clearCart, orders, createOrder }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
