# Stage 1: Build
FROM node:24-slim AS builder

WORKDIR /app

# Copy root and workspace package files
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY server/package*.json ./server/

# Install dependencies for server and shared workspaces
RUN npm ci --include=dev

# Copy source code
COPY shared ./shared
COPY server ./server

# Build the server
WORKDIR /app/server
RUN npm run build

# Stage 2: Production
FROM node:24-slim

WORKDIR /app/server

# Copy package files for production install
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/shared/package*.json /app/shared/
COPY --from=builder /app/server/package*.json /app/server/

# Install production dependencies
WORKDIR /app
RUN npm ci --omit=dev --workspace server --workspace shared

# Copy built assets from builder
COPY --from=builder /app/server/dist /app/server/dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

WORKDIR /app/server

# Expose port
EXPOSE 8080

# Start using the verified npm start script
CMD ["npm", "start"]
