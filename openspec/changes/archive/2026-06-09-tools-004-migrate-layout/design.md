## Context

The repository currently stores all tool components under `tools/agents/` because the original discovery logic only scanned hard-coded type directories. TOOLS-003 replaced that logic with a recursive `meta.json` scanner that works at any depth, making the `agents/` wrapper redundant.

There are 8 tools, all of type `agent`, all under `tools/agents/`:
- analyst, code-reviewer, design, docs, git, implementation, orchestrator, review

No hooks, skills, or mcp-servers directories exist yet. This task migrates the existing tools to the flat layout and removes the `agents/` wrapper.

## Goals / Non-Goals

**Goals:**
- Move all 8 tool directories from `tools/agents/<name>/` to `tools/<name>/`
- Remove the empty `tools/agents/` directory after migration
- Confirm the CLI (FsToolsRepository) resolves all tools correctly under the new paths
- Confirm no duplicate name errors are raised

**Non-Goals:**
- Renaming any tool (`name` in `meta.json` stays the same)
- Adding new tools or changing tool content
- Modifying any TypeScript code (no code changes needed)
- Creating hooks, skills, or mcp-servers directories (out of scope)

## Decisions

### Decision: Flat layout at `tools/<name>/`

Move tools to `tools/<name>/` (one level deep) rather than grouping into semantic subdirectories (e.g., `tools/dev-workflow/analyst/`).

**Rationale:** The set of tools is small (8 items), all the same type, and thematically cohesive. A flat layout is the simplest migration path, matches the architecture docs examples, and avoids premature grouping decisions. Subdirectories can be introduced later if the catalog grows.

**Alternative considered:** Grouping by domain (e.g., `tools/coding/`, `tools/devops/`) — rejected because it adds organizational overhead without benefit at this scale, and the groupings are not obvious for agents like `docs` or `review`.

### Decision: Use `git mv` for each tool directory

Use `git mv tools/agents/<name> tools/<name>` to preserve git history for each file.

**Rationale:** History preservation for tool content files is valuable. `git mv` is the standard way to rename/move tracked files.

### Decision: No code changes

`FsToolsRepository` already resolves content via `meta.path` (injected at scan time), so moving files automatically yields the correct new paths — no code needs updating.

## Risks / Trade-offs

- [Risk: Broken references] Any external script or documentation that hardcodes `tools/agents/<name>` will break. → Mitigation: Check `docs/ARCHITECTURE.md` for any hardcoded paths; the layout diagram there uses generic placeholders and is already correct.
- [Risk: DS_Store or other hidden files left behind] The `tools/agents/` directory may not be fully empty after the move if OS hidden files (`.DS_Store`) remain. → Mitigation: Remove `tools/agents/` with `rm -rf` after the `git mv` operations.
