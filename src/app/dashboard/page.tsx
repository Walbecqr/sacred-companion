'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import ChatInterface from '../components/chat/ChatInterface';
import { 
  Sparkles, Moon, BookOpen, Compass, 
  Heart, LogOut, Menu, X, 
  Feather
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';

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
  const [activeSection, setActiveSection] = useState('chat');
  const [currentMoonPhase, setCurrentMoonPhase] = useState('');
  
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

  const navigationItems = [
    { id: 'chat', icon: Sparkles, label: 'Chat with Beatrice', badge: null },
    { id: 'journal', icon: Feather, label: 'Journal', badge: 'Coming Soon' },
    { id: 'rituals', icon: Sparkles, label: 'Rituals', badge: 'Coming Soon' },
    { id: 'grimoire', icon: BookOpen, label: 'Grimoire', badge: 'Coming Soon' },
    { id: 'correspondences', icon: Compass, label: 'Correspondences', badge: 'Coming Soon' },
    { id: 'profile', icon: Heart, label: 'Spiritual Profile', badge: null },
  ];

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
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
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

            {/* Daily Spiritual Stats */}
            <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-3">Today&apos;s Energy</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Spiritual Focus</span>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${i <= 3 ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Energy Level</span>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${i <= 4 ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeSection === 'chat' && (
            <div className="h-full p-4">
              <ChatInterface />
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