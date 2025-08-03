# Node.js Version Fix for Hardhat

## Problem

You're currently using Node.js v21.7.1, which is not supported by Hardhat. This can lead to unexpected behavior during compilation and testing.

## Solution

Use Node.js version 18.x or 20.x (LTS versions) which are fully supported by Hardhat.

## Option 1: Using NVM (Node Version Manager) - Recommended

### Install NVM (if not already installed)

For macOS/Linux:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

### Install and Use Node.js 20 LTS

```bash
# Install Node.js 20 LTS
nvm install 20

# Use Node.js 20 for current session
nvm use 20

# Set Node.js 20 as default
nvm alias default 20

# Verify version
node --version
# Should show: v20.x.x
```

### For This Project Only

Create a `.nvmrc` file in the contracts directory:
```bash
echo "20" > .nvmrc
```

Then use:
```bash
nvm use
```

## Option 2: Using Volta (Alternative Version Manager)

### Install Volta

```bash
curl https://get.volta.sh | bash
```

### Install and Pin Node.js Version

```bash
# Install Node.js 20 LTS
volta install node@20

# Pin for this project
cd /path/to/smartjects-platform-3/contracts
volta pin node@20
```

## Option 3: Direct Installation (Not Recommended)

Download and install Node.js 20 LTS directly from:
https://nodejs.org/en/download/

**Note:** This will replace your system Node.js version.

## After Changing Node.js Version

1. Clear npm cache:
```bash
npm cache clean --force
```

2. Remove node_modules and reinstall:
```bash
cd /path/to/smartjects-platform-3/contracts
rm -rf node_modules package-lock.json
npm install
```

3. Verify Hardhat works:
```bash
npx hardhat --version
```

4. Run tests:
```bash
npm test
```

## Checking Hardhat Compatibility

To see which Node.js versions are supported by your Hardhat version:
```bash
npx hardhat --help
```

Or visit: https://hardhat.org/hardhat-runner/docs/reference/stability-guarantees#node.js-versions-support

## Project-Specific Configuration

Add to `contracts/package.json`:
```json
{
  "engines": {
    "node": ">=18.0.0 <21.0.0",
    "npm": ">=8.0.0"
  }
}
```

This will warn developers if they're using an incompatible Node.js version.