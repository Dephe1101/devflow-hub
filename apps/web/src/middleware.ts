import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { jwtDecode } from 'jwt-decode';

import { APP_ROUTES, KEYS, ROLES } from '@repo/constants';

const AUTH_ROUTES = [APP_ROUTES.LOGIN, APP_ROUTES.REGISTER];
const PROTECTED_PREFIXES = [APP_ROUTES.DASHBOARD, APP_ROUTES.SETTINGS, '/admin'];

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  const hasToken = request.cookies.has(KEYS.COOKIE.REFRESH_TOKEN);

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

    // Role-based authorization for admin routes
    if (pathname.startsWith('/admin')) {
      const tokenString = request.cookies.get(KEYS.COOKIE.REFRESH_TOKEN)?.value;
      if (tokenString) {
        try {
          const decoded = jwtDecode<{ role?: string }>(tokenString);

          if (decoded.role !== ROLES.ADMIN) {
            // Not an admin, redirect to dashboard
            return NextResponse.redirect(new URL('/dashboard', request.url));
          }
        } catch {
          // If token decoding fails, redirect to login
          return NextResponse.redirect(new URL('/login', request.url));
        }
      } else {
        return NextResponse.redirect(new URL('/login', request.url));
      }
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
