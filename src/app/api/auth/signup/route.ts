import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/dal';
import { hashPassword } from '@/lib/auth/password';
import { computeEmailLookupHash, encryptEmail } from '@/lib/crypto/email';
import { isDomainAllowed, validateAgeGate } from '@/lib/auth/validators';
import { createSession, getSessionCookieOptions } from '@/lib/auth/session';
import { deriveStudentPseudonym } from '@/lib/crypto';
import { logAuditEvent } from '@/lib/audit';
import supportSnapshot from '@/data/support-snapshot.json';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, full_name, department, cohort_year, adult_confirmed, age } = body;

    // 1. Age Gate Verification (DPDP Act 2023 & Ethics Safeguards)
    const effectiveAge = typeof age === 'number' ? age : adult_confirmed ? 18 : 17;
    const ageResult = validateAgeGate(effectiveAge);

    if (!ageResult.isAllowed) {
      // Under-18: Zero data processing starts. Compassionate crisis path returned.
      return NextResponse.json(
        {
          error: 'Registration aborted. Automated telemetry is restricted to adult students (18+).',
          legal_flag: 'LEGAL REVIEW REQUIRED',
          supportive_action: ageResult.supportiveAction,
          message: ageResult.message,
          crisis_resources: (
            supportSnapshot as unknown as Array<{ id: string; name: string; phone?: string }>
          ).slice(0, 3),
          institution_support: {
            title: 'Campus Student Counseling & Wellbeing Support',
            availability: 'Mon-Fri 9:00 AM - 5:00 PM IST',
          },
        },
        { status: 403 }
      );
    }

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: 'Missing required registration fields.' }, { status: 400 });
    }

    const prisma = getPrismaClient();

    // 2. Validate institutional domain allowlist
    const institution = await prisma.institution.findFirst();
    if (!institution) {
      return NextResponse.json({ error: 'No active institution configured.' }, { status: 500 });
    }

    if (!isDomainAllowed(email, institution.domain_allowlist)) {
      return NextResponse.json(
        {
          error: 'Please use your official institutional email address (e.g., student.campus.edu).',
        },
        { status: 400 }
      );
    }

    // 3. Compute HMAC lookup hash and check for existing account
    const pepper = process.env.EMAIL_LOOKUP_PEPPER || 'sahayak_dev_pepper_2026_super_secret';
    const emailLookupHash = computeEmailLookupHash(email, pepper);

    const existing = await prisma.user.findUnique({
      where: { email_lookup_hash: emailLookupHash },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with these details already exists or cannot be registered.' },
        { status: 409 }
      );
    }

    // 4. Hash password with OWASP Argon2id & encrypt email with AES-256-GCM
    const masterKey =
      process.env.APP_MASTER_KEY ||
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const passwordHash = await hashPassword(password);
    const encryptedEmail = JSON.stringify(encryptEmail(email, masterKey));

    // 5. Atomic user and student profile creation
    const salt = process.env.PSEUDONYMIZATION_SALT || 'sahayak_dev_salt_2026_super_secret';

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          institution_id: institution.id,
          email_encrypted: encryptedEmail,
          email_lookup_hash: emailLookupHash,
          password_hash: passwordHash,
          full_name: full_name.trim(),
          department: department || 'General Studies',
          cohort_year: cohort_year || '2026',
          role: 'STUDENT',
          status: 'ACTIVE',
          adult_confirmed: true,
          is_synthetic: false,
        },
      });

      const pseudoId = deriveStudentPseudonym(newUser.id, salt);

      const profile = await tx.studentProfile.create({
        data: {
          student_pseudo_id: pseudoId,
          user_id: newUser.id,
          department: department || 'General Studies',
          cohort_year: cohort_year || '2026',
          locale: 'en',
          key_version: 1,
          is_synthetic: false,
        },
      });

      return { user: newUser, profile };
    });

    // 6. Issue session and log audit event
    const session = createSession(
      result.user.id,
      result.user.role,
      institution.id,
      result.profile.student_pseudo_id
    );

    await logAuditEvent(
      result.profile.student_pseudo_id,
      result.user.role,
      'AUTH_SIGNUP_SUCCESS',
      'USER_ACCOUNT',
      null,
      {
        event_category: 'AUTH',
        status_code: 201,
      },
      prisma
    );

    const response = NextResponse.json(
      {
        success: true,
        message: 'Account created successfully.',
        user: {
          id: result.user.id,
          role: result.user.role,
          full_name: result.user.full_name,
        },
      },
      { status: 201 }
    );

    const cookieOptions = getSessionCookieOptions(session.expiresAt);
    response.cookies.set(cookieOptions.name, session.token, cookieOptions);

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Registration failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
