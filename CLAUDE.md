# duck-ia-tools

Monorepo that stores reusable AI coding components (agents, tools, hooks, skills) and exposes them via a CLI (`duck`) that installs them into AI coding tools (Claude Code, GitHub Copilot, etc.).

## Docs of interest

- **Architecture**: Read [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) before adding commands, repositories, targets, or tool components.

## Musts:

- Follow the SOLID principles.
- Each component / module must have its scope well identified.
- Before analyze or implements a new feature, identify the scope of the module that afects. 
- Do no create new features in modules with scopes that doesnot belongs to it.
- Follow the Clean Code principles.