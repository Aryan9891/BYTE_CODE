import { NextRequest, NextResponse } from 'next/server';
import { DataAccessLayer } from '@/lib/dal';
import { resolveActorFromRequest } from '@/lib/auth/resolve-actor';

export async function GET(req: NextRequest) {
  try {
    const actor = await resolveActorFromRequest(req, 'COUNSELOR');
    const dal = new DataAccessLayer();

    const cases = await dal.getActiveTriageCases(actor);

    // Format for client consumption ensuring zero student PII
    const formatted = cases.map((c) => ({
      id: c.id,
      student_pseudo_id: c.student_pseudo_id,
      tier: c.risk_evaluation?.tier ?? 'TIER_0',
      confidence_score: c.risk_evaluation
        ? Math.round(c.risk_evaluation.confidence_score * 100)
        : 0,
      plain_language_reasons: c.risk_evaluation?.plain_language_reasons ?? [],
      corroboration_details: c.risk_evaluation?.corroboration_details ?? {},
      status: c.status,
      opened_at: c.opened_at.toISOString(),
      feedback: c.feedback
        ? {
            rating: c.feedback.feedback_rating,
            notes: c.feedback.notes,
            submitted_at: c.feedback.submitted_at.toISOString(),
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      cases: formatted,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch triage cases';
    const status = message.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
