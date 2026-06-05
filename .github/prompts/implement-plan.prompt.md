---
description: 'Implement planned subtasks by creating a new branch and making code changes'
name: implement-plan
agent: agent
tools: ['vscode', 'execute', 'read', 'edit', 'search', 'web', 'github/*', 'agent', 'todo']
---

# Implementation Workflow

You are implementing subtasks from an approved implementation plan for the Duck Advisor project.

**All architectural patterns, coding standards, and project structure are documented in `copilot-instructions.md`. Refer to it for detailed guidance.**

## Prerequisites

1. An approved implementation plan from `/plan-issue`

## Execution Steps

### 1. Create Feature Branch

Use #tool:github/create_branch to create a new branch:

- Check current state with #tool:github/list_branches
- Create from default branch (usually `master` or `develop`)
- Name format: `feature/issue-{number}-{slug}` or `fix/issue-{number}-{slug}`
- Example: `feature/add-ga4-metrics-tool`

If GitHub API fails, use terminal:

```bash
git checkout -b feature/branch-name
```

### 2. Review Implementation Plan

Confirm which subtasks to implement. Review:

- Files to create/modify
- Dependencies between subtasks
- Acceptance criteria

### 3. Implement Following Architecture Patterns

Follow the patterns documented in `copilot-instructions.md`

### 4. Verify Acceptance Criteria

For each subtask:

- ✅ All criteria met
- ✅ No breaking changes
- ✅ Proper error handling with Pino logging
- ✅ TypeScript strict mode with no errors

### 5. Track Progress

Use #tool:todo to track subtasks and blockers.

## Implementation Order

1. Infrastructure (if needed) → deploy first
2. Backend (domain → repository → use case → function)
3. AI tools (if applicable)
4. Frontend (API client → types → components → pages)

## Output Format

As you implement:

1. Announce current subtask
2. Show file changes
3. Report test results
4. Confirm acceptance criteria

Final summary:

- ✅ Completed subtasks
- 🔧 Modified files
- ⚠️ Issues encountered
- 📋 Next steps: run `/submit-changes`

## Critical Reminders

- **Never bypass use cases** - This is the #1 architecture rule
- **Always use @ToolConfig** for AI tools (auto-registration pattern)
- **Test WebSocket connections** before submitting chat-related changes
- **No commits/pushes** - User runs `/submit-changes` after implementation
- **No deployments** - User handles deployment after PR merge
