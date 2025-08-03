#!/bin/bash

# Quick Node.js version switcher for Smartjects Contracts
# This script helps switch to the correct Node.js version for Hardhat

echo "🔧 Smartjects Contracts - Node.js Version Switcher"
echo "=================================================="

# Check if NVM is installed
if ! command -v nvm &> /dev/null; then
    echo "❌ NVM is not installed or not properly configured."
    echo ""
    echo "To install NVM, run:"
    echo "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "source ~/.bashrc  # or ~/.zshrc for zsh users"
    echo ""
    echo "Alternatively, download Node.js 20 LTS directly from:"
    echo "https://nodejs.org/en/download/"
    exit 1
fi

# Source NVM to ensure it's available in this script
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

echo "📦 Current Node.js version: $(node --version)"

# Check if Node.js 20 is installed
if ! nvm list | grep -q "v20"; then
    echo "🔄 Node.js 20 not found. Installing..."
    nvm install 20
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Node.js 20"
        exit 1
    fi
fi

# Switch to Node.js 20
echo "🔄 Switching to Node.js 20..."
nvm use 20

if [ $? -eq 0 ]; then
    echo "✅ Successfully switched to Node.js $(node --version)"

    # Set as default for future sessions
    nvm alias default 20
    echo "🎯 Set Node.js 20 as default for future sessions"

    # Clean and reinstall dependencies
    echo "🧹 Cleaning node_modules and package-lock.json..."
    rm -rf node_modules package-lock.json

    echo "📦 Installing dependencies..."
    npm install

    if [ $? -eq 0 ]; then
        echo "✅ Dependencies installed successfully"
        echo ""
        echo "🚀 Ready to run Hardhat commands!"
        echo "Try: npm test"
    else
        echo "❌ Failed to install dependencies"
        exit 1
    fi
else
    echo "❌ Failed to switch to Node.js 20"
    exit 1
fi

echo ""
echo "💡 Tips:"
echo "- Run 'nvm use' in this directory to switch to the correct version"
echo "- The .nvmrc file will automatically use Node.js 20"
echo "- Current Node.js version: $(node --version)"
echo "- NPM version: $(npm --version)"
