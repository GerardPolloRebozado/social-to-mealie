FROM node:lts-alpine AS base

RUN apk add --no-cache --no-scripts \
    wget \
    curl \
    unzip \
    ffmpeg

WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN node --run build

FROM base AS runner
WORKDIR /app

RUN apk add --no-cache --no-scripts python3 py3-pip

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Allow selecting a yt-dlp version at build or runtime
ARG YTDLP_VERSION=latest
ENV YTDLP_VERSION=${YTDLP_VERSION}

# Default path for yt-dlp binary
ENV YTDLP_PATH=./yt-dlp

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY ./entrypoint.sh /app/entrypoint.sh
RUN chown -R nextjs:nodejs /app

# If a build-time YTDLP_VERSION is provided, try downloading yt-dlp into the path.
RUN if [ -n "$YTDLP_VERSION" ]; then \
    if [ "$YTDLP_VERSION" = "latest" ]; then \
    YTDLP_URL="https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp"; \
    else \
    YTDLP_URL="https://github.com/yt-dlp/yt-dlp/releases/download/${YTDLP_VERSION}/yt-dlp"; \
    fi && \
    wget -q -O $YTDLP_PATH "$YTDLP_URL" && chmod +x $YTDLP_PATH || true; \
    fi

# Ensure the downloaded binary (if any) is owned by the app user so runtime chown/chmod won't fail
RUN if [ -f "$YTDLP_PATH" ]; then \
    chown nextjs:nodejs "$YTDLP_PATH" || true; \
    chmod +x "$YTDLP_PATH" || true; \
    fi

USER nextjs

EXPOSE 3000

ENTRYPOINT ["/bin/sh","/app/entrypoint.sh"]
CMD ["node", "--run", "start"]