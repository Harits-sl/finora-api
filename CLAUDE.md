# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev                  # start with hot reload
pnpm build                # compile TypeScript → dist/
pnpm start                # run compiled dist/main.js
pnpm lint                 # ESLint with auto-fix
pnpm format               # Prettier

pnpm prisma:generate      # regenerate Prisma client after schema changes
pnpm prisma:migrate       # apply migrations (requires live DB)
pnpm prisma:studio        # open Prisma Studio GUI

pnpm test                 # run all unit tests
pnpm test:watch           # watch mode
pnpm test:cov             # with coverage
```

> When offline, generate Prisma client with `npx prisma generate --no-engine` (downloads only type definitions, not the query engine binary).

## Architecture

### Request lifecycle

```
Request
  → LoggerMiddleware (timing)
  → JwtAuthGuard (global APP_GUARD — validates Bearer token by default)
  → Route Handler
  → ResponseInterceptor (wraps plain returns in { success, message, data })
  → LoggingInterceptor (logs method/URL/status/ms)
  ↓ on error
  → AllExceptionsFilter (normalises to { success: false, message, errors? })
```

### Making a route public

All routes require a valid JWT by default. To opt out, apply `@Public()` to the controller class or individual handler:

```typescript
import { Public } from '../../common/decorators';

@Public()
@Controller('auth')
export class AuthController { ... }
```

### Standardised response helpers

All service methods should return via `src/common/utils/response.util.ts`:

```typescript
successResponse(data, message?)     // { success: true, message, data }
errorResponse(message, errors?)      // { success: false, message, errors }
paginatedResponse(data, total, page, limit, message?)  // + meta
```

`ResponseInterceptor` auto-wraps anything that doesn't already have `{ success, message }` shape.

### Adding a module

Each module lives in `src/modules/<name>/` and follows the pattern:
- `<name>.module.ts` — declares controller, service, repository; export service if other modules need it
- `<name>.controller.ts` — calls service, injects `@CurrentUser()` for auth context
- `<name>.service.ts` — business logic, calls repository, returns `successResponse()`/`paginatedResponse()`
- `<name>.repository.ts` — Prisma queries only, accepts `Prisma.*Input` / `Prisma.*WhereInput` types
- `dto/` — class-validator classes with `!` on required fields (`name!: string`)
- `entities/` — plain TypeScript class mirroring the Prisma model shape

Register the module in `src/app.module.ts` imports array.

### Configuration

Environment variables are validated by Joi at startup (`src/config/env.validation.ts`). Adding a new required variable means adding it to:
1. `.env` and `.env.example`
2. The Joi schema in `env.validation.ts`
3. A `registerAs` config factory in `src/config/` if namespacing is needed

### Prisma

Schema is at `prisma/schema.prisma`. After any model change:
1. `pnpm prisma:migrate` (creates a migration file + applies it)
2. `pnpm prisma:generate` (regenerates TypeScript types)

`PrismaService` is a global provider — inject it directly or via a repository without importing `PrismaModule` again.

## Key constraints

- **bcryptjs** is used instead of `bcrypt` — `bcrypt@5` fails to compile on Node 22.
- **`"module": "commonjs"`** in `tsconfig.json` — NestJS 11 ships with `nodenext` by default but this project uses CommonJS for broader tooling compatibility.
- **pnpm build approvals** — `pnpm-workspace.yaml` must list `@nestjs/core`, `@prisma/client`, `@prisma/engines`, `prisma`, `unrs-resolver` under `allowBuilds` or `pnpm install` will skip their post-install scripts.
- **Decimal amounts** — `Transaction.amount` is `Decimal @db.Decimal(10,2)` in Prisma. Cast with `Number(row.amount)` when doing arithmetic in services.
