## 1. Extend ToolMeta Interface

- [x] 1.1 Add `path: string` field to the `ToolMeta` interface in `packages/cli/src/shared/interfaces/IToolsRepository.ts`
- [x] 1.2 Extend the `type` union in `ToolMeta` to include `"kit"` (result: `"agent" | "hook" | "skill" | "mcp-server" | "kit"`)
- [x] 1.3 Add optional `components?: string[]` field to `ToolMeta`

## 2. Verify No Compile Errors

- [x] 2.1 Run TypeScript compilation (`tsc --noEmit`) in `packages/cli` and confirm zero errors after the interface change
