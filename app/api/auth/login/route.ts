import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials, createSession, saveRememberMe, clearRememberMe } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, rememberMe } = body;

    console.log('Login attempt:', { username, hasPassword: !!password });
    console.log('Environment check:', {
      hasUsername: !!process.env.DASHBOARD_USERNAME,
      hasPassword: !!process.env.DASHBOARD_PASSWORD,
    });

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const isValid = await validateCredentials({ username, password });

    if (!isValid) {
      console.log('Invalid credentials provided');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    await createSession();

    // Remember Me機能: チェックされている場合は認証情報を保存
    if (rememberMe) {
      await saveRememberMe(username, password);
    } else {
      await clearRememberMe();
    }

    console.log('Login successful');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
