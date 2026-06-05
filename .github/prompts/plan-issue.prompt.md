---
description: 'Plan implementation for a GitHub issue by analyzing project architecture and creating subtasks'
name: plan-issue
argument-hint: 'owner/repo issue-number'
agent: agent
tools: ['vscode', 'execute', 'read', 'edit', 'search', 'web', 'github/*', 'agent', 'todo']
---

# Plan GitHub Issue Implementation

You are tasked with analyzing a GitHub issue and creating a detailed implementation plan for the Duck Advisor project.

## Input Format

The user will provide: `owner/repo issue-number`

Example: `sjardon/feedback 42`

## Workflow

### 1. Fetch Issue Details

Use #tool:github/issue_read to retrieve the issue:

- Method: `get`
- Parse the issue title, description, labels, and any acceptance criteria

### 2. Analyze Project Architecture

**Refer to `copilot-instructions.md` for all architectural patterns and coding standards.**

Identify which components are affected based on issue requirements.

### 3. Identify Affected Areas

Based on the issue requirements, determine:

- Which services need changes (chatbots, integrations, infrastructure)
- Which frontend apps are affected (app, web, webv01)
- Required new tools, endpoints, or components
- Database schema changes needed

### 4. Create Implementation Plan

Break down the issue into **concrete, actionable and testeable subtasks** following this structure:

#### Subtask Template:

```
## Subtask [N]: [Clear Action Title]

**Scope**: [Backend/Frontend/Infrastructure/Documentation]
**Estimated Complexity**: [Low/Medium/High]

**Files to Create/Modify**:
- `path/to/file.ts` - [what changes]

**Implementation Steps**:
1. [Specific step with technical details]
2. [Include patterns to follow from style guides]
3. [Testing requirements]

**Dependencies**:
- Requires Subtask [X] to be completed first
- Uses [specific API/tool/service]

**Acceptance Criteria**:
- [ ] [Specific, testable criterion]
```

It is not necessary to show code snippets.

### 5. Consider Integration Points

Ensure the plan accounts for:

- Lambda configuration in `serverless.yml`
- API security (JWT authorizers)
- WebSocket connections (if chat-related)
- Frontend API client integration

### 6. Deployment Strategy

Note:

- Which services need deployment
- Deploy order: infrastructure first, then services
- Testing steps post-deployment

## Output Format

Provide a clear, numbered list of subtasks with:

1. **Issue Summary** (brief restatement)
2. **Architectural Analysis** (affected components)
3. **Subtasks** (detailed breakdown as per template)
4. **Testing Strategy** (how to verify each subtask)
5. **Deployment Plan** (order and commands)

## Important Notes

- All patterns documented in `copilot-instructions.md`
- Each subtask should be independently testable
- Include rollback considerations for risky changes

Request clarification if the issue is ambiguous.

Parse the input arguments:
${input:args:owner/repo issue-number}
