import { NextRequest, NextResponse } from 'next/server';

// Cheap, edge-safe presence check on the session cookie. This is a UX
// redirect layer, not the sole authorization boundary — every protected
// API route and server component still calls getCurrentUser()/requirePermission()
// against the database, which is what actually enforces access. Middleware
// just stops an unauthenticated visitor from ever rendering the page shell.
const PROTECTED_PREFIXES = ['/dashboard', '/withdraw', '/kyc', '/support'];
const ADMIN_PREFIXES = ['/admin'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionCookie = req.cookies.get('bi_session')?.value;
  const adminCookie = req.cookies.get('bi_admin_session')?.value;

  if (ADMIN_PREFIXES.some((p) => pathname.startsWith(p)) && !pathname.startsWith('/admin/login')) {
    if (!adminCookie) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!sessionCookie) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/withdraw/:path*', '/kyc/:path*', '/support/:path*', '/admin/:path*'],
};
