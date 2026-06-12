## Context

`FsToolsRepository` is the sole implementation of `IToolsRepository` and is the component responsible for discovering tools on disk and reading their content. It currently uses a `TOOL_TYPES` constant (`["agents", "hooks", "skills", "mcp-servers"]`) to enumerate fixed top-level subdirectories, then reads one level of entries per type.

The architecture (TOOLS-001) and the `ToolMeta` interface (TOOLS-002) have already been updated to support a free-form layout, but the repository still enforces the old fixed-directory model. This task closes the gap by rewriting the discovery and content-resolution logic.

The change is confined to a single file: `packages/cli/src/shared/repositories/FsToolsRepository.ts`. The public interface (`IToolsRepository`) and the data shape (`ToolMeta`) are not touched.

## Goals / Non-Goals

**Goals:**
- Replace fixed-type iteration with a recursive `meta.json` walk across the entire `tools/` directory tree
- Populate `ToolMeta.path` at deserialization time using the relative path of the discovered directory
- Validate uniqueness of `name` across all discovered tools; throw with both conflicting paths if a duplicate is found
- Rewrite `getContent` to resolve the tool directory from `ToolMeta.path` instead of re-iterating `TOOL_TYPES`
- Preserve existing method signatures and return types unchanged

**Non-Goals:**
- Changing `IToolsRepository` or `ToolMeta`
- Implementing kit resolution (install-time concern, not repository concern)
- Migrating existing tool directories to the new layout (TOOLS-004)
- Adding caching or persistent storage

## Decisions

### Decision: Recursive walk using Node.js `fs` APIs (no extra dependencies)

The existing implementation already uses `fs/promises` (`readdir`, `readFile`, `stat`). A recursive walk can be implemented with the same APIs by passing `{ withFileTypes: true }` to `readdir`, avoiding an external dependency.

Alternative considered: `glob` or `fast-glob` for `**/meta.json` matching. Rejected to keep zero new dependencies.

### Decision: Populate `path` at discovery time, not in `getContent`

`path` must be part of every `ToolMeta` returned by `listAll()` and `getByName()`. The cleanest place to assign it is immediately after parsing the `meta.json`, using the relative path of its parent directory from the `toolsPath` root.

This means `getContent` can simply call `getByName(name)` and use `meta.path` to resolve the directory — no second file system scan.

### Decision: Validate uniqueness inside `listAll()` on every call (no lazy caching in this task)

Validation happens at the end of `listAll()`, after the full walk is complete. If a duplicate is found, an `Error` is thrown with a message listing all conflicting paths per name.

Caching/memoization (to avoid re-scanning on every `listAll()` call) is an optimization deferred to a future task. For now, each call performs a fresh scan. This keeps the implementation simple and correct.

Alternative considered: validate in the constructor. Rejected because the constructor is synchronous and a recursive file walk is async. Lazy validation (first call) is the idiomatic pattern for async initialization without a dedicated `init()` lifecycle.

### Decision: `getContent` delegates directory resolution to `getByName`

Rather than duplicating the walk logic, `getContent` calls `this.getByName(name)` (which calls `listAll()`) to obtain the `ToolMeta` and reads `meta.path` to construct the content path. This is slightly less efficient but eliminates duplication and keeps content resolution consistent with discovery.

If `getByName` returns `null`, `getContent` throws the same `Tool not found` error as before.

## Risks / Trade-offs

**[Risk] Re-scanning on every `listAll()` call has I/O cost** → The tools directory is small (tens of entries); the performance impact is negligible for the current use case. A memoization layer can be added later without changing the interface.

**[Risk] `getContent` now calls `listAll()` transitively via `getByName()`, adding a recursive walk per content lookup** → Same mitigation as above. Acceptable for the current scale; future caching will address it.

**[Risk] Validating uniqueness on every call means duplicate errors surface on every command, not just startup** → This is the desired behavior per the architecture spec. A startup hook that calls `listAll()` once before serving commands would give true startup-time detection (deferred to wiring in `index.ts`, outside this task's scope).

**[Risk] `meta.json` files with invalid JSON silently continue (skip with `continue`)** → Matches current behavior; noisy error reporting for malformed files is out of scope.
