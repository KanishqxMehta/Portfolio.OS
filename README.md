# Portfolio.OS

Free portfolio builder for developers — block-based editor, theme system, instant publishing, and analytics.

## Prerequisites

- Node.js 20+
- Docker (for local PostgreSQL)

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env

# 3. Start PostgreSQL
npm run db:up

# 4. Run migrations (also runs on production build)
npx prisma migrate deploy

# 5. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Generate Prisma client, run migrations, production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript check without emit |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run db:up` | Start PostgreSQL via Docker Compose |
| `npm run db:down` | Stop PostgreSQL |
| `npm run db:studio` | Open Prisma Studio |

## Testing

Unit tests live next to source files as `*.test.ts` under `src/`. They cover:

- Portfolio Zod validation schemas
- User/email/password/username validation
- Rate limiting utility
- HTML sanitization for contact emails
- Theme configuration integrity

```bash
npm run test
npm run test:coverage
```

## CI

GitHub Actions runs on every push and pull request to `main` / `master`:

1. ESLint
2. TypeScript typecheck
3. Vitest unit tests + coverage

See [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

## Project structure

```
src/
  app/           # Next.js App Router pages & API routes
  components/    # UI and portfolio renderer
  lib/           # Shared utilities, validation, themes
  store/         # Zustand client state
  actions/       # Server actions (password reset)
prisma/          # Schema and migrations
```

## Environment variables

See [`.env.example`](.env.example) for all supported variables.

## License

Private — all rights reserved.
