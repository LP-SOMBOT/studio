
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
  update,
  remove,
  limitToLast,
  increment,
  off,
  get
} from 'firebase/database';
import { toast } from '@/hooks/use-toast';
import { type GamePackage } from './games-data';

export const safeGet = (obj: any, path: string, fallback: any = "") => {
  return path.split('.').reduce((acc, key) => acc?.[key] ?? fallback, obj);
};

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
  createdAt: number;
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
  points: number;
  createdAt: number;
  photoURL?: string;
  gameName?: string;
  gameUid?: string;
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
  products: GamePackage[];
  allUsers: UserProfile[];
  accountPosts: AccountPost[];
  notifications: AppNotification[];
  events: GameEvent[];
  createOrder: (paymentMethod: string, gameDetails: any, directItem: CartItem) => Promise<void>;
  postAccount: (data: Partial<AccountPost>) => Promise<void>;
  updateAccountPost: (postId: string, data: Partial<AccountPost>) => Promise<void>;
  deleteAccountPost: (postId: string) => Promise<void>;
  buyAccountPost: (post: AccountPost) => void;
  markNotificationsAsRead: (notifId?: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  updateAccountPostStatus: (postId: string, status: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  deleteUser: (uid: string) => Promise<void>;
  saveProduct: (product: Partial<GamePackage>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  saveEvent: (event: Partial<GameEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  storeSettings: StoreSettings;
  updateStoreSettings: (settings: any) => Promise<void>;
  broadcastNotification: (title: string, body: string, target?: string) => Promise<void>;
  messages: any[];
  allChatSessions: any[];
  chatTargetId: string | null;
  setChatTargetId: (uid: string | null) => void;
  sendMessage: (text?: string, imageUrl?: string, targetUserId?: string) => Promise<void>;
  markMessagesAsRead: (targetUserId?: string) => Promise<void>;
  refreshAdminData: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const auth = useAuth();
  const rtdb = useDatabase();
  const router = useRouter();
  const pathname = usePathname();
  
  const [activeTab, setActiveTabState] = useState('home');
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<GamePackage[]>([]);
  const [accountPosts, setAccountPosts] = useState<AccountPost[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({});
  const [chatTargetId, setChatTargetId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [allChatSessions, setAllChatSessions] = useState<any[]>([]);

  useEffect(() => {
    const handleHash = () => {
      const hash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
      const validTabs = ['home', 'games', 'accounts', 'ranking', 'profile', 'chat', 'notifications', 'orders'];
      if (validTabs.includes(hash)) setActiveTabState(hash);
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      const isSpecialFlow = pathname === "/checkout" || pathname === "/checkout-account" || pathname.startsWith("/accounts/");
      if (isSpecialFlow || pathname !== '/') {
        router.push(tab === 'home' ? '/' : `/#${tab}`);
      } else {
        window.location.hash = tab === 'home' ? '' : tab;
      }
    }
  };

  useEffect(() => {
    if (!rtdb) return;
    const settingsRef = ref(rtdb, 'settings');
    const productsRef = ref(rtdb, 'products');
    const accPostsRef = ref(rtdb, 'accountPosts');
    const eventsRef = ref(rtdb, 'events');
    const usersRef = ref(rtdb, 'users');

    onValue(settingsRef, (s) => setStoreSettings(s.val() || {}));
    onValue(productsRef, (s) => setProducts(s.val() ? Object.entries(s.val()).map(([id, v]: any) => ({ ...v, id })) : []));
    onValue(accPostsRef, (s) => setAccountPosts(s.val() ? Object.entries(s.val()).map(([id, v]: any) => ({ ...v, id })) : []));
    onValue(eventsRef, (s) => setEvents(s.val() ? Object.entries(s.val()).map(([id, v]: any) => ({ ...v, id })) : []));
    onValue(usersRef, (s) => {
      if (s.val()) {
        const users = Object.entries(s.val()).map(([uid, v]: any) => ({
          ...v,
          uid: v.uid || uid
        }));
        setAllUsers(users);
      } else {
        setAllUsers([]);
      }
    });

    const timer = setTimeout(() => setIsInitialLoading(false), 1500);

    return () => {
      off(settingsRef);
      off(productsRef);
      off(accPostsRef);
      off(eventsRef);
      off(usersRef);
      clearTimeout(timer);
    };
  }, [rtdb]);

  useEffect(() => {
    if (!rtdb || !user) {
      setUserProfile(null);
      setNotifications([]);
      setOrders([]);
      return;
    }
    const profileRef = ref(rtdb, `users/${user.uid}`);
    const notifsRef = query(ref(rtdb, `notifications/${user.uid}`), limitToLast(30));
    const userOrdersRef = query(ref(rtdb, 'orders'), orderByChild('userId'), equalTo(user.uid));

    onValue(profileRef, (s) => setUserProfile(s.val()));
    onValue(notifsRef, (s) => setNotifications(s.val() ? Object.entries(s.val()).map(([id, v]: any) => ({ ...v, id })).sort((a,b) => b.createdAt - a.createdAt) : []));
    onValue(userOrdersRef, (s) => setOrders(s.val() ? Object.entries(s.val()).map(([id, v]: any) => ({ ...v, id })).sort((a,b) => b.createdAt - a.createdAt) : []));

    return () => {
      off(profileRef);
      off(notifsRef);
      off(userOrdersRef);
    };
  }, [rtdb, user]);

  const enhancedUser = useMemo(() => {
    if (!user) return null;
    return { ...user, ...userProfile, isAdmin: userProfile?.role === 'admin' || userProfile?.role === 'super_admin' };
  }, [user, userProfile]);

  // Robust REAL-TIME Admin Listener
  useEffect(() => {
    const isPinAuthorized = typeof window !== 'undefined' && sessionStorage.getItem("admin_pin_access") === "granted";
    
    if (!rtdb || (!enhancedUser?.isAdmin && !isPinAuthorized)) {
      if (allOrders.length > 0) setAllOrders([]);
      return;
    }

    const allOrdersRef = ref(rtdb, 'orders');
    const chatIndexRef = ref(rtdb, 'chatIndex');

    const unsubscribeOrders = onValue(allOrdersRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const sorted = Object.entries(val)
          .map(([id, v]: any) => ({ ...v, id }))
          .sort((a, b) => b.createdAt - a.createdAt);
        setAllOrders(sorted);
      } else {
        setAllOrders([]);
      }
    });

    const unsubscribeChat = onValue(chatIndexRef, (snapshot) => {
      const val = snapshot.val();
      setAllChatSessions(val ? Object.entries(val).map(([userId, v]: any) => ({ userId, ...v })).sort((a,b) => b.lastTimestamp - a.lastTimestamp) : []);
    });

    return () => {
      off(allOrdersRef, 'value', unsubscribeOrders);
      off(chatIndexRef, 'value', unsubscribeChat);
    };
  }, [rtdb, enhancedUser?.isAdmin, pathname]);

  const refreshAdminData = () => {
    if (!rtdb) return;
    get(ref(rtdb, 'orders')).then(s => {
      const val = s.val();
      if (val) setAllOrders(Object.entries(val).map(([id, v]: any) => ({ ...v, id })).sort((a,b) => b.createdAt - a.createdAt));
    });
  };

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
    try { 
      await signOut(auth); 
      router.push('/login');
    } finally { setIsGlobalLoading(false); }
  };

  const buyNow = (item: any) => {
    router.push(`/checkout?id=${item.id}`);
  };

  const createOrder = async (paymentMethod: string, gameDetails: any, directItem: CartItem) => {
    if (!rtdb || !user) return;
    const orderId = push(ref(rtdb, 'orders')).key;
    const newOrder: Order = {
      id: orderId!,
      userId: user.uid,
      items: [directItem],
      total: directItem.price,
      status: 'pending',
      createdAt: Date.now(),
      paymentMethod,
      gameDetails
    };
    await set(ref(rtdb, `orders/${orderId}`), newOrder);
  };

  const postAccount = async (data: any) => {
    if (!rtdb || !user) return;
    await push(ref(rtdb, 'accountPosts'), {
      ...data,
      uid: user.uid,
      authorName: enhancedUser?.name,
      authorAvatar: enhancedUser?.photoURL,
      status: 'pending',
      createdAt: Date.now(),
      views: 0,
      sold: false
    });
    toast({ title: "Successfully posted!", description: "Waiting for admin approval." });
  };

  const updateAccountPost = async (pid: string, data: any) => {
    if (!rtdb) return;
    const { price, totalCharge, fee, ...editableData } = data;
    await update(ref(rtdb, `accountPosts/${pid}`), editableData);
    toast({ title: "Post Updated!" });
  };

  const deleteAccountPost = async (pid: string) => {
    if (!rtdb) return;
    await remove(ref(rtdb, `accountPosts/${pid}`));
    toast({ title: "Post Deleted" });
  };

  const buyAccountPost = (post: any) => {
    router.push(`/checkout-account?id=${post.id}`);
  };

  const broadcastNotification = async (title: string, body: string, target?: string) => {
    if (!rtdb) return;
    const targetUids = target ? [target] : allUsers.map(u => u.uid);
    const updates: any = {};
    targetUids.forEach(uid => {
      const nid = push(ref(rtdb, `notifications/${uid}`)).key;
      updates[`notifications/${uid}/${nid}`] = { 
        title, body, read: false, createdAt: Date.now(), type: 'broadcast', linkTo: '#notifications' 
      };
    });
    await update(ref(rtdb), updates);
  };

  const updateOrderStatus = async (oid: string, status: string) => {
    if (!rtdb) return;
    
    // Fetch current state to determine point reversal logic
    const orderSnap = await get(ref(rtdb, `orders/${oid}`));
    const orderData = orderSnap.val();
    if (!orderData) return;
    
    const oldStatus = orderData.status;
    const userId = orderData.userId;
    
    await update(ref(rtdb, `orders/${oid}`), { status });
    
    if (userId) {
      if (oldStatus !== 'successful' && status === 'successful') {
        // Just turned successful -> Reward point
        await update(ref(rtdb, `users/${userId}`), { points: increment(1) });
        const nid = push(ref(rtdb, `notifications/${userId}`)).key;
        await set(ref(rtdb, `notifications/${userId}/${nid}`), {
          type: 'order_status',
          title: "Order Successful! ✅",
          body: `Your items have been delivered. You earned 1 point!`,
          read: false,
          createdAt: Date.now(),
          linkTo: '#orders'
        });
      } else if (oldStatus === 'successful' && status !== 'successful') {
        // Was successful, now it's cancelled/revoked -> Reverse point
        await update(ref(rtdb, `users/${userId}`), { points: increment(-1) });
        const nid = push(ref(rtdb, `notifications/${userId}`)).key;
        await set(ref(rtdb, `notifications/${userId}/${nid}`), {
          type: 'order_status',
          title: "Order Update: Points Revoked ⚠️",
          body: `Your order was marked as ${status}. 1 point was deducted from your balance.`,
          read: false,
          createdAt: Date.now(),
          linkTo: '#orders'
        });
      } else if (oldStatus !== status) {
        // Other status changes
        const nid = push(ref(rtdb, `notifications/${userId}`)).key;
        await set(ref(rtdb, `notifications/${userId}/${nid}`), {
          type: 'order_status',
          title: "Order Progress Update",
          body: `Your order is now being ${status}.`,
          read: false,
          createdAt: Date.now(),
          linkTo: '#orders'
        });
      }
    }
  };

  const updateAccountPostStatus = async (pid: string, status: string) => {
    if (!rtdb) return;
    await update(ref(rtdb, `accountPosts/${pid}`), { status });
  };

  const updateUserProfile = async (updates: any) => {
    if (!rtdb || !user) return;
    await update(ref(rtdb, `users/${user.uid}`), updates);
    toast({ title: "Profile updated!" });
  };

  const markNotificationsAsRead = async (nid?: string) => {
    if (!rtdb || !user) return;
    if (nid) await update(ref(rtdb, `notifications/${user.uid}/${nid}`), { read: true });
    else {
      const updates: any = {};
      notifications.forEach(n => updates[`notifications/${user.uid}/${n.id}/read`] = true);
      await update(ref(rtdb), updates);
    }
  };

  const sendMessage = async (text?: string, imageUrl?: string, targetId?: string) => {
    if (!rtdb || !user) return;
    const tid = targetId || (enhancedUser?.isAdmin ? chatTargetId : user.uid);
    if (!tid) return;
    const msg: any = { senderId: user.uid, timestamp: Date.now(), isRead: false };
    if (text) msg.text = text;
    if (imageUrl) msg.imageUrl = imageUrl;
    await push(ref(rtdb, `chats/${tid}`), msg);
    await update(ref(rtdb, `chatIndex/${tid}`), {
      lastMessage: text || "📷 Screenshot",
      lastTimestamp: Date.now(),
      unreadCount: increment(1),
      userName: enhancedUser?.isAdmin ? (allChatSessions.find(s => s.userId === tid)?.userName || "User") : enhancedUser?.name,
      userPhoto: enhancedUser?.isAdmin ? (allChatSessions.find(s => s.userId === tid)?.userPhoto || "") : enhancedUser?.photoURL
    });
  };

  const markMessagesAsRead = async (tid?: string) => {
    if (!rtdb || !user) return;
    const id = tid || user.uid;
    await update(ref(rtdb, `chatIndex/${id}`), { unreadCount: 0 });
  };

  const saveProduct = async (p: any) => {
    if (!rtdb) return;
    const { id, ...data } = p;
    const cleanData: any = {};
    Object.keys(data).forEach(key => {
      const val = data[key];
      if (val !== undefined && val !== null && val !== "" && !Number.isNaN(val)) {
        cleanData[key] = val;
      }
    });

    if (id) {
      await update(ref(rtdb, `products/${id}`), cleanData);
    } else {
      await push(ref(rtdb, 'products'), cleanData);
    }
  };

  const deleteProduct = async (id: string) => remove(ref(rtdb, `products/${id}`));
  const deleteUser = async (uid: string) => remove(ref(rtdb, `users/${uid}`));
  const updateStoreSettings = async (s: any) => update(ref(rtdb, 'settings'), s);

  return (
    <AppContext.Provider value={{ 
      user: enhancedUser, loading, isGlobalLoading, isInitialLoading, activeTab, setActiveTab, setGlobalLoading: setIsGlobalLoading,
      login, signup, logout, buyNow, orders, allOrders, products, allUsers, accountPosts, notifications, events,
      createOrder, postAccount, updateAccountPost, deleteAccountPost, buyAccountPost, markNotificationsAsRead, updateOrderStatus, updateAccountPostStatus, 
      updateUserProfile, deleteUser, saveProduct, deleteProduct, saveEvent: async()=>{}, deleteEvent: async()=>{}, storeSettings, updateStoreSettings, 
      broadcastNotification, messages, allChatSessions, chatTargetId, setChatTargetId, sendMessage, markMessagesAsRead, refreshAdminData
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
