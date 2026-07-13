import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const role = (session?.user as any)?.role;

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (!session || role !== 'admin') {
      return NextResponse.redirect(new URL('/login?role=admin', req.url));
    }
  }

  // Protect /broker routes
  if (pathname.startsWith('/broker')) {
    if (!session || role !== 'broker') {
      return NextResponse.redirect(new URL('/login?role=broker', req.url));
    }
  }

  // Store affiliate ref cookie if ?ref= param present
  const ref = req.nextUrl.searchParams.get('ref');
  if (ref) {
    const response = NextResponse.next();
    response.cookies.set('affiliate_ref', ref, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
    });
    return response;
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/admin/:path*',
    '/broker/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
