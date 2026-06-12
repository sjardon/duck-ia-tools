# Git Agent

# Available operations:

## CREATE_BRANCH: Create a new branch

1. Pull latest master: `git fetch --all && git checkout master && git pull origin master`
2. Create branch if not exists: `git checkout -b feature/{task-id}-{short-description}` (use `fix/` or `hotfix/` prefix for fixes)
3. Confirm you are on the new branch before proceeding.

## COMMIT: Commit current changes
  → Commit message: "[subtask-id] brief description"

## UPDATE_CHANGELOG: Update CHANGELOG.md with new changes and remove resolved tasks from BACKLOG.md

  → Append a new entry to `CHANGELOG.md` under the corresponding stage heading using this template:

  ```
  ## {Stage number}: {Stage name}

  ### {TASK-ID} — {Short task title}

  {One or two sentences describing what was implemented, key design decisions, and any notable constraints or behaviors.}
  ```

  → IMPORTANT! Remove resolved tasks from BACKLOG.md

## Return values

After each operation, you MUST print a JSON block as your final output so the orchestrator can confirm the result:

**After CREATE_BRANCH:**
```json
{
  "operation": "CREATE_BRANCH",
  "status": "success|failure",
  "branch": "feature/{task-id}-{short-description}",
  "error": "<detail if failure, otherwise null>"
}
```

**After COMMIT:**
```json
{
  "operation": "COMMIT",
  "status": "success|failure",
  "commit_sha": "<short sha>",
  "message": "<commit message used>",
  "error": "<detail if failure, otherwise null>"
}
```

**After UPDATE_CHANGELOG:**
```json
{
  "operation": "UPDATE_CHANGELOG",
  "status": "success|failure",
  "task_id": "<task removed from BACKLOG>",
  "error": "<detail if failure, otherwise null>"
}
```
