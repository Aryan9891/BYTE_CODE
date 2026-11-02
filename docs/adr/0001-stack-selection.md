# ADR 0001: Technology Stack Selection
**Status:** Accepted  
**Date:** 2026-11-02  
**Context:** S-12: AI-Based Mental Health Support and Crisis Detection (Sahayak)

## Context & Problem Statement
The platform requires a modern, accessible (WCAG 2.2 AA), highly secure, and privacy-preserving architecture capable of operating in higher education environments. The stack must support strict type safety, zero client PII leaks, deterministic risk engine computation, and free-tier cloud deployment feasibility (e.g., Vercel + Neon/Supabase) without sacrificing performance.

## Decision
We select the following core stack:
1. **Next.js 15 (App Router, React 19):** Single unified codebase for server actions, route handlers, and React Server Components (RSC), keeping sensitive logic and environment secrets strictly server-side.
2. **TypeScript 5.6+ in Strict Mode:** Complete compiler enforcement (`noImplicitAny`, strict null checks, exact optional property types) to eliminate runtime coercion errors.
3. **Tailwind CSS v4 + Radix UI Primitives (shadcn/ui style):** Headless, unstyled accessible UI primitives ensuring full compliance with WCAG 2.2 AA (contrast, keyboard focus trap, ARIA semantics).
4. **Prisma ORM + PostgreSQL:** Provider-agnostic relational ORM supporting multi-realm schema isolation (`identity_realm`, `telemetry_realm`, `audit_realm`) and parameterized SQL queries to prevent SQL injection.
5. **Auth.js (NextAuth v5):** Lightweight, standards-based session authentication with role-based claims.
6. **Zod 3.23+:** Ubiquitous schema validation at every network and function boundary.
7. **Vitest + Playwright + axe-core:** Multi-tiered testing covering pure mathematical logic, privacy boundary isolation, cross-browser e2e flows, and automated accessibility scans.

## Consequences
- **Positive:** Maximum developer velocity, zero client-side business logic leaks, free-tier compatibility, robust accessibility.
- **Negative:** Next.js 15 / React 19 requires careful dependency management to avoid peer dependency conflicts during early-adoption cycles.
