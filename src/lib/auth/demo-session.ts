import { Role } from '@prisma/client';
import { SessionActor } from './policy';

export const DEMO_USERS: Record<string, SessionActor> = {
  STUDENT: {
    id: 'usr_demo_student_01',
    email: 'student@campus.edu',
    role: Role.STUDENT,
    institution_id: 'inst_campus_edu',
    student_pseudo_id: 'pseudo_student_aarav_sharma',
  },
  COUNSELOR: {
    id: 'usr_demo_counselor_01',
    email: 'counselor@campus.edu',
    role: Role.COUNSELOR,
    institution_id: 'inst_campus_edu',
  },
  ADMIN: {
    id: 'usr_demo_admin_01',
    email: 'admin@campus.edu',
    role: Role.ADMIN,
    institution_id: 'inst_campus_edu',
  },
};

export function resolveDemoActor(roleStr?: string | null): SessionActor {
  if (roleStr && DEMO_USERS[roleStr]) {
    return DEMO_USERS[roleStr];
  }
  return DEMO_USERS.STUDENT;
}
