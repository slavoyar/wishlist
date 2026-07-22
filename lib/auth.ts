import { getIronSession, type SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export type SessionData = {
  isAuthenticated?: boolean;
};

function getSessionPassword() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    // iron-session requires >= 32 chars; fall back only for local scaffold
    return 'dev-only-session-secret-min-32-chars!!';
  }
  return secret;
}

export function getSessionOptions(): SessionOptions {
  return {
    password: getSessionPassword(),
    cookieName: 'wishlist_session',
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    },
  };
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), getSessionOptions());
}

export async function requireAuth() {
  const session = await getSession();
  if (!session.isAuthenticated) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}

export async function isAuthenticated() {
  const session = await getSession();
  return Boolean(session.isAuthenticated);
}
