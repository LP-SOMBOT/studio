
"use client";

import { useApp } from "@/lib/context";
import HomeView from "@/components/views/HomeView";
import GamesView from "@/components/views/GamesView";
import CartView from "@/components/views/CartView";
import ProfileView from "@/components/views/ProfileView";
import ChatView from "@/components/views/ChatView";

export default function AppShell() {
  const { activeTab } = useApp();

  return (
    <>
      {activeTab === 'home' && <HomeView />}
      {activeTab === 'games' && <GamesView />}
      {activeTab === 'cart' && <CartView />}
      {activeTab === 'profile' && <ProfileView />}
      {activeTab === 'chat' && <ChatView />}
    </>
  );
}
