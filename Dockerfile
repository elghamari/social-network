# Stage 1: Go Builder
FROM golang:1.26-bookworm AS go-builder
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY cmd/ cmd/
COPY internal/ internal/
RUN CGO_ENABLED=1 GOOS=linux go build -o server ./cmd/main.go

# Stage 2: Next.js Builder
FROM node:22-bookworm-slim AS next-builder
WORKDIR /build/web
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ ./
RUN sed -i '1s/^/export const dynamic = "force-dynamic";\n/' "app/(main)/groups/page.tsx"
RUN npm run build 

# Stage 3: Production
FROM node:22-bookworm-slim AS production

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN groupadd --gid 1001 nexus && \
    useradd --uid 1001 --gid nexus --shell /bin/false --create-home nexus

WORKDIR /app

RUN mkdir -p data web/public/uploads && chown -R nexus:nexus /app

COPY --chown=nexus:nexus --from=go-builder /build/server ./server
COPY --chown=nexus:nexus --from=go-builder /build/internal/db/migrations/ ./internal/db/migrations/

COPY --chown=nexus:nexus --from=next-builder /build/web/public ./web/public
COPY --chown=nexus:nexus --from=next-builder /build/web/.next/standalone ./web/
COPY --chown=nexus:nexus --from=next-builder /build/web/.next/static ./web/.next/static

COPY --chown=nexus:nexus docker-entrypoint.sh ./
RUN chmod +x ./docker-entrypoint.sh

USER nexus
EXPOSE 8080 3000

ENTRYPOINT ["./docker-entrypoint.sh"]