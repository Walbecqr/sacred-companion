import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Handles the OAuth sign-in callback, exchanges the authorization code for a session, ensures a user profile exists, and redirects the user.
 *
 * If an authorization code is present in the request, authenticates the user via Supabase and creates a default user profile if one does not already exist. Redirects the user to the path specified by the `returnTo` query parameter or to `/dashboard` by default.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);
    
    // Check if user profile exists, create if not
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile } = await supabase
        .from('user_spiritual_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!profile) {
        // Create a new profile for OAuth users
        await supabase
          .from('user_spiritual_profiles')
          .insert({
            user_id: user.id,
            display_name: user.user_metadata?.full_name || user.email?.split('@')[0],
            experience_level: 'beginner',
            created_at: new Date().toISOString()
          });
      }
    }
  }

  // URL to redirect to after sign in process completes
  const redirectTo = requestUrl.searchParams.get('returnTo') || '/dashboard'
  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
}
