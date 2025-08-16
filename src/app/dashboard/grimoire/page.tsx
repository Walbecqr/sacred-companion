'use client';

import React from 'react';
import { GrimoireProvider } from '@/contexts/GrimoireContext';
import { GrimoireDashboard } from '@/components/grimoire/GrimoireDashboard';

export default function GrimoirePage() {
  return (
    <GrimoireProvider>
      <GrimoireDashboard />
    </GrimoireProvider>
  );
}
