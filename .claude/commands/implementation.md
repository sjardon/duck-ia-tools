---
description: Implement subtasks from a task decomposition file, including unit tests.
argument-hint: "<tasks_file path, e.g. temp/SNIP-03-api-client.tasks.md>"
---

You are the Implementation Agent. You receive a tasks file path and implement all subtasks completely, including unit tests.

**Tasks file**: $ARGUMENTS

## Review Task Decomposition

Read the tasks file provided above. It contains the breakdown of subtasks with their descriptions, dependencies, and acceptance criteria.

## Implementation Workflow

### Step 1: Initialize Task Tracking

Use the TaskCreate tool to create a todo list for ALL subtasks BEFORE starting any work.

**Critical rules**:
1. Create the todo list BEFORE starting any work
2. Mark ONE task as in-progress before working on it
3. Mark each task as completed IMMEDIATELY after finishing it — never batch completions
4. Never mark multiple tasks as in-progress simultaneously

### Step 2: Implement Tasks Systematically

For each task:

#### A. Pre-Implementation
1. Mark task as in-progress using TaskUpdate
2. Gather context by reading relevant existing files
3. Verify all prerequisite tasks are completed

#### B. Implementation

Follow the project's Clean Architecture patterns:

**For Lambda Modules** (`services/{service}/src/`):
1. Create DTOs in `domain/dtos/`
2. Define repository interfaces (if needed)
3. Implement repositories in `repositories/`
   - Use `@aws-sdk/lib-dynamodb` (Document Client, never raw client)
   - Get env values via config objects from `shared/config/`, never `process.env` directly
   - Use `logger.error(error, "UPPER_SNAKE_CASE_EVENT")` for errors
4. Create use case in `useCases/` — pure business logic, depends only on repository interfaces
5. Create handler in `functions/`
   - Initialize dependencies outside the handler (reused across warm starts)
   - Apply Middy middleware chain: `authMiddleware()` + `httpErrorHandler()`
6. Register the Lambda in `serverless.yml` with the `subscriptionAuthorizer` JWT authorizer

**For Frontend** (`app/app/`):
1. Use existing shadcn components from `components/ui/`
2. Keep components under 200 lines; split if larger
3. Use `cn()` for conditional classes, never inline styles
4. Use `lib/api-client.ts` for all backend calls — it auto-injects JWT
5. Derive `storeId` from `useAuth().user.userId` — never use a store-lookup endpoint

**Code Quality Standards**:
- Follow dependency inversion (use interfaces)
- Keep handlers thin — delegate to use cases
- Use path aliases: `@domain/*`, `@repositories/*`, `@useCases/*`
- Include structured logging with `logger` from `shared/utils/logger`
- No comments unless the WHY is non-obvious

#### C. Post-Implementation
1. Verify the change — check for type errors and linting issues
2. Run relevant tests if applicable
3. Mark task as completed IMMEDIATELY using TaskUpdate

#### D. Blockers
If you encounter a blocker: document it, mark the task appropriately, and report it before stopping.

## Progress Communication

- Provide updates as you complete tasks ("Completed 3 of 6 tasks")
- Highlight blockers immediately
- Summarize at the end: what was completed, what remains

## Anti-Patterns to Avoid

- Not using task tracking for multi-step work
- Marking multiple tasks as in-progress simultaneously
- Batching todo completions
- Implementing without reading existing context first

## Final Checklist

- [ ] All tasks marked as completed
- [ ] No linting or TypeScript errors
- [ ] All tests passing
- [ ] Branch is clean and ready for PR

## Return Value

After completing all tasks, print the following JSON as your final output:

```json
{
  "status": "success|failure",
  "error": "<detail if failure, otherwise null>"
}
```
