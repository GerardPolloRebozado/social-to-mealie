FROM node:lts-alpine AS base

RUN apk add --no-cache \
        wget \
        curl \
        unzip \
        ffmpeg \
        python3 \
        py3-pip \
        deno # Deno is the recommended JS runtime for yt-dlp

# Install uv for Python package management and use it for yt-dlp inside a venv
ENV PATH="/root/.local/bin:${PATH}"
RUN curl -LsSf https://astral.sh/uv/install.sh | sh && \
        uv venv /opt/uv && \
        uv pip install --python /opt/uv/bin/python --no-cache "yt-dlp[default]" && \
        ln -s /opt/uv/bin/yt-dlp /usr/local/bin/yt-dlp

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

RUN apk add --no-cache python3 py3-pip

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["node", "--run", "start"]