 import { NextRequest, NextResponse } from 'next/server'
 import { cookies } from 'next/headers'
 import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
 import type { SupabaseClient } from '@supabase/supabase-js'
 
 export async function POST(req: NextRequest) {
   const supabase = createRouteHandlerClient({ cookies })
   const { data: userData } = await supabase.auth.getUser()
   const user = userData?.user
   if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 
   const { data: row } = await supabase
     .from('user_spiritual_profiles')
     .select('current_journey_phase, spiritual_path, practice_frequency, experience_level')
     .eq('user_id', user.id)
     .maybeSingle()
 
   const phase = (row?.current_journey_phase || '').toString()
   const paths = Array.isArray(row?.spiritual_path) ? (row?.spiritual_path as string[]) : []
   const practice = (row?.practice_frequency || '').toString()
   const level = (row?.experience_level || 'beginner').toString()
 
   const usedFields = [
     ...(phase ? ['current_journey_phase'] : []),
     ...(paths.length ? ['spiritual_path'] : []),
     ...(practice ? ['practice_frequency'] : []),
     'experience_level'
   ]
 
   const prompts = buildPrompts({ phase, paths, practice, level })
   await logProfileUsage(supabase, user.id, usedFields, 'journaling')
 
   return NextResponse.json({ prompts })
 }
 
 function buildPrompts({ phase, paths, practice, level }: { phase: string; paths: string[]; practice: string; level: string }) {
   const base: string[] = []
   if (phase) base.push(`Reflect on your current phase (${phase}): what signs or lessons are present right now?`)
   if (paths.length) base.push(`From your path (${paths.join(', ')}), which teachings feel most alive today?`)
   if (practice) base.push(`How does your practice rhythm (${practice}) support your well-being this week?`)
   base.push(`As a ${level}, what skill are you nurturing next?`)
   // Ensure at least 3 prompts
   while (base.length < 3) base.push('What is one insight your intuition is offering today?')
   return base.slice(0, 5)
 }
 
 async function logProfileUsage(supabase: SupabaseClient, userId: string, usedFields: string[], feature: string) {
   try {
     await supabase.from('messages').insert({
       conversation_id: null,
       user_id: userId,
       role: 'system',
       content: `[profile-usage] feature=${feature}; used=${usedFields.join(', ')}`,
       metadata: { type: 'profile_usage', usedFields, feature }
     })
   } catch {}
 }
 

