import { NextRequest, NextResponse } from 'next/server';
import { validateSession, revokeAllUserSessions, SESSION_COOKIE_NAME } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = validateSession(token);
  if (!session) {
    const res = NextResponse.json({ error: 'Session expired or invalid' }, { status: 401 });
    res.cookies.delete(SESSION_COOKIE_NAME);
    return res;
  }

  const revokedCount = revokeAllUserSessions(session.userId);

  const response = NextResponse.json({
    success: true,
    message: `Logged out of all ${revokedCount} active sessions.`,
    revokedCount,
  });

  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
