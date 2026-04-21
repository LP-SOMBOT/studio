
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
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
  update,
  remove
} from 'firebase/database';
import { toast } from '@/hooks/use-toast';
import { GAMES_DATA, type GamePackage } from './games-data';

type CartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  gameId: string;
  thumbnail?: string;
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
  logo?: string;
  onboardingImages?: string[];
  sliderImages?: string[];
};

type UserProfile = {
  uid: string;
  email: string;
  name: string;
  isAdmin: boolean;
  isBanned?: boolean;
  phoneNumber?: string;
  createdAt: number;
  lastLogin?: number;
};

type AppContextType = {
  user: any;
  loading: boolean;
  isGlobalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, phone: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  orders: Order[];
  allOrders: Order[];
  products: GamePackage[];
  allUsers: UserProfile[];
  createOrder: (paymentMethod: string, gameDetails: any) => void;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  updateUserStatus: (uid: string, updates: Partial<UserProfile>) => Promise<void>;
  deleteUser: (uid: string) => Promise<void>;
  saveProduct: (product: Partial<GamePackage>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  storeSettings: StoreSettings;
  updateStoreSettings: (settings: Partial<StoreSettings>) => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const auth = useAuth();
  const rtdb = useDatabase();
  const pathname = usePathname();
  
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<GamePackage[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({ 
    isLive: true,
    onboardingImages: [],
    sliderImages: []
  });

  // Hydrate from LocalStorage for speed
  useEffect(() => {
    const cachedCart = localStorage.getItem('oskar_cart');
    if (cachedCart) setCart(JSON.parse(cachedCart));

    const cachedSettings = localStorage.getItem('oskar_settings');
    if (cachedSettings) setStoreSettings(JSON.parse(cachedSettings));

    const cachedProducts = localStorage.getItem('oskar_products');
    if (cachedProducts) setProducts(JSON.parse(cachedProducts));

    const cachedProfile = localStorage.getItem('oskar_user_profile');
    if (cachedProfile) setUserProfile(JSON.parse(cachedProfile));
  }, []);

  // Sync RTDB state to LocalStorage
  useEffect(() => {
    if (storeSettings) localStorage.setItem('oskar_settings', JSON.stringify(storeSettings));
  }, [storeSettings]);

  useEffect(() => {
    if (products.length > 0) localStorage.setItem('oskar_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    if (userProfile) localStorage.setItem('oskar_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Handle route change loading
  useEffect(() => {
    setIsGlobalLoading(false);
  }, [pathname]);

  useEffect(() => {
    if (!rtdb || !user) {
      setUserProfile(null);
      localStorage.removeItem('oskar_user_profile');
      return;
    }
    const userRef = ref(rtdb, `users/${user.uid}`);
    return onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      setUserProfile(data);
    });
  }, [rtdb, user]);

  useEffect(() => {
    if (!rtdb) return;
    const settingsRef = ref(rtdb, 'settings');
    return onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setStoreSettings(prev => ({ ...prev, ...data }));
    });
  }, [rtdb]);

  useEffect(() => {
    if (!rtdb) return;
    const productsRef = ref(rtdb, 'products');
    return onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        GAMES_DATA.forEach(p => set(ref(rtdb, `products/${p.id}`), p));
        setProducts(GAMES_DATA);
      } else {
        const productList = Object.entries(data).map(([id, val]: [string, any]) => ({ ...val, id }));
        setProducts(productList);
      }
    });
  }, [rtdb]);

  const enhancedUser = useMemo(() => {
    if (!user) return null;
    const isAdmin = user.email === 'admin@lp.com' || userProfile?.isAdmin;
    return {
      ...user,
      isAdmin,
      isBanned: userProfile?.isBanned,
      phoneNumber: userProfile?.phoneNumber,
      name: user.displayName || userProfile?.name || user.email?.split('@')[0],
    };
  }, [user, userProfile]);

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
      const orderList = Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setOrders(orderList);
    });
  }, [rtdb, user]);

  useEffect(() => {
    if (!rtdb || !enhancedUser?.isAdmin) {
      setAllOrders([]);
      return;
    }
    const ordersRef = ref(rtdb, 'orders');
    return onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setAllOrders([]);
        return;
      }
      const orderList = Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setAllOrders(orderList);
    });
  }, [rtdb, enhancedUser]);

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
      const userList = Object.entries(data).map(([id, val]: [string, any]) => ({ uid: id, ...val }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setAllUsers(userList);
    });
  }, [rtdb, enhancedUser]);

  const login = async (email: string, password: string) => {
    if (!auth) return;
    setIsGlobalLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, phone: string) => {
    if (!auth || !rtdb) return;
    setIsGlobalLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      await updateProfile(newUser, { displayName: name });
      await set(ref(rtdb, `users/${newUser.uid}`), {
        uid: newUser.uid,
        email,
        name,
        phoneNumber: phone,
        isAdmin: email === 'admin@lp.com',
        createdAt: serverTimestamp()
      });
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    if (!auth || !rtdb) return;
    setIsGlobalLoading(true);
    try {
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
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const logout = async () => {
    if (!auth) return;
    setIsGlobalLoading(true);
    try {
      await signOut(auth);
    } finally {
      setIsGlobalLoading(false);
    }
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
    push(ordersRef, orderData).then(() => clearCart());
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    if (!rtdb || !enhancedUser?.isAdmin) return;
    await update(ref(rtdb, `orders/${orderId}`), { status });
    toast({ title: "Order Status Updated", description: `Order is now ${status}` });
  };

  const updateUserStatus = async (uid: string, updates: Partial<UserProfile>) => {
    if (!rtdb || !enhancedUser?.isAdmin) return;
    await update(ref(rtdb, `users/${uid}`), updates);
  };

  const deleteUser = async (uid: string) => {
    if (!rtdb || !enhancedUser?.isAdmin) return;
    await remove(ref(rtdb, `users/${uid}`));
  };

  const saveProduct = async (product: Partial<GamePackage>) => {
    if (!rtdb || !enhancedUser?.isAdmin) return;
    const id = product.id || `prod_${Date.now()}`;
    await set(ref(rtdb, `products/${id}`), { ...product, id });
    toast({ title: "Product Saved" });
  };

  const deleteProduct = async (id: string) => {
    if (!rtdb || !enhancedUser?.isAdmin) return;
    await remove(ref(rtdb, `products/${id}`));
    toast({ title: "Product Removed" });
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
      isGlobalLoading,
      setGlobalLoading: setIsGlobalLoading,
      login, 
      signup,
      loginWithGoogle,
      logout, 
      cart, 
      addToCart, 
      removeFromCart, 
      clearCart, 
      orders, 
      allOrders,
      products,
      allUsers,
      createOrder,
      updateOrderStatus,
      updateUserStatus,
      deleteUser,
      saveProduct,
      deleteProduct,
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
