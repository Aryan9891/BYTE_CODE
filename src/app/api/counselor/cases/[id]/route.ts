import { NextRequest, NextResponse } from 'next/server';
import { DataAccessLayer } from '@/lib/dal';
import { resolveActorFromRequest } from '@/lib/auth/resolve-actor';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const actor = await resolveActorFromRequest(req, 'COUNSELOR');
    const dal = new DataAccessLayer();

    const triageCase = await dal.getTriageCaseById(actor, id);

    // Format ensuring zero student PII
    const formatted = {
      id: triageCase.id,
      student_pseudo_id: triageCase.student_pseudo_id,
      tier: triageCase.risk_evaluation?.tier ?? 'TIER_0',
      confidence_score: triageCase.risk_evaluation
        ? Math.round(triageCase.risk_evaluation.confidence_score * 100)
        : 0,
      plain_language_reasons: triageCase.risk_evaluation?.plain_language_reasons ?? [],
      corroboration_details: triageCase.risk_evaluation?.corroboration_details ?? {},
      status: triageCase.status,
      opened_at: triageCase.opened_at.toISOString(),
      feedback: triageCase.feedback
        ? {
            rating: triageCase.feedback.feedback_rating,
            notes: triageCase.feedback.notes,
            submitted_at: triageCase.feedback.submitted_at.toISOString(),
          }
        : null,
    };

    return NextResponse.json({
      success: true,
      case: formatted,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch case details';
    const status = message.includes('Unauthorized')
      ? 403
      : message.includes('not found')
        ? 404
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
