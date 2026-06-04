# NEBULA CHAT — Real-Time Chat Application

> **Real Product · Portfolio Project · Clean Architecture · Class-Based OOP**
> Goal: Build production-quality real-time chat — secure, scalable, maintainable.

---

> ⚠️ **IMPORTANT NOTE FOR CLAUDE CODE**
>
> Everything in this file is a **reference and starting point** — not a locked-in final spec.
> Folder structure, schema fields, env variable names, module names, API endpoints, and Redis keys
> **may evolve during development**. Use this as a guide, not a contract.
> When something needs to change to make better technical sense, change it and note why.
>
> **Quality over quantity. One clean, tested, secure feature beats ten broken ones.**

---

## 📋 Session Behaviour for Claude Code

At the start of every session, the developer will tell you what the current task is.
**Focus only on that task. Do not implement future modules speculatively.**

When generating multiple files for a task, create related files together as a logical unit
(e.g. controller + service + repository + entity for one module = one unit). After each unit,
state clearly:

- What was created
- Where each file lives
- What to run next

Wait for confirmation before moving to the next unit.

When something goes wrong, **explain what the error means and how to fix it** — do not just
output a silent code change. The developer needs to understand what happened.

Keep responses focused. One file at a time when possible. Wait for confirmation.

---

## What This Project Is

Nebula Chat is a real-time chat application with Google OAuth and OTP-based passwordless login.
Users can chat one-to-one or in groups, with real-time message delivery via Socket.IO.

**Features:** Authentication (Google OAuth + OTP), User Profiles, Online/Offline Status,
One-to-One Messaging, Group Chat, Real-Time Notifications, Unread Message Indicators.

---

## Repository Structure

```
nebula-chat/
├── client/               # React (Vite + TypeScript) — UI/UX only, services layer for API calls
├── server/               # Express + TypeScript + TypeORM + PostgreSQL + Redis — ALL logic lives here
└── docker-compose.yml
```

---

## Tech Stack

| Layer          | Technology                                                              |
| -------------- | ----------------------------------------------------------------------- |
| Backend        | Node.js v24+, Express.js 4.18, TypeScript 6.0                           |
| Database       | PostgreSQL 15 via TypeORM 0.3                                           |
| Cache / PubSub | Redis 7, Socket.IO                                                      |
| WebSocket      | Socket.IO 4.7                                                           |
| Frontend       | React 18 + Vite + TypeScript                                            |
| Styling        | Tailwind CSS + shadcn/ui                                                |
| State          | Zustand (UI state only)                                                 |
| Auth           | JWT (Access + Refresh) + Google OAuth 2.0 + OTP                         |
| Validation     | Zod (server + client form validation)                                   |
| Email          | SMTP via Nodemailer — MailHog in development, Resend in production      |
| Logging        | Winston — debug level in dev, info level in prod                        |
| Deployment     | Vercel (client) + Render (server) + Neon (PostgreSQL) + Upstash (Redis) |

---

## Code Quality Rules (Non-Negotiable)

1. **Controllers route only. Services decide. Repositories query.** Never cross these boundaries.
2. **No try/catch in services or controllers.** Throw typed `HttpException`s. Global filter catches everything.
3. **Validation via Zod schemas** in `validators/` directory.
4. **Shared logic goes in `utils/` only.** Never duplicated across modules.
5. **No hardcoded values.** Everything comes from environment variables.
6. **Frontend is UI only.** Show/hide modals, client-side form validation, DOM manipulation.
   API calls go through `services/` layer only. No `fetch()` scattered in components.
7. **Never expose secrets to the frontend.** API keys and secrets stay server-side.

### Layer Separation (CRITICAL — Never cross these boundaries)

