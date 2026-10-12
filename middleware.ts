import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, UserSession } from '@/lib/auth';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const rawSession = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  let session: UserSession | null = null;
  if (rawSession) {
    try {
      session = JSON.parse(decodeURIComponent(rawSession));
    } catch {
      session = null;
    }
  }

  // Protect /staff
  if (pathname.startsWith('/staff')) {
    if (!session || (session.role !== 'staff' && session.role !== 'admin')) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', '/staff');
      url.searchParams.set('role', 'staff');
      return NextResponse.redirect(url);
    }
  }

  // Protect /kitchen
  if (pathname.startsWith('/kitchen')) {
    if (!session || (session.role !== 'kitchen' && session.role !== 'admin')) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', '/kitchen');
      url.searchParams.set('role', 'kitchen');
      return NextResponse.redirect(url);
    }
  }

  // Protect /admin
  if (pathname.startsWith('/admin')) {
    if (!session || (session.role !== 'admin' && session.role !== 'kitchen')) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', '/admin');
      url.searchParams.set('role', 'admin');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/staff/:path*', '/kitchen/:path*', '/admin/:path*'],
};
