## Why

`FsToolsRepository` still uses a hardcoded `TOOL_TYPES` constant to enumerate fixed subdirectories (`agents/`, `hooks/`, `skills/`, `mcp-servers/`), making it incompatible with the free-form layout defined in the architecture. The `ToolMeta` interface now carries a `path` field and supports the `kit` type, but the repository implementation never populates `path` and cannot discover tools outside the four fixed directories.

## What Changes

- Remove the `TOOL_TYPES` constant from `FsToolsRepository`
- Replace the type-based directory iteration in `listAll()` with a recursive walk over `tools/` that finds every `meta.json` at any depth
- Populate `ToolMeta.path` at deserialization time with the directory's relative path from the `tools/` root
- Add duplicate-name validation in `listAll()`: if two `meta.json` files declare the same `name`, throw an error that includes both paths
- Rewrite `getContent(name, target)` to resolve the tool directory using `ToolMeta.path` instead of iterating `TOOL_TYPES`

## Capabilities

### New Capabilities

- None — no new public interface capabilities. The `IToolsRepository` contract and `ToolMeta` shape were established by TOOLS-001/TOOLS-002.

### Modified Capabilities

- `flexible-tool-registry`: The implementation of discovery (`listAll`) and content resolution (`getContent`) now conform to the requirements already specified: recursive scan, `path` population, duplicate-name abort, and path-based content resolution. No requirement text changes — the spec already captures these behaviors; this change makes the code satisfy them.

## Impact

- **Modified file:** `packages/cli/src/shared/repositories/FsToolsRepository.ts`
- **No interface changes:** `IToolsRepository` and `ToolMeta` are unchanged
- **Behavioral change:** tools outside the four legacy subdirectories are now discoverable; tools inside those directories continue to work as long as their `meta.json` is present
- **Error surface change:** startup (or first `listAll()` call) will throw if duplicate `name` values exist across any discovered `meta.json` files
- **No downstream breakage** in existing use sites that call `listAll()`, `getByName()`, or `getContent()` — the method signatures are unchanged