| Layer           | Owns                                                             | Never Owns                                       |
| --------------- | ---------------------------------------------------------------- | ------------------------------------------------ |
| Controller      | Receives HTTP request, calls service, returns response           | Business logic, DB calls, data transformation    |
| Service         | ALL business logic — validation, orchestration, rule enforcement | Raw TypeORM queries, direct DB access            |
| Repository      | All TypeORM queries, returns plain entities                      | Business logic, rule checks, response formatting |
| Middleware      | Auth verification, request validation, rate limiting             | Business logic, DB queries                       |
| Validator (Zod) | Validates incoming data shape                                    | Domain logic, DB queries, formatting             |

### Error Handling

- Services throw typed `HttpException` subclasses — **no** `try/catch` in services or controllers
- One global error middleware catches ALL errors — logs via Winston, formats response
- **Never expose:** stack traces, SQL queries, passwords, or JWT tokens in error responses

---

## Actors

### Actor 1 — User

**Who:** Any person using the chat application.

**OTP Login Flow:**

```
User enters email → POST /api/v1/auth/otp/send
        ↓
OTP sent to email (MailHog in dev / Resend in prod)
        ↓
User enters OTP → POST /api/v1/auth/otp/verify
        ↓
If new user: account created automatically
JWT pair returned (access + refresh tokens)
        ↓
User is logged in → Chat Dashboard
```

**Google OAuth Flow (Popup-based):**

```
User clicks "Login with Google" → popup opens
        ↓
User authorizes in Google popup
        ↓
Popup sends credential to parent window
        ↓
POST /api/v1/auth/google with credential
        ↓
Backend verifies token, creates user if new
JWT pair returned
        ↓
User is logged in → Chat Dashboard
```

**User Capabilities:**

- Edit profile (display name, avatar)
- Start one-to-one conversations
- Create and manage group chats
- Send messages (text, image, file)
- See online/offline status of other users
- Receive real-time message notifications
- See unread message indicators
- Search for other users

---

## Architecture Rules

### JWT Token Strategy

```
Access Token (15 min)          Refresh Token (7 days)
┌─────────────────┐            ┌──────────────────┐
│ Payload:        │            │ Payload:         │
│ - userId        │            │ - userId         │
│ - email         │            │ - tokenVersion   │
│ - iat, exp      │            │ - jti (unique)   │
│                 │            │ - iat, exp       │
│ Stored in memory│            │ httpOnly cookie  │
└─────────────────┘            └──────────────────┘
```

- **Access token:** 15 min, stored in memory (Zustand store)
- **Refresh token:** 7 days, `httpOnly Secure SameSite=Strict` cookie
- **Token rotation:** every `/auth/refresh` invalidates the old token
- `tokenVersion` on the User model allows bulk invalidation

### Socket.IO Connection Management

- Socket authenticated via access token in handshake
- User joins personal room: `user:{userId}`
- User joins conversation rooms: `conversation:{convId}`
- On disconnect: remove from all rooms, broadcast offline status
- `SocketManager` singleton tracks all connections: `Map<userId, Set<socketId>>`

### Real-Time Message Flow

```
Sender → Socket emits 'message:send'
        ↓
Server validates + persists to DB
        ↓
Server emits 'message:new' to conversation room
        ↓
All participants receive message in real-time
        ↓
If recipient offline: message persists, delivered on reconnect
```

---

## Database Schema (3NF Normalized)

| #   | Table              | Key Fields                                                                       |
| --- | ------------------ | -------------------------------------------------------------------------------- |
| 1   | `users`            | id, email, displayName, avatarUrl, googleId, isOnline, lastSeenAt, tokenVersion  |
| 2   | `refresh_tokens`   | id, userId, tokenJti, deviceInfo, expiresAt, isRevoked                           |
| 3   | `conversations`    | id, type (`DIRECT\|GROUP`), name, avatarUrl, createdBy                           |
| 4   | `participants`     | conversationId, userId, role (`ADMIN\|MEMBER`), lastReadMessageId, joinedAt      |
| 5   | `messages`         | id, conversationId, senderId, content, messageType, replyTo, isEdited, createdAt |
| 6   | `message_receipts` | messageId, userId, readAt, deliveredAt                                           |
| 7   | `otps`             | id, email, codeHash, purpose, attempts, expiresAt, isUsed                        |
| 8   | `blocked_users`    | blockerId, blockedId, blockedAt                                                  |

