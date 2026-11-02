import { NextRequest, NextResponse } from 'next/server';
import { cryptoShredStudentData } from '@/lib/consent';
import { resolveDemoActor } from '@/lib/auth/demo-session';

export async function POST(req: NextRequest) {
  try {
    const demoCookie = req.cookies.get('sahayak_demo_role')?.value;
    const actor = resolveDemoActor(demoCookie);

    const body = await req.json().catch(() => ({}));
    const reason = body.reason || 'Student exercised Right-to-be-Forgotten cryptographic shredding';

    const result = await cryptoShredStudentData(actor.id, reason);

    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to execute cryptographic shredding';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
