# ADR 0002: Internationalization (i18n) Architecture
**Status:** Accepted  
**Date:** 2026-11-02  
**Context:** S-12: AI-Based Mental Health Support and Crisis Detection (Sahayak)

## Context & Problem Statement
Campus mental health platforms in multilingual environments (specifically India as primary reference deployment) must serve students comfortably in multiple regional languages: English (`en`), Hindi (`hi`), and Bengali (`bn`). Mental health terminology requires cultural sensitivity; clinical, alienating literal translations induce stigma and distress.

## Decision
1. **Lightweight, Zero-Overhead JSON Dictionary i18n:**
   We establish a structured message dictionary system located in `src/messages/{locale}.json` supporting:
   - English (`en`) - Default reference copy.
   - Hindi (`hi`) - Devanagari script.
   - Bengali (`bn`) - Bengali script.
2. **Typography Font Support:**
   Typography leverages `next/font` with Google's `Noto Sans`, `Noto Sans Devanagari`, and `Noto Sans Bengali` to ensure legible, properly kerned glyph rendering across all devices.
3. **Translation Quality Flags:**
   Any machine-translated or preliminary dictionary strings are explicitly tagged `"NEEDS HUMAN REVIEW"` in translation files until vetted by licensed bilingual mental health counselors.

## Consequences
- **Positive:** Low runtime overhead, clean separation of concerns, high rendering fidelity for Indic scripts.
- **Negative:** Requires continuous review workflow with bilingual clinical advisors before expanding to additional Indic languages (Tamil, Telugu, Marathi).
