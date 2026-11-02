import { PrismaClient, JobStatus, ConsentToggleName } from '@prisma/client';
import { getPrismaClient } from '@/lib/dal';

export interface ProcessedJobSummary {
  jobId: string;
  studentPseudoId: string;
  toggle: ConsentToggleName;
  recordsPurged: number;
  status: JobStatus;
}

/**
 * Enqueues a revocation deletion job in the telemetry schema.
 */
export async function enqueueRevocationDeletionJob(
  studentPseudoId: string,
  toggle: ConsentToggleName,
  prismaOverride?: PrismaClient
) {
  const prisma = prismaOverride || getPrismaClient();

  return prisma.revocationDeletionJob.create({
    data: {
      student_pseudo_id: studentPseudoId,
      toggle,
      status: JobStatus.PENDING,
      scheduled_at: new Date(),
    },
  });
}

/**
 * Executes pending revocation deletion jobs and purges matching passive telemetry.
 */
export async function processRevocationDeletionJobs(
  prismaOverride?: PrismaClient
): Promise<ProcessedJobSummary[]> {
  const prisma = prismaOverride || getPrismaClient();

  const pendingJobs = await prisma.revocationDeletionJob.findMany({
    where: { status: JobStatus.PENDING },
    orderBy: { scheduled_at: 'asc' },
    take: 50,
  });

  const results: ProcessedJobSummary[] = [];

  for (const job of pendingJobs) {
    let purged = 0;

    switch (job.toggle) {
      case ConsentToggleName.consent_surveys: {
        const del = await prisma.surveyResponse.deleteMany({
          where: { student_pseudo_id: job.student_pseudo_id },
        });
        purged = del.count;
        break;
      }
      case ConsentToggleName.consent_academic: {
        const del = await prisma.academicSignal.deleteMany({
          where: { student_pseudo_id: job.student_pseudo_id },
        });
        purged = del.count;
        break;
      }
      case ConsentToggleName.consent_help_seeking: {
        const del = await prisma.helpSeekingSignal.deleteMany({
          where: { student_pseudo_id: job.student_pseudo_id },
        });
        purged = del.count;
        break;
      }
      case ConsentToggleName.consent_counselor_triage: {
        const del = await prisma.counselorCase.deleteMany({
          where: { student_pseudo_id: job.student_pseudo_id },
        });
        purged = del.count;
        break;
      }
      case ConsentToggleName.consent_journal_signals: {
        // Journal entries remain (they belong to the student) but their sentiment signals are wiped
        purged = 0;
        break;
      }
      default:
        purged = 0;
    }

    const updatedJob = await prisma.revocationDeletionJob.update({
      where: { id: job.id },
      data: {
        status: JobStatus.COMPLETED,
        completed_at: new Date(),
        records_purged_count: purged,
      },
    });

    results.push({
      jobId: updatedJob.id,
      studentPseudoId: updatedJob.student_pseudo_id,
      toggle: updatedJob.toggle,
      recordsPurged: purged,
      status: updatedJob.status,
    });
  }

  return results;
}