---

## API Endpoints

### Auth

| Method | Endpoint                | Auth   | Description              |
| ------ | ----------------------- | ------ | ------------------------ |
| POST   | /api/v1/auth/otp/send   | Public | Send OTP to email        |
| POST   | /api/v1/auth/otp/verify | Public | Verify OTP, get JWT pair |
| POST   | /api/v1/auth/google     | Public | Google OAuth login       |
| POST   | /api/v1/auth/refresh    | Cookie | Rotate refresh token     |
| POST   | /api/v1/auth/logout     | JWT    | Revoke refresh token     |

### Users

| Method | Endpoint                 | Auth | Description              |
| ------ | ------------------------ | ---- | ------------------------ |
| GET    | /api/v1/users/me         | JWT  | Get current user profile |
| PATCH  | /api/v1/users/me         | JWT  | Update profile           |
| GET    | /api/v1/users/search     | JWT  | Search users             |
| GET    | /api/v1/users/:id/status | JWT  | Get user online status   |

### Conversations

| Method | Endpoint                  | Auth | Description                |
| ------ | ------------------------- | ---- | -------------------------- |
| GET    | /api/v1/conversations     | JWT  | List user's conversations  |
| POST   | /api/v1/conversations/dm  | JWT  | Create direct message conv |
| GET    | /api/v1/conversations/:id | JWT  | Get conversation details   |

### Messages

| Method | Endpoint                           | Auth | Description                     |
| ------ | ---------------------------------- | ---- | ------------------------------- |
| GET    | /api/v1/conversations/:id/messages | JWT  | Get message history (paginated) |
| POST   | /api/v1/conversations/:id/read     | JWT  | Mark messages as read           |

### Groups

| Method | Endpoint                           | Auth | Description               |
| ------ | ---------------------------------- | ---- | ------------------------- |
| POST   | /api/v1/groups                     | JWT  | Create group              |
| PUT    | /api/v1/groups/:id                 | JWT  | Update group info         |
| POST   | /api/v1/groups/:id/members         | JWT  | Add members               |
| DELETE | /api/v1/groups/:id/members/:userId | JWT  | Remove member             |
| DELETE | /api/v1/groups/:id                 | JWT  | Delete group (admin only) |

---

## WebSocket Events

| Event                  | Direction       | Payload                                    |
| ---------------------- | --------------- | ------------------------------------------ |
| `user:online`          | Server → All    | `{ userId, isOnline }`                     |
| `user:typing`          | Bidirectional   | `{ conversationId, userId, isTyping }`     |
| `message:send`         | Client → Server | `{ conversationId, content, messageType }` |
| `message:new`          | Server → Client | `{ message object }`                       |
| `message:read`         | Bidirectional   | `{ conversationId, messageId, userId }`    |
| `conversation:updated` | Server → Client | `{ conversationId, update }`               |
| `join:conversation`    | Client → Server | `{ conversationId }`                       |
| `leave:conversation`   | Client → Server | `{ conversationId }`                       |
| `notification`         | Server → Client | `{ type, title, message, data }`           |
| `unread:count`         | Server → Client | `{ conversationId, count }`                |

---

## Redis Key Structure

| Key Pattern                    | Purpose                       | TTL        |
| ------------------------------ | ----------------------------- | ---------- |
| `refresh_token:{userId}:{jti}` | Active refresh token tracking | 7 days     |
| `otp:{email}`                  | OTP rate limit per email      | 60 seconds |
| `user:online:{userId}`         | Online status cache           | 5 minutes  |
| `socket:user:{userId}`         | Socket ID mapping             | No TTL     |
| `ratelimit:{ip}:{endpoint}`    | Rate limit tracking           | 1 minute   |

---

## Standard Response Formats

### Success

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error

