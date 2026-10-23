import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read role cookie or session header
  const userRole = request.cookies.get('arogya_role')?.value;

  // Protect Admin / Doctor only routes
  const protectedAdminRoutes = [
    '/doctor-workspace',
    '/reception',
    '/prescription',
    '/analytics',
  ];

  const isProtectedAdminRoute = protectedAdminRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedAdminRoute && userRole !== 'admin') {
    // Redirect non-admins or unauthenticated users to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/doctor-workspace/:path*',
    '/reception/:path*',
    '/prescription/:path*',
    '/analytics/:path*',
  ],
};