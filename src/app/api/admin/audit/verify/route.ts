import { NextRequest, NextResponse } from 'next/server';
import { verifyAuditChain } from '@/lib/audit';
import { resolveDemoActor } from '@/lib/auth/demo-session';
import { can } from '@/lib/auth/policy';

export async function POST(req: NextRequest) {
  try {
    const demoCookie = req.cookies.get('sahayak_demo_role')?.value;
    const actor = resolveDemoActor(demoCookie || 'ADMIN');

    const auth = can(actor, 'READ', 'AUDIT_LOG', 'AUDIT_INSPECTION');
    if (!auth.granted) {
      return NextResponse.json({ error: auth.reason }, { status: 403 });
    }

    const verification = await verifyAuditChain();

    return NextResponse.json({ success: true, verification });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to verify audit chain';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
