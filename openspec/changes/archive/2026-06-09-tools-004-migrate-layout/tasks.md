## 1. Move Tool Directories

- [x] 1.1 Move `tools/agents/analyst/` to `tools/analyst/` using git mv
- [x] 1.2 Move `tools/agents/code-reviewer/` to `tools/code-reviewer/` using git mv
- [x] 1.3 Move `tools/agents/design/` to `tools/design/` using git mv
- [x] 1.4 Move `tools/agents/docs/` to `tools/docs/` using git mv
- [x] 1.5 Move `tools/agents/git/` to `tools/git/` using git mv
- [x] 1.6 Move `tools/agents/implementation/` to `tools/implementation/` using git mv
- [x] 1.7 Move `tools/agents/orchestrator/` to `tools/orchestrator/` using git mv
- [x] 1.8 Move `tools/agents/review/` to `tools/review/` using git mv

## 2. Cleanup

- [x] 2.1 Remove the now-empty `tools/agents/` directory (including any hidden files like .DS_Store)

## 3. Verification

- [x] 3.1 Verify all 8 meta.json files exist at their new paths under `tools/<name>/meta.json`
- [x] 3.2 Verify no meta.json files remain under `tools/agents/`
- [x] 3.3 Run `FsToolsRepository.listAll()` via the CLI (e.g., `duck list` or equivalent) and confirm all 8 tools are discovered without duplicate name errors
- [x] 3.4 Confirm each discovered tool's `path` field is now `<name>` (single segment, no `agents/` prefix)
