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
- **Yjs CRDT** canvas sync (per room):
  - Server holds a merged `Y.Doc` per room (in-memory + Redis `wired:rooms:{roomId}:yjs`)
  - On `room:join`, server emits `yjs:sync` with a base64 `Y.encodeStateAsUpdate` payload
  - Clients emit `yjs:update` with base64 incremental updates; server applies, persists (debounced), and broadcasts to the room
  - Legacy JSON room state (`wired:rooms:{roomId}:state`) is migrated once into Yjs when present
- `cursor:update` for presence (optional client feature)

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
  4. Apply `yjs:sync`, then keep the local `Y.Doc` in sync with UI state and emit `yjs:update` for local CRDT transactions
