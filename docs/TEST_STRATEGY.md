# Quality Assurance & Test Strategy Specification
**Project:** S-12: AI-Based Mental Health Support and Crisis Detection (Sahayak)  
**Document Version:** 1.0.0 (Foundational Architecture)  
**Status:** Approved for Engineering Scaffolding  

---

## 1. Testing Philosophy & Ethical Mandate

In standard software, a failed test or missed edge case results in a minor inconvenience or financial error. In **Sahayak**, a failure can result in:
- A student in acute crisis encountering a broken hotline link or unresponsive modal.
- An unauthorized dean or faculty member viewing a student's private mental health indicators.
- False alarms overwhelming campus counseling teams, causing alert fatigue and missed interventions.

Therefore, our testing strategy prioritizes **privacy boundaries, algorithmic fairness, accessibility under stress, and crisis escalation reliability**.

---

## 2. The Sahayak Test Pyramid

```
                ▲
               / \
              /   \
             / E2E \             Playwright (Crisis paths, Multi-role flows, A11y)
            /-------\
           / Privacy \           Boundary & RBAC Isolation Tests (k >= 10, Unconsented)
          / & Fairness\          Synthetic Disparate Impact Calibration Runs
         /-------------\
        /  Integration  \        Prisma Schema, API Envelopes, Next.js Server Actions
       /-----------------\
      /    Unit Tests     \      Z-score math, Corroboration rules, Crypto round-trips,
     /_____________________\     Zod schemas, Non-diagnostic string linters
```

---

## 3. Dedicated Test Suites & Verification Criteria

### 3.1 Unit Testing (Vitest)
- **Target Coverage:** $\ge 90\%$ line and branch coverage on business logic (`/lib`).
- **Scope:**
  - **Risk Engine Math:** Personal baseline calculation ($\mu, \sigma$), Z-score normalization, EWMA smoothing, hysteresis thresholds, cooldown logic.
  - **Corroboration Matrix:** Validate that single-signal spikes never trigger Tier 2 or 3 unless the acute safety flag is raised.
  - **Crypto Utilities:** Field-level encryption round-trip (`encrypt(text) -> decrypt(ciphertext) === text`) and pseudonymous token generation (`HMAC-SHA256`).
  - **Zod Validation:** Boundary tests for all survey submissions, consent updates, and API payloads.
  - **Language Linter:** Automated regex tests ensuring no clinical diagnostic words ("depression", "anxiety disorder", "pathology", "patient") appear in generated explanations or student-facing text.

### 3.2 Privacy & Cryptographic Boundary Testing
- **Suite:** `tests/integration/privacy-boundaries.test.ts`
- **Key Assertions:**
  1. *Consent Enforcement:* When a student sets `consent_surveys: false`, verify that any attempt to ingest survey telemetry returns `403 Forbidden` and does not insert rows into `telemetry_realm.survey_responses`.
  2. *Counselor Access Barrier:* Verify that a counselor querying `/api/v1/counselor/queue` receives records where `full_name`, `email`, and `university_id` are `undefined` or null, with only pseudonymous identifiers present.
  3. *Unmasking Audit Chain:* Verify that calling `/api/v1/counselor/unmask` requires a `reason` parameter and atomically creates an immutable record in `audit_logs` with a valid cryptographic SHA-256 chain.
  4. *Right to Erasure:* Verify that executing `/api/v1/consent/delete-all` wipes all survey responses, signals, and journal entries associated with the user's `student_pseudo_id`.
  5. *$k$-Anonymity Enforcement:* Verify that institutional analytics queries with cohort sizes $N < 10$ return `{ k_anonymity_applied: true, metrics: null }`.

### 3.3 Risk-Engine Evaluation & Fairness Benchmark
- **Suite:** `tests/unit/risk-engine-calibration.test.ts`
- **Benchmark Dataset:** 5,000 synthetic student profiles simulating realistic 16-week semester trajectories.
- **Pass Criteria:**
  - **Tier 3 Precision:** $\ge 85\%$ (low false alarms on highest priority cases).
  - **Tier 3 Recall:** $\ge 90\%$ (detecting students with multi-signal distress).
  - **Fairness Slices:** False Positive Rate (FPR) across synthetic demographic cohorts must satisfy $0.95 \le \frac{\text{FPR}_A}{\text{FPR}_B} \le 1.05$.

### 3.4 Accessibility (a11y) Testing
- **Automated Axe-Core Audits:** Integrated into Playwright test runs across all 12 core screens (`landing`, `onboarding`, `student-home`, `check-in`, `journal`, `support`, `crisis`, `privacy`, `counselor-queue`, `case-detail`, `analytics`, `audit-logs`).
- **Acceptance Criteria:**
  - Zero `critical` or `serious` accessibility violations under WCAG 2.2 Level AA.
  - All form inputs, survey radio buttons, and buttons have accessible names and visual focus indicators.
  - Color contrast ratio $\ge 4.5:1$ for all text in both light and dark modes.
  - Navigation operable using purely `Tab`, `Shift+Tab`, `Enter`, `Space`, and `Escape`.
  - Respects `prefers-reduced-motion` settings.

### 3.5 End-to-End User Journey Testing (Playwright)
- **Flow 1: Student Onboarding & Privacy Control:**
  Student registers, selectively enables survey consent, navigates to Privacy Center, revokes consent, and verifies processing stops.
- **Flow 2: Check-in to Self-Reflection:**
  Student completes weekly check-in, receives supportive grounding suggestions (no scores), and navigates to the encrypted journal.
- **Flow 3: Acute Safety Escalation:**
  Student selects an acute distress indicator; crisis modal immediately displays verified helplines within $100\text{ ms}$; one-click dialer link is confirmed.
- **Flow 4: Counselor Triage & Feedback Loop:**
  Counselor reviews Tier 2 suggested check-in, inspects plain-language corroboration details, submits feedback rating (`APPROPRIATE_TIMELY`), and marks case reviewed.
- **Flow 5: Institutional Aggregate Analytics:**
  Admin accesses dashboard, filters by department; verifies $k$-anonymity suppression on small cohorts.

---

## 4. Test Execution & CI Pipeline Integration

| Test Stage | Command | Trigger | Gate Threshold |
| :--- | :--- | :--- | :--- |
| **Lint & Diagnostic Language** | `npm run lint` | Pre-commit / PR | 0 warnings, 0 diagnostic word violations |
| **Type Check** | `npm run type-check` | Pre-commit / PR | 0 TypeScript errors (`strict: true`) |
| **Unit & Math Tests** | `npm run test:unit` | PR / Push | 100% pass, $\ge 90\%$ branch coverage |
| **Privacy & Boundary Tests**| `npm run test:privacy`| PR / Push | 100% pass, zero leaks |
| **Accessibility Audit** | `npm run test:a11y` | PR / Push | 0 axe-core violations |
| **E2E Browser Matrix** | `npm run test:e2e` | Nightly / Release| 100% pass across Chromium, Firefox, WebKit |
| **Risk Engine Benchmark** | `npm run test:eval` | Algorithm PR | Precision $\ge 85\%$, Recall $\ge 90\%$ |

