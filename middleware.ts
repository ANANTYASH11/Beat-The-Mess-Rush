import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, UserSession, serializeSession } from '@/lib/auth';

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

  // Seamless evaluation access for /kitchen
  if (pathname.startsWith('/kitchen')) {
    if (!session || (session.role !== 'kitchen' && session.role !== 'admin')) {
      const res = NextResponse.next();
      const defaultKitchenSession: UserSession = {
        role: 'kitchen',
        name: 'Central Mess North Kitchen',
        messCode: 'central-mess-north',
        messName: 'Central Mess North',
      };
      res.cookies.set(SESSION_COOKIE_NAME, serializeSession(defaultKitchenSession), {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
      });
      return res;
    }
  }

  // Seamless evaluation access for /staff
  if (pathname.startsWith('/staff')) {
    if (!session || (session.role !== 'staff' && session.role !== 'admin')) {
      const res = NextResponse.next();
      const defaultStaffSession: UserSession = {
        role: 'staff',
        name: 'Central Mess North Staff',
        messCode: 'central-mess-north',
        messName: 'Central Mess North',
      };
      res.cookies.set(SESSION_COOKIE_NAME, serializeSession(defaultStaffSession), {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
      });
      return res;
    }
  }

  // Seamless evaluation access for /admin
  if (pathname.startsWith('/admin')) {
    if (!session || session.role !== 'admin') {
      const res = NextResponse.next();
      const defaultAdminSession: UserSession = {
        role: 'admin',
        name: 'Hostel Mess Administrator',
        messCode: 'central-mess-north',
        messName: 'Central Mess North',
      };
      res.cookies.set(SESSION_COOKIE_NAME, serializeSession(defaultAdminSession), {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
      });
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/staff/:path*', '/kitchen/:path*', '/admin/:path*'],
};
