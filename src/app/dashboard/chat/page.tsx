'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Sparkles, Moon, BookOpen, Compass,
  Heart, LogOut, Menu, X,
  Feather, Map as MapIcon,
  type LucideIcon,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import ChatInterface from '../../components/chat/ChatInterface';

interface NavigationItem {
  id: string;
  icon: LucideIcon;
  label: string;
  badge?: string | null;
  href?: string;
}

interface UserProfile {
  display_name?: string;
  experience_level?: string;
  spiritual_path?: string[];
  current_journey_phase?: string;
}

function ChatPageInner() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentMoonPhase, setCurrentMoonPhase] = useState('');
  const [initialConversationId, setInitialConversationId] = useState<string | undefined>(undefined);
  const [conversations, setConversations] = useState<Array<{ id: string; title: string | null; last_message_at: string | null; created_at: string | null }>>([]);

  const router = useRouter();
  const supabase = createClientComponentClient();
  const searchParams = useSearchParams();

  const navigationItems: NavigationItem[] = [
    { id: 'overview', icon: Sparkles, label: 'Overview', href: '/dashboard', badge: null },
    { id: 'chat', icon: Sparkles, label: 'Chat with Beatrice', href: '/dashboard/chat', badge: null },
    { id: 'journey', icon: MapIcon, label: 'Spiritual Journey Dashboard', href: '/dashboard/spiritual-journey', badge: null },
    { id: 'journal', icon: Feather, label: 'Journal', badge: 'Coming Soon' },
    { id: 'rituals', icon: Sparkles, label: 'Rituals', badge: 'Coming Soon' },
    { id: 'grimoire', icon: BookOpen, label: 'Grimoire', badge: 'Coming Soon' },
    { id: 'correspondences', icon: Compass, label: 'Correspondences', badge: 'Coming Soon' },
    { id: 'profile', icon: Heart, label: 'Spiritual Profile', href: '/dashboard#profile', badge: null },
  ];

  const checkUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      const { data: profile } = await supabase
        .from('user_spiritual_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (profile) setUserProfile(profile);

      const { data: allConversations } = await supabase
        .from('conversations')
        .select('id, title, last_message_at, created_at')
        .eq('user_id', user.id)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });
      setConversations(allConversations || []);

      // If query provides ?c=...
      const queryConv = searchParams.get('c') || undefined;
      if (queryConv) {
        setInitialConversationId(queryConv);
      } else if ((allConversations?.length || 0) > 0) {
        setInitialConversationId(allConversations![0].id);
      }
    } catch (error) {
      console.error('Error fetching user/chat data:', error);
    } finally {
      setLoading(false);
    }
  }, [router, searchParams, supabase]);

  useEffect(() => {
    checkUser();
    fetchMoonPhase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMoonPhase = () => {
    const phases = ['New Moon 🌑', 'Waxing Crescent 🌒', 'First Quarter 🌓', 'Waxing Gibbous 🌔', 
                   'Full Moon 🌕', 'Waning Gibbous 🌖', 'Last Quarter 🌗', 'Waning Crescent 🌘'];
    const today = new Date();
    const phaseIndex = Math.floor((today.getDate() / 30) * 8) % 8;
    setCurrentMoonPhase(phases[phaseIndex]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-purple-300 animate-pulse mx-auto mb-4" />
          <p className="text-white">Preparing your sacred space...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-purple-900">
      {/* Top Navigation Bar */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-purple-200 dark:border-purple-800">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo and Toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5 text-purple-600" /> : <Menu className="w-5 h-5 text-purple-600" />}
              </button>
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <span className="font-bold text-lg text-gray-900 dark:text-white">Sacred Companion</span>
              </div>
            </div>

            {/* Center: Moon Phase */}
            <div className="hidden md:flex items-center gap-2 bg-purple-100 dark:bg-purple-900/50 px-4 py-2 rounded-full">
              <Moon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">{currentMoonPhase}</span>
            </div>

            {/* Right: User Menu */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {userProfile.display_name || user?.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {userProfile.current_journey_phase || 'Seeker'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-purple-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar Navigation */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-r border-purple-200 dark:border-purple-800`}>
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href || '#'}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-gray-700 dark:text-gray-300 ${item.id === 'chat' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-xs bg-purple-200 dark:bg-purple-700 text-purple-700 dark:text-purple-200 px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden p-4">
          <ChatInterface
            conversationId={initialConversationId}
            onConversationId={(id) => {
              setInitialConversationId(id);
              (async () => {
                const { data: updated } = await supabase
                  .from('conversations')
                  .select('id, title, last_message_at, created_at')
                  .order('last_message_at', { ascending: false, nullsFirst: false })
                  .order('created_at', { ascending: false });
                setConversations(updated || []);
              })();
            }}
            conversations={conversations}
            onSelectConversation={(id) => setInitialConversationId(id)}
            onNewConversation={() => setInitialConversationId(undefined)}
          />
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-purple-300 animate-pulse mx-auto mb-4" />
          <p className="text-white">Preparing your sacred space...</p>
        </div>
      </div>
    }>
      <ChatPageInner />
    </Suspense>
  );
}


