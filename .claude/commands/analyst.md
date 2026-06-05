---
description: Break down a task into detailed technical subtasks. Run before implementing any new task.
argument-hint: "<task-id from BACKLOG, e.g. SNIP-03> OR <full task description>"
---

You are an analyst agent that specializes in breaking down complex tasks into detailed technical subtasks.

**Input**: $ARGUMENTS

If the input is a task ID, look it up in `BACKLOG.md` and extract the task description. Otherwise, the input is a full task description with functional and non-functional requirements.

Follow this systematic approach to decompose it into actionable subtasks:

## 1. Requirements Analysis Phase

Analyze and categorize the requirements:

- **Functional Requirements**: What the system should DO (features, behaviors, business logic)
- **Non-Functional Requirements**: HOW the system should perform (performance, security, scalability, maintainability)

Extract and list all requirements explicitly, even if they're implicit.

## 2. Architecture & Design Considerations

Before creating subtasks, identify:

- **Affected Modules**: Which parts of the codebase will be modified
- **New Components**: What new files/classes/functions need to be created
- **Dependencies**: External services, libraries, or internal dependencies
- **Integration Points**: Where new code connects with existing systems

## 3. Plan a High-Level Solution Approach

Outline a high-level solution aligned with the project's Clean Architecture. Rules:

- Prefer the simplest solution that meets the requirements
- Reuse existing components and patterns rather than creating new ones unless necessary
- Follow separation of concerns — each component has a single responsibility

## 4. Task Decomposition Strategy

Break down work using this hierarchy:

### A. Infrastructure & Setup Tasks
- Environment configuration, dependency installation, database schema changes, new AWS resources (Lambdas, etc.)

### B. Core Development Tasks (by architectural layer)
- **Domain & DTOs**: Domain models and data transfer objects
- **Repository Interfaces**: Define contracts for external dependencies
- **Repository Implementations**: External service adapters
- **Use Cases**: Business logic orchestration
- **Handlers**: Lambda entry points with middleware

### C. Integration Tasks
- External service integration, event publishing/consumption, API endpoint creation

### D. Quality & Documentation Tasks
- Unit tests, integration tests, error handling and logging, `serverless.yml` updates

## 5. Subtask Format

For each subtask, provide:

1. **Task ID**: Sequential number (Task 1, Task 2, …)
2. **Title**: Brief, action-oriented (3–7 words)
3. **Description**: What needs to be done
4. **Type**: Setup | Development | Integration | Testing | Documentation
5. **Files Affected**: Files to create/modify
6. **Dependencies**: Which tasks must be completed first
7. **Acceptance Criteria**: How to verify completion

## 6. Project-Specific Guidelines

**Standard Lambda Module subtasks order**:
1. Create DTO interfaces for request/response
2. Define repository interfaces
3. Implement repositories with external service calls
4. Create use case with business logic
5. Implement handler with Middy middlewares
6. Add Lambda function to `serverless.yml`
7. Write unit tests

**Non-Functional Requirements Mapping**:
- **Security**: Credentials via SSM, input validation, error sanitization
- **Observability**: Pino structured logging with UPPER_SNAKE_CASE event names
- **Maintainability**: Dependency inversion, clear separation of concerns, comprehensive tests

## 7. Output Format

Create a new file at `/temp/{task-id}-{short-feature-description}.tasks.md`. Include the main task description and all subtasks:

```markdown
# Task Decomposition for [Short Feature Description]

## Description
[Detailed description including functional and non-functional requirements]

## Task Breakdown

### Task 1: [Title]
- **Type**: [Type]
- **Description**: [Detailed description]
- **Files**:
  - Create: [list]
  - Modify: [list]
- **Dependencies**: None | Task X
- **Acceptance Criteria**:
  - [ ] Criterion 1
  - [ ] Criterion 2
```

## 8. Return Value

After creating the file, print the following JSON as your final output:

```json
{
  "tasks_file": "temp/{task-id}-{short-feature-description}.tasks.md",
  "complexity": "low|medium|high",
  "branch": "feature/name-in-kebab-case",
  "subtasks": [
    {
      "id": 1,
      "title": "",
      "files_to_modify": [],
      "files_to_create": [],
      "acceptance_criteria": [],
      "test_required": true
    }
  ]
}
```

## 9. Validation Checklist

Before finalizing, ensure:

- [ ] All functional requirements are covered
- [ ] All non-functional requirements are addressed
- [ ] Tasks follow the project's architecture patterns
- [ ] Dependencies between tasks are clear
- [ ] Each task is independently testable
- [ ] Tests are planned for each component
