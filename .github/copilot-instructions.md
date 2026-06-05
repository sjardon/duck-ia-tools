# Duck Advisor - AI Agent Instructions

Duck Advisor is a serverless SaaS platform that displays social proof pop-ups for Tiendanube e-commerce stores in Argentina. It shows real-time notifications to store visitors (e.g. "42 people viewing this product", "Someone bought this 10 minutes ago") to increase conversion rates. The competitive advantage is native Tiendanube integration — a LATAM market not covered by global players (Fomo, ProveSource, TrustPulse).

**Target audience**: Tiendanube store owners in Argentina. Initial distribution channel: Facebook e-commerce groups and educational social media content.

**Business model**: Freemium — Free (1 store, 500 notifications/month, own branding), Pro ($8 USD/month, unlimited notifications, no branding, full customization), Agency ($25 USD/month, up to 10 stores, multi-account dashboard, priority support). Payments handled via an external system already developed.

## Architecture Overview

**Monorepo Structure**: Serverless Framework Compose orchestrates 3 backend services + 3 frontend apps (npm workspaces).

```
services/
  infrastructure/     # Cognito, DynamoDB tables, SSM params (deployed first)
  chatbots/          # AI agent + WebSocket chat (depends on infrastructure)
  integrations/      # OAuth + Google Analytics API (depends on infrastructure)
app/
  app/              # Main Next.js app (production)
  web/              # Marketing site (Next.js)
  webv01/           # Legacy Angular app
```

**Key Data Flow**: User sends message via WebSocket → `chatbots` processes with LangChain agent → Agent invokes tools → `GoogleAnalyticsTool` calls `integrations` service HTTP endpoints → Returns GA4 data → Agent synthesizes response → Streams back via WebSocket.

## Critical Patterns

### Backend: Clean Architecture (Use Cases Pattern)

All services follow strict layering:

```
functions/     # Lambda handlers (entry points)
  └─> useCases/      # Business logic (ProcessChatUseCase, GetIntegrationsUseCase)
       └─> repositories/ # Data access (DynamoDB, HTTP clients)
            └─> domain/      # Types, DTOs, events (pure TypeScript)
```

**Example**: [services/chatbots/src/useCases/processChat.ts](services/chatbots/src/useCases/processChat.ts) orchestrates agent → message persistence → WebSocket response.

**Rule**: Never bypass use cases. Lambda functions ONLY call use cases, never repositories directly.

### Shared Resources: Config & Logger

All services have a `shared/` directory with centralized resources that don't require dependency injection:

**Config Files** (`shared/config/`): Environment variables are wrapped in typed config objects. **Always import config objects instead of using `process.env` directly**:

```typescript
// ✅ CORRECT - Use config objects
import { appConfig } from '../shared/config/app';
import { googleApiConfig } from '../shared/config/googleapi';

const stage = appConfig.stage;
const clientId = googleApiConfig.clientId;

// ❌ WRONG - Never access process.env directly
const stage = process.env.STAGE;
const clientId = process.env.GOOGLE_CLIENT_ID;
```

**Logger** (`shared/utils/logger.ts`): Pre-configured Pino logger with structured logging. **Import directly - no injection needed**:

```typescript
// ✅ CORRECT - Import logger singleton
import { logger } from '../shared/utils/logger';

export class MyUseCase {
  async execute(dto: MyDto) {
    logger.info({ dto }, 'Starting use case execution');
    // ... business logic
    logger.error({ error }, 'Operation failed');
  }
}
```

**Available config modules** (per service):

- `app.ts` - Service name, stage, log level
- `documentDBTables.ts` - DynamoDB table names
- `auth.ts` - Cognito/JWT configuration (integrations service)
- `googleapi.ts` - Google OAuth credentials (integrations service)
- `agent.ts` - AI agent settings (chatbots service)
- `websocket.ts` - WebSocket API Gateway config (chatbots service)

**Rule**: Config and logger are stateless utilities - import them directly at the top of any file. Don't inject them into use cases or repositories.

### AI Agent: Tool Decorator Pattern

Tools use `@ToolConfig` decorator for automatic registration:

```typescript
export class GoogleAnalyticsTool extends Tool {
  @ToolConfig({
    name: 'GoogleAnalyticsRunReportsTool',
    description: 'Get GA reports with metrics and dimensions',
    schema: z.object({
      /* Zod schema */
    }),
  })
  async runReports(dto: GoogleAnalyticsRunReportsDto, config: Record<string, any>) {
    return this.integrationsRepository.googleAnalyticsRunReports({
      ...dto,
      userId: config.userId,
      integrationId: config.integrationId,
    });
  }
}
```

**Context Management**: Agent maintains conversation state via `MemorySaver` with thread ID = `{userId}:{integrationId}:{propertyId}`. Always pass full context config to tools.

**Location**: All tools live in [services/chatbots/src/services/agents/tools/](services/chatbots/src/services/agents/tools/).

### Frontend: Auth Context + API Client Pattern

**Next.js app** ([app/app/](app/app/)):

