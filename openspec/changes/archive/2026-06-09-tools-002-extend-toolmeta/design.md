## Context

`ToolMeta` (defined in `packages/cli/src/shared/interfaces/IToolsRepository.ts`) is the core data type that flows through the entire CLI: from repository reads, through use-case logic, to command output. Currently it lacks a `path` field and has a fixed `type` union that does not include `"kit"`.

The architecture now specifies a flexible registry where tools are discovered by recursive scan and located via their `path` relative to `tools/`. This task makes `ToolMeta` reflect that contract before `FsToolsRepository` is refactored (TOOLS-003) to actually populate those fields.

Current shape:
```ts
export interface ToolMeta {
  name: string;
  type: "agent" | "hook" | "skill" | "mcp-server";
  description: string;
  tags: string[];
  targets: string[];
}
```

## Goals / Non-Goals

**Goals:**
- Add `path: string` to `ToolMeta` so the interface can carry filesystem location
- Add `"kit"` to the `type` union
- Add `components?: string[]` to support kit metadata
- Keep the change purely additive at the interface level (no breaking change)

**Non-Goals:**
- Changing `FsToolsRepository` to populate `path` (TOOLS-003)
- Changing how `meta.json` files on disk are structured
- Validating that `components` is only present when `type === "kit"` at runtime (runtime enforcement is TOOLS-003)
- Migrating existing `meta.json` files to include `path` (TOOLS-004)

## Decisions

### Decision: `path` is added as a required field on the interface

**Rationale:** Making `path` required on `ToolMeta` makes it impossible to construct a valid `ToolMeta` object without specifying the filesystem location — which is exactly what the new registry model demands. Optional `path?` would allow consumers to pretend tools are still locatable via type, undermining the migration.

**Alternative considered:** `path?: string` (optional). Rejected because it defers the enforcement to runtime and allows the old path-reconstruction logic in `FsToolsRepository` to remain undetected as a violation.

### Decision: Extend the existing `type` union rather than introducing a discriminated union

**Rationale:** A discriminated union (e.g., `ToolBase | KitMeta`) would be the most type-safe shape, but would be a breaking change for all existing consumers that destructure `ToolMeta`. Since the goal of this task is a minimal, additive change, extending the union and making `components` optional is the right scope. TOOLS-003 can enforce the invariant at construction time.

**Alternative considered:** Separate `KitMeta` interface. Deferred to a future refactor once all consumers are updated.

### Decision: `components` is typed `string[]` (not `ToolMeta[]`)

**Rationale:** Components are referenced by `name`, consistent with the architecture spec. Embedding full `ToolMeta` objects would create circular resolution concerns and couple the kit definition to a fully-resolved registry.

## Risks / Trade-offs

- **[Risk] Existing `meta.json` files on disk do not have a `path` field** → The `FsToolsRepository` currently reads `meta.json` directly into `ToolMeta`. After this change the interface requires `path`, but the JSON on disk doesn't have it. TOOLS-003 must inject `path` during deserialization before this discrepancy causes runtime errors. Until TOOLS-003 lands, the repository is technically inconsistent at runtime. Mitigation: treat TOOLS-002 and TOOLS-003 as a tightly coupled pair; TOOLS-003 is the immediate next task.

- **[Trade-off] `components` is not enforced as kit-only at the type level** → TypeScript will allow any `ToolMeta` to carry `components`. Enforcement is left to TOOLS-003 runtime validation and documentation. Acceptable given the additive-only constraint of this task.
