# Nebula Chat — Decision Log

> Record every architectural and technical decision.
> What we chose, what we rejected, and why.

---

## Format

## Sprint X — [Module Name]

### Decision: [What was decided]

**Instead of:** [What CLAUDE.md suggested or alternative]

**Because:** [One sentence reason]

**Date:** Month Day, Year

---

## Sprint 0 — Project Initialization

### Decision: Pure React SPA (Vite) instead of Next.js

**Instead of:** Next.js with server components or "use client" islands

**Because:** Real-time chat apps are inherently client-side heavy (Socket.IO, live updates).
Next.js SSR adds complexity with no benefit for a chat app that doesn't need SEO.
Pure React with Vite is simpler, faster to develop, and a more natural fit for WebSocket-based applications.

**Date:** June 4, 2026

---

### Decision: Popup-based Google OAuth instead of full redirect flow

**Instead of:** Full page redirect to Google, then redirect back to app

**Because:** Popup-based flow keeps users on the same page, provides better UX, and avoids
full page reloads. The popup handles Google's consent screen, then sends the credential back
to the parent window. Both approaches are equally secure when the credential is verified server-side.

**Date:** June 4, 2026

---

### Decision: API versioning with `/api/v1/` prefix

**Instead of:** No versioning prefix (`/api/`)

**Because:** Costs nothing to add now, saves painful migration later if we need breaking changes.
We can create `/api/v2/` while keeping `/api/v1/` running for backwards compatibility.

**Date:** June 4, 2026

---

### Decision: Node16 module system in tsconfig.json

**Instead of:** CommonJS module with baseUrl and path aliases

**Because:** Node v24 and TypeScript 6.0.3 have deprecated `moduleResolution: "node"` with `baseUrl`.
Using `"module": "Node16"` and `"moduleResolution": "Node16"` is the modern standard.
Path aliases (`@config/*`, `@utils/*`) were removed — we'll use relative imports instead.

**Date:** June 4, 2026

---

### Decision: Separate Docker ports from FYP project

**Instead of:** Using same default ports (5432, 6379, 1025, 8025)

**Because:** Developer's FYP already uses those ports. To avoid conflicts:

- PostgreSQL: 5433 (FYP: 5432)
- Redis: 6380 (FYP: 6379)
- MailHog SMTP: 1026 (FYP: 1025)
- MailHog UI: 8026 (FYP: 8025)
- Server: 4000

**Date:** June 4, 2026

---

### Decision: Class-based OOP architecture throughout

**Instead of:** Functional programming style or NestJS decorators

**Because:** Supervisor requirement: "follow class based architecture (OOP)".
All layers (controllers, services, repositories) are implemented as classes with
dependency injection via constructor parameters. No NestJS — plain Express with
manual DI to keep full control and avoid framework lock-in.

**Date:** June 4, 2026

---

### Decision: Zod for validation instead of class-validator

**Instead of:** class-validator with decorators

**Because:** Zod works without decorators, integrates naturally with TypeScript type inference,
and is framework-agnostic. Since we're using plain Express (not NestJS), Zod is simpler
and doesn't require `experimentalDecorators` for validation logic.

**Date:** June 4, 2026

---

### Decision: Winston for logging

**Instead of:** Pino, Bunyan, or console.log

**Because:** Winston is mature, widely used, supports multiple transports (console + file),
log levels, and structured JSON logging. Good balance of features without complexity.

**Date:** June 4, 2026

---

### Decision: Refresh token in httpOnly cookie, access token in memory

**Instead of:** Both tokens in localStorage or both in cookies

**Because:** httpOnly cookies prevent XSS attacks from stealing refresh tokens.
Access token in memory (Zustand store) allows easy attachment to Authorization headers.
This split approach is the current security best practice for SPAs.

**Date:** June 4, 2026

---

## Pending Decisions

- Which email service for production? (Resend vs SendGrid)
- Client-side state management library? (Zustand confirmed, but React Query for server state still to decide)
- UI component library? (shadcn/ui proposed but not finalized)
- File upload strategy for chat attachments? (Cloudinary vs S3)
