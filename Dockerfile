FROM oven/bun:debian

WORKDIR /app

RUN apt update && apt install -y \
    wget \
    curl \
    unzip \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm-dev \
    libxkbcommon0 \
    libpango-1.0-0 \
    libxcursor1 \
    && wget -qO- https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb > /tmp/chrome.deb \
    && apt install -y /tmp/chrome.deb \
    && rm /tmp/chrome.deb \
    && apt clean && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock* ./

ENV NODE_ENV=production
RUN bun install --production --frozen-lockfile

COPY tsconfig.json .
COPY public public
COPY src src

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    CHROME_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=production

RUN groupadd -r bunuser && useradd -r -g bunuser bunuser \
    && chown -R bunuser:bunuser /app

USER bunuser

EXPOSE 3000
CMD ["bun", "src/index.ts"]