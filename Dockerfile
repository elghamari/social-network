
FROM golang:1.26-bookworm AS go-builder

WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY cmd/ cmd/
COPY internal/ internal/
RUN CGO_ENABLED=1 GOOS=linux \
    go build -o server ./cmd/main.go


FROM node:22-bookworm-slim AS next-builder

WORKDIR /build/web
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ ./
RUN npm run build


FROM debian:bookworm-slim AS production

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*


RUN groupadd --gid 1001 nexus && \
    useradd  --uid 1001 --gid nexus --shell /bin/false nexus

WORKDIR /app

COPY --from=go-builder /build/server ./server
COPY --from=go-builder /build/internal/db/migrations/ ./internal/db/migrations/
COPY --from=next-builder /build/web/.next         ./web/.next
COPY --from=next-builder /build/web/package.json   ./web/package.json
COPY --from=next-builder /build/web/node_modules   ./web/node_modules
COPY --from=next-builder /build/web/public         ./web/public
COPY --from=next-builder /build/web/next.config.ts  ./web/next.config.ts

RUN mkdir -p data web/public/uploads && \
    chown -R nexus:nexus /app

COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nexus

EXPOSE 8080 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
