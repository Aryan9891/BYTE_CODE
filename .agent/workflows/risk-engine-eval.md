# Antigravity Workflow: Risk Engine Evaluation & Fairness Calibration
**Workflow ID:** `workflow:risk-engine-eval`  
**Applicability:** Required whenever modifying mathematical weights, Z-score formulas, corroboration rules, or baseline parameters in the risk engine.

---

## 1. Objective
Ensure that adjustments to the risk-signal engine do not introduce false-alarm spikes, degrade acute crisis detection recall, or create disparate false-positive rates across student subgroups.

---

## 2. Execution Command
Run the synthetic evaluation suite against the 5,000 simulated student profiles:
```bash
npx vitest run tests/unit/risk-engine-calibration.test.ts
```

---

## 3. Mandatory Quantitative Gate Criteria

### 3.1 Tier 3 Alert Accuracy
- **Precision:** $\ge 85\%$ (At least $85\%$ of Tier 3 suggestions must represent true corroborated multi-vector distress or acute survey triggers).
- **Recall:** $\ge 90\%$ (At least $90\%$ of synthetic trajectories exhibiting sustained multi-signal deterioration must be surfaced).

### 3.2 False-Alarm Minimization (Tier 2 & Tier 3)
- **Single-Signal Isolation:** Verify that $100\%$ of synthetic profiles with an isolated spike in one signal family (e.g., missed deadlines alone during midterms) are capped at **Tier 1 (Watch)** and do not generate counselor alerts.
- **Hysteresis Stability:** Verify that oscillating scores around the threshold do not produce flip-flopping notifications within the 7-day cooldown window.

### 3.3 Demographic Fairness Ratio
Evaluate the False Positive Rate (FPR) across synthetic demographic cohorts (e.g., Department, Academic Year, International vs Domestic cohorts):

$$\text{Disparate Ratio} = \frac{\text{FPR}_{\text{Group } A}}{\text{FPR}_{\text{Group } B}}$$

- **Gate Criterion:** $0.95 \le \text{Disparate Ratio} \le 1.05$. If any group experiences $>5\%$ disproportionate false-positive alert frequency, the weights must be recalibrated.

---

## 4. Qualitative Language Audit
- Verify that every emitted explanation string passes through the non-diagnostic vocabulary filter.
- Run string verification:
  ```bash
  npm run test:language-linter
  ```
- **Zero clinical diagnostic phrases allowed** in counselor or student outputs.

