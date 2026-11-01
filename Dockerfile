# Multi-stage production Dockerfile for SRE Platform Backend / Full-Stack

FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl curl

FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Generate Prisma Client for PostgreSQL
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

# Next.js will automatically bind to $PORT and $HOSTNAME (0.0.0.0)
CMD ["npm", "start"]