```json
{
  "success": false,
  "message": "Human-readable message",
  "error": {
    "code": "MACHINE_READABLE_CODE",
    "message": "Human-readable message",
    "details": null
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Paginated

```json
{
  "success": true,
  "data": {
    "items": [],
    "meta": {
      "currentPage": 1,
      "itemsPerPage": 20,
      "totalItems": 100,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

---

## Error Codes

| Code                      | HTTP Status | When                             |
| ------------------------- | ----------- | -------------------------------- |
| `VALIDATION_ERROR`        | 400         | Zod validation failed            |
| `UNAUTHORIZED`            | 401         | Missing or invalid JWT           |
| `TOKEN_EXPIRED`           | 401         | Access token expired             |
| `FORBIDDEN`               | 403         | Valid JWT but insufficient perms |
| `NOT_FOUND`               | 404         | Resource not found               |
| `CONFLICT`                | 409         | Resource already exists          |
| `TOO_MANY_REQUESTS`       | 429         | Rate limit exceeded              |
| `INTERNAL_SERVER_ERROR`   | 500         | Unexpected error                 |
| `INVALID_OTP`             | 401         | Wrong or expired OTP             |
| `OTP_MAX_ATTEMPTS`        | 401         | OTP attempts exceeded            |
| `USER_BLOCKED`            | 403         | Cannot message blocked user      |
| `NOT_CONVERSATION_MEMBER` | 403         | User not in conversation         |
| `GROUP_REQUIRES_NAME`     | 400         | Group chat needs a name          |

---

## Deployment

| Service  | Platform          |
| -------- | ----------------- |
| Client   | Vercel            |
| Server   | Render            |
| Database | Neon (PostgreSQL) |
| Redis    | Upstash           |
| Email    | Resend            |

---

## Environment Variables

### Server

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://...
REDIS_URL=rediss://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=...
EMAIL_FROM=...
EMAIL_HOST=...
EMAIL_PORT=...
EMAIL_USER=...
EMAIL_PASS=...
CORS_ORIGIN=https://nebula-chat.vercel.app
COOKIE_DOMAIN=.nebula-chat.vercel.app
COOKIE_SECURE=true
```

### Client

```env
VITE_API_URL=https://api-nebula-chat.onrender.com/api/v1
VITE_WS_URL=wss://api-nebula-chat.onrender.com
VITE_GOOGLE_CLIENT_ID=...
```

---

## Build Order

| Phase   | Focus                                                                                       |
| ------- | ------------------------------------------------------------------------------------------- |
| Phase 1 | **Server Foundation** — Express, TypeORM, entities, base classes, exceptions, error handler |
| Phase 2 | **Authentication Module** — JWT, OTP, Google OAuth, token refresh                           |
| Phase 3 | **User & Connection Management** — profiles, online status, Socket.IO setup                 |
| Phase 4 | **Real-Time Messaging** — one-to-one chat, message persistence, real-time delivery          |
| Phase 5 | **Conversation Management** — group chat, member management, chat list, history             |
| Phase 6 | **Client Application** — React + Vite, auth pages, chat interface, socket integration       |
| Phase 7 | **Notifications & Polish** — unread indicators, typing indicators, error handling           |
| Phase 8 | **Deployment** — Vercel + Render + Neon + Upstash                                           |

---

## Key Development Rules

1. **Quality over quantity** — one clean, tested, secure feature beats ten broken ones.
2. **Controllers route, services decide, repositories query** — never cross layer boundaries.
3. **No try/catch in controllers or services** — throw typed `HttpException`s, global filter catches all.
4. **Shared logic in `utils/` only** — never duplicated across modules.
5. **All configuration from environment variables** — nothing hardcoded.
6. **Frontend is UI only** — API calls go through `services/` layer.
7. **Commit after every completed goal** — small, frequent, descriptive commits.
8. **Socket.IO with polling fallback** — works behind firewalls.
9. **JWT rotation on every refresh** — old tokens invalidated immediately.
10. **Never expose secrets to the client** — all keys stay server-side only.
