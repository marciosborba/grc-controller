#!/bin/bash
echo "🧹 Cleaning Vite cache..."
rm -rf node_modules/.vite

echo "🧹 Cleaning Dist folder..."
rm -rf dist

echo "🛑 Killing any existing node processes on port 8080..."
fuser -k 8080/tcp 2>/dev/null

echo "🚀 Restarting Vite Dev Server..."
echo "Please open the URL shown below in your browser."
npm run dev
