# ========================================
# KABA FRONTEND - PRODUCTION DOCKERFILE
# ========================================

# Use official Node.js runtime as base image
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl

# ========================================
# DEPENDENCIES STAGE
# ========================================
FROM base AS dependencies

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# ========================================
# BUILD STAGE
# ========================================
FROM base AS build

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# ========================================
# PRODUCTION STAGE
# ========================================
FROM base AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built application
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

# Create directories and set permissions
RUN mkdir -p /app/logs && \
    chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["node", "server.js"] 