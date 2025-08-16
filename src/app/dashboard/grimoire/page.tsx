'use client';

import React from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { GrimoireProvider } from '@/contexts/GrimoireContext';
import { GrimoireDashboard } from '@/components/grimoire/GrimoireDashboard';

export default function GrimoirePage() {
  return (
    <AuthGuard>
      <GrimoireProvider>
        <GrimoireDashboard />
      </GrimoireProvider>
    </AuthGuard>
  );
}
