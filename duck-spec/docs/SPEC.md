# Global Module Spec Index

This file tracks the current functional state of each module in the monorepo. One paragraph per module, present tense.

---

## cli

The `duck` CLI installs reusable AI coding components (agents, hooks, skills, MCP servers, kits, instructions) from the `tools/` library into user projects via `duck add <tool> --target <target>`. Component content is resolved using per-target variant files with a fallback to `instructions.md`. The `instruction` component type installs project-level configuration files (e.g., `CLAUDE.md`) at a path declared in `meta.json`, with an interactive overwrite confirmation when the destination already exists and a `--dest` flag for path override. Any component type may declare additional files in `meta.json` via a `"files"` field; these are installed into the same destination directory as the main content. Missing declared files abort the installation with a descriptive error. The `ds-analysis` and `ds-design` skills ship template files installed via this mechanism.
