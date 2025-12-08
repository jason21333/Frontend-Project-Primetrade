FROM node:18-alpine AS deps
WORKDIR /app

# ✅ FIXED: Install ALL dependencies (including devDependencies for build)
COPY package.json package-lock.json* ./
RUN npm ci --silent --no-audit || npm install

FROM node:18-alpine AS builder
WORKDIR /app

# Copy ALL dependencies from deps stage (including dev deps)
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Allow the API base to be set at build time
ARG NEXT_PUBLIC_API_BASE
ENV NEXT_PUBLIC_API_BASE=${NEXT_PUBLIC_API_BASE}

# ✅ Build the Next.js app (now has three & vanta!)
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy ONLY production files (no dev deps needed)
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/jsconfig.json ./jsconfig.json

# ✅ FIXED: Copy ONLY production node_modules for runner
RUN npm ci --only=production --silent --no-audit || npm install --only=production --silent
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]
