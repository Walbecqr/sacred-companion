'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import {
  Sparkles, Moon, BookOpen, Compass,
  Heart, LogOut, Menu, X,
  Feather, Map as MapIcon,
  type LucideIcon,
  Quote, NotebookPen, CalendarCheck
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';

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

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'profile'>('overview');
  const [currentMoonPhase, setCurrentMoonPhase] = useState('');
  const [initialConversationId, setInitialConversationId] = useState<string | undefined>(undefined);
  const [conversations, setConversations] = useState<Array<{ id: string; title: string | null; last_message_at: string | null; created_at: string | null }>>([]);
  const [dailyCheckin, setDailyCheckin] = useState<{ mood: string; intention: string }>(() => {
    if (typeof window === 'undefined') return { mood: '', intention: '' };
    const key = `sc_daily_checkin_${new Date().toISOString().slice(0,10)}`;
    const saved = window.localStorage.getItem(key);
    return saved ? JSON.parse(saved) : { mood: '', intention: '' };
  });
  const [journalDraft, setJournalDraft] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem('sc_quick_journal_draft') || '';
  });
  const [latestAssistantPreview, setLatestAssistantPreview] = useState<string>('');
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  const spiritualPaths = Array.isArray(userProfile.spiritual_path)
    ? userProfile.spiritual_path
    : [];

  const checkUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUser(user);
      
      // Fetch user profile; create if missing
      const { data: profile } = await supabase
        .from('user_spiritual_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile) {
        const defaultDisplay = user.email?.split('@')[0] || 'Seeker';
        await supabase
          .from('user_spiritual_profiles')
          .insert({
            user_id: user.id,
            display_name: defaultDisplay,
            experience_level: 'beginner',
            created_at: new Date().toISOString(),
          });
        const { data: created } = await supabase
          .from('user_spiritual_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        if (created) setUserProfile(created);
      } else {
        setUserProfile(profile);
      }

      // Load user's conversations (most recent first)
      const { data: allConversations } = await supabase
        .from('conversations')
        .select('id, title, last_message_at, created_at')
        .eq('user_id', user.id)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });
      setConversations(allConversations || []);
      if ((allConversations?.length || 0) > 0) {
        setInitialConversationId(allConversations![0].id);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  useEffect(() => {
    checkUser();
    fetchMoonPhase();
  }, [checkUser]);

  const fetchMoonPhase = () => {
    // Simple moon phase calculation (you can make this more accurate)
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

  const navigationItems: NavigationItem[] = [
    { id: 'overview', icon: Sparkles, label: 'Overview', href: '/dashboard', badge: null },
    { id: 'chat', icon: Sparkles, label: 'Chat with Beatrice', href: '/dashboard/chat', badge: null },
    { id: 'journey', icon: MapIcon, label: 'Spiritual Journey', href: '/dashboard/spiritual-journey', badge: null },
    { id: 'journal', icon: Feather, label: 'Journal', badge: 'Coming Soon' },
    { id: 'rituals', icon: Sparkles, label: 'Rituals', badge: 'Coming Soon' },
    { id: 'grimoire', icon: BookOpen, label: 'Grimoire', badge: 'Coming Soon' },
    { id: 'correspondences', icon: Compass, label: 'Correspondences', badge: 'Coming Soon' },
    { id: 'profile', icon: Heart, label: 'Spiritual Profile', badge: null },
  ];

  // Persist daily check-in and journal draft
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = `sc_daily_checkin_${new Date().toISOString().slice(0,10)}`;
    window.localStorage.setItem(key, JSON.stringify(dailyCheckin));
  }, [dailyCheckin]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('sc_quick_journal_draft', journalDraft);
  }, [journalDraft]);

  // Fetch a short preview of the latest assistant message
  useEffect(() => {
    const fetchPreview = async () => {
      if (!initialConversationId) {
        setLatestAssistantPreview('');
        return;
      }
      try {
        const res = await fetch(`/api/chat/history/${initialConversationId}`);
        if (res.ok) {
          const data = await res.json() as { messages: Array<{ role: 'user'|'assistant'; content: string; timestamp: string }>} ;
          const lastAssistant = [...data.messages].reverse().find(m => m.role === 'assistant');
          setLatestAssistantPreview(lastAssistant ? lastAssistant.content : '');
        }
      } catch {
        // ignore preview errors
      }
    };
    fetchPreview();
  }, [initialConversationId]);

  // Compute a simple practice streak from conversation activity
  const practiceStreak = useMemo(() => {
    if (!conversations || conversations.length === 0) return 0;
    const days = new Set(
      conversations
        .map(c => (c.last_message_at || c.created_at) || '')
        .filter(Boolean)
        .map(d => new Date(d as string).toISOString().slice(0,10))
    );
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const dt = new Date(today);
      dt.setDate(today.getDate() - i);
      const key = dt.toISOString().slice(0,10);
      if (days.has(key)) {
        streak += 1;
      } else {
        // Stop when we hit the first gap (unless i === 0 and it's okay to start tomorrow)
        break;
      }
    }
    return streak;
  }, [conversations]);

  // Inspirational quotes / oracle messages
  const dailyQuote = useMemo(() => {
    const quotes = [
      'Trust the whisper of your heart; it knows the way.',
      'In stillness, the sacred reveals itself.',
      'Each step you take is a prayer in motion.',
      'You are the temple and the flame within it.',
      'May your path be guided by kindness and courage.',
      'The moon teaches us to shine through our changes.'
    ];
    const idxSeed = Number(new Date().toISOString().slice(0,10).replace(/-/g, ''));
    const idx = idxSeed % quotes.length;
    return quotes[idx];
  }, []);

  const correspondenceOfTheDay = useMemo(() => {
    const correspondences = [
      { day: 'Sunday', planet: 'Sun', color: 'Gold', herb: 'Bay', element: 'Fire' },
      { day: 'Monday', planet: 'Moon', color: 'Silver/White', herb: 'Jasmine', element: 'Water' },
      { day: 'Tuesday', planet: 'Mars', color: 'Red', herb: 'Ginger', element: 'Fire' },
      { day: 'Wednesday', planet: 'Mercury', color: 'Yellow', herb: 'Lavender', element: 'Air' },
      { day: 'Thursday', planet: 'Jupiter', color: 'Blue', herb: 'Sage', element: 'Air' },
      { day: 'Friday', planet: 'Venus', color: 'Green/Pink', herb: 'Rose', element: 'Water' },
      { day: 'Saturday', planet: 'Saturn', color: 'Black', herb: 'Thyme', element: 'Earth' },
    ];
    const dayIndex = new Date().getDay(); // 0 Sunday
    return correspondences[dayIndex];
  }, []);

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
                  return item.href ? (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-gray-700 dark:text-gray-300 ${item.id === 'overview' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg' : ''}`}
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
              ) : (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as 'overview' | 'profile')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                      : 'hover:bg-purple-100 dark:hover:bg-purple-900/50 text-gray-700 dark:text-gray-300'
                  }`}
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
                </button>
              );
            })}

            {/* Removed "Today’s Energy" section for now */}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {activeSection === 'overview' && (
            <div className="h-full p-4 space-y-6">
              {/* Welcome & Greeting */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg p-6 shadow">
                <div className="flex items-center gap-4">
                  <Sparkles className="w-8 h-8" />
                  <div className="flex-1">
                    <h1 className="text-2xl font-semibold">Welcome{userProfile.display_name ? `, ${userProfile.display_name}` : ''}!</h1>
                    <p className="text-sm text-white/80">Current Moon: {currentMoonPhase}</p>
                  </div>
                  <Link href="/dashboard/chat" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg">Open Beatrice</Link>
                </div>
              </div>

              {/* Quick Feature Access */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/dashboard/chat" className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-md transition">
                  <div className="flex items-center gap-3 text-purple-700 dark:text-purple-300">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-medium">Chat with Beatrice</span>
                  </div>
                </Link>
                <Link href="/dashboard/spiritual-journey" className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-md transition">
                  <div className="flex items-center gap-3 text-purple-700 dark:text-purple-300">
                    <MapIcon className="w-5 h-5" />
                    <span className="font-medium">View Spiritual Journey</span>
                  </div>
                </Link>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow opacity-70">
                  <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                    <Feather className="w-5 h-5" />
                    <span className="font-medium">New Journal Entry (Coming Soon)</span>
                  </div>
                </div>
              </div>

              {/* Widgets Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Daily Spiritual Check-in */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <CalendarCheck className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold">Daily Spiritual Check-in</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="daily-mood" className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Mood</label>
                      <select
                        id="daily-mood"
                        value={dailyCheckin.mood}
                        onChange={(e) => setDailyCheckin({ ...dailyCheckin, mood: e.target.value })}
                        className="w-full rounded-md border border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-900 p-2"
                      >
                        <option value="">Select...</option>
                        <option>Peaceful</option>
                        <option>Grateful</option>
                        <option>Curious</option>
                        <option>Overwhelmed</option>
                        <option>Grounded</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Intention</label>
                      <input
                        value={dailyCheckin.intention}
                        onChange={(e) => setDailyCheckin({ ...dailyCheckin, intention: e.target.value })}
                        placeholder="What is your intention today?"
                        className="w-full rounded-md border border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-900 p-2"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Saved locally for today</p>
                  </div>
                </div>

                {/* Quick Journal Entry */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <NotebookPen className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold">Quick Journal Entry</h3>
                  </div>
                  <textarea
                    value={journalDraft}
                    onChange={(e) => setJournalDraft(e.target.value)}
                    placeholder="Jot down a reflection..."
                    rows={5}
                    className="w-full rounded-md border border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-900 p-3"
                  />
                  <div className="mt-2 text-xs text-gray-500">Autosaved locally</div>
                </div>

                {/* Inspirational Quote / Oracle */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <Quote className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold">Oracle Message</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-200 italic">“{dailyQuote}”</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Correspondence of the Day */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow">
                  <h3 className="font-semibold mb-2">Correspondence of the Day</h3>
                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <p><span className="font-medium">Day:</span> {correspondenceOfTheDay.day}</p>
                    <p><span className="font-medium">Planet:</span> {correspondenceOfTheDay.planet}</p>
                    <p><span className="font-medium">Element:</span> {correspondenceOfTheDay.element}</p>
                    <p><span className="font-medium">Color:</span> {correspondenceOfTheDay.color}</p>
                    <p><span className="font-medium">Herb:</span> {correspondenceOfTheDay.herb}</p>
                  </div>
                </div>

                {/* Practice Streak Counter */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow">
                  <h3 className="font-semibold mb-2">Practice Streak</h3>
                  <p className="text-3xl font-bold text-purple-600">{practiceStreak}<span className="text-base font-medium ml-2">day{practiceStreak === 1 ? '' : 's'}</span></p>
                  <p className="text-xs text-gray-500 mt-1">Based on recent chat activity</p>
                </div>

                {/* Spiritual Progress Overview (lightweight) */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow">
                  <h3 className="font-semibold mb-2">Spiritual Progress Overview</h3>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-xl font-bold text-purple-600">{conversations.length}</p>
                      <p className="text-xs text-gray-500">Conversations</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-purple-600">{userProfile.experience_level ? userProfile.experience_level.charAt(0).toUpperCase()+userProfile.experience_level.slice(1) : 'Beginner'}</p>
                      <p className="text-xs text-gray-500">Experience</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-purple-600">{(userProfile.spiritual_path && Array.isArray(userProfile.spiritual_path) ? userProfile.spiritual_path.length : 0)}</p>
                      <p className="text-xs text-gray-500">Paths</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Beatrice Chat Preview */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow lg:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Beatrice Chat Preview</h3>
                    <Link href={`/dashboard/chat${initialConversationId ? `?c=${initialConversationId}` : ''}`} className="text-sm text-purple-600 hover:underline">Open Chat</Link>
                  </div>
                  {latestAssistantPreview ? (
                    <div className="p-4 rounded-md bg-purple-50 dark:bg-purple-900/30 text-gray-800 dark:text-gray-200">
                      <p className="line-clamp-4 whitespace-pre-wrap">{latestAssistantPreview}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No messages yet. Start a new conversation with Beatrice.</p>
                  )}
                </div>

                {/* Recent Activity Overview */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow">
                  <h3 className="font-semibold mb-2">Recent Conversations</h3>
                  <div className="space-y-2 max-h-64 overflow-auto pr-1">
                    {conversations.slice(0, 8).map((c) => (
                      <Link key={c.id} href={`/dashboard/chat?c=${c.id}`} className="block p-2 rounded hover:bg-purple-50 dark:hover:bg-purple-900/30">
                        <p className="text-sm font-medium truncate">{c.title || 'Untitled conversation'}</p>
                        <p className="text-[10px] text-gray-500">{new Date(c.last_message_at || c.created_at || '').toLocaleString()}</p>
                      </Link>
                    ))}
                    {conversations.length === 0 && (
                      <p className="text-sm text-gray-500">No activity yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'profile' && (
            <div className="p-8">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Spiritual Profile</h2>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sacred Name
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {userProfile.display_name || 'Not set'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Experience Level
                    </label>
                    <p className="text-lg text-gray-900 dark:text-white capitalize">
                      {userProfile.experience_level || 'Beginner'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Spiritual Path
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {spiritualPaths.length > 0 ? (
                        spiritualPaths.map((path, i) => (
                          <span key={i} className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                            {path}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">Not specified yet</p>
                      )}
                    </div>
                  </div>
                  
                  <button className="mt-6 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200">
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Coming Soon Sections */}
          {['journal', 'rituals', 'grimoire', 'correspondences'].includes(activeSection) && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 dark:bg-purple-900/50 rounded-full mb-4">
                  <Sparkles className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Coming Soon</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  This sacred feature is being carefully crafted with love and intention. 
                  It will be available in your spiritual toolkit soon.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}