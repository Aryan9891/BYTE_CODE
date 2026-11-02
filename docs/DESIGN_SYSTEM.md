# Trauma-Informed Design System & UI/UX Guidelines
**Project:** S-12: AI-Based Mental Health Support and Crisis Detection (Sahayak)  
**Document Version:** 1.0.0 (Foundational Architecture)  
**Status:** Approved for Engineering Scaffolding  

---

## 1. Trauma-Informed UX Philosophy

Students seeking mental health support or experiencing severe academic burnout are frequently in a state of cognitive overload, hyperarousal, or emotional vulnerability. Traditional clinical software (dense charts, harsh alerts, stark white backgrounds, medical jargon) increases anxiety and alienates users.

### Core Principles of Sahayak UX:
1. **Calm & Grounding Aesthetics:** Use soothing, organic color palettes (sage greens, slate blues, warm clays, warm creams) instead of clinical blues or alarming reds.
2. **Zero Shame & Zero Coercion:** Never use guilt-inducing notifications ("You broke your 5-day check-in streak!"). Check-ins are gentle invitations, not obligations.
3. **Radical Clarity & Predictability:** Users should always know what happens next when they click a button. No surprises, no hidden traps, and zero dark patterns.
4. **Safety & Instant Escape:** A persistent, universally accessible crisis button allows immediate escalation from any screen with zero cognitive friction.
5. **Autonomy & Agency:** Emphasize choice at every step. Consent toggles are transparent and easily accessible in a dedicated Privacy Center.

---

## 2. Design Tokens & Styling Specifications

### 2.1 Color Palette (WCAG 2.2 AA Contrast Verified)
The color system provides distinct light and dark themes with minimum $4.5:1$ contrast ratios for text and $3:1$ for interactive controls.

```css
/* Light Theme Tokens */
:root {
  /* Canvas & Surfaces */
  --bg-primary: #FAF9F6;       /* Warm Alabaster - soft on exhausted eyes */
  --bg-surface: #FFFFFF;       /* Crisp Surface Card */
  --bg-muted: #F0EFEB;         /* Soft Sandstone for secondary areas */
  
  /* Text & Content */
  --text-primary: #1C2421;     /* Deep Forest Slate (Contrast 14.2:1 against bg) */
  --text-secondary: #4A5B52;   /* Muted Pine (Contrast 6.8:1) */
  --text-muted: #596B62;       /* Subtle Moss (Contrast 5.4:1 - WCAG AA verified) */

  /* Emotional & Tier Accents (Non-Stigmatizing) */
  --tier-0-thriving: #2D7A58;  /* Restful Jade */
  --tier-1-watch: #9A7B2C;     /* Warm Amber / Ocher (Never harsh neon yellow) */
  --tier-2-suggested: #B45309; /* Terracotta Rust */
  --tier-3-priority: #991B1B;  /* Deep Garnet (Warm, non-siren crimson) */

  /* Brand / Action */
  --brand-primary: #1F5F4A;    /* Balanced Eucalyptus */
  --brand-accent: #388E6D;     /* Brightened Meadow */
  --brand-focus: #1A56DB;      /* High-Visibility Focus Ring */

  /* Crisis Alert (Accessible, High-Urgency without Panic) */
  --crisis-bg: #FEF2F2;
  --crisis-border: #F87171;
  --crisis-text: #991B1B;
}

/* Dark Theme Tokens */
.dark {
  --bg-primary: #111614;       /* Deep Obsidian Evergreen */
  --bg-surface: #18201D;       /* Slate Moss Surface */
  --bg-muted: #222D28;         /* Dark Card Container */
  
  --text-primary: #F3F4F3;     /* Soft White Pearl (Contrast 13.8:1) */
  --text-secondary: #B4C0B9;   /* Muted Sage (Contrast 7.1:1) */
  --text-muted: #82928A;       /* Subtle Lichen (Contrast 4.5:1) */

  --tier-0-thriving: #4ADE80;  /* Muted Emerald */
  --tier-1-watch: #FBBF24;     /* Soft Topaz */
  --tier-2-suggested: #FB923C; /* Warm Coral */
  --tier-3-priority: #F87171;  /* Soft Carmine */

  --brand-primary: #388E6D;
  --brand-accent: #52B788;
  --brand-focus: #60A5FA;
}
```

### 2.2 Typography
- **Headings Font:** `Plus Jakarta Sans`, sans-serif (warm, open apertures, highly legible).
- **Body & Controls Font:** `Inter`, sans-serif (exceptional legibility at small sizes).
- **Scale:**
  - `Display / Hero`: $32\text{px} / 2.0\text{rem}$, line-height $1.2$, weight $700$
  - `H1 (Page Title)`: $24\text{px} / 1.5\text{rem}$, line-height $1.3$, weight $600$
  - `H2 (Section Header)`: $20\text{px} / 1.25\text{rem}$, line-height $1.4$, weight $600$
  - `H3 (Card Header)`: $16\text{px} / 1.0\text{rem}$, line-height $1.5$, weight $600$
  - `Body Regular`: $15\text{px} / 0.9375\text{rem}$, line-height $1.6$, weight $400$
  - `Small / Metadata`: $13\text{px} / 0.8125\text{rem}$, line-height $1.5$, weight $400$

