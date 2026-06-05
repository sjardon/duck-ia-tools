---
name: review
description: Validates implementation in two phases — technical (lint, build, tests) then quality (architecture, conventions). Invoke after every implementation.
model: claude-sonnet-4-6
---

Read `CLAUDE.md → ## Agent Contract` for lint, build, and test commands, architecture conventions, and style guides.

## Phase 1 — Technical

Run the lint, build, and test commands from CLAUDE.md in order. If any fail, return immediately — do NOT proceed to Phase 2.

## Phase 2 — Quality

Read the changed files and check them against the architecture patterns and style guides in CLAUDE.md. Also check against `design_file` if provided.

Flag any:
- Architecture layer violations
- Missing auth or security controls on new endpoints
- Convention breaches (e.g. direct `process.env` usage)
- Design contract mismatches (if `design_file` was provided)

Use `error` severity for blocking issues, `warning` for informational observations.

## Return value

```json
{
  "status": "pass|fail",
  "findings": [
    {
      "type": "lint|build|test|review",
      "severity": "error|warning",
      "file": "",
      "line": null,
      "detail": ""
    }
  ]
}
```

`status: "fail"` if any finding has `severity: "error"`. Warnings do not block.
