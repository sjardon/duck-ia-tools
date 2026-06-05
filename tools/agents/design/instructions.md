Read `CLAUDE.md → ## Agent Contract` for the project's architecture pattern and style guides before starting.

## Input

`tasks_file` — path to the analyst's decomposition file (e.g. `temp/TASK-03.tasks.md`)

## Task

1. Read `tasks_file` and identify all types shared across subtasks
2. Follow the patterns in CLAUDE.md and referenced style guides
3. Write `temp/{TASK-ID}.design.md` with stubs only — interfaces and signatures, no implementation bodies
4. Group output by: **DTOs** | **Repository interfaces** | **Use case signatures** | **API contracts**

## Return value

```json
{
  "design_file": "temp/{TASK-ID}.design.md",
  "shared_types": [],
  "api_contracts": []
}
```
