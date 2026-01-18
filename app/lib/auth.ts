import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'dashboard-session';
const REMEMBER_ME_COOKIE_NAME = 'dashboard-remember';
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds
const REMEMBER_ME_DURATION = 60 * 60 * 24 * 30; // 30 days in seconds

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

// Remember Me機能: 認証情報を暗号化してCookieに保存
export async function saveRememberMe(username: string, password: string): Promise<void> {
  const cookieStore = await cookies();
  // Base64エンコードで保存（本番環境ではより強力な暗号化を推奨）
  const encoded = Buffer.from(JSON.stringify({ username, password })).toString('base64');

  cookieStore.set(REMEMBER_ME_COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: REMEMBER_ME_DURATION,
    path: '/',
  });
}

export async function getRememberMe(): Promise<{ username: string; password: string } | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(REMEMBER_ME_COOKIE_NAME);

  if (!cookie?.value) {
    return null;
  }

  try {
    const decoded = Buffer.from(cookie.value, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export async function clearRememberMe(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(REMEMBER_ME_COOKIE_NAME);
}
