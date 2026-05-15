
"use client";

import { useApp } from "@/lib/context";
import HomeView from "@/components/views/HomeView";
import GamesView from "@/components/views/GamesView";
import ProfileView from "@/components/views/ProfileView";
import ChatView from "@/components/views/ChatView";
import AccountsView from "@/components/views/AccountsView";
import RankingView from "@/components/views/RankingView";
import NotificationsView from "@/components/views/NotificationsView";
import OfflinePage from "@/components/layout/OfflinePage";

export default function AppShell() {
  const { activeTab, storeSettings, user } = useApp();

  const isOffline = storeSettings?.appStatus?.offline;
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  if (isOffline && !isAdmin) {
    return <OfflinePage />;
  }

  return (
    <>
      {activeTab === 'home' && <HomeView />}
      {activeTab === 'games' && <GamesView />}
      {activeTab === 'accounts' && <AccountsView />}
      {activeTab === 'ranking' && <RankingView />}
      {activeTab === 'profile' && <ProfileView />}
      {activeTab === 'chat' && <ChatView />}
      {activeTab === 'notifications' && <NotificationsView />}
    </>
  );
}
