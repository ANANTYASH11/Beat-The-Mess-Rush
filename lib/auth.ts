import { cookies } from 'next/headers';

export interface UserSession {
  role: 'student' | 'staff' | 'kitchen' | 'admin';
  rollNumber?: string;
  name: string;
}

const SESSION_COOKIE = 'mess_rush_session';

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as UserSession;
  } catch {
    return null;
  }
}

export function serializeSession(session: UserSession): string {
  return encodeURIComponent(JSON.stringify(session));
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
