## Why

The `ToolMeta` interface currently reflects the old fixed-directory model: `type` is limited to four hardcoded values (`agent`, `hook`, `skill`, `mcp-server`) and there is no `path` field, meaning tools are located by reconstructing their path from `type`. The new flexible registry model (TOOLS-001) requires tools to be locatable by a `path` field and to support `kit` as a first-class type with a `components` list — without those fields on `ToolMeta`, the interface is a mismatch with the architecture spec.

## What Changes

- Add `path: string` to `ToolMeta` — relative path from the `tools/` root (e.g. `"analyst/openapi"`), used for content resolution instead of deriving paths from `type`
- Extend the `type` union to include `"kit"` alongside the existing four values
- Add optional `components?: string[]` to `ToolMeta` — only meaningful when `type === "kit"`, lists the `name` values of tools to install together

## Capabilities

### New Capabilities

_(none — this change extends an existing data contract, it does not introduce a new named capability)_

### Modified Capabilities

- `flexible-tool-registry`: The ToolMeta shape is a core part of the registry contract. Adding `path`, extending `type`, and adding `components` are requirement-level changes to how tools are identified and described.

## Impact

- `packages/cli/src/shared/interfaces/IToolsRepository.ts` — `ToolMeta` interface definition updated
- Any code that constructs or consumes `ToolMeta` objects will see the new fields (additive, no breaking change for existing consumers that don't use `path` or `components`)
- `FsToolsRepository` will need to populate `path` when building `ToolMeta` objects (addressed in TOOLS-003)
- No changes to CLI commands or target adapters in this task
