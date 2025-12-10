#!/bin/bash

# Mainnet Deployment Script for Stacks Counter Contract
# This script helps deploy your contract to Stacks mainnet

set -e

echo "🚀 Stacks Mainnet Deployment Script"
echo "===================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.example to .env and fill in your values:"
    echo "  cp .env.example .env"
    exit 1
fi

# Load environment variables
source .env

# Check if secret key is set
if [ -z "$DEPLOYER_SECRET_KEY" ]; then
    echo "❌ Error: DEPLOYER_SECRET_KEY is not set in .env file"
    echo "Please add your Stacks mainnet secret key to .env"
    exit 1
fi

# Validate secret key format (should be 64 hex characters)
if ! echo "$DEPLOYER_SECRET_KEY" | grep -qE '^[0-9a-fA-F]{64}$'; then
    echo "⚠️  Warning: Secret key format may be incorrect"
    echo "Expected: 64 hexadecimal characters (0-9, a-f)"
    echo "Got: ${#DEPLOYER_SECRET_KEY} characters"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Environment variables loaded"
echo ""

# Update Mainnet.toml with secret key from .env
echo "📝 Updating Mainnet.toml with secret key..."

# Create a temporary Mainnet.toml with the secret key
cat > settings/Mainnet.toml << EOF
[network]
name = "mainnet"
stacks_node_rpc_address = "https://api.hiro.so"
deployment_fee_rate = ${DEPLOYMENT_FEE_RATE:-10}

[accounts.deployer]
secret_key = "${DEPLOYER_SECRET_KEY}"
EOF

echo "✅ Configuration updated"
echo ""

# Check contract syntax
echo "🔍 Checking contract syntax..."
clarinet check
echo ""

# Generate deployment plan
echo "📋 Generating deployment plan..."
clarinet deployments generate --mainnet
echo ""

# Show deployment plan
echo "📄 Deployment Plan:"
echo "-------------------"
cat deployments/default.mainnet-plan.yaml
echo ""

# Confirm deployment
echo "⚠️  WARNING: You are about to deploy to MAINNET!"
echo "This will cost real STX tokens."
echo ""
read -p "Do you want to proceed with the deployment? (yes/no) " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

# Apply deployment
echo "🚀 Deploying to mainnet..."
clarinet deployments apply --mainnet

echo ""
echo "✅ Deployment complete!"
echo "Check your contract on: https://explorer.stacks.co/"

