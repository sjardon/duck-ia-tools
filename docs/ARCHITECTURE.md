# Architecture

## Purpose

A monorepo that stores reusable AI coding components (agents, tools, hooks, skills) and exposes them via a CLI (`duck`) that installs them into target AI tools (Claude Code, GitHub Copilot, etc.).

---

## Repository layout

```
duck-ia-tools/
├── packages/
│   └── cli/                        # npm package: the `duck` CLI
└── tools/                          # library of components (any layout)
    ├── <any-dir>/
    │   └── meta.json               # presence of meta.json = discoverable tool
    └── <nested/paths/allowed>/
        └── meta.json
```

Tools can be organized at any path under `tools/`. The directory structure is free-form — what makes a directory a tool is the presence of a `meta.json` file, not its location.

### Tool component structure

Each component directory that contains a `meta.json` is a discoverable tool:

```
tools/<any/path>/
├── meta.json          # name (global unique ID), description, tags, type, target compatibility
├── instructions.md    # canonical content
└── variants/          # optional platform-specific overrides
    ├── claude.md
    └── copilot.md
```

The `name` field in `meta.json` is the **global unique identifier** for the tool across the entire repository. All references to a tool (from the CLI, kits, or configuration) use `name` — not the filesystem path. The path is used only internally for content resolution.

### Additional files

A component directory may contain files beyond `instructions.md` that should be installed alongside the main content. These are declared explicitly in `meta.json` via an optional `"files"` field:

```jsonc
{
  "name": "ds-analysis",
  "type": "skill",
  "files": ["analysis.template.md"]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `files` | `string[]` | no | Paths relative to the component directory. Each file is read and written to the same destination directory as the main content. |

If a path listed in `"files"` does not exist on disk at install time, the installation aborts with an error that identifies both the component and the missing file. Files are installed in the same destination directory as the main content, with no per-file destination override and no target-specific variant. Existing destination files are overwritten without confirmation.

### Tool discovery

The CLI discovers tools by recursively scanning `tools/` for every `meta.json` file. There are no hard-coded type subdirectories.

**Uniqueness validation:** On startup, the registry validates that no two `meta.json` files share the same `name`. If a duplicate is found, the process aborts before serving any command and emits an error that includes both conflicting paths:

```
Error: Duplicate tool name "my-agent" found at:
  tools/analyst/my-agent/meta.json
  tools/legacy/my-agent/meta.json
