
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
  limitToLast,
  increment
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

type AccountPost = {
  id: string;
  uid: string;
  authorName: string;
  authorAvatar?: string;
  platform: string;
  level: number;
  age: string;
  primeLevel: number;
  items: string[];
  price: number;
  fee: number;
  totalCharge: number;
  thumbnailUrl: string;
  imageUrls: string[];
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  views: number;
  sold: boolean;
};

type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: number;
  linkTo: string;
  icon?: string;
};

type GameEvent = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  type: 'freefire_event' | 'general';
  active: boolean;
  startDate?: string;
  endDate?: string;
};

type StoreSettings = {
  isLive: boolean;
  announcementTicker?: string;
  logo?: string;
  onboardingImages?: string[];
  sliderImages?: string[];
  appStatus?: {
    offline: boolean;
    offlineTitle?: string;
    offlineBody?: string;
    offlineImageUrl?: string;
  };
  config?: {
    shop?: {
      feeType: 'percentage' | 'fixed';
      feeValue: number;
    };
    adminSettings?: {
      pin: string;
    };
  };
};

type UserProfile = {
  uid: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'super_admin';
  isBanned?: boolean;
  phoneNumber?: string;
  points: number;
  createdAt: number;
  lastLogin?: number;
  photoURL?: string;
  gameName?: string;
  gameUid?: string;
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
  buyNow: (item: Omit<CartItem, 'quantity'>) => void;
  orders: Order[];
  allOrders: Order[];
  accountOrders: any[];
  allAccountOrders: any[];
  products: GamePackage[];
  allUsers: UserProfile[];
  accountPosts: AccountPost[];
  notifications: AppNotification[];
  events: GameEvent[];
  createOrder: (paymentMethod: string, gameDetails: any, directItem: CartItem) => void;
  postAccount: (data: Partial<AccountPost>) => Promise<void>;
  buyAccountPost: (post: AccountPost) => void;
  completeAccountOrder: (orderId: string, credentials: any) => Promise<void>;
  markNotificationsAsRead: (notifId?: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  updateAccountPostStatus: (postId: string, status: string) => Promise<void>;
  updateUserStatus: (uid: string, updates: Partial<UserProfile>) => Promise<void>;
  deleteUser: (uid: string) => Promise<void>;
  saveProduct: (product: Partial<GamePackage>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  saveEvent: (event: Partial<GameEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  storeSettings: StoreSettings;
  updateStoreSettings: (settings: any) => Promise<void>;
  broadcastNotification: (title: string, body: string, target?: string) => Promise<void>;
  messages: ChatMessage[];
  allChatSessions: ChatSession[];
  chatTargetId: string | null;
  setChatTargetId: (uid: string | null) => void;
  sendMessage: (text?: string, imageUrl?: string, targetUserId?: string) => Promise<void>;
  markMessagesAsRead: (targetUserId?: string) => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const safeGet = (obj: any, path: string, fallback: any = "") => {
  return path.split('.').reduce((acc, key) => acc?.[key] ?? fallback, obj);
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const auth = useAuth();
  const rtdb = useDatabase();
  const pathname = usePathname();
  const router = useRouter();
  
  const [activeTab, setActiveTabState] = useState('home');
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [accountOrders, setAccountOrders] = useState<any[]>([]);
  const [allAccountOrders, setAllAccountOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<GamePackage[]>([]);
  const [accountPosts, setAccountPosts] = useState<AccountPost[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({});

  const [chatTargetId, setChatTargetId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [allChatSessions, setAllChatSessions] = useState<ChatSession[]>([]);

  // Hash handling
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      const validTabs = ['home', 'games', 'accounts', 'ranking', 'profile', 'chat', 'notifications'];
      if (validTabs.includes(hash)) {
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

  // Real-time Settings
  useEffect(() => {
    if (!rtdb) return;
    const settingsRef = ref(rtdb, 'settings');
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setStoreSettings(data);
      setIsInitialLoading(false);
    });
    return () => unsubscribe();
  }, [rtdb]);

  // Real-time Products
  useEffect(() => {
    if (!rtdb) return;
    const refPath = ref(rtdb, 'products');
    const unsubscribe = onValue(refPath, (snapshot) => {
      const data = snapshot.val();
      setProducts(data ? Object.entries(data).map(([id, val]: any) => ({ ...val, id })) : []);
    });
    return () => unsubscribe();
  }, [rtdb]);

  // Real-time Account Posts
  useEffect(() => {
    if (!rtdb) return;
    const refPath = ref(rtdb, 'accountPosts');
    const unsubscribe = onValue(refPath, (snapshot) => {
      const data = snapshot.val();
      setAccountPosts(data ? Object.entries(data).map(([id, val]: any) => ({ ...val, id })) : []);
    });
    return () => unsubscribe();
  }, [rtdb]);

  // Real-time Events
  useEffect(() => {
    if (!rtdb) return;
    const refPath = ref(rtdb, 'events');
    const unsubscribe = onValue(refPath, (snapshot) => {
      const data = snapshot.val();
      setEvents(data ? Object.entries(data).map(([id, val]: any) => ({ ...val, id })) : []);
    });
    return () => unsubscribe();
  }, [rtdb]);

  // Real-time User Profile & Notifications
  useEffect(() => {
    if (!rtdb || !user) {
      setUserProfile(null);
      setNotifications([]);
      return;
    }
    const userRef = ref(rtdb, `users/${user.uid}`);
    const unsubProfile = onValue(userRef, (snapshot) => {
      setUserProfile(snapshot.val());
    });
    
    const notifsRef = query(ref(rtdb, `notifications/${user.uid}`), limitToLast(30));
    const unsubNotifs = onValue(notifsRef, (snapshot) => {
      const data = snapshot.val();
      setNotifications(data ? Object.entries(data).map(([id, val]: any) => ({ ...val, id })).sort((a,b) => b.createdAt - a.createdAt) : []);
    });
    
    return () => {
      unsubProfile();
      unsubNotifs();
    };
  }, [rtdb, user]);

  // Admin Specific Listeners
  useEffect(() => {
    if (!rtdb || userProfile?.role !== 'admin' && userProfile?.role !== 'super_admin') {
      setAllUsers([]);
      setAllOrders([]);
      setAllAccountOrders([]);
      setAllChatSessions([]);
      return;
    }
    const unsubUsers = onValue(ref(rtdb, 'users'), s => setAllUsers(s.val() ? Object.values(s.val()) : []));
    const unsubOrders = onValue(ref(rtdb, 'orders'), s => setAllOrders(s.val() ? Object.entries(s.val()).map(([id, v]: any) => ({ ...v, id })) : []));
    const unsubAccOrders = onValue(ref(rtdb, 'accountOrders'), s => setAllAccountOrders(s.val() ? Object.entries(s.val()).map(([id, v]: any) => ({ ...v, id })) : []));
    const unsubChatIndex = onValue(ref(rtdb, 'chatIndex'), s => setAllChatSessions(s.val() ? Object.entries(s.val()).map(([userId, v]: any) => ({ userId, ...v })).sort((a,b) => b.lastTimestamp - a.lastTimestamp) : []));
    
    return () => {
      unsubUsers();
      unsubOrders();
      unsubAccOrders();
      unsubChatIndex();
    };
  }, [rtdb, userProfile]);

  // User Specific Orders
  useEffect(() => {
    if (!rtdb || !user) return;
    const unsubOrders = onValue(query(ref(rtdb, 'orders'), orderByChild('userId'), equalTo(user.uid)), s => setOrders(s.val() ? Object.entries(s.val()).map(([id, v]: any) => ({ ...v, id })) : []));
    const unsubAccOrders = onValue(query(ref(rtdb, 'accountOrders'), orderByChild('buyerUid'), equalTo(user.uid)), s => setAccountOrders(s.val() ? Object.entries(s.val()).map(([id, v]: any) => ({ ...v, id })) : []));
    return () => {
      unsubOrders();
      unsubAccOrders();
    };
  }, [rtdb, user]);

  // Chat Logic
  useEffect(() => {
    if (!rtdb || !user) return;
    const effectiveTargetId = (userProfile?.role === 'admin' && chatTargetId) ? chatTargetId : user.uid;
    const unsubChat = onValue(query(ref(rtdb, `chats/${effectiveTargetId}`), limitToLast(50)), (snapshot) => {
      const data = snapshot.val();
      setMessages(data ? Object.entries(data).map(([id, val]: any) => ({ id, ...val })) : []);
    });
    return () => unsubChat();
  }, [rtdb, user, chatTargetId, userProfile]);

  const enhancedUser = useMemo(() => {
    if (!user) return null;
    return {
      ...user,
      ...userProfile,
      name: userProfile?.name || user.displayName || user.email?.split('@')[0],
      photoURL: userProfile?.photoURL || user.photoURL,
    };
  }, [user, userProfile]);

  // Actions
  const login = async (e: string, p: string) => {
    setIsGlobalLoading(true);
    try { await signInWithEmailAndPassword(auth, e, p); } finally { setIsGlobalLoading(false); }
  };

  const signup = async (e: string, p: string, n: string, ph: string) => {
    setIsGlobalLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, e, p);
      await updateProfile(cred.user, { displayName: n });
      await set(ref(rtdb, `users/${cred.user.uid}`), {
        uid: cred.user.uid,
        email: e,
        name: n,
        phoneNumber: ph,
        role: 'user',
        points: 0,
        createdAt: Date.now()
      });
    } finally { setIsGlobalLoading(false); }
  };

  const logout = async () => {
    setIsGlobalLoading(true);
    try { await signOut(auth); } finally { setIsGlobalLoading(false); }
  };

  const buyNow = (item: Omit<CartItem, 'quantity'>) => {
    router.push('/checkout?id=' + item.id);
  };

  const createOrder = async (pm: string, gd: any, item: CartItem) => {
    if (!rtdb || !user) return;
    const data = {
      userId: user.uid,
      items: [item],
      total: item.price,
      status: 'pending',
      createdAt: Date.now(),
      paymentMethod: pm,
      gameDetails: gd
    };
    await push(ref(rtdb, 'orders'), data);
    toast({ title: "Dalabkaaga waa la gudbiyay!" });
    setActiveTab('profile');
  };

  const postAccount = async (data: any) => {
    if (!rtdb || !user) return;
    const postData = {
      ...data,
      uid: user.uid,
      authorName: enhancedUser?.name,
      authorAvatar: enhancedUser?.photoURL,
      status: 'pending',
      createdAt: Date.now(),
      views: 0,
      sold: false
    };
    await push(ref(rtdb, 'accountPosts'), postData);
    toast({ title: "Codsigaagu waa la diray!" });
  };

  const buyAccountPost = (post: AccountPost) => {
    router.push(`/checkout-account?id=${post.id}`);
  };

  const updateOrderStatus = async (oid: string, status: string) => {
    if (!rtdb) return;
    await update(ref(rtdb, `orders/${oid}`), { status });
    if (status === 'successful') {
      const orderRef = ref(rtdb, `orders/${oid}`);
      onValue(orderRef, (s) => {
        const o = s.val();
        if (o?.userId) {
          update(ref(rtdb, `users/${o.userId}`), { points: increment(1) });
        }
      }, { onlyOnce: true });
    }
  };

  const markNotificationsAsRead = async (nid?: string) => {
    if (!rtdb || !user) return;
    if (nid) {
      await update(ref(rtdb, `notifications/${user.uid}/${nid}`), { read: true });
    } else {
      const updates: any = {};
      notifications.forEach(n => { updates[`notifications/${user.uid}/${n.id}/read`] = true; });
      await update(ref(rtdb), updates);
    }
  };

  const sendMessage = async (text?: string, imageUrl?: string, targetUserId?: string) => {
    if (!rtdb || !user) return;
    const tid = targetUserId || (userProfile?.role === 'admin' ? chatTargetId : user.uid);
    if (!tid) return;
    const msg: any = { senderId: user.uid, timestamp: Date.now(), isRead: false };
    if (text) msg.text = text;
    if (imageUrl) msg.imageUrl = imageUrl;
    await push(ref(rtdb, `chats/${tid}`), msg);
    
    await update(ref(rtdb, `chatIndex/${tid}`), {
      lastMessage: text || "📷 Image",
      lastTimestamp: Date.now(),
      userName: userProfile?.role === 'admin' ? (allChatSessions.find(s => s.userId === tid)?.userName || "User") : enhancedUser?.name,
      userPhoto: userProfile?.role === 'admin' ? (allChatSessions.find(s => s.userId === tid)?.userPhoto || "") : enhancedUser?.photoURL,
      unreadCount: increment(1)
    });
  };

  const markMessagesAsRead = async (tid?: string) => {
    if (!rtdb || !user) return;
    const id = tid || user.uid;
    await update(ref(rtdb, `chatIndex/${id}`), { unreadCount: 0 });
  };

  const broadcastNotification = async (title: string, body: string, target?: string) => {
    if (!rtdb) return;
    const usersToNotify = target ? [target] : allUsers.map(u => u.uid);
    const updates: any = {};
    usersToNotify.forEach(uid => {
      const nid = push(ref(rtdb, `notifications/${uid}`)).key;
      updates[`notifications/${uid}/${nid}`] = { title, body, read: false, createdAt: Date.now(), type: 'broadcast' };
    });
    await update(ref(rtdb), updates);
  };

  // Other admin actions
  const saveProduct = async (p: any) => p.id ? update(ref(rtdb, `products/${p.id}`), p) : push(ref(rtdb, 'products'), p);
  const deleteProduct = async (id: string) => remove(ref(rtdb, `products/${id}`));
  const saveEvent = async (e: any) => e.id ? update(ref(rtdb, `events/${e.id}`), e) : push(ref(rtdb, 'events'), e);
  const deleteEvent = async (id: string) => remove(ref(rtdb, `events/${id}`));
  const updateStoreSettings = async (s: any) => update(ref(rtdb, 'settings'), s);
  const updateAccountPostStatus = async (pid: string, s: string) => update(ref(rtdb, `accountPosts/${pid}`), { status: s });
  const completeAccountOrder = async (oid: string, creds: any) => update(ref(rtdb, `accountOrders/${oid}`), { credentials: creds, status: 'completed' });
  const updateUserStatus = async (uid: string, u: any) => update(ref(rtdb, `users/${uid}`), u);
  const deleteUser = async (uid: string) => remove(ref(rtdb, `users/${uid}`));

  return (
    <AppContext.Provider value={{ 
      user: enhancedUser, loading, isGlobalLoading, isInitialLoading, activeTab, setActiveTab, setGlobalLoading: setIsGlobalLoading,
      login, signup, logout, buyNow, orders, allOrders, accountOrders, allAccountOrders, products, allUsers, accountPosts, notifications, events,
      createOrder, postAccount, buyAccountPost, completeAccountOrder, markNotificationsAsRead, updateOrderStatus, updateAccountPostStatus, 
      updateUserStatus, deleteUser, saveProduct, deleteProduct, saveEvent, deleteEvent, storeSettings, updateStoreSettings, broadcastNotification,
      messages, allChatSessions, chatTargetId, setChatTargetId, sendMessage, markMessagesAsRead
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
