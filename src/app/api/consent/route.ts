import { NextRequest, NextResponse } from 'next/server';
import { getConsentState, recordConsentChange } from '@/lib/consent';
import { resolveDemoActor } from '@/lib/auth/demo-session';

export async function GET(req: NextRequest) {
  try {
    const demoCookie = req.cookies.get('sahayak_demo_role')?.value;
    const actor = resolveDemoActor(demoCookie);

    const state = await getConsentState(actor.id);
    return NextResponse.json({ success: true, consent: state });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch consent state';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const demoCookie = req.cookies.get('sahayak_demo_role')?.value;
    const actor = resolveDemoActor(demoCookie);

    const body = await req.json();
    const { toggles, reason } = body;

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const updated = await recordConsentChange(
      actor.id,
      toggles,
      reason || 'USER_UPDATED_PREFERENCES',
      ip
    );

    return NextResponse.json({ success: true, consent: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update consent';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
