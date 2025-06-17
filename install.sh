#!/bin/bash

# Zeno KB Install Dependencies Script
# This script automatically navigates to the z_1 directory and installs dependencies

echo "📦 Installing Zeno KB Dependencies..."
echo "📁 Navigating to z_1 directory..."

# Check if z_1 directory exists
if [ ! -d "z_1" ]; then
    echo "❌ Error: z_1 directory not found!"
    echo "Make sure you're running this from the zeno_kb root directory"
    exit 1
fi

# Navigate to z_1 and install
cd z_1

echo "✅ Now in z_1 directory"
echo "🔧 Running pnpm install..."
echo ""

# Install dependencies
pnpm install 