- Auth: AWS Amplify Cognito wrapper in [lib/auth-context.tsx](app/app/lib/auth-context.tsx)
- API calls: Centralized client in [lib/api-client.ts](app/app/lib/api-client.ts) with JWT auto-injection
- Design system: [components/ui/](app/app/components/ui/) (shadcn-style) + custom brand colors (Mallard Teal `#006B7D`)

**Rule**: Always use `useAuth()` hook for auth state. Never bypass `apiClient` for backend calls.

## Essential Commands

### Development

```bash
npm run dev                # Watch all services (sls-compose watch)
npm run start:app          # Run Next.js app (port 3000)
npm run start:webv01       # Run Angular app (port 4200)
```

### Deployment

```bash
npm run deploy:dev         # Deploy all to dev stage
npm run deploy:prod        # Deploy all to production (sls-compose)
```

**Order**: Infrastructure → Chatbots + Integrations (parallel). Managed by `serverless-compose.yml`.

### Testing

```bash
cd services/social-proof && npm test    # Run social-proof tests
cd services/chatbots && npm test        # Run chatbots tests (if configured)
```

## Style Guides

- **Backend**: [BACKEND_STYLE_GUIDE.md](BACKEND_STYLE_GUIDE.md) - Clean architecture, TypeScript strict mode, Middy middleware, Pino logging
- **Frontend (Next.js)**: [app/app/FRONTEND_STYLE_GUIDE.md](app/app/FRONTEND_STYLE_GUIDE.md) + [CODE_GUIDELINES.md](app/app/CODE_GUIDELINES.md) - Component structure, brand colors, Tailwind conventions
- **Project status**: [KANBAN.md](KANBAN.md) - Feature completion tracking

## Key Conventions

### DynamoDB Access Patterns

- **Chats**: Partition key = `userId`, sort key = `chatId`
- **Messages**: Partition key = `chatId`, sort key = `timestamp` (use query with `ScanIndexForward: false` for newest first)
- **Integrations**: Partition key = `userId`, sort key = `integrationId`

**Always use DynamoDB Document Client** (`@aws-sdk/lib-dynamodb`), never raw client.

### OAuth Token Management

Integration tokens stored in DynamoDB with TTL. [services/integrations/src/useCases/createIntegrationToken.ts](services/integrations/src/useCases/createIntegrationToken.ts) handles refresh logic automatically.

**Security**: Tokens encrypted at rest (DynamoDB default). Client-side: tokens never exposed, only `integrationId` passed.

### Error Handling

- **Lambda**: Use Middy `http-error-handler` middleware (already configured)
- **Use cases**: Throw custom errors extending base `Error` with `statusCode` property
- **Logging**: Pino logger injected, use structured logging: `logger.info({ context }, "MESSAGE")`

### Environment Variables

Managed via AWS SSM Parameter Store. Reference in `serverless.yml`:

```yaml
environment:
  GOOGLE_OAUTH_CLIENT_ID: ${ssm:/${sls:stage}/google-oauth-client-id}
```

**Never commit secrets**. All credentials in SSM.

## Integration Points

### Google Analytics API

- **Base**: [services/integrations/src/services/googleAnalyticsApiService.ts](services/integrations/src/services/googleAnalyticsApiService.ts)
- **OAuth callback**: `/integrations/google-analytics/callback` → exchanges code for tokens
- **Run reports**: POST `/integrations/{integrationId}/google-analytics/run-report` (see [QUICK_START.md](services/integrations/QUICK_START.md))

**Date format**: Use GA4 conventions: `today`, `yesterday`, `7daysAgo`, or `YYYY-MM-DD`.

### WebSocket Chat

- Connect: `wss://{api-gateway-id}.execute-api.{region}.amazonaws.com/{stage}`
- Send message: `{ action: 'chat', chatId: '...', message: '...', integrationId: '...', propertyId: '...' }`
- Receive: `{ type: 'user' | 'assistant', content: '...', timestamp: ... }`

**Connection management**: [services/chatbots/src/repositories/chatbotsConnectionsRepository.ts](services/chatbots/src/repositories/chatbotsConnectionsRepository.ts) tracks `connectionId` → `userId` mapping.

## Common Tasks

### Adding a new test

Canonical test structure. All services should follow this pattern.

**Folder layout** (mirrors `src/` inside `test/`):

```
services/<service>/
├── src/
│   ├── repositories/
│   ├── useCases/
│   └── ...
└── test/
    ├── setup.ts                  # jest.setTimeout and global setup
    ├── helpers/
    │   ├── index.ts              # barrel export
    │   ├── mocks.ts              # shared mock objects (loggerMock, dynamoSendMock)
    │   └── factories.ts          # factory functions for domain types
    ├── repositories/
    │   └── *.test.ts
    └── useCases/
        └── *.test.ts
```

**Path aliases** — test files use the same aliases as source files, plus `@test/*`:

