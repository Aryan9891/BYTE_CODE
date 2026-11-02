import { NextRequest, NextResponse } from 'next/server';
import { exportStudentData } from '@/lib/consent';
import { resolveDemoActor } from '@/lib/auth/demo-session';

export async function GET(req: NextRequest) {
  try {
    const demoCookie = req.cookies.get('sahayak_demo_role')?.value;
    const actor = resolveDemoActor(demoCookie);

    const data = await exportStudentData(actor.id);

    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="sahayak-privacy-export-${actor.id}.json"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate data export';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
