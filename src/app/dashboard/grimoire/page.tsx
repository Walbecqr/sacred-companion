'use client';

import React from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { GrimoireProvider } from '@/contexts/GrimoireContext';
import { GrimoireDashboard } from '@/components/grimoire/GrimoireDashboard';
import { AuthDebugger } from '@/components/debug/AuthDebugger';

export default function GrimoirePage() {
  return (
    <AuthGuard>
      <div>
        <AuthDebugger />
        <GrimoireProvider>
          <GrimoireDashboard />
        </GrimoireProvider>
      </div>
    </AuthGuard>
  );
}
