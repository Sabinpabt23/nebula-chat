<div align="center">

<h1>💬 Nebula Chat</h1>

<p>A production-grade real-time chat application with passwordless OTP login, Google OAuth, one-to-one and group messaging, typing indicators, and online presence — built with strict clean architecture.</p>

<p>
  <a href="https://nebula-chat-seven.vercel.app"><strong>🔗 Live Demo</strong></a> &nbsp;·&nbsp;
</p>

<br/>

<p>
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Node.js-24.14-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
</p>
<p>
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis"/>
  <img src="https://img.shields.io/badge/Socket.IO-4.8-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.IO"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
</p>

</div>

---

## 📑 Table of Contents

- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Setup Guide](#-setup-guide)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Developer Notes](#-developer-notes)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js 24, Express 5, TypeScript 6 |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS |
| **Database** | PostgreSQL 15 via TypeORM |
| **Cache / PubSub** | Redis 7 |
| **Real-time** | Socket.IO 4.8 (WebSocket + polling fallback) |
| **Auth** | JWT (Access + Refresh tokens), Google OAuth 2.0, OTP |
| **Email** | Resend (production), MailHog (development) |
| **Validation** | Zod |
| **State Management** | Zustand |
| **Logging** | Winston |
| **DevOps** | Docker Compose, Render, Vercel, Neon, Upstash |

---

## ✨ Features

<details>
<summary><b>🔐 Authentication</b></summary>
<br>

- **Passwordless OTP login** — enter your email, receive a code, verify and you're in
- **Google OAuth 2.0** — popup-based sign-in with server-side audience validation
- **JWT token rotation** — short-lived access token (15 min, in memory) paired with a 7-day `httpOnly` refresh cookie
- **Automatic session restore** on page refresh via silent token refresh
- **Route protection** — unauthenticated users are redirected to login
- **Secure logout** — clears cookie, disconnects socket, wipes in-memory token

</details>

<details>
<summary><b>💬 Real-Time Messaging</b></summary>
<br>

- **One-to-one direct messages** — unique conversation per user pair, no duplicates
- **Group chat** — create groups, add/remove members, admin controls
- **Instant delivery** via Socket.IO — messages appear without any reload
- **Typing indicators** — live "User is typing..." feedback
- **Online presence** — green dot on avatars for online users
- **Unread badges** — counts update in real-time and clear automatically on view

</details>

<details>
<summary><b>👤 User Profiles</b></summary>
<br>

- View your own profile and any other user's public profile
- Displays name, email, online status, and last seen timestamp
- Clickable avatars throughout the app open profile views
- Dedicated public profile endpoint

</details>

<details>
<summary><b>📱 UI / UX</b></summary>
<br>

- Dark theme built with CSS custom properties
- Mobile-responsive layout with a collapsible sidebar
- Smooth transitions and micro-animations
- Meaningful empty states with contextual prompts
- Clean, minimal design focused on readability

</details>

---

## 🏗 Architecture

Nebula Chat enforces a strict **three-layer clean architecture** on both the backend and frontend. Every layer has exactly one responsibility and does not bleed into another.

### Backend

| Layer | Location | Responsibility |
|---|---|---|
| **Controller** | `controllers/` | HTTP routing only — extracts request data, calls service, sends response |
| **Service** | `services/` | All business logic — validation, orchestration, rule enforcement |
| **Repository** | `repositories/` | All database queries via TypeORM — no logic whatsoever |

### Frontend

| Layer | Location | Responsibility |
|---|---|---|
| **Component** | `components/` | Renders UI, handles clicks and inputs — never calls an API directly |
| **Hook** | `hooks/` | Orchestrates services and stores — the glue layer |
| **Service** | `services/` | All HTTP and WebSocket communication |
| **Store** | `stores/` | Zustand global state management |

### Error Handling

- **Backend:** Services throw typed `HttpException` subclasses. A global error middleware catches everything — no `try/catch` scattered across controllers or services.
- **Frontend:** Components display errors surfaced from hooks. A `getErrorMessage()` utility extracts structured backend messages consistently.

### Real-Time Message Flow

```
Client A ──POST /messages──▶ Server (persist to DB)
                                    │
                             Socket.IO broadcast
                                    │
                             Client B ◀── message:new
```

HTTP handles persistence. Socket.IO handles delivery. These concerns never swap roles.

---

## 📁 Project Structure

```
nebula-chat/
├── server/                         # Backend — Express + TypeScript
│   └── src/
│       ├── config/                 # Database, Redis, environment setup
│       ├── entities/               # TypeORM entity classes (8 tables)
│       ├── repositories/           # Data access layer
│       ├── services/               # Business logic
│       ├── controllers/            # Route handlers (routing only)
│       ├── middleware/             # Auth, validation, error handling
│       ├── socket/                 # Socket.IO event handlers
│       ├── exceptions/             # Typed HTTP exception classes
│       ├── validators/             # Zod schemas
│       ├── utils/                  # Shared utilities
│       ├── routes/                 # Route definitions
│       └── app.ts                  # Application entry point
│
├── client/                         # Frontend — React + Vite
│   └── src/
│       ├── components/
│       │   ├── auth/               # LoginForm, AuthProvider, ProtectedRoute
│       │   ├── chat/               # MessageBubble, ChatInput, ConversationList
│       │   ├── layout/             # AppShell
│       │   └── ui/                 # Shared UI primitives
│       ├── pages/                  # Route-level page components
│       ├── hooks/                  # useAuth, useChat, useSocket
│       ├── services/               # api.ts, socket.ts
│       ├── stores/                 # authStore, chatStore (Zustand)
│       ├── types/                  # TypeScript interfaces
│       ├── lib/                    # Constants, error utilities
│       └── validators/             # Zod schemas
│
├── docker-compose.yml              # PostgreSQL + Redis + MailHog
└── README.md
```

---

## 🚀 Setup Guide

### Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 24+ | Runtime |
| Docker | Latest | Local PostgreSQL + Redis + MailHog |
| Git | Latest | Clone the repository |

---

### Step 1 — Clone

```bash
git clone https://github.com/Sabinpabt23/nebula-chat.git
cd nebula-chat
```

### Step 2 — Start Docker Services

```bash
docker-compose up -d
```

Starts three services:

| Service | Port |
|---|---|
| PostgreSQL | `5433` |
| Redis | `6380` |
| MailHog SMTP | `1026` |
| MailHog UI | `8026` |

### Step 3 — Configure Environment

```bash
# Server
cp server/.env.example server/.env

# Client
cp client/.env.example client/.env
```

Edit `server/.env` with your local settings. Set `VITE_API_URL` and `VITE_WS_URL` in `client/.env`.

### Step 4 — Run the Server

```bash
cd server
npm install
npm run dev
```

Server starts at `http://localhost:4000`. Health check available at `/health`.

### Step 5 — Run the Client

```bash
cd client
npm install
npm run dev
```

Client starts at `http://localhost:5173`.

### Step 6 — Try It Out

1. Open `http://localhost:5173` in **two separate browsers**
2. Log in via OTP — check MailHog at `http://localhost:8026` to retrieve codes
3. Search for the other user and open a conversation
4. Send messages — they deliver instantly in real-time

---

## 📡 API Reference

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/otp/send` | Public | Send OTP to email |
| `POST` | `/api/v1/auth/otp/verify` | Public | Verify OTP, receive JWT |
| `POST` | `/api/v1/auth/google` | Public | Google OAuth login |
| `POST` | `/api/v1/auth/refresh` | Cookie | Refresh access token |
| `POST` | `/api/v1/auth/logout` | JWT | Revoke refresh token |

### Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/users/me` | JWT | Get current user profile |
| `PATCH` | `/api/v1/users/me` | JWT | Update profile |
| `GET` | `/api/v1/users/search?query=` | JWT | Search users |
| `GET` | `/api/v1/users/:id` | JWT | Get public profile |

### Conversations

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/conversations` | JWT | List all conversations |
| `POST` | `/api/v1/conversations/dm` | JWT | Create a direct message |
| `POST` | `/api/v1/conversations/group` | JWT | Create a group |
| `POST` | `/api/v1/conversations/:id/members` | JWT | Add member to group |
| `DELETE` | `/api/v1/conversations/:id/members/:userId` | JWT | Remove member from group |

### Messages

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/conversations/:id/messages` | JWT | Get messages (paginated) |
| `POST` | `/api/v1/conversations/:id/messages` | JWT | Send a message |
| `POST` | `/api/v1/messages/:id/read` | JWT | Mark message as read |

---

## 🚢 Deployment

| Service | Platform | URL |
|---|---|---|
| **Client** | Vercel | [nebula-chat-seven.vercel.app](https://nebula-chat-seven.vercel.app) |
| **Server** | Render | `nebula-chat-api.onrender.com` |
| **Database** | Neon | Serverless PostgreSQL |
| **Redis** | Upstash | Serverless Redis |
| **Email** | Resend | Transactional email API |

---

## 🧑‍💻 Developer Notes

### Code Quality Rules

| Rule | Detail |
|---|---|
| **Layer boundaries are sacred** | Controllers route. Services decide. Repositories query. |
| **No scattered error handling** | Throw typed `HttpException` subclasses. The global handler catches everything. |
| **Validate at the edge** | All input validation via Zod schemas in `validators/`. |
| **No duplication** | Shared logic lives in `utils/` only. |
| **No hardcoded values** | Every configuration value comes from environment variables. |
| **Frontend stays in its lane** | API calls go through `services/` and `hooks/`. Components never call APIs directly. |

### Authentication Details

- **Access token** — 15-minute lifespan, stored in memory (Zustand + `api.ts` variable, never in `localStorage`)
- **Refresh token** — 7-day lifespan, `httpOnly Secure SameSite=None` cookie
- **Token rotation** — every refresh revokes the old token and issues a fresh pair
- **Google OAuth** — credential is verified server-side with audience validation; the frontend never trusts the token blindly

### Database

- All 8 tables are normalized to 3NF with proper indexes
- Junction tables use composite primary keys
- Soft deletes for conversation participants (`leftAt`) and OTPs (`isUsed`)

### Real-Time

- Socket.IO uses WebSocket transport with long-polling as a fallback
- A `SocketManager` singleton authenticates connections via JWT middleware
- **HTTP = persistence. Socket.IO = delivery.** These are single-purpose channels.

---

<div align="center">

Made with ❤️ by **Sabin Panta**

</div>
