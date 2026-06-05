# Architecture

## Purpose

A monorepo that stores reusable AI coding components (agents, tools, hooks, skills) and exposes them via a CLI (`duck`) that installs them into target AI tools (Claude Code, GitHub Copilot, etc.).

---

## Repository layout

```
duck-ia-tools/
├── packages/
│   └── cli/                        # npm package: the `duck` CLI
└── tools/                          # library of components
    ├── agents/
    ├── hooks/
    ├── skills/
    └── mcp-servers/
```

### Tool component structure

Each component in `tools/` follows:

```
tools/<type>/<name>/
├── meta.json          # name, description, tags, target compatibility
├── instructions.md    # canonical content
└── variants/          # optional platform-specific overrides
    ├── claude.md
    └── copilot.md
```

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
