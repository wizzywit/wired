# wired-backend

Socket.IO + Express backend for the Wired collaborative canvas.

## Features

- Redis-backed cookie sessions (`express-session` + `connect-redis`)
- Auth endpoints for existing frontend screens:
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/logout`
  - `GET /auth/me`
- Socket.IO room lifecycle:
  - `room:join`, `room:leave`
  - `room:user-joined`, `room:user-left`
- Collaborative canvas sync events:
  - `canvas:replace` (persist full snapshot per room)
  - `canvas:request-state`, `canvas:state`
  - `cursor:update`

## Setup

1. Copy env file:

```bash
cp .env.example .env
```

2. Run Redis locally (or provide remote `REDIS_URL`).
3. Start backend:

```bash
npm run dev
```

Server defaults to `http://localhost:4000`.

## Frontend integration notes

- Frontend must send cookies:
  - HTTP fetch/axios: `credentials: "include"`
  - Socket.IO client: `withCredentials: true`
- Typical flow:
  1. Call `/auth/register` or `/auth/login`
  2. Open Socket.IO connection
  3. Emit `room:join` with `{ roomId }`
