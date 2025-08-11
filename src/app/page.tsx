import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * Root application page.
 *
 * Users who visit the base URL are immediately redirected based on their
 * authentication state:
 *   - Authenticated users are taken to the main dashboard
 *   - Unauthenticated users are sent to the login screen
 */
export default async function Home() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  redirect(session ? '/dashboard' : '/login');
}

