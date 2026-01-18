import { NextResponse } from 'next/server';
import { getRememberMe } from '@/app/lib/auth';

export async function GET() {
  try {
    const remembered = await getRememberMe();

    if (remembered) {
      return NextResponse.json({
        hasRemembered: true,
        username: remembered.username,
        password: remembered.password,
      });
    }

    return NextResponse.json({ hasRemembered: false });
  } catch (error) {
    console.error('Remember me check error:', error);
    return NextResponse.json({ hasRemembered: false });
  }
}
