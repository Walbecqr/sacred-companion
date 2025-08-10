import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession();

  // Protected routes that require authentication (avoid redirecting API requests)
  const protectedRoutes = ['/dashboard'];
  const authRoutes = ['/login', '/signup'];
  
  const path = req.nextUrl.pathname;
  
  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isApiRoute = path.startsWith('/api/');
  const isAuthRoute = authRoutes.some(route => path.startsWith(route));
  
  // Let API routes handle auth themselves to avoid redirecting POSTs
  if (isApiRoute) {
    return res;
  }

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectTo', path);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Redirect to dashboard if accessing auth routes with active session
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  // Redirect root to appropriate page
  if (path === '/') {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    } else {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};