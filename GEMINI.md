# GEMINI.md - AI Context & Agent Instruction Pointer

Welcome to **Sahayak (S-12: AI-Based Mental Health Support and Crisis Detection)**.

## Primary Instructions
All agents, models (including Gemini and Antigravity subagents), and human contributors MUST read and follow the master project rules and architecture:

1. **Master Architecture & Governance:** [AGENT.md](./AGENT.md)
2. **Project Rules Auto-loader:** [.agent/rules/00-project-rules.md](./.agent/rules/00-project-rules.md)
3. **Product Requirements Document (PRD):** [docs/PRD.md](./docs/PRD.md)
4. **System & Security Architecture:** [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
5. **Risk Engine & Scoring Logic:** [docs/RISK_ENGINE.md](./docs/RISK_ENGINE.md)
6. **Privacy, Ethics & Legal Framework:** [docs/PRIVACY_AND_ETHICS.md](./docs/PRIVACY_AND_ETHICS.md)
7. **Trauma-Informed Design System:** [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md)
8. **Data Model & Schema Specification:** [docs/DATA_MODEL.md](./docs/DATA_MODEL.md)
9. **Verified Support Directory & Crisis Paths:** [docs/SUPPORT_DIRECTORY.md](./docs/SUPPORT_DIRECTORY.md)
10. **Test Strategy & Safety Verification:** [docs/TEST_STRATEGY.md](./docs/TEST_STRATEGY.md)
11. **Project Execution Backlog:** [TASKS.md](./TASKS.md)

## Critical Constraints for LLMs
- **NEVER generate clinical diagnoses or medical advice.**
- **NEVER suggest or expose methods of self-harm.**
- **ALWAYS maintain pseudonymous data boundaries ($k \ge 10$ cohort aggregation).**
- **ALWAYS prioritize immediate crisis support escalation.**

