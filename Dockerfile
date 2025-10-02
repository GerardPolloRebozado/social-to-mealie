FROM node:lts-alpine AS base

RUN apk add --no-cache \
    wget \
    curl \
    unzip \
    ffmpeg

WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --no-frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Générer le client Prisma
RUN npx prisma generate

RUN node --run build

FROM base AS runner
WORKDIR /app

RUN apk add --no-cache python3 py3-pip

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 --shell /bin/sh nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/docker-init.sh ./docker-init.sh

# Créer le répertoire pour la base de données et les fichiers temporaires
RUN mkdir -p /app/data /app/temp
RUN chmod +x /app/docker-init.sh

# Donner les permissions à nextjs AVANT de changer d'utilisateur
RUN chown -R nextjs:nodejs /app

# Le container démarre en root, le script d'init gère le changement d'utilisateur

EXPOSE 3000

ENTRYPOINT ["/app/docker-init.sh"]
CMD ["node", "--run", "start"]