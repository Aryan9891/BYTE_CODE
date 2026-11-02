# Explainable Risk-Signal Engine Specification
**Project:** S-12: AI-Based Mental Health Support and Crisis Detection (Sahayak)  
**Document Version:** 1.0.0 (Foundational Architecture)  
**Status:** Approved for Engineering Scaffolding  

---

## 1. Engine Mission & Mathematical Foundations

The Sahayak Risk-Signal Engine is designed to identify students experiencing statistically significant deviations toward distress **without computing clinical diagnoses**.

### 1.1 Core Mathematical Philosophy
1. **Personal Baselines vs. Population Norms:**
   Human baseline emotional states, workloads, and work habits vary dramatically. An introverted student with steady low-frequency social engagement should not be penalized by a population-wide metric. Sahayak evaluates every incoming signal vector $x_{i,t}$ against the student's *own* rolling 30-day baseline $\mu_i$ and standard deviation $\sigma_i$.
2. **Multi-Signal Corroboration:**
   Single-signal spikes (e.g., submitting an assignment late or answering one bad survey question after a poor exam) happen routinely in academic life. To prevent false alarms, **no student is escalated to Tier 2 or Tier 3 without corroboration from at least two distinct, independent signal families**.
3. **Deterministic Explainability:**
   Every output is mathematically traceable to specific standardized score shifts and produces plain-language, non-stigmatizing explanation strings.

---

## 2. Signal Families & Ingestion Vectors

