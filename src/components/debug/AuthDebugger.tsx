'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface AuthState {
  session?: {
    user?: string;
    email?: string;
    expires_at?: number;
  } | null;
  user?: {
    id?: string;
    email?: string;
  } | null;
  timestamp?: string;
  error?: string;
}

export function AuthDebugger() {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check session
        const { data: { session } } = await supabase.auth.getSession();
        
        // Check user
        const { data: { user } } = await supabase.auth.getUser();
        
        setAuthState({
          session: session ? {
            user: session.user?.id,
            email: session.user?.email,
            expires_at: session.expires_at
          } : null,
          user: user ? {
            id: user.id,
            email: user.email
          } : null,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        setAuthState({ error: error instanceof Error ? error.message : 'Unknown error' });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [supabase]);

  if (loading) {
    return <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">Loading auth debug info...</div>;
  }

  return (
    <div className="p-4 bg-blue-100 border border-blue-400 rounded mb-4">
      <h3 className="font-bold mb-2">Auth Debug Info:</h3>
      <pre className="text-xs overflow-auto">
        {JSON.stringify(authState, null, 2)}
      </pre>
    </div>
  );
}
