# Nexus Social Network

A full-stack social networking application built with Go, SQLite, and Next.js.

## Overview

This repository includes:
- A Go backend API with authentication, user profiles, posts, comments, reactions, notifications, and group chat.
- A SQLite database with migrations under `internal/db/migrations/sqlite/`.
- A Next.js frontend app in the `web` folder, using React and TypeScript.
- WebSocket-powered real-time chat and notification support.

## Architecture

- Backend: Go + `net/http` + SQLite + Gorilla WebSocket
- Frontend: Next.js 16 + React 19 + TypeScript
- Database: SQLite database file at `data/database.db`
- Proxy / auth middleware: `web/proxy.ts`

## Features

- User authentication and session-based access control
- User profile management
- News feed with posts, comments, and reactions
- Follow / network interactions
- Groups with posts, events, and group chat
- Real-time group and direct messages via WebSocket
- Unread message counts and read tracking

## Getting Started

### Backend

1. From the repository root:

```bash
cd /home/mmarhror/Desktop/social-network
go run cmd/main.go
```

2. The backend server listens on port `8080` by default.

3. The app will create the `data` folder and initialize the SQLite database automatically.

### Frontend

1. Install dependencies in the frontend folder:

```bash
cd /home/mmarhror/Desktop/social-network/web
npm install
```

2. Start the Next.js development server:

```bash
npm run dev
```

3. Open the app at `http://localhost:3000`.

## Development Notes

- Backend configuration is controlled in `cmd/main.go`.
- Migrations are stored in `internal/db/migrations/sqlite/`.
- API handlers are defined in `internal/handlers/`, services in `internal/services/`, and repositories in `internal/repositories/`.
- WebSocket behavior is implemented in `internal/hub/` and consumed from the frontend via `web/app/_context/WebSocketContext.tsx`.
- Frontend routes and UI components are organized under `web/app/`.

## Important Paths

- Backend entrypoint: `cmd/main.go`
- Backend app setup: `internal/app/app.go`
- Frontend entrypoint: `web/package.json`
- Frontend auth and WebSocket provider: `web/app/_context/WebSocketContext.tsx`
- Group chat page: `web/app/(main)/groups/[id]/chat/`

## Troubleshooting

- If the frontend fails to load protected routes, ensure the backend is running on `http://localhost:8080`.
- If the database is missing, the backend will recreate it when started.
- To reset data, stop the server and remove `data/database.db`.

## License

This project does not include a license file. Add one if you plan to share or publish the project.
