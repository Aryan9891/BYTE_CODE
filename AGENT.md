# AGENT.md - Autonomous Agent & Engineering Governance Guide
**Project: S-12: AI-Based Mental Health Support and Crisis Detection (Working Title: "Sahayak")**

> **Notice:** This repository contains sensitive public-health, privacy-preserving, and student-support infrastructure. All agents, developers, and reviewers operating on this codebase MUST adhere strictly to the rules, principles, and architectural boundaries set forth in this document.

---

## 1. Mission and Problem Statement
**Problem Statement (Verbatim):**
> "Develop a privacy-preserving platform that identifies students at risk of severe stress, burnout, or self-harm using voluntary surveys, academic patterns, and help-seeking behavior. Detect risk without diagnosis, protect privacy, minimize false alarms, and connect students to verified support."

**Mission:**
Empower higher education students to monitor their own mental wellbeing, recognize early warning patterns of severe distress and burnout, and connect with compassionate, verified institutional and emergency resources without fear of stigma, surveillance, or academic penalty.

---

## 2. Non-Negotiable Ethical & Product Principles

1. **Absolute No-Diagnosis Guarantee:**
   - The platform is strictly an early-warning signal detection and self-advocacy tool, **never** a medical diagnostic instrument.
   - Prohibited phrasing: *"Student has severe depression"*, *"Clinical GAD diagnosis"*, *"Patient is bipolar"*, *"High risk of psychiatric disorder"*.
   - Required phrasing: *"Signals suggest it may be a good time to check in"*, *"Elevated stress trend detected over the last 14 days"*, *"Self-reported exhaustion patterns"*.
2. **Consent-First, Granular, and Revocable:**
   - Every signal ingestion category (surveys, academic signals, help-seeking patterns) requires explicit, granular, opt-in consent.
   - A student can revoke consent at any moment with a single click in their Privacy Center.
   - Revocation immediately halts processing and triggers soft-deletion/scrubbing per data retention policy.
3. **Privacy by Design & Cryptographic Segregation:**
   - Identity records (Real Name, Student ID, Email) reside in an isolated schema/table physically or cryptographically separated from the signals and survey responses.
   - Pseudonymous tokens (`student_pseudo_id`) are used across analytics and the risk engine.
   - Field-level encryption (AES-256-GCM) is required for journal entries and open-ended text.
   - Minimum cohort size $k \ge 10$ is strictly enforced for all institutional and aggregate dashboards. If a cohort slice has $<10$ students, metrics are suppressed.
4. **Human-in-the-Loop (Decisions Belong to Humans):**
   - The system only outputs check-in suggestions; **only qualified humans** (counselors, wellbeing staff) decide whether and how to reach out.
   - Zero automated punitive actions (e.g., suspension, academic warnings, parental alerts).
   - Zero sharing of identifiable student flags with course instructors, academic deans, or parents by default.
5. **Fairness and Disparate Impact Monitoring:**
   - System calibration must ensure false-positive rates do not disproportionately target specific demographics, international students, or neurodivergent profiles.
   - Protected demographic attributes (gender, caste, race, nationality, religion) are **strictly forbidden** as risk-engine inputs.
6. **Radical Transparency:**
   - Students have full visibility into the signals contributing to their personal tier score.
   - Students can export all stored data in machine-readable JSON format or execute an irrevocable "Delete My Data" request.
7. **Safe AI & Crisis Protocols:**
   - Any LLM feature (e.g., journal reflection prompts or FAQ summarization) must be guard-railed against generating medical advice or detailing methods of self-harm.
   - Immediate warm handoff to verified 24/7 crisis helplines on any acute risk detection.
   - Emergency auto-contact is disabled by default; if enabled by an institution, it must adhere to strict, documented legal mandates with full audit logging.

---

## 3. Technology Stack & Pinned Versions

