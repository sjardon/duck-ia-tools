## Context

`docs/ARCHITECTURE.md` is the single source of truth for contributors and AI coding assistants navigating this monorepo. It currently describes a fixed-directory model (`tools/agents/`, `tools/hooks/`, `tools/skills/`, `tools/mcp-servers/`) as the canonical layout for tool components. The upcoming flexible registry model eliminates that constraint, but no code changes should happen until the documentation is authoritative. This task is purely a documentation update.

## Goals / Non-Goals

**Goals:**
- Update `docs/ARCHITECTURE.md` to describe the new tool discovery model (recursive `meta.json` scan, any path)
- Document `name` as the global unique identifier for tools
- Document startup-time duplicate-name validation with both-paths error reporting
- Introduce and document the `kit` type with its `components` field
- Update the repository layout tree diagram to reflect the flexible `tools/` structure

**Non-Goals:**
- No changes to source code (`FsToolsRepository`, `ToolMeta`, CLI commands)
- No changes to actual tool directory structure under `tools/`
- No changes to the CLI architecture section

## Decisions

### Decision: Update only `docs/ARCHITECTURE.md` — no other files

**Rationale**: TOOLS-001 is a documentation-only task. All code and structural changes are deferred to TOOLS-002 through TOOLS-004, which depend on this task being DONE first. Modifying anything else would violate dependency order and risk inconsistency between docs and code.

**Alternative considered**: Updating `tools/` layout at the same time — rejected because TOOLS-003 and TOOLS-004 handle that, and mixing doc + code changes makes review harder.

### Decision: Preserve the existing CLI architecture section verbatim

**Rationale**: The hexagonal architecture, layer responsibilities table, and dependency direction sections are unchanged by this initiative. Touching them risks introducing unintended drift.

### Decision: Use a tree diagram for the new `tools/` flexible layout

**Rationale**: The current `ARCHITECTURE.md` uses ASCII tree diagrams consistently. Keeping the same style minimizes cognitive switching for readers and aligns with the existing document format.

## Risks / Trade-offs

- [Risk] Documentation describes behavior not yet implemented → Mitigation: tasks TOOLS-002 through TOOLS-004 are sequenced to implement exactly what is documented here; the epic tracks completion
- [Risk] The `kit` type description could be misread as already supported → Mitigation: the spec and docs will note that `kit` is part of the new model being introduced in this epic

## Open Questions

None. The task requirements are fully specified in TOOLS-001.