```
Signal Families (Independent Dimensions)
┌──────────────────────────────────────────────────────────────┐
│ Family A: Voluntary Check-ins & Surveys (S)                  │
│ • S_mood: Self-reported mood rating (1-5)                   │
│ • S_energy: Self-reported fatigue / exhaustion (1-5)         │
│ • S_overwhelm: Perceived academic overwhelm (1-5)            │
├──────────────────────────────────────────────────────────────┤
│ Family B: Academic Drift Indicators (A)                      │
│ • A_submission_delay: Delta hours past deadline              │
│ • A_attendance_variance: Drop in attendance % vs 30d avg     │
│ • A_workload_spike: Concurrent assignments due within 48h    │
├──────────────────────────────────────────────────────────────┤
│ Family C: Help-Seeking & Interaction Telemetry (H)           │
│ • H_abandoned_booking: Counselor booking drop-offs           │
│ • H_resource_spike: Searches for distress / coping guides    │
│ • H_nocturnal_activity: System usage between 02:00 and 05:00 │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Mathematical Formulation

### 3.1 Rolling Baseline & Standardized Deviation (Z-Score)
For any metric $x$ within signal family $k$ for student $i$ at time $t$:

$$\mu_{i,k} = \frac{1}{N} \sum_{\tau=t-30d}^{t-1} x_{i,k,\tau}$$

$$\sigma_{i,k} = \sqrt{\frac{1}{N} \sum_{\tau=t-30d}^{t-1} (x_{i,k,\tau} - \mu_{i,k})^2 + \epsilon}$$

Where $\epsilon = 0.05$ (smoothing term preventing division by zero when variance is tiny).

The standardized personal deviation score $Z_{i,k}$ is computed as:

$$Z_{i,k} = \frac{x_{i,k,t} - \mu_{i,k}}{\sigma_{i,k}}$$

### 3.2 Exponentially Weighted Moving Average (EWMA)
To capture trends over acute multi-day fluctuations without noise spikes:

$$\text{EWMA}_{i,k,t} = \alpha \cdot Z_{i,k,t} + (1 - \alpha) \cdot \text{EWMA}_{i,k,t-1}$$

Where the decay parameter $\alpha = 0.35$ (providing balanced sensitivity to 3-day distress trends).

### 3.3 Composite Family Scores
Each signal family yields a normalized composite score $C_{\text{family}} \in [0.0, 1.0]$:

$$C_S = \min\left(1.0, \max\left(0.0, \frac{\text{EWMA}_S + 1.0}{4.0}\right)\right)$$

$$C_A = \min\left(1.0, \max\left(0.0, \frac{\text{EWMA}_A + 1.0}{4.0}\right)\right)$$

$$C_H = \min\left(1.0, \max\left(0.0, \frac{\text{EWMA}_H + 1.0}{4.0}\right)\right)$$

---

## 4. Tier Definitions & Decision Rules

| Tier | Designation | Description | System & Human Action | Corroboration Requirement |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 0** | **Thriving** | Signals are within normal baseline variance ($\pm 1.0\sigma$). | Default state; student sees standard self-care reflections; no counselor visibility. | None. |
| **Tier 1** | **Watch** | Mild drift detected in 1 signal family ($Z \ge +1.5\sigma$). | Personal student portal surfaces supportive tips (sleep hygiene, study pacing). No counselor queue entry. | Single signal family. |
| **Tier 2** | **Gentle Check-in Suggested** | Sustained moderate elevation across at least 2 signal families ($Z \ge +2.0\sigma$). | Consented entry added to Counselor Triage Queue. Counselor considers informal outreach. | **Minimum 2 distinct signal families.** |
| **Tier 3** | **Priority Human Review** | Severe elevation across multiple families ($Z \ge +3.0\sigma$) or acute distress survey response. | Top priority in Counselor Queue; counselor reviews within 24 hours. Immediate crisis banner shown to student. | **Minimum 2 signal families OR Acute Survey Flag.** |

### 4.1 The Corroboration Rule
$$
\text{AllowTier2} = (C_S \ge 0.60 \land C_A \ge 0.50) \lor (C_S \ge 0.60 \land C_H \ge 0.50) \lor (C_A \ge 0.50 \land C_H \ge 0.50)
$$

$$
\text{AllowTier3} = (C_S \ge 0.85 \land (C_A \ge 0.70 \lor C_H \ge 0.70)) \lor \text{AcuteSafetyTrigger}
$$

If a single signal family spikes (e.g., $C_A = 0.90$ due to three late project submissions) but $C_S < 0.40$ and $C_H < 0.30$, the system will **cap the output at Tier 1 (Watch)**, preventing an erroneous counselor alert for a purely academic workload spike.

### 4.2 Acute Safety Bypass Protocol
> **Critical Rule:** The multi-signal corroboration rule and the 7-day alert cooldown window apply **STRICTLY AND ONLY to passive-signal alerts** (academic drift, help-seeking interaction patterns, and routine survey score shifts).
>
> **A student's acute self-report (e.g., voluntary survey response indicating self-harm thoughts or acute distress) ALWAYS BYPASSES BOTH THE CORROBORATION RULE AND THE COOLDOWN WINDOW.**

When an acute self-report is submitted:
1. **Immediate Student Crisis Screen:** Instantly presents the 24/7 Crisis Hotline modal on the student's screen with direct one-tap calling (Tele-MANAS `14416`, Campus Duty Desk) and warm-handoff options. This occurs with $<100\text{ ms}$ latency and zero barriers.
2. **Counselor Notification Gate:** 
   - Notifying a counselor of an acute self-report **strictly requires active student consent** (`consent_counselor_triage: true`).
   - If consent is not present, counselor notification is suppressed unless the university has explicitly enabled the **OFF-by-default institutional emergency policy** (`ENABLE_AUTOMATED_EMERGENCY_DISPATCH="true"`), which requires documented legal and clinical governance authorization.
3. **No Automated Police Dispatch:** The platform will **never** automatically dispatch police or non-consensual physical emergency services without affirmative user initiation or legally sanctioned human review.

---

## 5. False-Alarm Minimization Strategy

```mermaid
flowchart LR
    A["Raw Signal Intake"] --> B["Personal Baseline (Z-Score)"]
    B --> C["Multi-Signal Corroboration Check"]
    C -->|Fails: 1 Family Only| D["Cap at Tier 1 (Self-Help)"]
    C -->|Passes: 2+ Families| E["Hysteresis Filter"]
    E -->|Under Cooldown (7 Days)| F["Suppress Redundant Alert"]
    E -->|Eligible| G["Confidence Calibration Score"]
    G --> H["Surface in Counselor Queue"]
    H --> I["Counselor Feedback Loop<br/>(Actionable vs False Alarm)"]
    I -->|Weight Recalibration| B
