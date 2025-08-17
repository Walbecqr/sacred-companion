'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface AuthInfo {
  hasSession?: boolean;
  hasUser?: boolean;
  userId?: string;
  userEmail?: string;
  sessionExpires?: number;
  error?: string;
}

interface DbInfo {
  vaultsAccessible?: boolean;
  vaultError?: string;
  vaultCount?: number;
}

export default function GrimoireTestPage() {
  const [authInfo, setAuthInfo] = useState<AuthInfo | null>(null);
  const [dbInfo, setDbInfo] = useState<DbInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const testAuthAndDb = async () => {
      try {
        // Test 1: Check authentication
        const { data: { session } } = await supabase.auth.getSession();
        const { data: { user } } = await supabase.auth.getUser();
        
        setAuthInfo({
          hasSession: !!session,
          hasUser: !!user,
          userId: user?.id,
          userEmail: user?.email,
          sessionExpires: session?.expires_at
        });

        // Test 2: Check if user exists, try to access database
        if (user) {
          try {
            // Test if grimoire_vaults table exists and is accessible
            const { data: vaults, error: vaultError } = await supabase
              .from('grimoire_vaults')
              .select('id')
              .eq('user_id', user.id)
              .limit(1);

            setDbInfo({
              vaultsAccessible: !vaultError,
              vaultError: vaultError?.message,
              vaultCount: vaults?.length || 0
            });
          } catch (dbError) {
            setDbInfo({
              vaultsAccessible: false,
              vaultError: dbError instanceof Error ? dbError.message : 'Unknown DB error'
            });
          }
        }
      } catch (error) {
        setAuthInfo({
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      } finally {
        setLoading(false);
      }
    };

    testAuthAndDb();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Testing authentication and database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-purple-800">Grimoire Debug Test</h1>
        
        {/* Authentication Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Authentication Status</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(authInfo, null, 2)}
          </pre>
        </div>

        {/* Database Info */}
        {authInfo?.hasUser && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Database Status</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(dbInfo, null, 2)}
            </pre>
          </div>
        )}

        {/* Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Summary</h2>
          <div className="space-y-2">
            <div className={`p-3 rounded ${authInfo?.hasUser ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              Authentication: {authInfo?.hasUser ? '✅ Authenticated' : '❌ Not Authenticated'}
            </div>
            {authInfo?.hasUser && (
              <div className={`p-3 rounded ${dbInfo?.vaultsAccessible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                Database Access: {dbInfo?.vaultsAccessible ? '✅ Accessible' : '❌ Not Accessible'}
              </div>
            )}
            {authInfo?.error && (
              <div className="p-3 rounded bg-red-100 text-red-800">
                Error: {authInfo.error}
              </div>
            )}
            {dbInfo?.vaultError && (
              <div className="p-3 rounded bg-red-100 text-red-800">
                Database Error: {dbInfo.vaultError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