Resolve the conflict before starting.
```

### instruction type

An `instruction` component represents a project-level instruction file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot). It is installed by `duck add` directly into the user's project at the path defined by the mandatory `destination` field.

```jsonc
// tools/duck-spec/instructions/ds-CLAUDE/meta.json
{
  "name": "ds-CLAUDE",
  "type": "instruction",
  "description": "Project-level CLAUDE.md instructions for the duck-spec workflow",
  "tags": ["duck-spec", "instructions", "claude"],
  "targets": ["claude"],
  "destination": "CLAUDE.md"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | `"instruction"` | yes | Marks this entry as an instruction component |
| `destination` | `string` | yes | Default install path relative to the user's project root. Absence causes a validation error at install time. |

Variant resolution (`variants/<target>.md` → fallback `instructions.md`) applies to `instruction` components the same way it does for `agent` components. If the destination file already exists in the user's project, the CLI presents an interactive overwrite confirmation before writing.

The `--dest <path>` flag on `duck add` overrides `destination` at install time.

---

### kit type

A `kit` is a special tool type that groups other tools by name reference. Instead of providing its own installable content, a kit's `meta.json` lists the tools to install together.

```jsonc
// tools/my-kit/meta.json
{
  "name": "my-kit",
  "type": "kit",
  "description": "Bundles analyst and reviewer tools",
  "components": ["analyst", "code-reviewer"]
}
```

| Field | Type | Description |
|---|---|---|
| `type` | `"kit"` | Marks this entry as a kit |
| `components` | `string[]` | List of tool `name` values to include in the kit |

When a user installs a kit, the CLI resolves each entry in `components` to the corresponding tool and installs that tool's content for the requested target. If any name in `components` cannot be resolved, the install fails with an error identifying the unresolved name and the kit that referenced it.

---

## CLI architecture

Pattern: **vertical slicing + simplified hexagonal**.

```
packages/cli/src/
├── commands/
│   └── <command>/
│       ├── handler.ts              # entry point: parses CLI args, calls useCase
│       ├── <command>.useCase.ts    # application logic, depends only on interfaces
│       ├── interfaces/             # repository contracts (ports) specific to this slice
│       │   └── I<Name>Repository.ts
│       └── repositories/          # implementations specific to this slice
│           └── Fs<Name>Repository.ts
├── shared/
│   ├── interfaces/                 # generic contracts reused across slices
│   │   ├── IToolsRepository.ts
│   │   └── ITargetAdapter.ts
│   └── repositories/              # generic implementations shared across slices
│       └── FsToolsRepository.ts
├── infrastructure/
│   └── targets/                   # one adapter per AI tool
│       ├── ClaudeTarget.ts        # implements ITargetAdapter
│       └── CopilotTarget.ts
└── index.ts                       # wiring: injects concrete implementations into useCases
```

### Layer responsibilities

| File | Responsibility |
|---|---|
| `handler.ts` | CLI adapter. Parses args (Commander), calls useCase, renders output (Clack) |
| `<command>.useCase.ts` | Business logic. No I/O. Depends on injected repository interfaces |
| `interfaces/I*.ts` | Contracts (ports). Define what the useCase needs, not how it's done |
| `repositories/Fs*.ts` | Implementations. File system, network, etc. |
| `infrastructure/targets/*.ts` | AI tool adapters. Know how to write files for each target |

### Repository placement rule

| Scenario | Location |
|---|---|
| Used only by one slice, or has slice-specific queries/mappings | `commands/<slice>/interfaces/` + `repositories/` |
| Generic, used by 2+ slices | `shared/interfaces/` + `shared/repositories/` |
| AI tool adapter (Claude, Copilot) | `infrastructure/targets/` |

### Dependency direction

```
handler → useCase → interface ← repository implementation
```

The useCase never imports from `repositories/` or `infrastructure/` directly. Concrete implementations are injected in `index.ts`.

### Shared interface contracts

`IToolsRepository` (in `shared/interfaces/IToolsRepository.ts`) defines the following methods:

| Method | Return type | Description |
|---|---|---|
| `listAll()` | `Promise<ToolMeta[]>` | Returns all discoverable tools in the repository |
| `getByName(name)` | `Promise<ToolMeta \| null>` | Finds a tool by its unique name |
| `getContent(name, target)` | `Promise<string>` | Resolves and returns the main content for the given tool and target |
| `getAdditionalFiles(name)` | `Promise<AdditionalFile[]>` | Resolves and returns additional files declared in `meta.json`. Returns an empty array if `"files"` is absent or empty. Throws with a descriptive message if any declared file does not exist on disk. |

`InstallOptions` (in `shared/interfaces/ITargetAdapter.ts`) carries the following fields to the target adapter:

| Field | Type | Description |
|---|---|---|
| `toolName` | `string` | The unique name of the component being installed |
| `toolType` | `string` | The component type (`agent`, `skill`, `instruction`, `hook`, `mcp-server`) |
| `content` | `string` | Main file content resolved for the active target |
| `projectPath` | `string` | Absolute path to the user's project root |
| `destination` | `string \| undefined` | Destination override (from `--dest` flag or `meta.json`) |
| `additionalFiles` | `AdditionalFile[]` | List of additional files to write alongside the main content; always present, may be empty |

`AdditionalFile` (in `shared/interfaces/IToolsRepository.ts`) is a value type:

| Field | Type | Description |
|---|---|---|
| `fileName` | `string` | File name only (no path separators); written as-is inside the destination directory |
| `content` | `string` | Raw file content |

---

## Frameworks

| Purpose | Library |
|---|---|
| Command routing + arg parsing | Commander |
| Interactive prompts + terminal UI | Clack |

---

## Adding a new command

1. Create `commands/<name>/` with `handler.ts`, `<name>.useCase.ts`
2. Add `interfaces/I<Name>Repository.ts` if external I/O is needed
3. Add `repositories/Fs<Name>Repository.ts` (or reuse from `shared/`)
4. Wire in `index.ts`

## Adding a new AI tool target

1. Create `infrastructure/targets/<ToolName>Target.ts` implementing `ITargetAdapter`
2. Add a variant file in each tool component under `tools/<type>/<name>/variants/<toolname>.md` if the content differs
