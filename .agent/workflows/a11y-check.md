# Antigravity Workflow: Accessibility (a11y) Verification
**Workflow ID:** `workflow:a11y-check`  
**Applicability:** Required whenever authoring or modifying UI components, pages, dialogs, or crisis modals. Standard: **WCAG 2.2 Level AA**.

---

## 1. Automated Axe-Core Audit
Run the automated accessibility scanner across the target component or route:
```bash
npx playwright test tests/a11y/
```
- [ ] 0 `critical` violations.
- [ ] 0 `serious` violations.
- [ ] 0 `moderate` violations related to contrast or missing labels.

---

## 2. Visual & Sensory Checklist
- [ ] **Color Contrast:** All body text meets $\ge 4.5:1$ contrast against background in both light (`#FAF9F6`) and dark (`#111614`) themes. Large text / headings meet $\ge 3:1$.
- [ ] **Color Independence:** Information (such as tier status or survey score) is never conveyed solely through color; icons and text labels accompany all color indicators.
- [ ] **Motion Reduction:** All animated transitions (breathing exercises, modal entries) include `motion-reduce:transition-none` and `motion-reduce:animate-none`.
- [ ] **Zero Flashing / Strobe:** No flashing elements, sirens, or harsh strobes that could induce panic or seizures.

---

## 3. Keyboard Operability Checklist
- [ ] **Tab Order:** Logical, predictable top-to-bottom tab order.
- [ ] **Focus Indicators:** High-contrast focus rings ($2\text{px}$ `--brand-focus` with offset) visible on all interactive elements.
- [ ] **Modal Trap & Escape:** Dialogs trap keyboard focus inside the modal and dismiss immediately on pressing `Escape`.
- [ ] **Persistent Crisis Shortcut:** The "Get Help Now" button is reachable within 2-3 tab presses or via an accessible shortcut.

---

## 4. Screen Reader Semantics
- [ ] **ARIA Roles:** Semantic HTML5 (`<header>`, `<main>`, `<nav>`, `<aside>`, `<dialog>`) used wherever possible.
- [ ] **Accessible Names:** Icon buttons have `aria-label` or visually hidden text (e.g., `<button aria-label="Close crisis window">`).
- [ ] **Live Regions:** Dynamic crisis alerts or validation errors use `aria-live="polite"` or `role="alert"`.
- [ ] **Form Labels:** Every input and radio item is linked to an explicit `<label>` element via `htmlFor`.

