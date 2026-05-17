
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  get,
  runTransaction
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
  processedBy?: {
    uid: string;
    name: string;
    photoURL?: string;
  };
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
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  createdAt: number;
  views: number;
  sold: boolean;
  processedBy?: {
    uid: string;
    name: string;
    photoURL?: string;
  };
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
  isAdminOnly?: boolean;
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

type Banner = {
  id: string;
  imageUrl: string;
  linkTo?: string;
  active: boolean;
  createdAt: number;
};

type StoreSettings = {
  isLive: boolean;
  announcementTicker?: string;
  logo?: string;
  paymentNumber?: string;
  onboardingImages?: string[];
  sliderImages?: string[]; 
  appStatus?: {
    offline: boolean;
    offlineTitle?: string;
    offlineBody?: string;
    offlineImageUrl?: string;
  };
  helpLinks?: {
    tutorialUrl?: string;
    whatsappNumber?: string;
    tiktokUrl?: string;
  };
  config?: {
    shop?: {
      feeType: 'percentage' | 'fixed';
      feeValue: number;
      listingFee?: number;
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
  role: 'user' | 'staff' | 'admin' | 'super_admin';
  points: number;
  createdAt: number;
  photoURL?: string;
  gameName?: string;
  gameUid?: string;
  phoneNumber?: string;
  banned?: boolean;
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
  adminNotifications: AppNotification[];
  events: GameEvent[];
  banners: Banner[];
  createOrder: (paymentMethod: string, gameDetails: any, directItem: CartItem) => Promise<void>;
  postAccount: (data: Partial<AccountPost>) => Promise<void>;
  updateAccountPost: (postId: string, data: Partial<AccountPost>) => Promise<void>;
  deleteAccountPost: (postId: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  buyAccountPost: (post: AccountPost) => void;
  markNotificationsAsRead: (notifId?: string) => Promise<void>;
  markAdminNotificationsAsRead: (notifId?: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  updateAccountPostStatus: (postId: string, status: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  manageUser: (uid: string, updates: Partial<UserProfile>) => Promise<void>;
  deleteUser: (uid: string) => Promise<void>;
  saveProduct: (product: Partial<GamePackage>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  saveEvent: (event: Partial<GameEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  saveBanner: (banner: Partial<Banner>) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  storeSettings: StoreSettings;
  updateStoreSettings: (settings: any) => Promise<void>;
  broadcastNotification: (title: string, body: string, target?: string) => Promise<void>;
  broadcastAdminNotification: (title: string, body: string, skipPush?: boolean) => Promise<void>;
  messages: any[];
  allChatSessions: any[];
  chatTargetId: string | null;
  setChatTargetId: (uid: string | null) => void;
  sendMessage: (text?: string, imageUrl?: string, targetUserId?: string) => Promise<void>;
  markMessagesAsRead: (targetUserId?: string) => Promise<void>;
  refreshAdminData: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const USER_CACHE_KEY = 'oskar_user_cache';
const SETTINGS_CACHE_KEY = 'oskar_settings_cache';
const PRODUCTS_CACHE_KEY = 'oskar_products_cache';
const EVENTS_CACHE_KEY = 'oskar_events_cache';
const BANNERS_CACHE_KEY = 'oskar_banners_cache';
const THEME_CACHE_KEY = 'oskar_theme_cache';

const getCache = (key: string, fallback: any = null) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
};

const setCache = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e: any) {
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        localStorage.removeItem(PRODUCTS_CACHE_KEY);
        localStorage.removeItem(EVENTS_CACHE_KEY);
        localStorage.removeItem(BANNERS_CACHE_KEY);
        try {
          if (key === SETTINGS_CACHE_KEY || key === USER_CACHE_KEY || key === THEME_CACHE_KEY) {
            localStorage.setItem(key, JSON.stringify(data));
          }
        } catch {}
      }
    }
  }
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const auth = useAuth();
  const rtdb = useDatabase();
  const router = useRouter();
  const pathname = usePathname();
  
  const [activeTab, setActiveTabState] = useState('home');
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getCache(THEME_CACHE_KEY, 'light'));
  
  const [syncStatus, setSyncStatus] = useState({
    settings: false,
    products: false,
    accPosts: false,
    events: false,
    banners: false,
    allUsers: false
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => getCache(SETTINGS_CACHE_KEY, {}));
  const [products, setProducts] = useState<GamePackage[]>(() => getCache(PRODUCTS_CACHE_KEY, []));
  const [accountPosts, setAccountPosts] = useState<AccountPost[]>([]);
  const [events, setEvents] = useState<GameEvent[]>(() => getCache(EVENTS_CACHE_KEY, []));
  const [banners, setBanners] = useState<Banner[]>(() => getCache(BANNERS_CACHE_KEY, []));
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => getCache(USER_CACHE_KEY));
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<AppNotification[]>([]);
  const [chatTargetId, setChatTargetId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [allChatSessions, setAllChatSessions] = useState<any[]>([]);

  // Internal Session Management for Notifications
  const sessionStartTime = useRef(Date.now());
  const lastNotifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      setCache(THEME_CACHE_KEY, theme);
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const isInitialLoading = useMemo(() => {
    return !syncStatus.settings || !syncStatus.products || !syncStatus.banners || !syncStatus.events;
  }, [syncStatus]);

  // Robust Push Notification Implementation using Service Worker
  const showPushNotification = useCallback((title: string, body: string, id: string) => {
    if (typeof window === 'undefined') return;
    
    // Uniqueness check for current session
    if (lastNotifiedRef.current.has(id)) return;
    lastNotifiedRef.current.add(id);

    // Standard Browser Notification check
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const logo = storeSettings.logo || "https://placehold.co/192x192/0EA5E9/FFFFFF/png?text=O";

    // Attempt to use Service Worker registration (Better for background/minimized state)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon: logo,
          badge: logo,
          tag: id, // Prevent duplicate alerts for the same ID
          vibrate: [200, 100, 200],
          requireInteraction: true
        });
      }).catch(() => {
        // Fallback to standard if SW is not ready
        new Notification(title, { body, icon: logo });
      });
    } else {
      new Notification(title, { body, icon: logo });
    }
  }, [storeSettings.logo]);

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

  const setActiveTab = useCallback((tab: string) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      const isSpecialFlow = pathname === "/checkout" || pathname === "/checkout-account" || pathname.startsWith("/accounts/");
      if (isSpecialFlow || pathname !== '/') {
        router.push(tab === 'home' ? '/' : `/#${tab}`);
      } else {
        window.location.hash = tab === 'home' ? '' : tab;
      }
    }
  }, [pathname, router]);

  useEffect(() => {
    if (!rtdb) return;
    
    const settingsRef = ref(rtdb, 'settings');
    const productsRef = ref(rtdb, 'products');
    const accPostsRef = ref(rtdb, 'accountPosts');
    const eventsRef = ref(rtdb, 'events');
    const bannersRef = ref(rtdb, 'banners');
    const usersRef = ref(rtdb, 'users');

    const unsubSettings = onValue(settingsRef, (s) => {
      const data = s.val() || {};
      
      // Real-time Background Alerts for Live/Online Status
      if (syncStatus.settings) {
        if (data.isLive && !storeSettings.isLive) {
          showPushNotification("Oskar is LIVE Now! 🔴", "Join us on TikTok for exclusive rewards and diamonds!", "live-ticker-" + Date.now());
        }
        if (data.appStatus?.offline === false && storeSettings.appStatus?.offline === true) {
          showPushNotification("Oskar Shop is Online! ✅", "We are back! You can now resume your top-ups and purchases.", "online-alert-" + Date.now());
        }
      }

      setStoreSettings(data);
      setCache(SETTINGS_CACHE_KEY, data);
      setSyncStatus(prev => ({ ...prev, settings: true }));
    });

    const unsubProducts = onValue(productsRef, (s) => {
      const data = s.val() ? Object.entries(s.val()).map(([id, v]: any) => ({ ...v, id })) : [];
      setProducts(data);
      setCache(PRODUCTS_CACHE_KEY, data);
      setSyncStatus(prev => ({ ...prev, products: true }));
    });

    const unsubAccPosts = onValue(accPostsRef, (s) => {
      const data = s.val() ? Object.entries(s.val()).map(([id, v]: any) => ({ ...v, id })) : [];
      setAccountPosts(data);
      setSyncStatus(prev => ({ ...prev, accPosts: true }));
    });

    const unsubEvents = onValue(eventsRef, (s) => {
      const data = s.val() ? Object.entries(s.val()).map(([id, v]: any) => ({ ...v, id })) : [];
      setEvents(data);
      setCache(EVENTS_CACHE_KEY, data);
      setSyncStatus(prev => ({ ...prev, events: true }));
    });

    const unsubBanners = onValue(bannersRef, (s) => {
      const data = s.val() ? Object.entries(s.val()).map(([id, v]: any) => ({ ...v, id })) : [];
      setBanners(data);
      setCache(BANNERS_CACHE_KEY, data);
      setSyncStatus(prev => ({ ...prev, banners: true }));
    });

    const unsubUsers = onValue(usersRef, (s) => {
      if (s.val()) {
        const users = Object.entries(s.val()).map(([uid, v]: any) => ({
          ...v,
          uid: v.uid || uid
        }));
        setAllUsers(users);
      } else {
        setAllUsers([]);
      }
      setSyncStatus(prev => ({ ...prev, allUsers: true }));
    });

    return () => {
      off(settingsRef);
      off(productsRef);
      off(accPostsRef);
      off(eventsRef);
      off(bannersRef);
      off(usersRef);
    };
  }, [rtdb, syncStatus.settings, storeSettings.isLive, storeSettings.appStatus?.offline, showPushNotification]);

  useEffect(() => {
    if (!rtdb || !user) {
      setUserProfile(null);
      setNotifications([]);
      setOrders([]);
      return;
    }
    const profileRef = ref(rtdb, `users/${user.uid}`);
    const notifsRef = query(ref(rtdb, `notifications/${user.uid}`), limitToLast(20));
    const userOrdersRef = query(ref(rtdb, 'orders'), orderByChild('userId'), equalTo(user.uid));

    onValue(profileRef, (s) => {
      const data = s.val();
      setUserProfile(data);
      if (data) setCache(USER_CACHE_KEY, data);
      if (data?.banned) {
        toast({ title: "Account Banned", description: "Your account has been suspended.", variant: "destructive" });
        logout();
      }
    });

    // Dedicated Real-time System Notification Listener
    onValue(notifsRef, (s) => {
      const data = s.val() ? Object.entries(s.val()).map(([id, v]: any) => ({ ...v, id })).sort((a,b) => b.createdAt - a.createdAt) : [];
      
      // Trigger browser notification for fresh messages
      if (data.length > 0) {
        const latest = data[0];
        // Rules: Must be unread AND must be newer than the time the app session started
        if (!latest.read && latest.createdAt > sessionStartTime.current) {
          showPushNotification(latest.title, latest.body, "oskar-notif-" + latest.id);
        }
      }

      setNotifications(data);
    });

    onValue(userOrdersRef, (s) => {
      const data = s.val() ? Object.entries(s.val()).map(([id, v]: any) => ({ ...v, id })).sort((a,b) => b.createdAt - a.createdAt) : [];
      setOrders(data);
    });

    return () => {
      off(profileRef);
      off(notifsRef);
      off(userOrdersRef);
    };
  }, [rtdb, user, showPushNotification]);

  const enhancedUser = useMemo(() => {
    if (!user) return null;
    const role = userProfile?.role || 'user';
    return { 
      ...user, 
      ...userProfile, 
      isAdmin: role === 'admin' || role === 'super_admin' || role === 'staff' 
    };
  }, [user, userProfile]);

  useEffect(() => {
    // Admin Panel Restricted Access Logic
    if (!rtdb || !enhancedUser?.isAdmin) {
      if (allOrders.length > 0) setAllOrders([]);
      setAdminNotifications([]);
      return;
    }
    const allOrdersRef = ref(rtdb, 'orders');
    const chatIndexRef = ref(rtdb, 'chatIndex');
    const adminNotifsRef = query(ref(rtdb, 'adminNotifications'), limitToLast(30));

    const unsubscribeOrders = onValue(allOrdersRef, (snapshot) => {
      const val = snapshot.val();
      if (val) setAllOrders(Object.entries(val).map(([id, v]: any) => ({ ...v, id })).sort((a, b) => b.createdAt - a.createdAt));
      else setAllOrders([]);
    });

    const unsubscribeChat = onValue(chatIndexRef, (snapshot) => {
      const val = snapshot.val();
      setAllChatSessions(val ? Object.entries(val).map(([userId, v]: any) => ({ userId, ...v })).sort((a,b) => b.lastTimestamp - a.lastTimestamp) : []);
    });

    const unsubscribeAdminNotifs = onValue(adminNotifsRef, (snapshot) => {
      const data = snapshot.val() ? Object.entries(snapshot.val()).map(([id, v]: any) => ({ ...v, id })).sort((a,b) => b.createdAt - a.createdAt) : [];
      
      // Admin Push Notifications Logic
      if (data.length > 0) {
        const latest = data[0];
        if (!latest.readBy?.[enhancedUser.uid] && latest.createdAt > sessionStartTime.current) {
          // Rule: Skip push for assignment updates
          if (latest.type !== 'assignment_update') {
            showPushNotification(latest.title, latest.body, "admin-push-" + latest.id);
          }
        }
      }
      setAdminNotifications(data);
    });

    return () => {
      off(allOrdersRef, 'value', unsubscribeOrders);
      off(chatIndexRef, 'value', unsubscribeChat);
      off(adminNotifsRef, 'value', unsubscribeAdminNotifs);
    };
  }, [rtdb, enhancedUser, pathname, showPushNotification]);

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
      const profile = {
        uid: cred.user.uid,
        email: e,
        name: n,
        phoneNumber: ph,
        role: 'user',
        points: 0,
        createdAt: Date.now()
      };
      await set(ref(rtdb, `users/${cred.user.uid}`), profile);
      setCache(USER_CACHE_KEY, profile);
    } finally { setIsGlobalLoading(false); }
  };

  const logout = async () => {
    setIsGlobalLoading(true);
    try { 
      localStorage.removeItem(USER_CACHE_KEY);
      await signOut(auth); 
      router.push('/login');
    } finally { setIsGlobalLoading(false); }
  };

  const buyNow = (item: any) => {
    if (!user) {
      toast({ title: "Fadlan soo gal", description: "Waa inaad soo gashaa si aad wax u iibsato.", variant: "destructive" });
      router.push('/login');
      return;
    }
    router.push(`/checkout?id=${item.id}`);
  };

  const createOrder = async (paymentMethod: string, gameDetails: any, directItem: CartItem) => {
    if (!rtdb || !user) return;
    
    const counterRef = ref(rtdb, 'settings/orderCounter');
    let sequenceId = 10;
    
    try {
      const result = await runTransaction(counterRef, (currentValue) => {
        if (currentValue === null || typeof currentValue !== 'number' || currentValue < 10) {
          return 10;
        }
        return currentValue + 1;
      });
      
      if (result.committed) {
        sequenceId = result.snapshot.val();
      }
    } catch (e) {
      sequenceId = Date.now();
    }

    const orderId = `iibinta${sequenceId}`;
    
    const newOrder: Order = {
      id: orderId,
      userId: user.uid,
      items: [directItem],
      total: directItem.price,
      status: 'pending',
      createdAt: Date.now(),
      paymentMethod,
      gameDetails
    };
    await set(ref(rtdb, `orders/${orderId}`), newOrder);

    // Notify Admins of New Order
    await broadcastAdminNotification("New Order Received! 🛍️", `Order #${orderId.toUpperCase()} for ${directItem.title} is pending verification.`);
  };

  const postAccount = async (data: any) => {
    if (!rtdb || !user) return;
    const postRef = push(ref(rtdb, 'accountPosts'));
    await set(postRef, {
      ...data,
      uid: user.uid,
      authorName: enhancedUser?.name,
      authorAvatar: enhancedUser?.photoURL,
      status: 'pending',
      createdAt: Date.now(),
      views: 0,
      sold: false
    });
    toast({ title: "Successfully posted!", description: "Waiting for admin approval of listing fee payment." });

    // Notify Admins
    await broadcastAdminNotification("New Account Post! 🎮", `${enhancedUser?.name} listed a Lv ${data.level} account.`);
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

  const deleteOrder = async (oid: string) => {
    if (!rtdb) return;
    await remove(ref(rtdb, `orders/${oid}`));
    toast({ title: "Order Deleted" });
  };

  const buyAccountPost = (post: any) => {
    if (!user) {
      toast({ title: "Fadlan soo gal", description: "Waa inaad soo gashaa si aad u iibsato account-kan.", variant: "destructive" });
      router.push('/login');
      return;
    }
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

  const broadcastAdminNotification = async (title: string, body: string, skipPush: boolean = false) => {
    if (!rtdb) return;
    const nid = push(ref(rtdb, 'adminNotifications')).key;
    await set(ref(rtdb, `adminNotifications/${nid}`), {
      id: nid,
      title,
      body,
      createdAt: Date.now(),
      type: skipPush ? 'assignment_update' : 'system_alert',
      linkTo: '#notifications',
      readBy: {}
    });
  };

  const updateOrderStatus = async (oid: string, status: string) => {
    if (!rtdb || !enhancedUser) return;
    const orderSnap = await get(ref(rtdb, `orders/${oid}`));
    const orderData = orderSnap.val();
    if (!orderData) return;
    
    const oldStatus = orderData.status;
    const userId = orderData.userId;
    const items = orderData.items || [];
    
    const accountItem = items.find((i: any) => i.gameId === 'accounts' || i.gameId === 'account');
    
    // Multi-admin Assignment Logic
    const assignmentUpdate: any = { status };
    if (oldStatus === 'pending' && (status === 'processing' || status === 'successful')) {
      assignmentUpdate.processedBy = {
        uid: enhancedUser.uid,
        name: enhancedUser.name,
        photoURL: enhancedUser.photoURL || ""
      };
      // Broadcast to other admins (no push)
      broadcastAdminNotification(`Order Assigned! 🤝`, `${enhancedUser.name} is now handling Order #${oid.toUpperCase()}`, true);
    }

    await update(ref(rtdb, `orders/${oid}`), assignmentUpdate);
    
    if (status === 'successful') {
      if (accountItem && accountItem.id) {
        await update(ref(rtdb, `accountPosts/${accountItem.id}`), { sold: true });
      }

      if (userId && oldStatus !== 'successful') {
        await update(ref(rtdb, `users/${userId}`), { points: increment(1) });
        broadcastNotification("Order Successful! ✅", "Dalabkaaga waa lagu guuleystay. Waxaad heshay 1 point!", userId);
      }
    } else if (oldStatus === 'successful' && status !== 'successful') {
      if (accountItem && accountItem.id) {
        await update(ref(rtdb, `accountPosts/${accountItem.id}`), { sold: false });
      }

      if (userId) {
        await update(ref(rtdb, `users/${userId}`), { points: increment(-1) });
        broadcastNotification("Order Update: Points Revoked ⚠️", `Dalabkaaga waa la bedelay xaaladiisa.`, userId);
      }
    }
  };

  const updateAccountPostStatus = async (pid: string, status: string) => {
    if (!rtdb || !enhancedUser) return;
    const postSnap = await get(ref(rtdb, `accountPosts/${pid}`));
    const postData = postSnap.val();
    if (!postData) return;

    const oldStatus = postData.status;

    // Multi-admin Assignment
    const assignmentUpdate: any = { status };
    if (oldStatus === 'pending' && (status === 'processing' || status === 'approved')) {
      assignmentUpdate.processedBy = {
        uid: enhancedUser.uid,
        name: enhancedUser.name,
        photoURL: enhancedUser.photoURL || ""
      };
      broadcastAdminNotification(`Listing Assigned! 🤝`, `${enhancedUser.name} is now reviewing listing #${pid.toUpperCase()}`, true);
    }

    await update(ref(rtdb, `accountPosts/${pid}`), assignmentUpdate);
    
    if (postData.uid) {
      broadcastNotification(
        status === 'approved' ? "Post Approved! ✅" : "Post Rejected ❌",
        status === 'approved' ? "Your account is now live in the marketplace." : "Your account listing was rejected by admin.",
        postData.uid
      );
    }
  };

  const updateUserProfile = async (updates: any) => {
    if (!rtdb || !user) return;
    await update(ref(rtdb, `users/${user.uid}`), updates);
    toast({ title: "Profile updated!" });
  };

  const manageUser = async (uid: string, updates: Partial<UserProfile>) => {
    if (!rtdb) return;
    await update(ref(rtdb, `users/${uid}`), updates);
    toast({ title: "User updated!" });
  };

  const deleteUser = async (uid: string) => {
    if (!rtdb) return;
    await remove(ref(rtdb, `users/${uid}`));
    toast({ title: "User account deleted." });
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

  const markAdminNotificationsAsRead = async (nid?: string) => {
    if (!rtdb || !enhancedUser?.isAdmin) return;
    if (nid) await update(ref(rtdb, `adminNotifications/${nid}/readBy/${enhancedUser.uid}`), true);
    else {
      const updates: any = {};
      adminNotifications.forEach(n => updates[`adminNotifications/${n.id}/readBy/${enhancedUser.uid}`] = true);
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
      if (val !== undefined && val !== null && val !== "" && !Number.isNaN(val)) cleanData[key] = val;
    });
    if (id) await update(ref(rtdb, `products/${id}`), cleanData);
    else await push(ref(rtdb, 'products'), cleanData);
  };

  const deleteProduct = async (id: string) => remove(ref(rtdb, `products/${id}`));
  
  const saveEvent = async (e: any) => {
    if (!rtdb) return;
    const { id, ...data } = e;
    if (id) await update(ref(rtdb, `events/${id}`), data);
    else await push(ref(rtdb, 'events'), data);
  };

  const deleteEvent = async (id: string) => remove(ref(rtdb, `events/${id}`));

  const saveBanner = async (b: any) => {
    if (!rtdb) return;
    const { id, ...data } = b;
    if (id) await update(ref(rtdb, `banners/${id}`), data);
    else await push(ref(rtdb, 'banners'), { ...data, createdAt: Date.now(), active: true });
  };

  const deleteBanner = async (id: string) => remove(ref(rtdb, `banners/${id}`));

  const updateStoreSettings = async (s: any) => update(ref(rtdb, 'settings'), s);

  return (
    <AppContext.Provider value={{ 
      user: enhancedUser, loading, isGlobalLoading, isInitialLoading, activeTab, setActiveTab, setGlobalLoading: setIsGlobalLoading,
      login, signup, logout, buyNow, orders, allOrders, products, allUsers, accountPosts, notifications, adminNotifications, events, banners,
      createOrder, postAccount, updateAccountPost, deleteAccountPost, deleteOrder, buyAccountPost, markNotificationsAsRead, markAdminNotificationsAsRead, updateOrderStatus, updateAccountPostStatus, 
      updateUserProfile, manageUser, deleteUser, saveProduct, deleteProduct, saveEvent, deleteEvent, saveBanner, deleteBanner, storeSettings, updateStoreSettings, 
      broadcastNotification, broadcastAdminNotification, messages, allChatSessions, chatTargetId, setChatTargetId, sendMessage, markMessagesAsRead, refreshAdminData,
      theme, toggleTheme
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
