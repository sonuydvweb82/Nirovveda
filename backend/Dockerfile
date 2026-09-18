# Nirovveda backend — production image.
# Build context: repository root (Render default).
# Render settings: Root Directory = repo root (blank/default),
# Dockerfile Path = backend/Dockerfile.
# Debian (glibc) base: Prisma's debian-openssl-3.0.x engines work out of the
# box on Render. Alpine (musl) needs libssl1.1-compat and is the cause of:
# "Error loading shared library libssl.so.1.1" / "linux-musl not compatible".
FROM node:20-bookworm-slim

WORKDIR /app

# OpenSSL is required by Prisma engines at runtime (Debian bookworm = OpenSSL 3).
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Install backend deps first for better layer caching.
# Manifest lives in backend/, so prefix paths with backend/.
COPY backend/package*.json ./
RUN npm ci

# Prisma schema lives at repo-root prisma/ (not backend/prisma).
COPY prisma ./prisma
RUN npx prisma generate

# Copy only the runtime source — never .env files or node_modules.
COPY backend/src ./src

# Lean production image: drop devDependencies (prisma CLI already ran).
RUN npm prune --omit=dev

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

# /app/src/index.js exists because of the COPY above (plain JS, no TS build step).
CMD ["node", "src/index.js"]