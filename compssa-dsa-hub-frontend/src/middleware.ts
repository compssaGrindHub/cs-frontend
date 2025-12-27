import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

// Admin routes that require ADMIN role
const adminRoutes = ['/admin'];

// User routes that require authentication (USER, ADMIN, or INSTRUCTOR)
const protectedRoutes = ['/dashboard', '/attendance', '/contests', '/leaderboard', '/problems', '/profile', '/sessions', '/settings'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Check if route is admin route
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  
  // Check if route is protected (requires auth)
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Get auth tokens from cookies (set by client-side auth store)
  // Note: In a real app, you might want to verify the token with your backend
  const accessToken = request.cookies.get('accessToken')?.value;
  
  // For now, we'll rely on client-side checks in layouts
  // This middleware can be extended to verify tokens with backend
  // For client-side routing, the layouts will handle the actual protection
  
  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For protected and admin routes, let the client-side layouts handle authentication
  // This is because Zustand state is client-side only
  // In production, you'd want to verify the token here with your backend
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

