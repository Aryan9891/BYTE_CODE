# Sahayak: Core Project Rules & Ethical Guardrails
# Auto-loaded by Antigravity Agents

## Mission & Problem Statement
"Develop a privacy-preserving platform that identifies students at risk of severe stress, burnout, or self-harm using voluntary surveys, academic patterns, and help-seeking behavior. Detect risk without diagnosis, protect privacy, minimize false alarms, and connect students to verified support."

## 1. Absolute Ethical Guardrails (Non-Negotiable)
- **NO DIAGNOSIS:** Never output clinical diagnostic language (e.g., "depressed", "anxiety disorder", "pathological"). Always frame outputs as "signals suggest a check-in is recommended" or "stress trend observed".
- **CONSENT FIRST:** Every signal source (surveys, academic, help-seeking) is strictly opt-in and individually toggleable. Revocation immediately stops ingestion and triggers deletion/scrubbing.
- **PRIVACY BY DESIGN:** 
  - Strict separation of real identity from pseudonymous signals (`student_pseudo_id`).
  - Minimum cohort size $k \ge 10$ for any institutional/admin aggregated views.
  - Field-level encryption (AES-256-GCM) for private journals and free-text inputs.
- **HUMAN IN THE LOOP:** System generates tiered suggestions (Tier 0 to Tier 3); only qualified humans make outreach decisions. No automatic punitive actions or faculty/parent alerts.
- **SAFE AI & CRISIS ESCALATION:**
  - Crisis resources must be instantly accessible on every screen via a persistent crisis button/banner.
  - LLM prompts must strictly avoid giving clinical/medical advice or discussing methods of self-harm.
  - Helplines must be sourced exclusively from the verified support directory, never fabricated or hardcoded.

## 2. Technical Quality Standards
- **Stack:** Next.js 15 (App Router), TypeScript 5.6+ (Strict, no `any`), Tailwind CSS, shadcn/ui (Radix), PostgreSQL, Prisma ORM, Auth.js, Zod, Vitest, Playwright.
- **Type Safety:** 100% type safety. All I/O, API payloads, form inputs, and env variables must be validated using Zod.
- **Accessibility:** WCAG 2.2 AA compliant. High contrast, keyboard operable, screen-reader labeled, `prefers-reduced-motion` respected.
- **Testing Required:** No task is complete without unit tests (risk engine, crypto, schemas), integration tests (privacy boundary checks), and a11y checks.
- **Zero PII Logging:** Never log student names, emails, raw survey responses, or IP addresses.

## 3. Workflow Protocol
- Refer to `TASKS.md` for execution order.
- Plan before implementation.
- Keep documentation in sync.
- Run privacy and a11y reviews before finishing tasks.

