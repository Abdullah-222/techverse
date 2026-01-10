/**
 * Next.js Middleware for Route Protection
 * 
 * This middleware protects routes based on authentication status.
 * Uses lightweight cookie checking to avoid bundling heavy dependencies.
 * 
 * Protected routes (require authentication):
 * - /add-book - Adding books to the platform
 * - /exchange/* - Book exchange operations
 * - /profile - User profile page
 * - /points - Buy points page
 * 
 * Public routes (accessible without authentication):
 * - /books - Browse all books
 * - /book/[id] - View individual book by QR code
 * - /book-history/[bookId] - View book history (accessible via QR code)
 * - /forums - Forum discussions (supports anonymous participation)
 * - /login - Login page
 * - /signup - Signup page
 * 
 * Security considerations:
 * - Checks NextAuth session cookie directly (lightweight)
 * - Redirects unauthenticated users to login
 * - Preserves intended destination for redirect after login
 * - Full auth validation happens in API routes/server components
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Define protected routes
  // These routes require authentication
  const protectedRoutes = [
    '/add-book',
    '/exchange',
    '/profile',
    '/points',
    '/reports',
  ]

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // If accessing a protected route, check for session cookie
  if (isProtectedRoute) {
    // Check for NextAuth session cookie
    // Based on auth.ts configuration: 'next-auth.session-token'
    // In production with HTTPS, it may be prefixed with '__Secure-'
    const sessionToken = 
      req.cookies.get('next-auth.session-token')?.value ||
      req.cookies.get('__Secure-next-auth.session-token')?.value

    // If no session token, redirect to login
    if (!sessionToken) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Allow all other requests to proceed
  return NextResponse.next()
}

// Configure which routes the middleware runs on
// This improves performance by not running middleware on unnecessary routes
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled by NextAuth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

