import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read role cookie
  const userRole = request.cookies.get('arogya_role')?.value;

  // Admin routes
  const protectedAdminRoutes = [
    '/doctor-workspace',
    '/reception',
    '/prescription',
    '/analytics',
  ];

  const isProtectedAdminRoute = protectedAdminRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If trying to access admin route without admin cookie, redirect to /login
  if (isProtectedAdminRoute && userRole !== 'admin') {
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