# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
# python3, make, g++ required to compile better-sqlite3 native addon
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Build
# Token KHÔNG được bake vào image — đọc từ env runtime khi container chạy
FROM node:20-alpine AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Run (standalone)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# better-sqlite3 native addon — Next.js file tracing may miss .node binaries
COPY --from=builder /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3

# Prepare data dir with correct ownership before volume mount
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
