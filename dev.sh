#!/bin/bash

# Zeno KB Development Server Script
# This script automatically navigates to the z_1 directory and starts the dev server

echo "🚀 Starting Zeno KB Development Server..."
echo "📁 Navigating to z_1 directory..."

# Check if z_1 directory exists
if [ ! -d "z_1" ]; then
    echo "❌ Error: z_1 directory not found!"
    echo "Make sure you're running this from the zeno_kb root directory"
    exit 1
fi

# Navigate to z_1 and start the dev server
cd z_1 && pnpm dev

echo "✅ Now in z_1 directory"
echo "🔧 Starting pnpm dev..."
echo ""

# Run the development server
pnpm dev 