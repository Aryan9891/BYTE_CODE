import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/dal';
import { resolveDemoActor } from '@/lib/auth/demo-session';
import { can } from '@/lib/auth/policy';

export async function GET(req: NextRequest) {
  try {
    const demoCookie = req.cookies.get('sahayak_demo_role')?.value;
    const actor = resolveDemoActor(demoCookie || 'ADMIN');

    const auth = can(actor, 'READ', 'AUDIT_LOG', 'AUDIT_INSPECTION');
    if (!auth.granted) {
      return NextResponse.json({ error: auth.reason }, { status: 403 });
    }

    const prisma = getPrismaClient();
    const entries = await prisma.auditLogEntry.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      total: entries.length,
      entries: entries.map((e) => ({
        id: e.id,
        sequence_number: e.sequence_number.toString(),
        timestamp: e.timestamp.toISOString(),
        actor_pseudo_id: e.actor_pseudo_id,
        actor_role: e.actor_role,
        action_type: e.action_type,
        resource_type: e.resource_type,
        target_pseudo_id: e.target_pseudo_id,
        details: e.details,
        previous_entry_hash: e.previous_entry_hash,
        current_hash: e.current_hash,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load audit logs';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
