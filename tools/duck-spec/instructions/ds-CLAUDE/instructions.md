# duck-spec workflow

This project uses the duck-spec workflow for structured feature development.

## Workflow overview

Features progress through the following stages:

1. **Plan** (`ds-plan`) — Elicit requirements and produce a FEATURES.md entry.
2. **Analysis** (`ds-analysis`) — Derive EARS requirements, edge cases, and effort estimate; write `analysis.md`.
3. **Design** (`ds-design`) — Produce `design.md` (chosen solution, technical design, files) and `tasks.md` (ordered task list).
4. **Implement** (`ds-implement`) — Implement all tasks from `tasks.md` in order.
5. **Review** (`ds-review`) — Run lint, build, tests, and functional verification against every R-ID.
6. **Docs** (`ds-docs`) — Update living documentation (FEATURES.md, SPEC.md, ARCHITECTURE.md, etc.).
7. **Integrate** (`ds-integrate`) — Create branch and open a GitHub pull request.

## Feature artifacts

Each feature lives under `modules/<module>/<feature-id>-<short-desc>/`:

- `analysis.md` — Requirements (R-IDs, NF-IDs, EC-IDs), out-of-scope, and edge cases.
- `design.md` — Chosen solution, technical design, and file list.
- `tasks.md` — Ordered function-level task list referencing R-IDs.

## Conventions

- Never modify `analysis.md`, `design.md`, or `tasks.md` during implementation.
- Never implement anything not described in `tasks.md`.
- Follow SOLID and Clean Code principles.
- Each component/module must have its scope well identified before adding new features.
