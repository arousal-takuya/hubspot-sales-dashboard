import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'dashboard-session';
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

export interface AuthCredentials {
  username: string;
  password: string;
}

export async function validateCredentials(credentials: AuthCredentials): Promise<boolean> {
  const validUsername = process.env.DASHBOARD_USERNAME;
  const validPassword = process.env.DASHBOARD_PASSWORD;

  if (!validUsername || !validPassword) {
    console.error('Authentication credentials not configured in environment variables');
    return false;
  }

  return (
    credentials.username === validUsername &&
    credentials.password === validPassword
  );
}

export async function createSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = generateSessionToken();

  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSession(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

function generateSessionToken(): string {
  // Simple token generation - in production, use a proper session management library
  return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
}
