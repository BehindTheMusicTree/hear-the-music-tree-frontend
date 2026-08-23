# syntax=docker/dockerfile:1
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
COPY package.json pnpm-lock.yaml .npmrc ./
RUN --mount=type=secret,id=GH_PACKAGES_TOKEN_READ \
    if [ ! -s /run/secrets/GH_PACKAGES_TOKEN_READ ]; then \
        echo "ERROR: GH_PACKAGES_TOKEN_READ build secret is not provided" >&2; \
        exit 1; \
    fi && \
    NPM_TOKEN="$(cat /run/secrets/GH_PACKAGES_TOKEN_READ)" pnpm install --frozen-lockfile

# next.config.js's REQUIRED_ENV_VARS check runs at `next build` time, so every NEXT_PUBLIC_* var it
# needs must be passed as a build arg here, or the build fails with "Missing required environment
# variable(s)". Coolify injects these via its buildtime_env config (see infrastructure repo).
ARG NEXT_PUBLIC_CONTACT_EMAIL
ARG NEXT_PUBLIC_SPOTIFY_CLIENT_ID
ARG NEXT_PUBLIC_SPOTIFY_SCOPES
ARG NEXT_PUBLIC_SPOTIFY_REDIRECT_URI
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_GOOGLE_REDIRECT_URI
ARG NEXT_PUBLIC_TRACK_UPLOAD_TIMEOUT_MS
ARG NEXT_PUBLIC_BACKEND_BASE_URL
ENV NEXT_PUBLIC_CONTACT_EMAIL=$NEXT_PUBLIC_CONTACT_EMAIL \
    NEXT_PUBLIC_SPOTIFY_CLIENT_ID=$NEXT_PUBLIC_SPOTIFY_CLIENT_ID \
    NEXT_PUBLIC_SPOTIFY_SCOPES=$NEXT_PUBLIC_SPOTIFY_SCOPES \
    NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=$NEXT_PUBLIC_SPOTIFY_REDIRECT_URI \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID \
    NEXT_PUBLIC_GOOGLE_REDIRECT_URI=$NEXT_PUBLIC_GOOGLE_REDIRECT_URI \
    NEXT_PUBLIC_TRACK_UPLOAD_TIMEOUT_MS=$NEXT_PUBLIC_TRACK_UPLOAD_TIMEOUT_MS \
    NEXT_PUBLIC_BACKEND_BASE_URL=$NEXT_PUBLIC_BACKEND_BASE_URL

COPY . .
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static/
COPY --from=builder --chown=nextjs:nodejs /app/public ./public/
ENV PORT=3000
# Docker auto-sets $HOSTNAME to the container ID; without this override, Next's standalone
# server binds there instead of all interfaces, so Coolify's localhost healthcheck can't connect.
ENV HOSTNAME=0.0.0.0
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
