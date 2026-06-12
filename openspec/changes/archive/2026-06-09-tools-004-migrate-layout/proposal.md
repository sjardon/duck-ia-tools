## Why

The `tools/` directory currently uses a fixed type-based layout (`agents/`, `hooks/`, `skills/`, `mcp-servers/`) inherited from a previous architecture. Now that TOOLS-003 introduced recursive `meta.json` discovery and TOOLS-002 added `path` injection, there is no technical reason to keep these type directories — they are structural noise that contradicts the flexible layout model defined in the architecture.

## What Changes

- Move all tool directories from `tools/agents/<name>/` to `tools/<name>/` (flat layout at `tools/` root)
- Remove the now-empty `tools/agents/` parent directory
- All `meta.json` names remain unchanged (no renames needed; names are already unique)
- No code changes required — `FsToolsRepository` already handles arbitrary paths via recursive scan

## Capabilities

### New Capabilities

None. This is a structural reorganization, not a new capability.

### Modified Capabilities

- `flexible-tool-registry`: The tools directory layout is updated to match the flexible model described in the spec — tools live directly under `tools/<name>/` rather than under type-prefixed directories. The spec already defines this as the intended state; this task makes the filesystem match it.

## Impact

- `tools/` directory structure (filesystem reorganization only)
- `FsToolsRepository.listAll()` path resolution: `path` values returned for each tool will change from `agents/<name>` to `<name>` — this is the intended outcome
- No CLI API changes, no interface changes, no breaking changes to callers
