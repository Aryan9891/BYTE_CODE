# ADR 0004: Content Security Policy & Inline Script Execution Strategy

## Status
Accepted

## Date
2026-11-02

## Context
Sahayak (S-12: AI-Based Mental Health Support and Crisis Detection) operates under strict non-negotiable privacy boundaries: zero medical diagnoses, zero third-party telemetry, zero external CDNs, and zero unconsented data leakage. A robust Content Security Policy (CSP) is a foundational defense-in-depth control against Cross-Site Scripting (XSS), data injection, and malicious third-party tracking.

## Decision

### 1. Production Header Hardening
In production builds (`process.env.NODE_ENV === 'production'`), `'unsafe-eval'` is strictly prohibited from `script-src`. Webpack and Turbopack development tool sourcemap evaluation are confined exclusively to `development` mode.

The production CSP policy is defined as:
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```

### 2. Justification for Remaining `'unsafe-inline'`
Two specific framework constraints currently mandate `'unsafe-inline'`:

1. **`next-themes` Flash-of-Unstyled-Theme (FOUT) Prevention:**
   The `ThemeProvider` injects an immediate synchronous `<script>` into `<head>` to read `localStorage` / system media preferences (`prefers-color-scheme`) and apply the `.dark` class to `<html>` prior to DOM paint. Without this inline execution, students experience a disruptive visual white flash on dark-mode devices.
2. **Next.js 15 App Router Streaming Hydration:**
   Next.js App Router streams React Server Component payloads using inline `<script>` tags invoking `self.__next_f.push(...)`.

### 3. Nonce & Hash Architecture Roadmap
For static and server-rendered pages where request-time headers are manipulated:
- **Phase 1 (Current - M0/M1 Hardening):** Strict origin isolation (`default-src 'self'`, `connect-src 'self'`), total ban of `'unsafe-eval'` in production, zero external origins, and Playwright verification of zero third-party network egress.
- **Phase 2 (Milestone M2 Security Audit):** Implementation of Next.js Edge Middleware nonce injection, generating a cryptographically secure 128-bit random nonce (`crypto.randomBytes(16).toString('base64')`) per request, forwarded via `x-nonce` request header to root layout and embedded in all Next.js `<Script>` primitives, retiring `'unsafe-inline'` in favor of `'nonce-<value>' 'strict-dynamic'`.

## Consequences
- **Positive:**
  - Automated Playwright network tests prove zero third-party egress across all core routes (`/`, `/crisis`, `/support`, `/settings/privacy`).
  - Protection against `eval()`, `new Function()`, and runtime code string compilation.
  - Zero iframe framing (`frame-ancestors 'none'`, `X-Frame-Options: DENY`).
- **Negative / Trade-offs:**
  - Full removal of `'unsafe-inline'` requires request-time middleware nonce threading across static SSG pages, planned for M2.

