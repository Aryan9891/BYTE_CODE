import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Strict Security Invariant: Dev-only demo switcher returns 404 in production
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const { role } = await req.json();
    if (!['STUDENT', 'COUNSELOR', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Invalid demo role' }, { status: 400 });
    }

    const res = NextResponse.json({ success: true, role });
    res.cookies.set('sahayak_demo_role', role, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return res;
  } catch {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }
}

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.json({
    status: 'ok',
    environment: 'development',
    available_roles: ['STUDENT', 'COUNSELOR', 'ADMIN'],
  });
}
