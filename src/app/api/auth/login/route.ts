import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/dal';
import { verifyPassword } from '@/lib/auth/password';
import { computeEmailLookupHash } from '@/lib/crypto/email';
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/lib/auth/rate-limit';
import { rotateSession, getSessionCookieOptions, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { logAuditEvent } from '@/lib/audit';

const GENERIC_ERROR = 'Invalid credentials';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
    }

    const emailLookupHash = computeEmailLookupHash(
      email,
      process.env.EMAIL_LOOKUP_PEPPER || 'sahayak_dev_pepper_2026_super_secret'
    );

    // 1. Check rate limit on IP and identifier
    const ipLimit = checkRateLimit(`ip:${ip}`);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Account temporarily locked. Please try again later.' },
        { status: 429 }
      );
    }

    const idLimit = checkRateLimit(`id:${emailLookupHash}`);
    if (!idLimit.allowed) {
      return NextResponse.json(
        { error: 'Account temporarily locked. Please try again later.' },
        { status: 429 }
      );
    }

    // 2. Lookup user by keyed HMAC hash (NO plain email query)
    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { email_lookup_hash: emailLookupHash },
      include: {
        student_profile: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      recordFailedAttempt(`ip:${ip}`);
      recordFailedAttempt(`id:${emailLookupHash}`);
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    // 3. Verify password via Argon2id
    const validPassword = await verifyPassword(user.password_hash, password);
    if (!validPassword) {
      recordFailedAttempt(`ip:${ip}`);
      recordFailedAttempt(`id:${emailLookupHash}`);
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    // Reset rate limits on success
    resetRateLimit(`ip:${ip}`);
    resetRateLimit(`id:${emailLookupHash}`);

    // 4. Session rotation on login (prevent session fixation)
    const oldToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = rotateSession(oldToken, {
      userId: user.id,
      role: user.role,
      institutionId: user.institution_id,
      studentPseudoId: user.student_profile?.student_pseudo_id,
    });

    // 5. Audit login success
    await logAuditEvent(
      user.student_profile?.student_pseudo_id || user.id,
      user.role,
      'AUTH_LOGIN_SUCCESS',
      'USER_SESSION',
      null,
      {
        event_category: 'AUTH',
        status_code: 200,
      },
      prisma
    );

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        role: user.role,
        full_name: user.full_name,
        department: user.department,
        cohort_year: user.cohort_year,
      },
    });

    // Set secure httpOnly cookie
    const cookieOptions = getSessionCookieOptions(session.expiresAt);
    response.cookies.set(cookieOptions.name, session.token, cookieOptions);

    return response;
  } catch {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