| Alias | Resolves to |
|---|---|
| `@domain/*` | `src/domain/*` |
| `@repositories/*` | `src/repositories/*` |
| `@useCases/*` | `src/useCases/*` |
| `@shared/*` | `src/shared/*` |
| `@test/*` | `test/*` |

**Key conventions**:

- Import the class/function under test via its path alias, not a relative `./` path:
  ```typescript
  // ✅ CORRECT
  import { EventsRepository } from '@repositories/eventsRepository';
  // ❌ WRONG
  import { EventsRepository } from './eventsRepository';
  ```
- Always mock `@shared/utils/logger` and `@shared/config` at the top of each test file.
- Use factory functions with `overrides` parameter for test data — never hardcode literals inline.
- Shared factories and mock objects live in `test/helpers/`; import them via `@test/helpers`.

### Adding a new AI tool

1. Create class extending `Tool` in `services/chatbots/src/services/agents/tools/`
2. Add `@ToolConfig` decorator with name, description, Zod schema
3. Implement method accepting (dto, config) → returns data
4. Register in agent initialization (auto-discovered via decorator)

### Adding a backend endpoint

1. Define DTO in `domain/dtos/`
2. Create use case in `useCases/` (inject required repositories)
3. Add Lambda handler in `functions/` calling use case
4. Configure in `serverless.yml` with HTTP event + JWT authorizer

### Updating frontend component

- Use existing shadcn components from [app/app/components/ui/](app/app/components/ui/)
- Follow brand colors from style guide (Mallard Teal, Golden Yellow, Cream)
- Keep components under 200 lines; split if larger

## Anti-Patterns

### Backend

- **No `services/` layer**: The only valid layers are `useCases/` → `repositories/`. Never introduce an intermediate `services/` directory or service classes as coding components. Business logic belongs in use cases; data access belongs in repositories.
- **No complex logic**: Prefer the simplest implementation that satisfies the requirement. Avoid clever abstractions, deeply nested conditionals, or multi-step transformations when a straightforward approach works. If logic feels complex, break it into smaller use cases instead.

## Debugging

**Lambda logs**: CloudWatch Logs group = `/aws/lambda/{service-name}-{stage}-{function}`
**WebSocket issues**: Check `ChatbotConnectionsTable` for connectionId state
**Agent errors**: Review LangChain traces in logs (search for `AGENT_EXECUTOR` log entries)
**Auth failures**: Verify Cognito user pool client ID in Amplify config ([app/app/lib/amplify-config.tsx](app/app/lib/amplify-config.tsx))

## Learned Lessons

> **Agent protocol**: Read this section at the start of every session. After completing any task, append a new entry if you discovered something worth preserving — a gotcha, a correction to prior assumptions, or a pattern that proved useful. Keep entries concise and actionable. Never delete existing entries.

<!-- Format:
- **[YYYY-MM-DD] <short title>**: Description of what was learned, why it matters, and what to do differently.
-->

_No lessons recorded yet. Add the first one after completing a task._

---

**[DASH-02–05] `storeId === userId` (Cognito sub) is the MVP identity contract.**  
The social-proof service uses `STORE#{userId}` as the DynamoDB partition key. The frontend derives `storeId` directly from `useAuth().user.userId` — no separate store-lookup endpoint is needed for MVP. All new frontend pages and backend endpoints follow this pattern.

**[DASH-02–05] Parallel subagents on the same branch require explicit rebase before each commit.**  
When two agents implement tasks in parallel on the same branch, the second agent to commit must run `git pull --rebase` first. Always provide the exact branch name upfront in both agent prompts so neither agent guesses or creates a divergent branch.

**[DASH-04] PopupPreview inline styles must mirror the snippet renderer exactly.**  
The `PopupPreview` component (`app/app/components/popup-preview.tsx`) uses inline styles to replicate SNIP-04 values. If `packages/social-proof-js/src/renderer.ts` is ever updated, `popup-preview.tsx` must be updated in sync — they are not shared code.

**[DASH-05] `subscriptionAuthorizer` is the correct JWT authorizer name for the social-proof service.**  
New authenticated endpoints in `services/social-proof/serverless.yml` must reference `subscriptionAuthorizer` (not a Cognito authorizer resource defined inline). The authorizer ARN comes from SSM `/${stage}/subscriptionAuthorizerArn`.

- **[2025-07-14] SNIP-05: Core already implemented in SNIP-01**: The loader (`sp.js`), versioned bundle (`sp.v{VERSION}.js`), build pipeline, and deploy script were fully implemented as part of SNIP-01. SNIP-05 only required a jest config cleanup (`globals → transform`) and DEPLOYMENT.md update.

- **[2026-06-01] User plan contract must include usage fields and nullable limit guards**: `GET /user/plan` must always return numeric `currentImpressions` and `currentStores` fields. Frontend quota components must treat `impressionsLimit` as `number | null` and render an unlimited fallback (e.g. `Ilimitado`) instead of calling number formatters blindly.

## Documentation

 - After each completed task, update the ./DEPLOYMENT.md file with the deployment steps and configurations needed for each service-