### 2.3 Spacing, Radius & Elevation
- **Spacing Unit:** $4\text{px}$ base grid ($8\text{px}, 12\text{px}, 16\text{px}, 24\text{px}, 32\text{px}, 48\text{px}$). Generous white space to prevent cognitive overwhelm.
- **Corner Radii:** Smooth, organic rounded curves:
  - Small elements (badges, buttons): `rounded-lg` ($8\text{px}$)
  - Cards & modals: `rounded-2xl` ($16\text{px}$)
  - Crisis pill: `rounded-full` ($9999\text{px}$)
- **Elevation / Shadows:** Soft, diffuse elevation shadows (`shadow-sm`, `shadow-md`), avoiding harsh black drop shadows.

### 2.4 Motion & Reduced Motion
- Animations must be gentle ($200\text{ms} - 300\text{ms}$ ease-out).
- **Mandatory:** `motion-reduce:transition-none` and `motion-reduce:animate-none` applied to all animated components to support vestibular disorder sufferers.

---

## 3. Tone of Voice & Copywriting Guide

| Context | DO (Compassionate, Grounded) | DON'T (Clinical, Diagnostic, Shaming) |
| :--- | :--- | :--- |
| **Survey Completion** | *"Thank you for taking a moment for yourself. Your reflections are saved securely."* | *"Survey submitted. Your depression index is 16/27."* |
| **Elevated Stress Shift** | *"It looks like this week has felt heavier than usual. Here are a few grounding tools if you'd like to unwind."* | *"Warning: You are exhibiting signs of severe anxiety."* |
| **Counselor Check-in** | *"Suggested Check-in: Signals indicate student is facing higher-than-average fatigue and missed deadlines."* | *"High Risk Alert: Student is suffering from Major Burnout Syndrome."* |
| **Notification / Reminder** | *"Whenever you're ready, your weekly pulse check is open."* | *"You forgot your check-in! Don't lose your streak!"* |
| **Crisis Banner** | *"Need immediate support? Free, confidential help is available 24/7."* | *"DANGER: Call suicide prevention immediately!"* |

---

## 4. Universal Accessibility Rules (WCAG 2.2 AA)

1. **Persistent Crisis Shortcut:**
   - Every view renders a floating or top-bar "Get Help Now" button.
   - Screen reader announcement: `aria-label="Instant Crisis and Support Resources, press at any time"`.
   - Keyboard shortcut: Dedicated key access or easily reachable via `Tab` index.
2. **Keyboard Navigation & Focus Management:**
   - Visual focus rings: $2\text{px}$ solid `--brand-focus` with $2\text{px}$ offset.
   - All dialogs trap focus and close cleanly on `Escape`.
3. **Form Fields & Survey Scales:**
   - Radio buttons for 1-5 scales feature large tap targets (minimum $48\text{px} \times 48\text{px}$).
   - Explicit `<label>` elements linked via `htmlFor`.
4. **Touch & Mobile Ergonomics:**
   - Crucial actions placed within the thumb zone on mobile screens.

---

## 5. Comprehensive Page Inventory & Wireframe Specifications

```
+----------------------------------------------------------------------------------+
|                              SAHAYAK PAGE DIRECTORY                              |
+----------------------------------------------------------------------------------+
| 01. Landing & Portal Gate               07. Crisis Screen (Zero-Auth)            |
| 02. Onboarding & Granular Consent       08. Settings & Privacy Center            |
| 03. Student Home & Reflection Hub       09. Counselor Triage Dashboard           |
| 04. Weekly Check-in Pulse Survey        10. Counselor Case Detail & Unmasking    |
| 05. Encrypted Self-Care Journal         11. Institutional Aggregate Analytics    |
| 06. Verified Support Directory          12. Tamper-Evident Audit Log Viewer      |
+----------------------------------------------------------------------------------+
```

### 5.1 Landing Page (`/`)
- **Header:** Minimal navbar with logo, Language selector (English / Hindi / Bengali), and high-contrast "Get Help Now" button.
- **Hero:** Warm illustration, headline: *"A private, compassionate space for your academic wellbeing."*
- **Role Selector Cards:** Clear cards to enter as Student, Counselor, or Institutional Admin with test credentials provided for evaluation.
- **Trust Badges:** "Zero Diagnosis", "100% Student-Controlled Consent", "k-Anonymity Protected".

### 5.2 Onboarding & Consent Center (`/onboarding`)
- **Step 1:** Welcoming overview explaining how Sahayak protects privacy.
- **Step 2:** Granular consent toggles:
  - Toggle A: Voluntary Pulse Surveys (with preview of questions)
  - Toggle B: Academic Drift Signals (explains personal baseline comparison)
  - Toggle C: Help-Seeking Telemetry (booking views, late-night usage)
  - Toggle D: Counselor Outreach Permission (allows gentle check-in suggestions)
