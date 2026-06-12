## Why

The current architecture documentation describes a fixed-directory model for tool components (`tools/agents/`, `tools/hooks/`, etc.) that no longer reflects the intended design. Before any code changes, the documentation must be updated to establish the new flexible registry model as the authoritative reference: tools discovered by recursive `meta.json` scan, `name` as the global unique identifier, `kit` as a new composition type, and startup-time validation that prevents duplicate names.

## What Changes

- Remove the fixed `tools/<type>/<name>/` path convention as the sole valid layout
- Document that any directory containing `meta.json` is a discoverable tool, regardless of its path
- Document that `name` (from `meta.json`) is the global unique identifier across all tools, not the filesystem path
- Document startup failure behavior: if two `meta.json` files share the same `name`, the service must abort and report both conflicting paths
- Introduce the `kit` type: a `meta.json` with `type: "kit"` and a `components: string[]` field that lists tool names to bundle
- Update the repository layout diagram to reflect the new flexible `tools/` structure

## Capabilities

### New Capabilities

- `flexible-tool-registry`: Discovery model where any directory with `meta.json` is a tool; `name` is the global unique identifier; startup validates uniqueness and fails with both paths on conflict; `kit` type groups tools by name reference

### Modified Capabilities

<!-- No existing specs are affected — this is a documentation-only change establishing the new model -->

## Impact

- `docs/ARCHITECTURE.md`: sections "Repository layout", "Tool component structure", and related diagrams will be updated
- No code changes in this task; downstream tasks (TOOLS-002, TOOLS-003, TOOLS-004) will implement the model documented here
