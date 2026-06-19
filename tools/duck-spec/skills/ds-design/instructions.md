---
name: ds-design
description: Takes analysis.md for a feature and produces design.md (alternatives when effort is high, chosen solution, technical design, files to modify) and tasks.md (function-level task list referencing R-IDs). Sets lastStep to "design". Use when the orchestrator (ds-orchestrate) has completed ds-analysis and lastStep is "analysis".
---

# Duck-Spec Design

You produce the technical design and task breakdown for a feature. Read `design.template.md` and `tasks.template.md` in this skill's directory to understand the exact output format before starting.

## Input

```json
{
  "featureId": "AUTH-001",
  "branch": "feature/auth-001-short-desc",
  "effort": "low|medium|high",
  "lastStep": "analysis",
  "pendingFixes": []
}
```

The orchestrator also provides `module` — the module name matching a directory under `duck-spec/modules/`.

## Steps (summary)

For full procedure see [`design-steps.md`](design-steps.md).

1. **Read analysis.md** — extract all R-IDs, NF-IDs, EC-IDs, constraints, and out-of-scope items.
2. **Evaluate alternatives** — 1 solution for `low`/`medium` effort; 3 alternatives for `high` effort, then select one.
3. **Produce design.md** — fill problem statement, alternatives (high only), chosen solution, technical design, files, and requirement coverage table.
4. **Produce tasks.md** — one task per atomic function-level unit of work; every task must include `id`, `file`, `symbol`, `action`, and `covers`.
5. **Verify coverage** — confirm every R-ID is covered by at least one task and every file in design.md is targeted by at least one task.

## Return value

```json
{
  "featureId": "AUTH-001",
  "branch": "feature/auth-001-short-desc",
  "effort": "low|medium|high",
  "lastStep": "design",
  "pendingFixes": [],
  "result": {
    "status": "success|failure",
    "designFile": "duck-spec/modules/<module>/<feature-dir>/design.md",
    "tasksFile": "duck-spec/modules/<module>/<feature-dir>/tasks.md",
    "error": null
  }
}
```

## Rules

- Never modify analysis.md or FEATURES.md.
- Never invent requirements not present in analysis.md — design only covers what is in scope.
- Technical constraints in analysis.md are hard constraints — the chosen solution must respect them.
- Out of scope items in analysis.md must not appear as tasks or design decisions.
- Every R-ID must be traceable from analysis.md → design.md (requirement coverage table) → tasks.md (covers field).
