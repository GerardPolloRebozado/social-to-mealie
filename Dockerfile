FROM node:lts-slim AS base

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    wget \
    curl \
    unzip \
    ffmpeg \
    ca-certificates \
    gallery-dl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN node --run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Allow selecting a yt-dlp version at build or runtime
ARG YTDLP_VERSION=latest
ENV YTDLP_VERSION=${YTDLP_VERSION}

# Default path for yt-dlp binary
ENV YTDLP_PATH=./yt-dlp
ENV VIRTUAL_ENV=/venv
ENV PATH="/venv/bin:$PATH"

RUN groupadd -g 1001 nodejs
RUN useradd -r -u 1001 -g nodejs nextjs

# Set up virtual environment and pre-install yt-dlp with curl-cffi
RUN python3 -m venv /venv && \
    /venv/bin/pip install --no-cache-dir --upgrade pip && \
    if [ -n "$YTDLP_VERSION" ] && [ "$YTDLP_VERSION" != "none" ] && [ "$YTDLP_VERSION" != "false" ] && [ "$YTDLP_VERSION" != "skip" ]; then \
        if [ "$YTDLP_VERSION" = "latest" ]; then \
            /venv/bin/pip install --no-cache-dir "yt-dlp[default,curl-cffi]"; \
        else \
            CLEAN_VER="${YTDLP_VERSION#v}"; \
            /venv/bin/pip install --no-cache-dir "yt-dlp[default,curl-cffi]==${CLEAN_VER}"; \
        fi; \
        touch /venv/.yt-dlp-updated; \
    fi && \
    chown -R nextjs:nodejs /venv

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY ./entrypoint.sh /app/entrypoint.sh

# Symlink yt-dlp to /app/yt-dlp so both ./yt-dlp and yt-dlp work
RUN if [ -f /venv/bin/yt-dlp ]; then \
        ln -sf /venv/bin/yt-dlp /app/yt-dlp; \
    fi

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

# Ensure cache dir exists
RUN mkdir -p /app/node_modules/@xenova/.cache/
RUN chmod 777 -R /app/node_modules/@xenova/

# /bin/sh is available in Debian, but you can also use /bin/bash if your entrypoint needs it
ENTRYPOINT ["/bin/sh","/app/entrypoint.sh"]
CMD ["node", "--run", "start"]
