FROM golang:1.26-alpine AS go-build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o server ./cmd

FROM node:22-alpine AS node-build
WORKDIR /app/web
COPY web/package*.json ./
RUN npm ci
COPY web/ .
RUN npm run build

FROM node:22-alpine
RUN addgroup -S app && adduser -S app -G app
RUN apk add --no-cache ca-certificates tzdata

COPY --from=go-build /app/server /app/server
COPY --from=node-build /app/web/.next/standalone /app/web
COPY --from=node-build /app/web/.next/static /app/web/.next/static
COPY --from=node-build /app/web/public /app/web/public
COPY docker-entrypoint.sh /app/

RUN chown -R app:app /app && chmod +x /app/docker-entrypoint.sh

WORKDIR /app
USER app

EXPOSE 8080 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
