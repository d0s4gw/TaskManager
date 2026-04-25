#!/bin/bash
set -e

echo "🚀 Setting up TaskManager for local development..."

# 1. Install all dependencies via workspaces
echo "📦 Installing all dependencies (root, server, web, shared)..."
npm install

# 3. Create dummy .env files if they don't exist
if [ ! -f server/.env ]; then
  echo "📄 Creating default server/.env..."
  echo "PORT=8080" > server/.env
  echo "GOOGLE_CLOUD_PROJECT=task-manager-dev" >> server/.env
fi

if [ ! -f web/.env.local ]; then
  echo "📄 Creating default web/.env.local..."
  echo "NEXT_PUBLIC_FIREBASE_API_KEY=mock-key" > web/.env.local
  echo "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mock-project.firebaseapp.com" >> web/.env.local
  echo "NEXT_PUBLIC_FIREBASE_PROJECT_ID=mock-project" >> web/.env.local
fi

echo "✅ Setup complete! Run 'npm run dev' to start the application."
