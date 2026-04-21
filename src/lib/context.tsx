
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  useUser, 
  useAuth, 
  useDatabase
} from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { 
  ref, 
  onValue, 
  push, 
  set, 
  query, 
  orderByChild, 
  equalTo,
  serverTimestamp,
  update
} from 'firebase/database';
import { toast } from '@/hooks/use-toast';

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
  createdAt: any;
  paymentMethod: string;
  gameDetails?: any;
};

type StoreSettings = {
  isLive: boolean;
  announcementTicker?: string;
};

type UserProfile = {
  uid: string;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: number;
  lastLogin?: number;
};

type AppContextType = {
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  orders: Order[];
  allUsers: UserProfile[];
  createOrder: (paymentMethod: string, gameDetails: any) => void;
  storeSettings: StoreSettings;
  updateStoreSettings: (settings: Partial<StoreSettings>) => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const auth = useAuth();
  const rtdb = useDatabase();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({ isLive: true });

  // Sync user profile from RTDB
  useEffect(() => {
    if (!rtdb || !user) {
      setUserProfile(null);
      return;
    }
    const userRef = ref(rtdb, `users/${user.uid}`);
    return onValue(userRef, (snapshot) => {
      setUserProfile(snapshot.val());
    });
  }, [rtdb, user]);

  // Sync global store settings
  useEffect(() => {
    if (!rtdb) return;
    const settingsRef = ref(rtdb, 'settings');
    return onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStoreSettings(prev => ({ ...prev, ...data }));
      }
    });
  }, [rtdb]);

  const enhancedUser = useMemo(() => {
    if (!user) return null;
    const isAdmin = user.email === 'admin@lp.com' || userProfile?.isAdmin;
    return {
      ...user,
      isAdmin,
      name: user.displayName || userProfile?.name || user.email?.split('@')[0],
    };
  }, [user, userProfile]);

  // Sync orders from RTDB
  useEffect(() => {
    if (!rtdb || !user) {
      setOrders([]);
      return;
    }
    const ordersRef = ref(rtdb, 'orders');
    const userOrdersQuery = query(ordersRef, orderByChild('userId'), equalTo(user.uid));
    
    return onValue(userOrdersQuery, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setOrders([]);
        return;
      }
      const orderList = Object.entries(data).map(([id, val]: [string, any]) => ({
        id,
        ...val
      })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setOrders(orderList);
    });
  }, [rtdb, user]);

  // Sync ALL users for Admin
  useEffect(() => {
    if (!rtdb || !enhancedUser?.isAdmin) {
      setAllUsers([]);
      return;
    }
    const usersRef = ref(rtdb, 'users');
    return onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setAllUsers([]);
        return;
      }
      const userList = Object.entries(data).map(([id, val]: [string, any]) => ({
        uid: id,
        ...val
      })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setAllUsers(userList);
    });
  }, [rtdb, enhancedUser]);

  useEffect(() => {
    const savedCart = localStorage.getItem('oskar_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  const login = async (email: string, password: string) => {
    if (!auth) return;
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string, name: string) => {
    if (!auth || !rtdb) return;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;
    
    await updateProfile(newUser, { displayName: name });
    
    await set(ref(rtdb, `users/${newUser.uid}`), {
      uid: newUser.uid,
      email,
      name,
      isAdmin: email === 'admin@lp.com',
      createdAt: serverTimestamp()
    });
  };

  const loginWithGoogle = async () => {
    if (!auth || !rtdb) return;
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    const userRef = ref(rtdb, `users/${user.uid}`);
    await update(userRef, {
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      isAdmin: user.email === 'admin@lp.com',
      lastLogin: serverTimestamp()
    });
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
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

  const createOrder = (paymentMethod: string, gameDetails: any) => {
    if (!rtdb || !user) return;

    const orderData = {
      userId: user.uid,
      items: cart,
      total: cart.reduce((acc, i) => acc + (i.price * i.quantity), 0),
      status: 'pending',
      createdAt: serverTimestamp(),
      paymentMethod,
      gameDetails,
    };

    const ordersRef = ref(rtdb, 'orders');
    push(ordersRef, orderData)
      .then(() => {
        clearCart();
      })
      .catch((error) => {
        console.error("Order creation failed:", error);
        toast({
          variant: "destructive",
          title: "Order Failed",
          description: "Could not process your order. Please try again."
        });
      });
  };

  const updateStoreSettings = async (settings: Partial<StoreSettings>) => {
    if (!rtdb || !enhancedUser?.isAdmin) return;
    const settingsRef = ref(rtdb, 'settings');
    await update(settingsRef, settings);
  };

  return (
    <AppContext.Provider value={{ 
      user: enhancedUser, 
      loading,
      login, 
      signup,
      loginWithGoogle,
      logout, 
      cart, 
      addToCart, 
      removeFromCart, 
      clearCart, 
      orders, 
      allUsers,
      createOrder,
      storeSettings,
      updateStoreSettings
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
