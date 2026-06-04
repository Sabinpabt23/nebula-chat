# Nebula Chat — Development Status Log

> Track what was done, what works, what's broken, and what's next.
> Update at the end of every session.

---

## Sprint 0 — Project Setup & Planning (June 4, 2026)

### Status: IN PROGRESS

### What We Did Today:

- Defined complete project architecture and tech stack
- Made key decisions: Pure React SPA (Vite), Popup-based Google OAuth, API versioning with `/api/v1`
- Created project root at `E:\nebula-chat`
- Initialized server package with all dependencies (`npm install`)
- Created `server/package.json` with scripts and dependencies
- Created `server/tsconfig.json` (Node16 module system for Node v24 + TypeScript 6.0.3)
- Created `server/.env.example` and `server/.env` for development
- Fixed TypeScript deprecation warnings (moduleResolution changed to Node16, baseUrl and paths removed)
- Created core utility files:
  - `server/src/config/env.config.ts` — Environment variable validation
  - `server/src/utils/logger.util.ts` — Winston logger setup
  - `server/src/utils/constants.util.ts` — All enums and constants
  - `server/src/utils/response.util.ts` — Standard API response helpers
- Created exception classes:
  - `server/src/exceptions/HttpException.ts` — Base abstract class
  - `server/src/exceptions/BadRequestException.ts`
  - `server/src/exceptions/UnauthorizedException.ts`
  - `server/src/exceptions/ForbiddenException.ts`
  - `server/src/exceptions/NotFoundException.ts`
  - `server/src/exceptions/ConflictException.ts`
  - `server/src/exceptions/TooManyRequestsException.ts`
  - `server/src/exceptions/index.ts` — Barrel export
- Created middleware:
  - `server/src/middleware/error.middleware.ts` — Global error handler (fixed ZodError.issues → used `error.issues`)
- Created documentation files:
  - `CLAUDE.md` — Complete system blueprint
  - `STATUS.md` — This file

### Files Created:

server/
├── package.json
├── tsconfig.json
├── .env
├── .env.example
└── src/
├── config/
│ └── env.config.ts
├── exceptions/
│ ├── HttpException.ts
│ ├── BadRequestException.ts
│ ├── UnauthorizedException.ts
│ ├── ForbiddenException.ts
│ ├── NotFoundException.ts
│ ├── ConflictException.ts
│ ├── TooManyRequestsException.ts
│ └── index.ts
├── middleware/
│ └── error.middleware.ts
└── utils/
├── logger.util.ts
├── constants.util.ts
└── response.util.ts

E:\nebula-chat
├── CLAUDE.md
├── STATUS.md

### What Works:

- [x] Project structure created with config/, exceptions/, middleware/, utils/ directories
- [x] All npm dependencies installed
- [x] TypeScript config working (no deprecation warnings)
- [x] All exception classes defined with proper inheritance
- [x] Global error handler with ZodError support
- [x] Environment variable validation
- [x] Winston logger configured
- [x] Standard response format utility

### What Does NOT Work Yet:

- [ ] Server won't start — missing files (entities, database config, app.ts not yet created)
- [ ] No database connection setup
- [ ] No TypeORM entities created
- [ ] No routes or controllers
- [ ] No Socket.IO setup
- [ ] Docker containers not configured for this project

### Bugs:

- None currently

### Next Task:

- Create `server/src/entities/BaseEntity.ts` — Abstract base entity class
- Create `server/src/repositories/BaseRepository.ts` — Generic CRUD repository
- Create `server/src/config/database.config.ts` — TypeORM DataSource config
- Create `server/src/app.ts` — Express application entry point
- Create `DECISION.md` — Key decisions log
- Create `docker-compose.yml` for development (PostgreSQL, Redis, MailHog)
- Create entity files for all 8 tables

### Notes:

- Node version: v24.13.0
- npm version: 11.6.2
- TypeScript version: 6.0.3
- Developer's FYP runs on different ports. Nebula Chat uses:
  - PostgreSQL: 5433 (FYP on 5432)
  - Redis: 6380 (FYP on 6379)
  - MailHog SMTP: 1026 (FYP on 1025)
  - MailHog UI: 8026 (FYP on 8025)
  - Server: 4000
- DECISION.md not yet created — will record all architecture decisions there

---

## Session Log

| Date       | Sprint | Tasks Completed                                                                 | Status      |
| ---------- | ------ | ------------------------------------------------------------------------------- | ----------- |
| 2026-06-04 | 0      | Project init, config, exceptions, error middleware, utils, CLAUDE.md, STATUS.md | IN PROGRESS |
