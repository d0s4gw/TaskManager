# Stage 1: Build
FROM node:18-slim AS builder

WORKDIR /app

# Copy shared types
COPY shared /shared

# Copy server package files
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install

# Copy server source
COPY server/tsconfig.json ./
COPY server/src ./src

# Build
RUN npm run build

# Stage 2: Production
FROM node:18-slim

WORKDIR /app/server

# Copy package files and install production dependencies
COPY server/package*.json ./
RUN npm install --only=production

# Copy built assets from builder
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /shared /app/shared

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start
CMD ["node", "dist/index.js"]
