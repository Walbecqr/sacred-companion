#!/bin/bash

# Script to move existing files into new module structure

mkdir -p $(dirname src/modules/personal-dashboard/welcome-and-greeting-section/components/LoginForm.tsx)
mv src/app/components/auth/LoginForm.tsx src/modules/personal-dashboard/welcome-and-greeting-section/components/LoginForm.tsx
mkdir -p $(dirname src/modules/ai-chat-with-beatrice/core-chat-interface/components/ChatInterface.tsx)
mv src/app/components/chat/ChatInterface.tsx src/modules/ai-chat-with-beatrice/core-chat-interface/components/ChatInterface.tsx
mkdir -p $(dirname src/modules/lunar-and-astrological-integration-engine/current-moon-phase-display/components/CompactMoonPhase.tsx)
mv src/components/moon/CompactMoonPhase.tsx src/modules/lunar-and-astrological-integration-engine/current-moon-phase-display/components/CompactMoonPhase.tsx
mkdir -p $(dirname src/modules/lunar-and-astrological-integration-engine/current-moon-phase-display/components/LunarCalendar.tsx)
mv src/components/moon/LunarCalendar.tsx src/modules/lunar-and-astrological-integration-engine/current-moon-phase-display/components/LunarCalendar.tsx
mkdir -p $(dirname src/modules/lunar-and-astrological-integration-engine/current-moon-phase-display/components/MoonPhaseDisplay.tsx)
mv src/components/moon/MoonPhaseDisplay.tsx src/modules/lunar-and-astrological-integration-engine/current-moon-phase-display/components/MoonPhaseDisplay.tsx
mkdir -p $(dirname src/modules/ai-chat-with-beatrice/encouragement-oracle/components/OracleCard.tsx)
mv src/components/oracle/OracleCard.tsx src/modules/ai-chat-with-beatrice/encouragement-oracle/components/OracleCard.tsx
mkdir -p $(dirname src/modules/personal-dashboard/spiritual-progress-overview/components/Skeleton.tsx)
mv src/components/ui/skeleton.tsx src/modules/personal-dashboard/spiritual-progress-overview/components/Skeleton.tsx
mkdir -p $(dirname src/modules/ai-chat-with-beatrice/core-chat-interface/db/beatrice.ts)
mv src/app/lib/ai/beatrice.ts src/modules/ai-chat-with-beatrice/core-chat-interface/db/beatrice.ts
mkdir -p $(dirname src/lib/supabase/dataObjects.ts)
mv src/app/lib/data/supabaseDataObjects.ts src/lib/supabase/dataObjects.ts
mkdir -p $(dirname src/modules/lunar-and-astrological-integration-engine/real-time-celestial-data/db/moon-phase-api.ts)
mv src/lib/moon-phase-api.ts src/modules/lunar-and-astrological-integration-engine/real-time-celestial-data/db/moon-phase-api.ts
mkdir -p $(dirname src/lib/supabase/index.ts)
mv src/lib/supabase.ts src/lib/supabase/index.ts
mkdir -p $(dirname src/modules/spiritual-journey-profile/milestone-tracker-with-achievement-system/actions/milestones.ts)
mv src/modules/spiritual-profile/actions/milestones.ts src/modules/spiritual-journey-profile/milestone-tracker-with-achievement-system/actions/milestones.ts
mkdir -p $(dirname src/modules/spiritual-journey-profile/milestone-tracker-with-achievement-system/db/queries.ts)
mv src/modules/spiritual-profile/db/queries.ts src/modules/spiritual-journey-profile/milestone-tracker-with-achievement-system/db/queries.ts
mkdir -p $(dirname src/modules/spiritual-journey-profile/milestone-tracker-with-achievement-system/hooks/useMilestones.ts)
mv src/modules/spiritual-profile/hooks/useMilestones.ts src/modules/spiritual-journey-profile/milestone-tracker-with-achievement-system/hooks/useMilestones.ts
mkdir -p $(dirname src/modules/spiritual-journey-profile/milestone-tracker-with-achievement-system/components/SpiritualJourneyDashboard.tsx)
mv src/modules/spiritual-profile/ui/SpiritualJourneyDashboard.tsx src/modules/spiritual-journey-profile/milestone-tracker-with-achievement-system/components/SpiritualJourneyDashboard.tsx
mkdir -p $(dirname src/modules/spiritual-journey-profile/milestone-tracker-with-achievement-system/types.ts)
mv src/modules/spiritual-profile/types.ts src/modules/spiritual-journey-profile/milestone-tracker-with-achievement-system/types.ts
mkdir -p $(dirname src/modules/lunar-and-astrological-integration-engine/current-moon-phase-display/types.ts)
mv src/types/moon-phase.ts src/modules/lunar-and-astrological-integration-engine/current-moon-phase-display/types.ts