```

### 5.1 Hysteresis & Cooldown Windows
- **State Hysteresis:** To transition from Tier 1 to Tier 2, the composite score must exceed $0.65$. To drop back from Tier 2 to Tier 1, the score must stay below $0.45$ for 3 consecutive days. This prevents rapid oscillating alerts ("flip-flopping").
- **7-Day Alert Cooldown:** Once a counselor receives a Tier 2 check-in suggestion for a student, subsequent notifications for that student are silenced for 7 days unless the score elevates to Tier 3.

### 5.2 Confidence Score Formulation
Every tier suggestion includes an auditable confidence score $\gamma \in [0\%, 100\%]$:

$$\gamma = \left( 0.40 \cdot N_{\text{samples\_ratio}} + 0.35 \cdot \text{Agreement}_{\text{families}} + 0.25 \cdot \text{Signal}_{\text{magnitude}} \right) \times 100\%$$

- High confidence ($\ge 80\%$): Multi-signal corroboration across all 3 families with $\ge 20$ historical data points.
- Moderate confidence ($60-79\%$): Corroborated across 2 families with adequate baseline history.
- Low confidence ($< 60\%$): Baseline history $< 7$ days; alerts suppressed or flagged as "Preliminary Baseline".

---

## 6. Plain-Language Explanation Templates

The engine outputs structured human-readable explanations. **Diagnostic terms are banned.**

### Approved Template Examples:
- **Tier 1 (Student View):**  
  *"You've reported higher fatigue and disrupted sleep compared to your typical month. Consider checking out these gentle wind-down exercises."*
- **Tier 2 (Counselor View):**  
  *"Suggested Check-in: Self-reported stress survey elevated (+2.2σ above personal baseline), corroborated by multiple late-night help searches and an abandoned counselor booking in the last 48 hours."*
- **Tier 3 (Counselor View):**  
  *"Priority Review: Significant multi-domain distress signals observed. Sustained survey elevation (+3.1σ) corroborated by sudden drop in academic participation and repeated access to crisis support pages."*

### Prohibited Phrases (Linter Enforced):
- ❌ *"Student displays symptoms of clinical depression."*
- ❌ *"Subject has severe Generalized Anxiety Disorder."*
- ❌ *"High risk psychiatric patient."*

---

## 7. Synthetic Evaluation & Calibration Plan

Before production deployment, the engine is benchmarked against a synthetic dataset of 5,000 simulated student trajectories representing diverse profiles:

| Student Archetype | Simulated Profile Description | Target System Response |
| :--- | :--- | :--- |
| **Typical High-Achiever** | High baseline workload; occasionally submits 1 day late during midterms; surveys remain stable. | Stays at Tier 0/1; **never** false-alarms to Tier 2. |
| **Gradual Burnout** | Steady decline in energy survey scores over 3 weeks; late-night portal activity increases; 2 deadlines missed. | Accurately escalates to Tier 2 in Week 3. |
| **Acute Crisis Onset** | Sudden severe survey check-in response with help-seeking searches. | Immediate escalation to Tier 3 + Crisis Modal. |
| **Irregular Shift Worker** | Routine nocturnal portal logins (normal for this user's personal baseline). | Baseline adjusts; zero false alarms on nocturnal telemetry. |

### Evaluation Metrics:
- **Target Precision (Tier 3):** $\ge 85\%$
- **Target Recall (Tier 3):** $\ge 90\%$
- **Brier Score (Calibration):** $\le 0.12$
- **Demographic Disparate False Positive Ratio:** $0.95 \le \frac{\text{FPR}_{\text{group } A}}{\text{FPR}_{\text{group } B}} \le 1.05$

---

## 8. Future Machine Learning Upgrade Path & Safeguards

While the MVP relies on explainable, deterministic statistical heuristics (Z-score + EWMA + Decision Tree), future iterations may evaluate lightweight privacy-preserving ML models (e.g., Gradient Boosted Trees or on-device localized models).

### Mandatory Safeguards for Future ML Integration:
1. **Model Card & Explainability:** Any ML model must generate SHAP (SHapley Additive exPlanations) values for every inference.
2. **Local / Edge Inference:** Explore client-side WebAssembly (ONNX Runtime Web) to run risk scoring directly in the student's browser, preventing raw telemetry from ever reaching central servers.
3. **Continuous Bias Audits:** Automated monthly pipeline testing across all demographic slices to detect concept drift and demographic bias.

