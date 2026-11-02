import { NextRequest } from 'next/server';
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { resolveDemoActor } from '@/lib/auth/demo-session';
import { SessionActor } from '@/lib/auth/policy';
import { getPrismaClient } from '@/lib/dal';

/**
 * Resolves the authenticated actor for incoming API requests.
 * Prioritizes active session token; falls back to demo cookie or header in development/testing.
 */
export async function resolveActorFromRequest(
  req: NextRequest,
  defaultRole: 'STUDENT' | 'COUNSELOR' | 'ADMIN' = 'COUNSELOR'
): Promise<SessionActor> {
  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (sessionToken) {
    const session = validateSession(sessionToken);
    if (session) {
      try {
        const prisma = getPrismaClient();
        const user = await prisma.user.findUnique({
          where: { id: session.userId },
          include: { student_profile: true },
        });
        if (user) {
          return {
            id: user.id,
            role: user.role,
            email: `${user.role.toLowerCase()}@campus.edu`,
            institution_id: user.institution_id,
            student_pseudo_id: user.student_profile?.student_pseudo_id || session.studentPseudoId,
          };
        }
      } catch {
        // Fall back to session metadata if DB query fails
      }

      return {
        id: session.userId,
        role: session.role,
        email: `${session.role.toLowerCase()}@campus.edu`,
        institution_id: session.institutionId,
        student_pseudo_id: session.studentPseudoId,
      };
    }
  }

  const demoRole =
    req.cookies.get('sahayak_demo_role')?.value || req.headers.get('x-demo-role') || defaultRole;

  return resolveDemoActor(demoRole);
}
