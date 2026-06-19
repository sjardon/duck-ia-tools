# cli — Module Spec

**Scope:** Capacidades del CLI `duck` — comandos disponibles, tipos de componentes soportados, y targets de instalación hacia herramientas de AI.

---

## Commands

### `duck add <tool> --target <target>`

Installs a tool component from the `tools/` library into the user's project for the specified AI tool target.

Supported component types: `agent`, `hook`, `skill`, `mcp-server`, `kit`, `instruction`.

**Flags:**
- `--target <name>` — AI tool target to install for (e.g., `claude`, `copilot`).
- `--dest <path>` — Overrides the default installation destination. Takes precedence over the `destination` field in `meta.json`. Applies only to `instruction` type components.

**Behavior:**
- For `kit` type components, the CLI resolves each entry in the kit's `components` array and installs each individually.
- For `instruction` type components, the CLI resolves the installation destination using the precedence: `--dest` > `meta.json` `destination` field.
- If the resolved destination file already exists in the user's project, the CLI interactively prompts the user to confirm overwriting via a Clack `confirm` prompt before proceeding.
- If the user rejects the overwrite confirmation, the installation is cancelled for that component and the existing file remains unchanged.
- Variant resolution (`variants/<target>.md` → fallback `instructions.md`) applies uniformly to all component types including `instruction`.

---

## Component types

| Type | Description |
|---|---|
| `agent` | An AI coding agent definition file |
| `hook` | A lifecycle hook for the AI tool |
| `skill` | A reusable skill or prompt template |
| `mcp-server` | An MCP server configuration |
| `kit` | A bundle of other components installed together |
| `instruction` | A project-level instruction file (e.g., `CLAUDE.md`, `.github/copilot-instructions.md`) |

### `instruction` type specifics

- Requires a `destination` field in `meta.json` specifying the default install path relative to the user's project root. Absence of this field causes a descriptive error and aborts the install.
- Supports per-target variants (`variants/<target>.md`) using the same resolution mechanism as `agent` components.
- Falls back to `instructions.md` when no variant file matches the active target.

### Additional files

Any component type may declare an optional `"files": string[]` field in its `meta.json`. Entries are file paths relative to the component directory. When present, `duck add` reads each declared file and installs it into the same destination directory as the main content.

- If `"files"` is omitted or empty, installation proceeds with unchanged behavior.
- If a declared file does not exist on disk, the installation is aborted before any file is written. The error message identifies both the missing file path and the component name.
- Existing files at the destination are overwritten without interactive confirmation.

The destination directory used for additional files per component type:

| Type | Destination directory for additional files |
|---|---|
| `agent` | `.claude/agents/` |
| `skill` | `.claude/skills/<skillName>/` |
| `instruction` | same directory as the resolved destination file |
| `hook` | `.claude/` |
| `mcp-server` | `.claude/` |

The `ds-analysis` and `ds-design` skills use this mechanism to install their template files (`analysis.template.md`, `design.template.md`, `tasks.template.md`) alongside their main `instructions.md`.

---

## Targets

| Target | Class | Notes |
|---|---|---|
| `claude` | `ClaudeTarget` | Installs for Claude Code. Resolves `claude` variant for `instruction` type. |
| `copilot` | `CopilotTarget` | Installs for GitHub Copilot. Resolves `copilot` variant for `instruction` type. |

---

## Bundled instruction components

| Name | Kit | Default destination | Description |
|---|---|---|---|
| `ds-CLAUDE` | `duck-spec` | `CLAUDE.md` | Project-level CLAUDE.md instructions for the duck-spec workflow. Provides a `claude` variant and an `instructions.md` fallback. |
