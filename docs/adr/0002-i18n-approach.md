# ADR 0002: Internationalization (i18n) Architecture & Server-Side Cookie Resolution

## Status
Accepted (Amended 2026-11-02 for Server-Side Resolution)

## Date
2026-11-02

## Context & Problem Statement
Campus mental health platforms in multilingual environments (specifically India as primary reference deployment) must serve students comfortably in multiple regional languages: English (`en`), Hindi (`hi`), and Bengali (`bn`). Mental health terminology requires cultural sensitivity; clinical, alienating literal translations induce stigma and distress.

Furthermore, client-only localization approaches cause a disruptive Flash of English (FOE) and incorrect `<html lang>` attributes during server-side pre-rendering, degrading both accessibility for screen readers and user psychological safety.

## Decision

### 1. Structured Multilingual JSON Dictionaries
We maintain structured message dictionaries located in `src/messages/{locale}.json` supporting:
- English (`en`) - Reference copy.
- Hindi (`hi`) - Devanagari script.
- Bengali (`bn`) - Bengali script.

### 2. Cookie-Based Server-Side Locale Resolution
Locale preference is persisted in an HTTP cookie (`sahayak_locale`) with `SameSite=Lax` and a 1-year lifespan:
- During initial SSR / RSC generation, `src/app/layout.tsx` reads `cookies().get('sahayak_locale')`.
- The root `<html lang="{locale}">` attribute is emitted by the server matching the user's preference immediately.
- The `I18nProvider` is initialized with `initialLocale`, eliminating client-side flash of unlocalized content.
- When the student switches languages via `LanguageSwitcher`, the cookie and `document.documentElement.lang` are updated synchronously, followed by state re-rendering.

### 3. Typography & Native Script Rendering
Typography leverages `next/font/google` with:
- `Noto_Sans` (Latin subset)
- `Noto_Sans_Devanagari` (Devanagari subset for Hindi)
- `Noto_Sans_Bengali` (Bengali subset)
Configured via CSS font variables (`--font-sans`, `--font-devanagari`, `--font-bengali`) so complex ligatures and vowel diacritics render crisply without layout shifts.

### 4. Clinical Advisory Translation Workflow
Preliminary translations are tagged `"NEEDS HUMAN REVIEW"` in `_meta.status` until certified by licensed bilingual campus counselors.

## Consequences
- **Positive:**
  - True zero-FOE server-rendered output with synchronous `<html lang>` matching user language.
  - Native script rendering for Hindi and Bengali with ligatures and vowel marks.
  - Full screen reader compatibility without language mispronunciation.
- **Verification:**
  - Automated Playwright tests with screenshot capture verify correct Devanagari and Bengali glyph rendering across viewports.
