import { NextRequest, NextResponse } from 'next/server';
import { DataAccessLayer } from '@/lib/dal';
import { resolveActorFromRequest } from '@/lib/auth/resolve-actor';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const actor = await resolveActorFromRequest(req, 'COUNSELOR');

    const body = await req.json().catch(() => ({}));
    const { reason } = body;

    if (!reason || typeof reason !== 'string' || reason.trim().length < 10) {
      return NextResponse.json(
        {
          error:
            'A documented clinical care justification of at least 10 characters is required to unmask student identity.',
        },
        { status: 400 }
      );
    }

    const dal = new DataAccessLayer();
    const triageCase = await dal.getTriageCaseById(actor, id);

    const unmasked = await dal.unmaskStudentIdentity(
      actor,
      triageCase.student_pseudo_id,
      reason.trim()
    );

    return NextResponse.json({
      success: true,
      unmasked,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Identity unmasking failed';
    const status =
      message.includes('Unauthorized') || message.includes('denied')
        ? 403
        : message.includes('not found')
          ? 404
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
