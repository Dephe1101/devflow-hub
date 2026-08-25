import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_ROUTES = ['/login', '/register'];
const PROTECTED_PREFIXES = ['/dashboard', '/settings'];

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // The backend sets the refreshToken cookie named 'devflow_refresh_token'
  const hasToken = request.cookies.has('devflow_refresh_token');

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isAuthRoute) {
    if (hasToken) {
      // If user is already authenticated, redirect them away from auth pages
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (isProtectedRoute) {
    if (!hasToken) {
      // If user is NOT authenticated, redirect them to login page
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