| Layer | Technology | Target Version | Justification |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `15.x` | React Server Components, secure server actions, API routes |
| **Language** | TypeScript (Strict mode) | `5.6+` | Complete type safety, zero unchecked runtime errors |
| **UI Library** | React | `19.x` | Modern concurrency, accessible primitives |
| **Styling** | Tailwind CSS + `shadcn/ui` | `v4` / `Radix UI` | Accessible (WCAG 2.2 AA), low-cognitive load, calm aesthetics |
| **ORM / DB** | Prisma ORM + PostgreSQL | Prisma `6.x` / PG `16+` | Type-safe migrations, relational integrity, Neon/Supabase compatible |
| **Auth** | Auth.js (NextAuth v5) | `5.0-beta` / stable | Granular session claims, RBAC, decoupled credentials |
| **Validation** | Zod | `3.23+` | Runtime validation for all inputs, APIs, and env vars |
| **Charts** | Recharts | `2.13+` | SVG-based, responsive, accessible data visualization |
| **Testing** | Vitest + Testing Library + Playwright | Latest | Unit, integration, a11y (axe-core), and cross-browser e2e |
| **Icons** | Lucide React | `0.450+` | Clean, non-distracting visual cues |

---

## 4. Repository Structure & Naming Conventions

```text
/
├── .agent/
│   ├── rules/
│   │   └── 00-project-rules.md     # Antigravity rule definition
│   └── workflows/
│       ├── new-feature.md          # Workflow for shipping features
│       ├── privacy-review.md       # Mandatory privacy checklist
│       ├── a11y-check.md           # WCAG AA accessibility audit
│       └── risk-engine-eval.md     # Evaluation & calibration run
├── docs/
│   ├── PRD.md                      # Product Requirements Document
│   ├── ARCHITECTURE.md             # System & Security Architecture
│   ├── RISK_ENGINE.md              # Mathematical & Logic Specification
│   ├── PRIVACY_AND_ETHICS.md       # DPDP/GDPR Compliance, Threat Model
│   ├── DESIGN_SYSTEM.md            # Trauma-Informed UI/UX Guidelines
│   ├── DATA_MODEL.md               # Database Schema, ERD, Encryption
│   ├── SUPPORT_DIRECTORY.md        # Verified Resources & Escalation
│   └── TEST_STRATEGY.md            # Comprehensive Verification Plan
├── src/
│   ├── app/                        # Next.js App Router (pages & layouts)
│   │   ├── (auth)/                 # Login, register, verify
│   │   ├── (student)/              # Student portal: check-in, journal, support
│   │   ├── (counselor)/            # Counselor portal: case review, check-in queue
│   │   ├── (admin)/                # Institution portal: aggregate analytics
│   │   ├── api/                    # Route handlers (REST endpoints)
│   │   └── crisis/                 # Instant-access crisis screen (no auth barrier)
│   ├── components/                 # Reusable UI components
│   │   ├── ui/                     # shadcn/ui base primitives
│   │   ├── student/                # Student-specific widgets
│   │   ├── counselor/              # Counselor queue and case review cards
│   │   ├── shared/                 # Crisis banner, privacy toggles, navbar
│   │   └── providers/              # Theme, query, and session providers
│   ├── lib/                        # Core utilities & engines
│   │   ├── db/                     # Prisma client instance
│   │   ├── auth/                   # Auth.js config and session helpers
│   │   ├── crypto/                 # Field-level encryption & pseudonymization
│   │   ├── risk-engine/            # Deterministic signal engine & calibration
│   │   ├── audit/                  # Tamper-evident audit logging
│   │   └── validations/            # Zod schemas for all forms & payloads
│   ├── types/                      # TypeScript definitions (.d.ts / types)
│   └── styles/                     # Tailwind globals and font configs
├── tests/
│   ├── unit/                       # Risk engine, math, crypto, schemas
│   ├── integration/                # APIs, RBAC, privacy boundary tests
│   ├── e2e/                        # Playwright user flows & crisis path
│   └── a11y/                       # Axe automated accessibility scans
├── .env.example                    # Documented template for env vars
├── AGENT.md                        # Master instructions for AI agents
├── GEMINI.md                       # Entrypoint linking to AGENT.md
├── TASKS.md                        # Dependency-ordered execution backlog
└── README.md                       # Developer setup & project overview
```

