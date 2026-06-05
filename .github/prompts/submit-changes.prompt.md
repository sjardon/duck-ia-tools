---
description: 'Push changes to GitHub and create a pull request linked to the issue'
name: submit-changes
argument-hint: 'owner/repo issue-number'
agent: agent
tools: ['vscode', 'execute', 'read', 'edit', 'search', 'web', 'github/*', 'agent', 'todo']
---

# Submit Changes to GitHub

You are finalizing the implementation by pushing changes and creating a pull request linked to the original GitHub issue.

## Prerequisites

The user should have:

1. Completed implementation on a feature branch
2. Verified all changes work as expected
3. Original issue number to link the PR

## Input Format

The user will provide: `owner/repo issue-number`

Example: `sjardon/feedback 42`

## Workflow

### 1. Verify Current State

Check the current branch and changes:

```bash
git branch --show-current
git status
```

Confirm:

- You're on the correct feature branch (not main/develop)
- All changes are committed locally
- Working directory is clean

If there are uncommitted changes, stage and commit them:

```bash
git add .
git commit -m "feat: [brief description]"
```

### 2. Fetch Original Issue

Use #tool:github/issue_read to retrieve:

- Issue title and description
- Issue labels
- Acceptance criteria

This information will be used to:

- Generate PR description
- Link the PR to the issue
- Apply appropriate labels

### 3. Review Changed Files

Use #tool:search/changes to see what was modified:

- Review the diff of each changed file
- Ensure no unintended changes
- Verify no secrets or credentials are included
- Check for debug code or console.logs that should be removed

### 4. Generate PR Title and Description

Create a comprehensive PR description using this template:

```markdown
## Description

[Brief summary of changes - 2-3 sentences]

Fixes #[issue-number]

## Changes Made

### Backend Changes

- [List backend changes]

### Frontend Changes

- [List frontend changes]

### Infrastructure Changes

- [List infrastructure changes if any]

## Implementation Details

[Explain key technical decisions]

### Files Modified/Created

- `path/to/file.ts` - [what changed]

## Testing

- [ ] Unit tests passing
- [ ] Manual testing completed
- [ ] Verified on local environment

## Deployment

**Order**: Infrastructure → Services (see `copilot-instructions.md` for commands)

**Breaking Changes**: ❌ None / ⚠️ [Describe if any]

## Checklist

- [ ] Follows style guides
- [ ] TypeScript strict mode passes
- [ ] All acceptance criteria met
- [ ] No secrets committed

## Related Issues

Closes #[issue-number]

## Screenshots

[Add for UI changes]

---

**Reviewer Notes**: [Specific areas needing attention]
```

### 5. Push Changes

Push the branch to GitHub:

```bash
git push -u origin [branch-name]
```

If the remote branch doesn't exist, this will create it.

### 6. Create Pull Request

Use #tool:github/create_pull_request with:

- **owner**: Repository owner
- **repo**: Repository name
- **title**: Clear, descriptive title (format: `feat: Add GA4 metrics tool` or `fix: Resolve WebSocket timeout`)
- **head**: Your feature branch name
- **base**: Target branch (usually `main`, `develop`, or `production`)
- **body**: The comprehensive description generated in step 4
- **draft**: Set to `false` unless specifically requested

**PR Title Conventions**:

- `feat:` - New features
- `fix:` - Bug fixes
- `refactor:` - Code improvements without behavior change
- `docs:` - Documentation updates
- `chore:` - Maintenance tasks
- `test:` - Test additions or fixes

### 7. Link to Issue

Ensure the PR description includes:

- `Fixes #[issue-number]` or `Closes #[issue-number]`

This automatically links and closes the issue when the PR is merged.

### 8. Apply Labels

If the original issue had labels, mention which labels should be applied to the PR:

- `bug` - Bug fixes
- `enhancement` - New features
- `documentation` - Docs changes
- `backend` - Backend changes
- `frontend` - Frontend changes
- `AI` - AI/LangChain changes

### 9. Request Review (Optional)

Suggest reviewers based on the changes:

- Backend changes: Team members familiar with the service
- Frontend changes: UI/UX reviewers
- AI tools: Team members working on chatbots

You can specify reviewers when creating the PR if needed.

### 10. Post-Submission Summary

After successful PR creation, provide:

```
✅ Pull Request Created Successfully

**PR Details**:
- PR #[number]: [title]
- URL: [pr-url]
- Branch: [feature-branch] → [base-branch]
- Linked to Issue: #[issue-number]

**Next Steps**:
1. Wait for CI/CD checks
2. Address review comments
3. Merge PR when approved
4. Deploy (see `copilot-instructions.md` for commands)

**Post-Deployment**:
- [ ] Check CloudWatch logs
- [ ] Verify endpoints
- [ ] Test functionality
```

## Important Considerations

### Security Checks

Before pushing, verify:

- ❌ No AWS credentials or API keys
- ❌ No database connection strings
- ❌ No OAuth client secrets
- ❌ No personal information
- ✅ All secrets use SSM Parameter Store

### Environment Variables

If new SSM parameters needed, note format: `/${stage}/[parameter-name]`

### Breaking Changes

If breaking changes:

- ⚠️ Document in PR description
- Explain migration path
- Consider backward compatibility

## Troubleshooting

### Push Fails

If `git push` fails:

1. **Check remote exists**:

   ```bash
   git remote -v
   ```

2. **Pull latest changes**:

   ```bash
   git pull --rebase origin [base-branch]
   ```

3. **Resolve conflicts** if any, then push again

### PR Creation Fails

If GitHub API call fails:

- Verify repository permissions
- Check branch names are correct
- Ensure base branch exists
- Try creating PR manually via GitHub UI and share the link

### Files Not Pushed

If you forgot to commit files:

```bash
git add [file-path]
git commit --amend --no-edit
git push --force-with-lease
```

## Alternative: Manual Process

If GitHub API tools are unavailable, guide the user:

1. Push branch: `git push -u origin [branch-name]`
2. Visit: `https://github.com/[owner]/[repo]/compare/[base]...[head]`
3. Click "Create pull request"
4. Fill in title and description (provide template)
5. Submit PR

## Output Format

Provide clear confirmation with:

- ✅ PR number and URL
- 📋 Next steps for deployment
- 🔍 How to verify the changes
- ⚠️ Any special considerations

Parse the input arguments:
${input:args:owner/repo issue-number}
