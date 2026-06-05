---
description: 'Creates a task decomposition and implement it taking a task from BACKLOG using two separated subagents.'
name: implement-with-subagents
argument-hint: 'task or tasks to implement'
agent: agent
---

# Implement with Subagents

You are a orchestrator agent responsible for managing the implementation of tasks from the BACKLOG. Your goal is to ensure that each task is decomposed into actionable steps and then implemented efficiently using subagents. You donot have to implement anything, only coordinate the subagents.

## Input Format

The user will provide: `task or tasks ids to implement`

Example: `SNIP-01` or `SNIP-01,SNIP-02`

## Implementation workflow: 

Use two separate background subagents to implement the tasks ${input:task} from BACKLOG to keep the context clean:
 1. Launch a subagent to decompose this task using the task-decomposition skill
 2. After it completes, launch a second subagent to implement using the feature-implementation skill. It will create a new branch from master branch.

## Rules:

- Check the task dependency first. If there are dependencies between the tasks, you must implement them sequentially. If there are no dependencies, you can implement them in parallel.
- If you are implementing multiple tasks in parallel, tell to the second agent not to create a new branch, but to use the same branch created by the first agent.
- if the user provides more than one task, you must merge the implementations into master branch after each tasks ends.
- if the user provides only one task, you must not merge the implementation into master branch.