### Naming Conventions:
- **Files & Folders:** `kebab-case` (e.g., `risk-engine.ts`, `case-detail-card.tsx`).
- **Components:** `PascalCase` (e.g., `CrisisBanner.tsx`, `ConsentToggleGroup.tsx`).
- **Types & Interfaces:** `PascalCase` with semantic nouns (e.g., `RiskScoreBreakdown`, `ConsentState`).
- **Database Tables & Fields:** `snake_case` in SQL / Prisma maps (e.g., `student_pseudo_id`, `created_at`).
- **Enums:** `SCREAMING_SNAKE_CASE` (e.g., `RiskTier.TIER_0_THRIVING`).

---

## 5. Coding & Engineering Standards

1. **TypeScript Strictness:**
   - `"strict": true`, `"noImplicitAny": true`, `"exactOptionalPropertyTypes": true`.
   - The use of `any` is strictly banned. Use `unknown` with Zod type narrowing where dynamic data enters.
2. **Boundary Validation:**
   - Every server action, API request body, query parameter, and environment variable must pass through a strict Zod schema before consumption.
3. **Error Handling & Resilience:**
   - Never swallow errors silently.
   - Return structured domain errors (`{ success: false, error: { code, message } }`).
   - Server-side exceptions must sanitize error messages before returning them to client to prevent stack leakages.
4. **Accessibility (WCAG 2.2 Level AA):**
   - High color contrast ($\ge 4.5:1$ for normal text, $\ge 3:1$ for UI controls).
   - Full keyboard navigability (visible focus rings, logical tab order, `Escape` closes modals).
   - Screen reader friendly: proper ARIA roles, `aria-live` for crisis alerts, `aria-describedby` for risk explanations.
   - Respect `prefers-reduced-motion` across all transitions.

---

## 6. Security & Privacy Rules (Zero-Tolerance)

- **Zero PII Logging:** Never log student names, emails, raw survey responses, journal entries, or IP addresses in application logs or monitoring tools (e.g., Sentry, Datadog).
- **Secrets Management:** Secrets must reside strictly in `.env.local` or environment variables. No secrets committed to git.
- **SQL Injection Prevention:** Exclusively use Prisma ORM parameterized queries. Never use raw string interpolation in SQL queries.
- **Rate Limiting:** Protect all auth and signal ingestion endpoints with sliding-window rate limiting.
- **CSRF & Security Headers:** Enforce strict CSP, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.
- **Field-Level Encryption:** Encrypt sensitive journal entries and survey comments at rest using authenticated encryption (`AES-256-GCM`).

---

## 7. Definition of Done (DoD) Checklist

Before any PR or task is marked complete:
- [ ] Code is written in strict TypeScript with zero linter or compiler warnings.
- [ ] Zod schema validates all inputs and environment configurations.
- [ ] Automated unit test added with $\ge 90\%$ branch coverage for business logic.
- [ ] Privacy boundary test passes (counselor cannot query non-consented student details).
- [ ] Axe-core accessibility scan passes with 0 violations.
- [ ] No diagnostic or medicalized terms appear in UI text or code comments.
- [ ] Verified support directory references tested (no hardcoded invalid phone numbers).
- [ ] `TASKS.md` updated with completion state.

---

## 8. Forbidden Actions (Agent Guardrails)

1. **DO NOT** add third-party tracking scripts, analytics pixels (e.g., Google Analytics, Meta Pixel), or fingerprinting libraries.
2. **DO NOT** send unredacted student text to public LLM APIs. Any external AI call must be stripped of PII and require active user consent.
3. **DO NOT** write code that auto-reports students to law enforcement, campus discipline, or family members.
4. **DO NOT** hardcode crisis phone numbers; always pull from the verified, region-aware `SupportDirectory`.
5. **DO NOT** implement gamification loops (streaks, badges, leaderboards) that induce anxiety or guilt around mental health check-ins.

---

## 9. Operating Protocol for Autonomous Agents

- **Plan First:** Always inspect `TASKS.md`, `PRD.md`, and relevant architecture docs before modifying files.
- **Atomic Progress:** Execute one focused milestone or task at a time.
- **Sync Documentation:** Update `TASKS.md` and related docs immediately after finishing a change.
- **Clarify Ambiguity:** If requirements conflict or safety parameters are undefined, pause and request guidance from the user.

