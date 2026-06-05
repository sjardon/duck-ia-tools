---
description: Generate a detailed task description for a new issue based on a provided title and context.
argument-hint: "<issue title> — <optional context>"
---

# Task Description Generation

Generate a detailed task description for a new issue in the Duck Advisor project based on the input below:

**Input**: $ARGUMENTS

Follow these three steps:

## Step 1: Understand the User Request

Before extracting any requirements, build a clear understanding of the request in the context of the Duck Advisor project.

1. **Review project context**: Read the relevant source files, architecture docs, and style guides to identify which service, layer, or component the request belongs to (`chatbots`, `integrations`, `infrastructure`, a frontend app, or a shared package). Refer to `CLAUDE.md` for a high-level overview of the architecture, key patterns, and integration points.

2. **Locate the affected area**: Use search and file reading tools to find the specific modules, use cases, repositories, or UI components that will be touched. Understand how they fit into the existing data flow and clean architecture layers.

3. **Consult official documentation when needed**: If the request involves a third-party service, library, or API (e.g., Google Analytics 4, AWS Bedrock, LangChain, AWS Cognito, Serverless Framework), look up the relevant official docs using web search to ensure accuracy in the task description.

## Step 2: Extract Functional and Non-Functional Requirements

Analyze the request and separate its requirements into two categories:

**Functional requirements** — what the system must _do_:
- New behaviors, endpoints, UI features, or agent tools to be added.
- Changes to existing logic, data flows, or user interactions.
- Inputs, outputs, and data transformations involved.

**Non-functional requirements** — how the system must _behave_:
- Performance, scalability, or latency constraints.
- Security considerations (e.g., token handling, JWT authorization, encrypted storage).
- Compliance with existing architectural patterns (clean architecture, tool decorator pattern, config objects, Pino logger).
- Code style and conventions defined in `BACKEND_STYLE_GUIDE.md` or `app/app/FRONTEND_STYLE_GUIDE.md`.
- Testing expectations.

## Step 3: Generate the Task Description

Produce a concise, structured task description using this format:

```markdown
## Task Name

A short, action-oriented name for the task.

## Objectives

A 2–4 sentence summary of what this task aims to achieve and why it matters within the Duck Advisor platform.

## Context

Describe the relevant project area(s), existing components involved, and any background information needed to understand the scope. Reference specific files, services, or architectural patterns where applicable.

## Functional Requirements

- [ ] Requirement 1
- [ ] Requirement 2

## Non-Functional Requirements

- [ ] Requirement 1
- [ ] Requirement 2

## Resources

- [Link to architecture docs]
- [Link to official documentation for any third-party services or libraries involved]
```

## Rules

- The task description must be concise and less than 250 words.
- Must not contain any implementation details or code snippets.
- The requirement list must be less than 10 items total.
- Add links to relevant documentation or resources when applicable.
