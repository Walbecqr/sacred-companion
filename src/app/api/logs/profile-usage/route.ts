 import { NextRequest, NextResponse } from 'next/server'
 import { cookies } from 'next/headers'
 import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
 
 // Minimal logging endpoint to record which profile fields were used by AI personalization
 // Expects POST with JSON: { conversationId?: string, usedFields: string[], feature: 'chat'|'rituals'|'journaling', notes?: string }
 export async function POST(req: NextRequest) {
   try {
     const supabase = createRouteHandlerClient({ cookies })
     const { data: userData } = await supabase.auth.getUser()
     const user = userData?.user
     if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 
     const body = await req.json() as { conversationId?: string; usedFields?: string[]; feature?: string; notes?: string }
     const usedFields = Array.isArray(body.usedFields) ? body.usedFields : []
     const feature = typeof body.feature === 'string' ? body.feature : 'chat'
 
     // Store as a message metadata entry to avoid schema churn; could be moved to a dedicated table later
     await supabase.from('messages').insert({
       conversation_id: body.conversationId || null,
       user_id: user.id,
       role: 'system',
       content: `[profile-usage] feature=${feature}; used=${usedFields.join(', ')}`,
       metadata: { type: 'profile_usage', usedFields, feature, notes: body.notes || '' }
     })
 
     return NextResponse.json({ ok: true })
   } catch (e) {
     return NextResponse.json({ error: 'Failed to log' }, { status: 500 })
   }
 }
 

