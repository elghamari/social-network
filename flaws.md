# Flaws & Issues

## Critical Issues

### 1. Migration ordering bug
`00009_create_posts_table.up.sql` uses 4 digits (`00009`) while all other migrations use 6 digits (`000001`–`000015`). Alphabetical sorting places `00009` **after** `000015`, meaning the posts table is created last. Comments (`000010`) and reactions (`000011`) reference `posts` but run before it exists. On a fresh database this would fail.

**File:** `internal/db/migrations/sqlite/`

### 2. docker-entrypoint.sh rebuilds everything at runtime
The entrypoint runs `go build`, `npm install`, and `npm run build` at container startup, ignoring the pre-built binaries from the multi-stage Dockerfile. This makes container startup very slow (~10+ seconds) and runs `npm install` in production (non-deterministic).

**File:** `docker-entrypoint.sh`

### 3. WebSocket URL hardcoded in frontend
`WebSocketContext.tsx` connects to `ws://localhost:8080/api/ws/chat` directly. This breaks in Docker/production where the backend may be on a different host. Should use the same origin or be configurable.

**File:** `web/app/_context/WebSocketContext.tsx`

### 4. CORS hardcoded to localhost:3000
Only allows `http://localhost:3000`. Blocks API calls from any other origin. Should be configurable via environment variable.

**File:** `internal/middleware/cors.go`

### 5. No Docker Compose
There is no `docker-compose.yml`, making local development outside Docker cumbersome. The frontend expects the backend at `localhost:8080`.

---

## Backend Bugs

### 6. Register handler: inverted error check for image upload
`auth-handler.go:46` checks `if err == nil` (success) but does nothing useful, while the error case on line 41–43 calls `HandleError` without returning — execution continues trying to register even after reporting an error.

**File:** `internal/handlers/auth-handler.go:40-64`

### 7. Notification content duplication
In `notification_repo.go`, the query prepends the sender's name (`u.first_name || ' ' || u.last_name || ' ' || n.content`) to the stored `content` field. The frontend also renders `notif.content` directly, causing the sender name to appear twice (e.g., "Alice Johnson Alice Johnson invited you to join Go Programming").

**File:** `internal/repositories/notification_repo.go`

### 8. Notification read marking not working
`POST /api/notifications/read` returns `{"message":"notification marked as read"}` but the notification's `is_read` field remains `false` when fetched again.

**File:** `internal/handlers/notification-handler.go`

### 9. JSON field typo: `fistname` instead of `firstname`
The `UserResponse` JSON tag uses `fistname` (missing 'r'). The frontend matches this typo so it works, but it's incorrect.

**File:** `internal/types/feed.go`

### 10. `CreatePost` shares handler with group posts
The `CreatePost` handler is mounted at both `/api/posts/create` and `/api/groups/{id}/posts`. It extracts `groupId` from `PathValue("id")`, which works but conflates two different use cases in one handler.

**File:** `internal/handlers/posts-handler.go`

### 11. `HandleError` doesn't terminate request
`HandleError` writes a JSON error response but doesn't stop execution. Callers must manually `return` after calling it, which is error-prone. Several handlers omit the return.

**File:** `internal/handlers/0_errors.go`

### 12. No input sanitization for passwords
Password validation only checks minimum length (6 chars). No strength requirements or character restrictions.

**File:** `internal/services/0_validation.go`

### 13. Hardcoded paths
`DBPath: "./data/database.db"` and `MigrationsPath: "./internal/db/migrations/sqlite/"` are hardcoded in `cmd/main.go`.

**File:** `cmd/main.go`

---

## Missing Features / Edge Cases

### 14. No post editing or deletion
Once created, posts cannot be edited or deleted.

### 15. No comment editing or deletion
Same as above for comments.

### 16. No group editing or deletion
Groups cannot be edited or deleted after creation.

### 17. No event editing or deletion
Events cannot be edited or deleted after creation.

### 18. No forgot password / password reset
There is no password reset flow.

### 19. No email verification
Users can register with any email without confirmation.

### 20. No typing indicators in chat
Chat doesn't show when the other person is typing.

### 21. No file attachments in chat
Only text messages are supported in chat.

### 22. No pagination for notifications
All notifications are fetched at once (no cursor/offset).

### 23. No CSRF protection
Only relies on httpOnly cookies + CORS.

---

## Frontend Issues

### 24. `proxy.ts` is likely unused
`web/proxy.ts` defines middleware for route protection, but with Next.js App Router, middleware should be at `middleware.ts` in the project root. Actual route protection is handled client-side in `AuthContext.tsx`.

**File:** `web/proxy.ts`

### 25. Extensive `any` usage
TypeScript `any` is used extensively (e.g., `profile/[id]/page.tsx:18`), defeating the purpose of TypeScript.

### 26. `next.config.ts` has `ignoreBuildErrors: true`
Hides real TypeScript errors during build.

**File:** `web/next.config.ts`

### 27. `createGroupPost` uses GET instead of POST
In `web/app/lib/services/group.ts`, `createGroupPost` does a GET request instead of POST. This function appears unused.

### 28. Parameter ordering in `GetGroupPosts`
`GetGroupPosts` in `feed.ts` takes `(cursor, groupId)` instead of `(groupId, cursor)`, which is unintuitive.

### 29. `go 1.26.1` requires `toolchain` directive
Go 1.21+ requires a `toolchain` directive in `go.mod` for versions beyond the installed toolchain. This is missing and may cause build issues.

**File:** `go.mod`

---

## Docker Issues

### 30. Duplicate builds in Dockerfile and entrypoint
The Dockerfile builds Go and Next.js binaries in stages 1 and 2, then the entrypoint rebuilds everything at runtime, wasting the multi-stage build.

### 31. No health checks
Neither service has health check endpoints or startup ordering.

### 32. No request logging
The server doesn't log incoming requests, making debugging difficult.
