# Sahayak (सहायक) - S-12: AI-Based Mental Health Support and Crisis Detection

> **A Privacy-Preserving Wellbeing & Early Distress Signal Platform for Higher Education**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.x-black)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38B2AC)](https://tailwindcss.com/)
[![WCAG 2.2 AA](https://img.shields.io/badge/Accessibility-WCAG%202.2%20AA-success)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![Privacy: DPDP Act](https://img.shields.io/badge/Compliance-DPDP%20Act%202023-emerald)](https://www.meity.gov.in/)

---

## 1. Overview & Problem Statement

**Problem Statement (Verbatim):**
> "Develop a privacy-preserving platform that identifies students at risk of severe stress, burnout, or self-harm using voluntary surveys, academic patterns, and help-seeking behavior. Detect risk without diagnosis, protect privacy, minimize false alarms, and connect students to verified support."

Higher education students face severe cognitive and emotional pressures, yet fear of academic stigmatization, parental discovery, and punitive policies prevent timely care. **Sahayak** provides a safe, student-first early-warning platform that detects shifts in personal wellbeing patterns, facilitates private self-reflection, and suggests compassionate, non-diagnostic check-ins to campus counselors—while enforcing cryptographic anonymity and $k$-anonymity guarantees.

---

## 2. The Seven Non-Negotiables

1. **Zero Diagnosis, Ever:** Sahayak is an early-warning signal detection system, never a clinical psychiatric diagnostic device. Language is strictly: *"Signals suggest it may be a good time to check in"*.
2. **Consent-First, Granular, Revocable:** Every data source (surveys, academic drift, help-seeking telemetry) requires individual, affirmative opt-in. Revoking consent immediately halts processing and triggers data deletion.
3. **Cryptographic Segregation & Privacy by Design:** Real-world identity records are separated from behavioral telemetry. Sensitive journal entries are encrypted via AES-256-GCM. All institutional dashboards enforce strict $k$-anonymity ($k \ge 10$).
4. **Human-in-the-Loop:** Algorithmic suggestions provide triage context to licensed counselors; humans make all outreach decisions. No automated disciplinary alerts, no sharing with professors or parents.
5. **Multi-Signal Corroboration & False-Alarm Minimization:** Escalation to Tier 2 (Gentle Check-in Suggested) or Tier 3 (Priority Review) strictly requires corroboration across at least two independent signal families or an acute safety trigger.
6. **Instant, Zero-Barrier Crisis Support:** Every application screen features a persistent, high-contrast crisis button leading to verified 24/7 helplines (Tele-MANAS, KIRAN, campus emergency) in $<100\text{ ms}$ with no login required.
7. **Safe AI & Trauma-Informed UX:** Organic, calm color palettes, generous spacing, zero guilt-inducing streaks or gamification, and strict guardrails preventing AI from offering medical or self-harm advice.

---

## 3. Technology Stack

- **Core Framework:** Next.js 15 (React 19, App Router, React Server Components)
- **Language:** TypeScript 5.6+ in Strict Mode (zero `any`, full type narrowing)
- **UI Components & Styling:** Tailwind CSS, shadcn/ui (Radix UI accessible primitives), Lucide React
- **Database & ORM:** PostgreSQL, Prisma ORM (multi-realm schema isolation)
- **Authentication & RBAC:** Auth.js (NextAuth v5) supporting Student, Counselor, and Admin roles
- **Validation Engine:** Zod 3.23+ runtime schema validation across all boundaries
- **Data Visualization:** Recharts (accessible, privacy-safe SVG charts)
- **Testing Toolchain:** Vitest (unit/math/privacy testing), Playwright (end-to-end user journeys), Axe-core (accessibility)

---

## 4. Documentation Index

The repository contains comprehensive, production-grade architectural and governance documentation in the `/docs` directory:

| Document | Description |
| :--- | :--- |
| **[AGENT.md](./AGENT.md)** | Master developer rules, coding standards, definition of done, and forbidden actions. |
| **[docs/PRD.md](./docs/PRD.md)** | Product Requirements Document: personas, user journeys, MoSCoW scope, and metrics. |
| **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** | System architecture, privacy boundaries, module breakdown, and data flow diagrams. |
| **[docs/RISK_ENGINE.md](./docs/RISK_ENGINE.md)** | Mathematical formulation: Z-scores, personal baselines, corroboration, and hysteresis. |
| **[docs/PRIVACY_AND_ETHICS.md](./docs/PRIVACY_AND_ETHICS.md)** | Data inventory, DPDP Act/GDPR alignment, STRIDE threat model, and ethical review checklist. |
| **[docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md)** | Trauma-informed UX, WCAG AA color tokens, component inventory, and page wireframes. |
| **[docs/DATA_MODEL.md](./docs/DATA_MODEL.md)** | ERD diagrams, field-level privacy notes, encryption specs, and synthetic seed plan. |
| **[docs/SUPPORT_DIRECTORY.md](./docs/SUPPORT_DIRECTORY.md)** | Schema, verification workflow, and pre-configured regional helpline placeholders. |
| **[docs/TEST_STRATEGY.md](./docs/TEST_STRATEGY.md)** | Test pyramid, privacy boundary test suites, fairness calibration, and a11y gates. |
| **[TASKS.md](./TASKS.md)** | Dependency-ordered engineering backlog broken down across Milestones M0 through M8. |

---

## 5. Getting Started (Setup Placeholder - Foundation Phase)

> ℹ️ **Notice:** The project is currently in the **Foundational Architecture Phase (Milestone 0)**. Application scaffolding and code generation will commence upon user approval of Step 1 foundations.

### Prerequisites:
- Node.js `20.x` or `22.x` (LTS)
- Docker Desktop (for local PostgreSQL) OR a free-tier Neon/Supabase cloud database
- `npm` or `pnpm`

### Quickstart (Windows PowerShell & Cross-Platform):
```powershell
# 1. Clone the repository and enter directory
git clone https://github.com/your-org/sahayak.git
cd sahayak

# 2. Setup local environment variables
Copy-Item .env.example .env.local

# 3. Start local PostgreSQL database container via Docker
docker compose up -d

# 4. Install dependencies
pnpm install
# (or: npm install)

# 5. Run test suites and verify accessibility gates
pnpm test          # Runs 27 unit tests (contrast, crypto, support snapshot, Zod env)
pnpm test:e2e      # Runs Playwright + Axe-core WCAG 2.2 AA accessibility audit

# 6. Typecheck and build production bundle
pnpm typecheck     # Strict TypeScript verification (0 errors)
pnpm build         # Compiles 15 static/dynamic Next.js 15 pages

# 7. Launch development server
pnpm dev
# Open http://localhost:3000 in your browser
```

---

## 6. Hackathon Demo Walkthrough Guide

The project is structured to demonstrate three distinct stakeholder flows within a 5-minute hackathon evaluation:
1. **The Student Experience:** Seamless onboarding with 4-way consent toggles, taking a 2-minute pulse check, seeing gentle self-reflection insights (no scores), and exploring the student-private envelope-encrypted journal.
2. **The Counselor Triage:** Inspecting the suggested check-in queue, viewing explainable multi-signal corroboration summaries, executing an audited identity unmasking, and providing alert feedback.
3. **The Institutional Oversight:** Reviewing macro campus wellbeing analytics with $k$-anonymity protection ($k \ge 10$), managing the verified support directory, and auditing the tamper-evident log chain.

