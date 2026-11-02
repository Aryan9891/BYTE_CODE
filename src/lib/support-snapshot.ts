import { z } from 'zod';

export const supportResourceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  phone: z.string().min(1),
  sms_or_whatsapp: z.string().nullable().optional(),
  web_url: z.string().url(),
  source_url: z.string().url(),
  operating_hours: z.string().min(1),
  languages_supported: z.array(z.string()).min(1),
  region_code: z.string().min(2),
  is_free_toll_free: z.boolean(),
  is_crisis_priority: z.boolean(),
  verification_status: z.enum(['VERIFIED', 'PENDING', 'UNVERIFIED']),
  verified_by: z.string(),
  verified_on: z.string(),
  next_verification_due: z.string(),
  verification_notes: z.string().optional(),
});

export type SupportResource = z.infer<typeof supportResourceSchema>;

export interface SnapshotValidationResult {
  valid: boolean;
  errors: string[];
  mode: 'demo' | 'launch';
  requiresBanner: boolean;
  isPlaceholder: boolean;
}

export function validateSupportSnapshot(
  entries: unknown[],
  mode: 'demo' | 'launch' = 'demo',
  currentDate: Date = new Date()
): SnapshotValidationResult {
  const errors: string[] = [];

  if (!Array.isArray(entries) || entries.length === 0) {
    return {
      valid: false,
      errors: ['Support snapshot must contain at least one support resource.'],
      mode,
      requiresBanner: true,
      isPlaceholder: true,
    };
  }

  let containsPlaceholders = false;

  for (let i = 0; i < entries.length; i++) {
    const raw = entries[i];
    const parsed = supportResourceSchema.safeParse(raw);

    if (!parsed.success) {
      const entryId = (raw as Record<string, unknown>)?.id || `index_${i}`;
      errors.push(
        `Entry ${entryId} schema validation failed: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`
      );
      continue;
    }

    const item = parsed.data;

    // Check ISO date format
    const verifiedDate = new Date(item.verified_on);
    if (isNaN(verifiedDate.getTime())) {
      errors.push(`Entry ${item.id}: invalid verified_on date "${item.verified_on}"`);
    }

    const dueDate = new Date(item.next_verification_due);
    if (isNaN(dueDate.getTime())) {
      errors.push(
        `Entry ${item.id}: invalid next_verification_due date "${item.next_verification_due}"`
      );
    }

    const hasPlaceholderTag =
      item.verification_notes?.includes('VERIFY BEFORE LAUNCH') ||
      item.verification_status !== 'VERIFIED';

    if (hasPlaceholderTag) {
      containsPlaceholders = true;
    }

    if (mode === 'launch') {
      if (item.verification_status !== 'VERIFIED') {
        errors.push(
          `Entry ${item.id}: verification_status must be 'VERIFIED' in launch mode (found '${item.verification_status}')`
        );
      }
      if (!item.verified_by || item.verified_by.trim().length === 0) {
        errors.push(`Entry ${item.id}: missing verified_by counselor/official identifier`);
      }
      if (!item.source_url || item.source_url.trim().length === 0) {
        errors.push(`Entry ${item.id}: missing source_url verification reference`);
      }
      if (item.verification_notes && item.verification_notes.includes('VERIFY BEFORE LAUNCH')) {
        errors.push(
          `Entry ${item.id}: contains unresolved 'VERIFY BEFORE LAUNCH' tag in verification_notes`
        );
      }
      if (dueDate.getTime() < currentDate.getTime()) {
        errors.push(`Entry ${item.id}: review date (${item.next_verification_due}) has expired`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    mode,
    requiresBanner: mode === 'demo' || containsPlaceholders,
    isPlaceholder: containsPlaceholders,
  };
}
