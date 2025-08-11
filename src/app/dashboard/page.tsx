'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, usePathname } from 'next/navigation';
import {
  Sparkles, Moon, BookOpen, Gem,
  Heart, LogOut, Menu, X,
  Feather, Map as MapIcon, Flame,
  type LucideIcon,
  Quote, NotebookPen, CalendarCheck,
  Settings as SettingsIcon, User as UserIcon, Check, Bell, Eye, Shield, Upload, Undo2
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
  preferences?: UserPreferences | null;
}

type DailyReminderSlot = 'off' | 'morning' | 'afternoon' | 'evening';
interface UserPreferences {
  avatar?: {
    url?: string;
    theme?: 'moon' | 'crystal' | 'pentacle' | 'flame' | 'leaf' | string;
  } | null;
  notifications?: {
    dailyReminder?: DailyReminderSlot;
  } | null;
  privacy?: {
    showProfilePublicly?: boolean;
    shareMilestonesWithAI?: boolean;
  } | null;
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
  const [now, setNow] = useState<Date>(() => new Date());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [draftPrefs, setDraftPrefs] = useState<UserPreferences>({});
  const lastSavedPrefsRef = useRef<UserPreferences>({});
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settingsButtonRef = useRef<HTMLButtonElement | null>(null);
  const overlayPanelRef = useRef<HTMLDivElement | null>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  // Simple toast notifications
  type Toast = { id: string; message: string; type: 'success' | 'error' | 'info' };
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3000);
  }, []);
  
  const router = useRouter();
  const pathname = usePathname();
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

      // Allow UI to render greeting quickly; fetch conversations without blocking
      setLoading(false);

      // Initialize preferences draft from profile
      const initial = (profile?.preferences as UserPreferences) || {};
      setDraftPrefs(initial);
      lastSavedPrefsRef.current = initial;

      // Load user's conversations (most recent first) in background
      (async () => {
        try {
          const { data } = await supabase
            .from('conversations')
            .select('id, title, last_message_at, created_at')
            .eq('user_id', user.id)
            .order('last_message_at', { ascending: false, nullsFirst: false })
            .order('created_at', { ascending: false });

          const allConversations = data || [];
          setConversations(allConversations);
          if (allConversations.length > 0) {
            setInitialConversationId(allConversations[0].id);
          }
        } catch {
          // ignore background errors for conversations
        }
      })();
    } catch (error) {
      console.error('Error fetching user:', error);
      setLoading(false);
    }
  }, [supabase, router]);

  useEffect(() => {
    checkUser();
    fetchMoonPhase();
    // Keep time-of-day current for greeting without heavy re-renders
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
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

  // Settings overlay logic
  const themeAvatars = [
    { id: 'moon', label: 'Moon', symbol: '🌙' },
    { id: 'crystal', label: 'Crystal', symbol: '🔮' },
    { id: 'pentacle', label: 'Pentacle', symbol: '⭐' },
    { id: 'flame', label: 'Flame', symbol: '🔥' },
    { id: 'leaf', label: 'Leaf', symbol: '🍃' },
  ];

  const applyPrefChange = useCallback((updater: (prev: UserPreferences) => UserPreferences) => {
    setDraftPrefs((prev: UserPreferences) => {
      const next = updater(prev || {});
      // debounce autosave
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        if (!user) return;
        try {
          setSavingPrefs('saving');
          const { error } = await supabase
            .from('user_spiritual_profiles')
            .update({ preferences: next, updated_at: new Date().toISOString() })
            .eq('user_id', user.id);
          if (error) throw error;
          lastSavedPrefsRef.current = next;
          setSavingPrefs('saved');
          setTimeout(() => setSavingPrefs('idle'), 1500);
          // reflect in header data source
          setUserProfile((p) => ({ ...(p || {}), preferences: next }));
          addToast('Preferences saved', 'success');
        } catch {
          setSavingPrefs('error');
          setTimeout(() => setSavingPrefs('idle'), 2000);
          addToast('Failed to save preferences', 'error');
        }
      }, 500);
      return next;
    });
  }, [supabase, user, addToast]);

  const undoLastSave = useCallback(() => {
    const prev = lastSavedPrefsRef.current || {};
    setDraftPrefs(prev);
    if (!user) return;
    (async () => {
      try {
        setSavingPrefs('saving');
        const { error } = await supabase
          .from('user_spiritual_profiles')
          .update({ preferences: prev, updated_at: new Date().toISOString() })
          .eq('user_id', user.id);
        if (error) throw error;
        setSavingPrefs('saved');
        setTimeout(() => setSavingPrefs('idle'), 1500);
        addToast('Changes undone', 'success');
      } catch {
        setSavingPrefs('error');
        setTimeout(() => setSavingPrefs('idle'), 2000);
        addToast('Failed to undo', 'error');
      }
    })();
  }, [supabase, user, addToast]);

  const handleAvatarUpload = useCallback(async (file: File) => {
    if (!user) return;
    try {
      const MAX_BYTES = 2 * 1024 * 1024; // 2MB
      const allowed = ['image/jpeg','image/png','image/webp','image/avif'];
      if (!allowed.includes(file.type)) {
        addToast('Unsupported image type. Use JPEG, PNG, WebP, or AVIF.', 'error');
        return;
      }
      if (file.size > MAX_BYTES) {
        addToast('Image too large. Max 2MB.', 'error');
        return;
      }
      const ext = file.name.split('.').pop() || 'png';
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const url = data.publicUrl;
      applyPrefChange((prev) => ({ ...(prev || {}), avatar: { ...(prev?.avatar || {}), url } }));
      addToast('Avatar updated', 'success');
    } catch {
      setSavingPrefs('error');
      setTimeout(() => setSavingPrefs('idle'), 2000);
      addToast('Failed to upload avatar', 'error');
    }
  }, [applyPrefChange, supabase, user, addToast]);

  // Defaults and per-toggle undo
  const DEFAULT_PREFS = useMemo<UserPreferences>(() => ({
    avatar: { theme: 'moon', url: '' },
    notifications: { dailyReminder: 'off' },
    privacy: { showProfilePublicly: false, shareMilestonesWithAI: false }
  }), []);

  const resetToDefaults = useCallback(() => {
    applyPrefChange(() => DEFAULT_PREFS);
    addToast('Preferences reset to defaults', 'success');
  }, [applyPrefChange, addToast, DEFAULT_PREFS]);

  const undoAvatarTheme = useCallback(() => {
    const prev = lastSavedPrefsRef.current?.avatar?.theme;
    if (typeof prev === 'string') {
      applyPrefChange((p) => ({ ...(p || {}), avatar: { ...(p?.avatar || {}), theme: prev } }));
      addToast('Avatar theme reverted', 'success');
    }
  }, [applyPrefChange, addToast]);

  const undoDailyReminder = useCallback(() => {
    const prev = (lastSavedPrefsRef.current?.notifications?.dailyReminder || 'off') as DailyReminderSlot;
    applyPrefChange((p) => ({ ...(p || {}), notifications: { ...(p?.notifications || {}), dailyReminder: prev } }));
    addToast('Notification timing reverted', 'success');
  }, [applyPrefChange, addToast]);

  const undoPrivacyProp = useCallback((prop: 'showProfilePublicly' | 'shareMilestonesWithAI') => {
    const prev = !!(lastSavedPrefsRef.current?.privacy && (lastSavedPrefsRef.current.privacy as Required<NonNullable<UserPreferences['privacy']>>)[prop]);
    applyPrefChange((p) => ({ ...(p || {}), privacy: { ...(p?.privacy || {}), [prop]: prev } } as UserPreferences));
    addToast('Privacy setting reverted', 'success');
  }, [applyPrefChange, addToast]);

  // Focus trap and restore
  useEffect(() => {
    if (!settingsOpen) return;
    prevFocusRef.current = (document.activeElement as HTMLElement) || null;
    const panel = overlayPanelRef.current;
    const focusables = () => {
      if (!panel) return [] as HTMLElement[];
      return Array.from(panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ));
    };
    const tryFocusFirst = () => {
      const els = focusables();
      if (els.length > 0) els[0].focus();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setSettingsOpen(false);
      } else if (e.key === 'Tab') {
        const els = focusables();
        if (els.length === 0) return;
        const first = els[0];
        const last = els[els.length - 1];
        const isShift = e.shiftKey;
        const active = document.activeElement as HTMLElement;
        if (!isShift && active === last) {
          e.preventDefault();
          first.focus();
        } else if (isShift && active === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    setTimeout(tryFocusFirst, 0);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [settingsOpen]);

  useEffect(() => {
    if (!settingsOpen && prevFocusRef.current) {
      setTimeout(() => {
        try {
          settingsButtonRef.current?.focus();
        } catch {}
      }, 0);
    }
  }, [settingsOpen]);

  // Helpers for personalized welcome message
  const getPreferredName = useCallback(() => {
    return (
      userProfile.display_name?.trim() ||
      user?.email?.split('@')[0] ||
      'Seeker'
    );
  }, [userProfile.display_name, user?.email]);

  const getTimeOfDay = useCallback((d: Date) => {
    const h = d.getHours();
    if (h >= 5 && h < 12) return 'morning';
    if (h >= 12 && h < 17) return 'afternoon';
    if (h >= 17 && h < 22) return 'evening';
    return 'night';
  }, []);

  const getSabbatGreeting = useCallback((d: Date) => {
    // Approximate Northern Hemisphere dates for the Wheel of the Year
    const y = d.getFullYear();
    const md = (m: number, day: number) => new Date(y, m - 1, day);
    const sameDay = (a: Date, b: Date) => a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    const isOneOf = (date: Date, list: Array<{ name: string; date: Date }>) =>
      list.find(x => sameDay(date, x.date));

    const sabbats = [
      { name: 'Imbolc', date: md(2, 1) },
      { name: 'Ostara', date: md(3, 20) },
      { name: 'Beltane', date: md(5, 1) },
      { name: 'Litha', date: md(6, 21) },
      { name: 'Lughnasadh', date: md(8, 1) },
      { name: 'Mabon', date: md(9, 22) },
      { name: 'Samhain', date: md(10, 31) },
      { name: 'Yule', date: md(12, 21) },
    ];
    const hit = isOneOf(d, sabbats);
    return hit ? `Blessed ${hit.name}` : null;
  }, []);

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

  const lastActivityInfo = useMemo(() => {
    if (!conversations || conversations.length === 0) return null;
    const latestIso = conversations
      .map(c => (c.last_message_at || c.created_at))
      .filter(Boolean)
      .map(s => new Date(s as string))
      .sort((a, b) => b.getTime() - a.getTime())[0];
    if (!latestIso) return null;
    const ms = now.getTime() - latestIso.getTime();
    const days = Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
    return { daysSince: days };
  }, [conversations, now]);

  const personalizedGreeting = useMemo(() => {
    const name = getPreferredName();
    const sabbat = getSabbatGreeting(now);
    const partOfDay = getTimeOfDay(now);

    const lead = sabbat ? `${sabbat}, ${name}.` :
      partOfDay === 'morning' ? `Good morning, ${name}.` :
      partOfDay === 'afternoon' ? `Good afternoon, ${name}.` :
      partOfDay === 'evening' ? `Good evening, ${name}.` : `Peaceful night, ${name}.`;

    const stage = userProfile.current_journey_phase || userProfile.experience_level || '';
    const stageText = stage ? ` As a ${stage.toString().toLowerCase()}, may your steps be guided.` : '';

    const activityBits: string[] = [];
    if (practiceStreak > 0) activityBits.push(`${practiceStreak}-day streak`);
    if (lastActivityInfo && lastActivityInfo.daysSince > 0) {
      activityBits.push(`last active ${lastActivityInfo.daysSince} day${lastActivityInfo.daysSince === 1 ? '' : 's'} ago`);
    }
    const activityText = activityBits.length > 0 ? ` You are on a ${activityBits.join(' • ')}.` : '';

    return `${lead}${stageText}${activityText}`;
  }, [getPreferredName, getSabbatGreeting, getTimeOfDay, now, userProfile.current_journey_phase, userProfile.experience_level, practiceStreak, lastActivityInfo]);

  const navigationItems: NavigationItem[] = [
    { id: 'overview', icon: Sparkles, label: 'Overview', href: '/dashboard', badge: null },
    { id: 'chat', icon: Sparkles, label: 'Chat with Beatrice', href: '/dashboard/chat', badge: null },
    { id: 'journey', icon: MapIcon, label: 'Journey', href: '/dashboard/spiritual-journey', badge: null },
    { id: 'profile', icon: Heart, label: 'Spiritual Profile', href: '/dashboard/spiritual-profile', badge: null },
    { id: 'journal', icon: Feather, label: 'Journal', badge: 'Coming Soon' },
    { id: 'rituals', icon: Flame, label: 'Rituals', badge: 'Coming Soon' },
    { id: 'library', icon: BookOpen, label: 'Library', badge: 'Coming Soon' },
    { id: 'reference', icon: Gem, label: 'Reference', badge: 'Coming Soon' },
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
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                aria-label={sidebarOpen ? 'Collapse navigation' : 'Expand navigation'}
                aria-controls="primary-navigation"
              >
                {sidebarOpen ? <X className="w-5 h-5 text-purple-600" /> : <Menu className="w-5 h-5 text-purple-600" />}
              </button>
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <span className="font-bold text-lg text-gray-900 dark:text-white">Sacred Companion</span>
              </div>
            </div>

            {/* Center: Moon Phase */}
            <div className="hidden md:flex items-center gap-2 bg-purple-100 dark:bg-purple-900/50 px-4 py-2 rounded-full" aria-live="polite" aria-label={`Moon phase: ${currentMoonPhase}`}>
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
              {/* Profile & Settings quick access */}
              <button
                type="button"
                ref={settingsButtonRef}
                onClick={() => setSettingsOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-100/70 dark:bg-purple-900/40 hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                aria-label="Open Profile and Settings"
              >
                    <div className="w-7 h-7 rounded-full bg-white/80 dark:bg-gray-800 flex items-center justify-center text-base">
                  {(draftPrefs?.avatar && draftPrefs.avatar.url) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={String(draftPrefs.avatar.url)} alt="Avatar" className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <span aria-hidden="true">{draftPrefs?.avatar?.theme ? themeAvatars.find(a => a.id === (draftPrefs.avatar?.theme as string))?.symbol : '🌟'}</span>
                  )}
                </div>
                <SettingsIcon className="w-4 h-4 text-purple-700 dark:text-purple-300" aria-hidden="true" />
                <span className="hidden md:inline text-sm font-medium text-gray-800 dark:text-gray-200">Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                title="Logout"
                aria-label="Sign out"
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
          <nav id="primary-navigation" className="p-4 space-y-2" role="navigation" aria-label="Primary">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href ? pathname === item.href : activeSection === item.id;
              return item.href ? (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-gray-800 dark:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${isActive ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  role="link"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-purple-700 dark:text-purple-300'}`} aria-hidden="true" />
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
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                      : 'hover:bg-purple-100 dark:hover:bg-purple-900/50 text-gray-800 dark:text-gray-200'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-purple-700 dark:text-purple-300'}`} aria-hidden="true" />
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
              {/* Personalized Welcome & Greeting */}
              <div
                className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white rounded-lg p-6 shadow"
                role="region"
                aria-live="polite"
                aria-label={`Welcome message: ${personalizedGreeting}. Current Moon: ${currentMoonPhase}`}
              >
                <div className="flex items-start gap-4">
                  <Sparkles className="w-8 h-8 shrink-0" aria-hidden="true" />
                  <div className="flex-1">
                    <h1 className="text-2xl font-semibold">{personalizedGreeting || `Welcome, ${getPreferredName()}.`}</h1>
                    <p className="text-sm text-white/90 mt-1">Current Moon: {currentMoonPhase}</p>
                  </div>
                  <Link
                    href="/dashboard/spiritual-journey"
                    className="bg-white/20 hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 text-white px-4 py-2 rounded-lg"
                  >
                    View Spiritual Journey
                  </Link>
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
                    <span className="font-medium">Spiritual Journey Dashboard</span>
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
                  
                  <Link
                    href="/dashboard/spiritual-profile"
                    className="mt-6 inline-flex w-full items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
                  >
                    Edit Profile
                  </Link>
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
          {/* Settings Overlay */}
          {settingsOpen && (
            <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="settings-title">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setSettingsOpen(false)}
                aria-hidden="true"
              />
              <div ref={overlayPanelRef} className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl p-5 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-purple-600" />
                    <h2 id="settings-title" className="text-lg font-semibold text-gray-900 dark:text-white">Profile & Settings</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {savingPrefs === 'saving' && <span className="text-xs text-gray-500">Saving…</span>}
                    {savingPrefs === 'saved' && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600"><Check className="w-3 h-3" /> Saved</span>
                    )}
                    {savingPrefs === 'error' && <span className="text-xs text-red-600">Save failed</span>}
                    <button
                      type="button"
                      onClick={() => setSettingsOpen(false)}
                      className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                      aria-label="Close settings"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Avatar */}
                <section className="mb-6" aria-labelledby="avatar-section">
                  <h3 id="avatar-section" className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Avatar</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center text-xl">
                      {(draftPrefs?.avatar && draftPrefs.avatar.url) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={String(draftPrefs.avatar.url)} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <span aria-hidden="true">{draftPrefs?.avatar?.theme ? themeAvatars.find(a => a.id === (draftPrefs.avatar?.theme as string))?.symbol : '🌟'}</span>
                      )}
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleAvatarUpload(f);
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={undoLastSave}
                      className="ml-auto inline-flex items-center gap-1 text-xs text-purple-700 dark:text-purple-300 hover:underline"
                    >
                      <Undo2 className="w-3 h-3" /> Undo
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {themeAvatars.map((a) => {
                      const active = draftPrefs?.avatar?.theme === a.id;
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => applyPrefChange((p) => ({ ...(p || {}), avatar: { ...(p?.avatar || {}), theme: a.id, url: '' } }))}
                          className={`px-3 py-1 rounded-full border text-sm ${active ? 'border-purple-600 text-purple-700 dark:text-purple-300' : 'border-gray-300 text-gray-700 dark:text-gray-300'}`}
                          aria-label={`Select ${a.label} avatar`}
                        >
                          <span className="mr-1" aria-hidden="true">{a.symbol}</span>{a.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={undoAvatarTheme}
                      className="inline-flex items-center gap-1 text-xs text-purple-700 dark:text-purple-300 hover:underline"
                    >
                      <Undo2 className="w-3 h-3" /> Undo avatar theme
                    </button>
                  </div>
                </section>

                {/* Notifications */}
                <section className="mb-6" aria-labelledby="notif-section">
                  <h3 id="notif-section" className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Notifications</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {(['off','morning','afternoon','evening'] as DailyReminderSlot[]).map((slot) => {
                      const active = (draftPrefs?.notifications?.dailyReminder || 'off') === slot;
                      const label = slot === 'off' ? 'Off' : slot[0].toUpperCase()+slot.slice(1);
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => applyPrefChange((p) => ({ ...(p || {}), notifications: { ...(p?.notifications || {}), dailyReminder: slot } }))}
                          className={`px-3 py-2 rounded-md border ${active ? 'border-purple-600 text-purple-700 dark:text-purple-300' : 'border-gray-300 text-gray-700 dark:text-gray-300'}`}
                        >
                          <Bell className="inline w-4 h-4 mr-2" />{label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={undoDailyReminder}
                      className="inline-flex items-center gap-1 text-xs text-purple-700 dark:text-purple-300 hover:underline"
                    >
                      <Undo2 className="w-3 h-3" /> Undo notification timing
                    </button>
                  </div>
                </section>

                {/* Privacy */}
                <section className="mb-6" aria-labelledby="privacy-section">
                  <h3 id="privacy-section" className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Privacy</h3>
                  <div className="space-y-3 text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!draftPrefs?.privacy?.showProfilePublicly}
                        onChange={(e) => applyPrefChange((p) => ({ ...(p || {}), privacy: { ...(p?.privacy || {}), showProfilePublicly: e.target.checked } }))}
                      />
                      <span className="flex items-center gap-2"><Eye className="w-4 h-4" /> Show profile publicly</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => undoPrivacyProp('showProfilePublicly')}
                      className="ml-6 inline-flex items-center gap-1 text-xs text-purple-700 dark:text-purple-300 hover:underline"
                    >
                      <Undo2 className="w-3 h-3" /> Undo
                    </button>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!draftPrefs?.privacy?.shareMilestonesWithAI}
                        onChange={(e) => applyPrefChange((p) => ({ ...(p || {}), privacy: { ...(p?.privacy || {}), shareMilestonesWithAI: e.target.checked } }))}
                      />
                      <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Allow AI insights from milestones</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => undoPrivacyProp('shareMilestonesWithAI')}
                      className="ml-6 inline-flex items-center gap-1 text-xs text-purple-700 dark:text-purple-300 hover:underline"
                    >
                      <Undo2 className="w-3 h-3" /> Undo
                    </button>
                  </div>
                </section>

                {/* Info */}
                <section className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Changes are saved automatically. You can use Undo to revert the last change.
                </section>
                <div className="mt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={resetToDefaults}
                    className="text-xs text-purple-700 dark:text-purple-300 hover:underline"
                  >
                    Reset to defaults
                  </button>
                  <button
                    type="button"
                    onClick={undoLastSave}
                    className="text-xs text-purple-700 dark:text-purple-300 hover:underline"
                  >
                    Undo last save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="fixed bottom-4 right-4 z-[60] space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className={`rounded-md px-4 py-2 shadow text-sm text-white ${t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-gray-800'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}