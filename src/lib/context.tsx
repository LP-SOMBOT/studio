
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
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
  remove,
  limitToLast
} from 'firebase/database';
import { toast } from '@/hooks/use-toast';
import { type GamePackage } from './games-data';

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
  photoURL?: string;
};

type ChatMessage = {
  id?: string;
  text?: string;
  imageUrl?: string;
  senderId: string;
  timestamp: any;
  isRead: boolean;
};

type ChatSession = {
  userId: string;
  userName: string;
  lastMessage: string;
  lastTimestamp: number;
  unreadCount: number;
  userPhoto?: string;
};

type AppContextType = {
  user: any;
  loading: boolean;
  isGlobalLoading: boolean;
  isInitialLoading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
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
  // Chat
  messages: ChatMessage[];
  allChatSessions: ChatSession[];
  sendMessage: (text?: string, imageUrl?: string, targetUserId?: string) => Promise<void>;
  markMessagesAsRead: (targetUserId?: string) => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const auth = useAuth();
  const rtdb = useDatabase();
  const pathname = usePathname();
  
  const [activeTab, setActiveTabState] = useState('home');
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<GamePackage[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({ 
    isLive: false,
    onboardingImages: [],
    sliderImages: []
  });

  // Chat States
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [allChatSessions, setAllChatSessions] = useState<ChatSession[]>([]);

  const [settingsFetched, setSettingsFetched] = useState(false);
  const [productsFetched, setProductsFetched] = useState(false);
  
  const prevIsLiveRef = useRef<boolean | null>(null);
  const [hasNotifiedThisSession, setHasNotifiedThisSession] = useState(false);
  const lastMessageNotifiedRef = useRef<string | null>(null);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (['home', 'games', 'cart', 'profile', 'chat'].includes(hash)) {
        setActiveTabState(hash);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    window.location.hash = tab === 'home' ? '' : tab;
  };

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

  useEffect(() => {
    if (settingsFetched && productsFetched) {
      setIsInitialLoading(false);
    }
  }, [settingsFetched, productsFetched]);

  // Push Notifications Logic (Live & Chat)
  useEffect(() => {
    // 1. LIVE NOTIFICATIONS
    if (storeSettings.isLive === true && !hasNotifiedThisSession && prevIsLiveRef.current === false) {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        const notifyLive = () => {
          const options = {
            body: "Join our TikTok challenge now and win exclusive diamonds & rewards!",
            icon: storeSettings.logo || "https://placehold.co/192x192/7C3AED/FFFFFF/png?text=O",
            tag: 'store-live',
            renotify: true
          };
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(reg => reg.showNotification("Oskar Shop is LIVE! 🔴", options));
          } else {
            new Notification("Oskar Shop is LIVE! 🔴", options);
          }
          setHasNotifiedThisSession(true);
        };
        notifyLive();
      }
    }
    if (storeSettings.isLive === false) setHasNotifiedThisSession(false);
    prevIsLiveRef.current = storeSettings.isLive;
  }, [storeSettings.isLive, storeSettings.logo, hasNotifiedThisSession]);

  // 2. CHAT NOTIFICATIONS
  useEffect(() => {
    if (!user || !messages.length) return;
    const lastMsg = messages[messages.length - 1];
    
    // Only notify if: Received message AND it's new AND app not currently focused on chat
    if (lastMsg.senderId !== user.uid && !lastMsg.isRead && lastMsg.id !== lastMessageNotifiedRef.current) {
      if (pathname !== '/chat' && activeTab !== 'chat') {
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          const notifyChat = () => {
            const options = {
              body: lastMsg.text || "📷 Image received",
              icon: storeSettings.logo || "https://placehold.co/192x192/7C3AED/FFFFFF/png?text=O",
              tag: 'chat-msg',
              renotify: true
            };
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then(reg => reg.showNotification("New Message from Oskar Shop", options));
            } else {
              new Notification("New Message from Oskar Shop", options);
            }
            lastMessageNotifiedRef.current = lastMsg.id || null;
          };
          notifyChat();
        }
      }
    }
  }, [messages, user, pathname, activeTab, storeSettings.logo]);

  useEffect(() => {
    if (storeSettings) localStorage.setItem('oskar_settings', JSON.stringify(storeSettings));
  }, [storeSettings]);

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
      setSettingsFetched(true);
    });
  }, [rtdb]);

  useEffect(() => {
    if (!rtdb) return;
    const productsRef = ref(rtdb, 'products');
    return onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setProducts([]);
      } else {
        const productList = Object.entries(data).map(([id, val]: [string, any]) => ({ ...val, id }));
        setProducts(productList);
      }
      setProductsFetched(true);
    });
  }, [rtdb]);

  // Chat Data Sync
  useEffect(() => {
    if (!rtdb || !user) {
      setMessages([]);
      return;
    }
    const targetId = user.uid;
    const chatRef = query(ref(rtdb, `chats/${targetId}`), limitToLast(50));
    return onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setMessages([]);
      } else {
        const msgList = Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }));
        setMessages(msgList);
      }
    });
  }, [rtdb, user]);

  // Admin Chat Index Sync
  useEffect(() => {
    if (!rtdb || !userProfile?.isAdmin) {
      setAllChatSessions([]);
      return;
    }
    const indexRef = ref(rtdb, 'chatIndex');
    return onValue(indexRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setAllChatSessions([]);
      } else {
        const sessions = Object.entries(data).map(([userId, val]: [string, any]) => ({ userId, ...val }))
          .sort((a, b) => b.lastTimestamp - a.lastTimestamp);
        setAllChatSessions(sessions);
      }
    });
  }, [rtdb, userProfile]);

  const enhancedUser = useMemo(() => {
    if (!user) return null;
    const isAdmin = user.email === 'admin@lp.com' || userProfile?.isAdmin;
    return {
      ...user,
      isAdmin,
      isBanned: userProfile?.isBanned,
      phoneNumber: userProfile?.phoneNumber,
      name: user.displayName || userProfile?.name || user.email?.split('@')[0],
      photoURL: user.photoURL || userProfile?.photoURL,
    };
  }, [user, userProfile]);

  const sendMessage = async (text?: string, imageUrl?: string, targetUserId?: string) => {
    if (!rtdb || !user) return;
    const chatUserId = targetUserId || user.uid;
    const msgData: ChatMessage = {
      text,
      imageUrl,
      senderId: user.uid,
      timestamp: serverTimestamp(),
      isRead: false
    };

    const chatRef = ref(rtdb, `chats/${chatUserId}`);
    await push(chatRef, msgData);

    // Update Index for Admin view
    const indexRef = ref(rtdb, `chatIndex/${chatUserId}`);
    const updates: any = {
      lastMessage: text || "📷 Image",
      lastTimestamp: Date.now(),
      userName: enhancedUser?.name || "Guest",
      userPhoto: enhancedUser?.photoURL || "",
    };
    
    // If user sent it, increment unread for admin
    if (user.uid === chatUserId) {
      const currentSession = allChatSessions.find(s => s.userId === chatUserId);
      updates.unreadCount = (currentSession?.unreadCount || 0) + 1;
    }

    await update(indexRef, updates);
  };

  const markMessagesAsRead = async (targetUserId?: string) => {
    if (!rtdb || !user) return;
    const chatUserId = targetUserId || user.uid;
    
    // Reset index count
    if (enhancedUser?.isAdmin || user.uid === chatUserId) {
      await update(ref(rtdb, `chatIndex/${chatUserId}`), { unreadCount: 0 });
    }

    // Mark last 10 messages as read locally/remote
    // (In a real app, we'd iterate all unread, here we just do simple index reset)
  };

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
    push(ordersRef, orderData).then(() => {
      clearCart();
      setActiveTab('profile'); 
    });
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    if (!rtdb || !enhancedUser?.isAdmin) return;
    await update(ref(rtdb, `orders/${orderId}`), { status });
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
  };

  const deleteProduct = async (id: string) => {
    if (!rtdb || !enhancedUser?.isAdmin) return;
    await remove(ref(rtdb, `products/${id}`));
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
      isInitialLoading,
      activeTab,
      setActiveTab,
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
      updateStoreSettings,
      // Chat
      messages,
      allChatSessions,
      sendMessage,
      markMessagesAsRead
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
