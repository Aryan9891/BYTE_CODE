import { NextRequest, NextResponse } from 'next/server';
import { DataAccessLayer, FeedbackRating } from '@/lib/dal';
import { resolveActorFromRequest } from '@/lib/auth/resolve-actor';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const actor = await resolveActorFromRequest(req, 'COUNSELOR');

    const body = await req.json().catch(() => ({}));
    const { rating, notes } = body;

    const validRatings = Object.values(FeedbackRating);
    if (!rating || !validRatings.includes(rating as FeedbackRating)) {
      return NextResponse.json(
        {
          error: `Invalid rating. Must be one of: ${validRatings.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const dal = new DataAccessLayer();
    const feedback = await dal.recordCaseFeedback(actor, id, rating as FeedbackRating, notes);

    return NextResponse.json({
      success: true,
      feedback: {
        id: feedback.id,
        counselor_case_id: feedback.counselor_case_id,
        rating: feedback.feedback_rating,
        notes: feedback.notes,
        submitted_at: feedback.submitted_at.toISOString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Feedback recording failed';
    const status = message.includes('Unauthorized')
      ? 403
      : message.includes('not found')
        ? 404
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
