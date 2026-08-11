FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
COPY package.json pnpm-lock.yaml .npmrc ./
RUN --mount=type=secret,id=GH_PACKAGES_TOKEN_READ \
    NPM_TOKEN="$(cat /run/secrets/GH_PACKAGES_TOKEN_READ 2>/dev/null)" pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static/
COPY --from=builder --chown=nextjs:nodejs /app/public ./public/
ENV PORT=3000
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
