
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  useUser, 
  useAuth, 
  useDatabase
} from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
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
  logout: () => Promise<void>;
  cart: CartItem[];
  buyNow: (item: Omit<CartItem, 'quantity'>) => void;
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
  messages: ChatMessage[];
  allChatSessions: ChatSession[];
  chatTargetId: string | null;
  setChatTargetId: (uid: string | null) => void;
  sendMessage: (text?: string, imageUrl?: string, targetUserId?: string) => Promise<void>;
  markMessagesAsRead: (targetUserId?: string) => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const auth = useAuth();
  const rtdb = useDatabase();
  const pathname = usePathname();
  const router = useRouter();
  
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

  const [chatTargetId, setChatTargetId] = useState<string | null>(null);
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
      if (['home', 'games', 'profile', 'chat'].includes(hash)) {
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
    if (tab === 'chat' && user && !userProfile?.isAdmin) {
      setChatTargetId(user.uid);
    }
  };

  useEffect(() => {
    const cachedCart = localStorage.getItem('oskar_cart');
    if (cachedCart) setCart(JSON.parse(cachedCart));
  }, []);

  useEffect(() => {
    if (settingsFetched && productsFetched) {
      setIsInitialLoading(false);
    }
  }, [settingsFetched, productsFetched]);

  useEffect(() => {
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
    if (storeSettings.isLive === false) {
      setHasNotifiedThisSession(false);
    }
    prevIsLiveRef.current = storeSettings.isLive;
  }, [storeSettings.isLive, storeSettings.logo, hasNotifiedThisSession]);

  useEffect(() => {
    if (!rtdb) return;
    const settingsRef = ref(rtdb, 'settings');
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setStoreSettings(prev => ({ ...prev, ...data }));
      setSettingsFetched(true);
    });
    return () => unsubscribe();
  }, [rtdb]);

  useEffect(() => {
    if (!rtdb) return;
    const productsRef = ref(rtdb, 'products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setProducts([]);
      } else {
        const productList = Object.entries(data).map(([id, val]: [string, any]) => ({ ...val, id }));
        setProducts(productList);
      }
      setProductsFetched(true);
    });
    return () => unsubscribe();
  }, [rtdb]);

  useEffect(() => {
    if (!rtdb || !user) {
      setUserProfile(null);
      return;
    }
    const userRef = ref(rtdb, `users/${user.uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      setUserProfile(data);
    });
    return () => unsubscribe();
  }, [rtdb, user]);

  useEffect(() => {
    if (!rtdb || !user) {
      setMessages([]);
      return;
    }
    const effectiveTargetId = (userProfile?.isAdmin && chatTargetId) ? chatTargetId : user.uid;
    const chatRef = query(ref(rtdb, `chats/${effectiveTargetId}`), limitToLast(50));
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setMessages([]);
      } else {
        const msgList = Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }));
        setMessages(msgList);
        const lastMsg = msgList[msgList.length - 1];
        if (lastMsg && lastMsg.senderId !== user.uid && !lastMsg.isRead && lastMsg.id !== lastMessageNotifiedRef.current) {
          if (activeTab !== 'chat' && pathname !== '/admin') {
             if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                const options = {
                  body: lastMsg.text || "📷 Image received",
                  icon: storeSettings.logo || "https://placehold.co/192x192/7C3AED/FFFFFF/png?text=O",
                  tag: 'chat-msg',
                  renotify: true
                };
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.ready.then(reg => reg.showNotification("New Message", options));
                } else {
                  new Notification("New Message", options);
                }
                lastMessageNotifiedRef.current = lastMsg.id;
             }
          }
        }
      }
    });
    return () => unsubscribe();
  }, [rtdb, user, chatTargetId, userProfile, activeTab, pathname, storeSettings.logo]);

  useEffect(() => {
    if (!rtdb || !userProfile?.isAdmin) {
      setAllUsers([]);
      setAllOrders([]);
      setAllChatSessions([]);
      return;
    }
    const usersRef = ref(rtdb, 'users');
    const ordersRef = ref(rtdb, 'orders');
    const indexRef = ref(rtdb, 'chatIndex');
    const unsubUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      setAllUsers(data ? Object.values(data) : []);
    });
    const unsubOrders = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      setAllOrders(data ? Object.entries(data).map(([id, val]: [string, any]) => ({ ...val, id })) : []);
    });
    const unsubChatIndex = onValue(indexRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sessions = Object.entries(data).map(([userId, val]: [string, any]) => ({ userId, ...val }))
          .sort((a, b) => b.lastTimestamp - a.lastTimestamp);
        setAllChatSessions(sessions);
      } else {
        setAllChatSessions([]);
      }
    });
    return () => {
      unsubUsers();
      unsubOrders();
      unsubChatIndex();
    };
  }, [rtdb, userProfile]);

  useEffect(() => {
    if (!rtdb || !user) return;
    const userOrdersRef = query(ref(rtdb, 'orders'), orderByChild('userId'), equalTo(user.uid));
    const unsubscribe = onValue(userOrdersRef, (snapshot) => {
      const data = snapshot.val();
      setOrders(data ? Object.entries(data).map(([id, val]: [string, any]) => ({ ...val, id })) : []);
    });
    return () => unsubscribe();
  }, [rtdb, user]);

  const enhancedUser = useMemo(() => {
    if (!user) return null;
    return {
      ...user,
      isAdmin: userProfile?.isAdmin || user.email === 'admin@lp.com',
      isBanned: userProfile?.isBanned,
      name: userProfile?.name || user.displayName || user.email?.split('@')[0],
      photoURL: userProfile?.photoURL || user.photoURL,
    };
  }, [user, userProfile]);

  const sendMessage = async (text?: string, imageUrl?: string, targetUserId?: string) => {
    if (!rtdb || !user) return;
    const chatUserId = targetUserId || (userProfile?.isAdmin ? chatTargetId : user.uid);
    if (!chatUserId) return;
    const msgData: any = {
      senderId: user.uid,
      timestamp: serverTimestamp(),
      isRead: false
    };
    if (text) msgData.text = text;
    if (imageUrl) msgData.imageUrl = imageUrl;
    const chatRef = ref(rtdb, `chats/${chatUserId}`);
    await push(chatRef, msgData);
    const indexRef = ref(rtdb, `chatIndex/${chatUserId}`);
    const updates: any = {
      lastMessage: text || "📷 Image",
      lastTimestamp: Date.now(),
      userName: userProfile?.isAdmin ? (allChatSessions.find(s => s.userId === chatUserId)?.userName || "User") : enhancedUser?.name,
      userPhoto: userProfile?.isAdmin ? (allChatSessions.find(s => s.userId === chatUserId)?.userPhoto || "") : enhancedUser?.photoURL,
    };
    if (!userProfile?.isAdmin) {
      const current = allChatSessions.find(s => s.userId === user.uid);
      updates.unreadCount = (current?.unreadCount || 0) + 1;
    }
    await update(indexRef, updates);
  };

  const markMessagesAsRead = async (targetUserId?: string) => {
    if (!rtdb || !user) return;
    const chatUserId = targetUserId || user.uid;
    await update(ref(rtdb, `chatIndex/${chatUserId}`), { unreadCount: 0 });
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

  const logout = async () => {
    if (!auth) return;
    setIsGlobalLoading(true);
    try {
      await signOut(auth);
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const buyNow = (item: Omit<CartItem, 'quantity'>) => {
    const directItem = { ...item, quantity: 1 };
    setCart([directItem]);
    localStorage.setItem('oskar_cart', JSON.stringify([directItem]));
    router.push('/checkout');
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
      gameDetails: gameDetails || {},
    };
    push(ref(rtdb, 'orders'), orderData).then(() => {
      clearCart();
      setActiveTab('profile'); 
    });
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    if (!rtdb) return;
    await update(ref(rtdb, `orders/${orderId}`), { status });
  };

  const updateUserStatus = async (uid: string, updates: Partial<UserProfile>) => {
    if (!rtdb) return;
    await update(ref(rtdb, `users/${uid}`), updates);
  };

  const deleteUser = async (uid: string) => {
    if (!rtdb) return;
    await remove(ref(rtdb, `users/${uid}`));
  };

  const saveProduct = async (product: Partial<GamePackage>) => {
    if (!rtdb) return;
    const id = product.id || `prod_${Date.now()}`;
    await set(ref(rtdb, `products/${id}`), { ...product, id });
  };

  const deleteProduct = async (id: string) => {
    if (!rtdb) return;
    await remove(ref(rtdb, `products/${id}`));
  };

  const updateStoreSettings = async (settings: Partial<StoreSettings>) => {
    if (!rtdb) return;
    await update(ref(rtdb, 'settings'), settings);
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
      logout, 
      cart, 
      buyNow,
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
      messages,
      allChatSessions,
      chatTargetId,
      setChatTargetId,
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
