# Antigravity Workflow: New Feature Implementation
**Workflow ID:** `workflow:new-feature`  
**Applicability:** Required whenever authoring, extending, or refactoring an application feature.

---

## Stage 1: Planning & Architectural Alignment
1. **Locate Task:** Identify the assigned task in [TASKS.md](../../TASKS.md). Read its acceptance criteria and dependencies.
2. **Review Guardrails:** Consult [AGENT.md](../../AGENT.md) and [.agent/rules/00-project-rules.md](../rules/00-project-rules.md). Ensure the feature strictly adheres to:
   - Zero-diagnosis copywriting rules.
   - Consent-first access controls.
   - Pseudonymous data boundaries.
3. **Verify Zod Boundary:** Define input and output Zod schemas before writing business logic or UI components.

---

## Stage 2: Implementation (Small, Atomic Steps)
1. **Domain Logic First:** Implement data models, validation schemas, or pure functions in `src/lib/`.
2. **Strict TypeScript:** Run type-checking continuously. Ensure zero `any` usage.
3. **UI / Presentation:** Implement responsive, accessible React components in `src/components/` and `src/app/` adhering to `docs/DESIGN_SYSTEM.md`.
4. **Error Handling:** Ensure structured, sanitized domain errors with user-friendly recovery states.

---

## Stage 3: Verification & Automated Testing
1. **Unit Tests:** Write Vitest tests in `tests/unit/` verifying happy path, boundary conditions, and invalid inputs ($\ge 90\%$ branch coverage).
2. **Privacy Check:** If touching database queries or student telemetry, run `workflow:privacy-review`.
3. **Accessibility Check:** Run axe-core tests on any new UI screens (`workflow:a11y-check`).

---

## Stage 4: Documentation & Backlog Synchronization
1. **Update Backlog:** Mark the task checkbox `[x]` in [TASKS.md](../../TASKS.md).
2. **Sync Specs:** If schemas or API endpoints were added/changed, update `docs/DATA_MODEL.md` or `docs/ARCHITECTURE.md`.
3. **Review Commit:** Ensure git commit follows Conventional Commits format (e.g., `feat(surveys): implement non-diagnostic pulse check`).