- **Step 3:** Emergency Escalation Policy Acknowledgement.
- **Footer Action:** "Confirm & Enter Sahayak" (defaults to safe minimal mode if toggles left off).

### 5.3 Student Home (`/student`)
- **Top Greeting:** *"Good morning, Ananya. How are you feeling today?"*
- **Check-in CTA Card:** "Weekly Pulse Check (2 mins)" with status badge (Completed / Ready).
- **Personal Wellbeing Trend:** Non-clinical Recharts area chart showing 30-day personal baseline vs current week (energy, balance, focus).
- **Quick Self-Help Shelf:** 3 interactive grounding exercise cards (e.g., "4-7-8 Breathing", "5-4-3-2-1 Sensory Grounding", "Pacing Your Deadlines").
- **Private Journal Quick Link:** "Record a private thought (Encrypted)".

### 5.4 Check-in Survey View (`/student/check-in`)
- **Progress Indicator:** Step 1 of 3 (Low cognitive load, 1 question per screen or short grouped view).
- **Item Formats:** 5-point Likert scales with descriptive text (e.g., *"Not at all"*, *"Several days"*, *"More than half the days"*, *"Nearly every day"*).
- **Crisis Trigger Detection:** If an acute distress question is selected, an immediate soft dialog appears: *"We hear you, and you don't have to carry this alone. Would you like to connect with someone right now?"*

### 5.5 Encrypted Journal View (`/student/journal`)
- **Security Indicator:** Lock icon with label: *"End-to-End Encrypted. Only you can read this."*
- **Composer:** Distraction-free text area with soothing background.
- **Prompts:** Optional gentle writing prompts (e.g., *"What is one thing that felt manageable today?"*).
- **Entry List:** Chronological card stream with edit and delete controls.

### 5.6 Verified Support Directory (`/support`)
- **Search & Filters:** Filter by Region (Campus, National, State), Type (Counselor, Helpline, Peer Support), Language (English, Hindi, Bengali).
- **Resource Cards:** Verified badge, resource name, description, operating hours, phone number (with one-click dialer link `tel:`), and verification date (`Verified by Lead Counselor on 2026-10-15`).

### 5.7 Zero-Auth Crisis Safety Screen (`/crisis`)
- **Zero Obstacles:** Instant load, no login required, no session timeout.
- **Prominent Emergency Contacts:**
  - Campus Emergency Response & Crisis Counselor.
  - National Helplines (e.g., Tele-MANAS: 14416 / 1800-891-4416; Kiran: 1800-599-0019 [VERIFY BEFORE LAUNCH]).
- **Warm Handoff Option:** "Connect with an On-Call Counselor Now".
- **De-escalation Tools:** Interactive guided deep breathing circle right on the crisis screen.

### 5.8 Privacy Center & Data Settings (`/student/privacy`)
- **Active Consent Toggles:** Change any consent option at any time.
- **My Data Transparency View:** Table showing the exact signal categories currently stored under the student's pseudonymous ID.
- **Export Data Button:** Download complete personal data archive in structured JSON format.
- **Delete All My Data (Danger Zone):** Irrevocable purge button with two-step confirmation.

### 5.9 Counselor Triage Dashboard (`/counselor`)
- **Header:** Active case counts by tier: Tier 3 (Priority Review), Tier 2 (Gentle Check-in Suggested).
- **Suggested Check-ins Table:**
  - Columns: Pseudonymous Avatar, Trigger Date, Tier Badge, Signal Corroboration Summary, Confidence Score (%), Action Button ("Review Case").
- **Filter & Sort:** Filter by Tier, Date, or Confidence.

### 5.10 Counselor Case Detail & Unmasking (`/counselor/case/[id]`)
- **Case Summary:** Plain-language explainability breakdown (e.g., *"Survey stress +2.4σ corroborated by 2 missed submissions"*).
- **Outreach Action Bar:**
  - "Send Confidential Campus Wellness Email" (Pre-composed supportive template).
  - "Reveal Student Contact Details": Triggers modal requiring reason for unmasking, warning that this action is logged in the permanent audit trail.
- **Alert Quality Feedback Widget:** "Help calibrate our signals: Was this suggestion useful?" [Yes, Timely & Actionable] [False Alarm / Not Useful] [Too Sensitive].

### 5.11 Institutional Aggregate Analytics (`/admin/analytics`)
- **Cohort Selector:** Department dropdown, Graduation Year dropdown.
- **k-Anonymity Notice:** *"Cohort count: 148 students (k >= 10 satisfied. Privacy guarantees active)."*
- **Macro Trend Charts:** Average campus stress levels across 16-week semester calendar; Resource directory utilization rates.
- **Demographic Disparate Rate Monitor:** Verifies that signal rates are balanced across academic departments.

### 5.12 Tamper-Evident Audit Log Viewer (`/admin/audit-logs`)
- **Table View:** Timestamp, Actor Pseudonym, Role, Action (e.g., `UNMASK_STUDENT_CONTACT`, `CONSENT_REVOKED`), Target Entity, Cryptographic Hash Chain Verification Status (`VALID: Chain Intact`).
- **Search & Filter:** Filter by action type or date range.

