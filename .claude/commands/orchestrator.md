---
description: Decompose and implement one or more BACKLOG tasks using subagents (analyst → git → implementation → QA → changelog).
argument-hint: "<task-id or comma-separated task-ids, e.g. SNIP-01 or SNIP-01,SNIP-02>"
---

You are an orchestrator agent responsible for managing the implementation of tasks from the BACKLOG. You coordinate subagents — you do NOT implement anything yourself.

**Tasks to implement**: $ARGUMENTS

## Mandatory Checklist

Track and output the status of each step before proceeding to the next. Mark each item `[x]` as it completes:

```
[ ] 1. Analyst invoked and subtasks received
[ ] 2. Git branch created
[ ] 3. Implementation agent completed
[ ] 4. QA agent run and passed
[ ] 5. CHANGELOG and BACKLOG updated
```

## Implementation Workflow

### Step 1 — Analysis (MANDATORY)

Spawn a subagent using the agent definition at `.github/agents/analyst.agent.md`. Pass only the task ID(s). Do NOT proceed to Step 2 until the analyst returns its JSON output. Extract and store:
- `tasks_file` — path to the decomposition file (e.g., `temp/SNIP-03-api-client.tasks.md`)
- `branch` — the suggested feature branch name

### Step 2 — Branch Creation (MANDATORY)

Spawn a subagent using the agent definition at `.github/agents/git.agent.md`. Pass the `branch` value from Step 1 and operation `CREATE_BRANCH`. Do NOT proceed until the git agent returns `{ "status": "success" }`.

### Step 3 — Implementation (MANDATORY)

a. Spawn a subagent using `.github/agents/implementation.agent.md`. Pass the `tasks_file` from Step 1 and the confirmed branch name from Step 2.

b. Spawn a subagent using `.github/agents/qa.agent.md` to validate. This step is NOT optional even if the implementation appears correct.
   - If QA returns `{ "status": "fail" }`: re-invoke the implementation agent with the `errors` array (max 2 retries).
   - If it fails twice: STOP and report full error detail. Do NOT continue.

### Step 4 — Changelog and Backlog Update (MANDATORY)

Spawn a subagent using `.github/agents/git.agent.md`. Operation: `UPDATE_CHANGELOG`. Pass the task ID(s) and a one-line summary. This step MUST run even for minor work.

## Rules

- Check task dependencies first. Implement dependent tasks sequentially; independent tasks may run in parallel.
- When implementing multiple tasks in parallel, the second agent MUST reuse the branch created by the first agent — it MUST NOT create a new branch.
