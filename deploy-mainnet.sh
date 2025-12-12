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

MNEMONIC_LINE=$(grep -E '^DEPLOYER_MNEMONIC=' .env || true)
if [ -z "$MNEMONIC_LINE" ]; then
    echo "❌ Error: DEPLOYER_MNEMONIC is not set in .env file"
    echo "Please add your Stacks mainnet 24-word mnemonic to .env"
    exit 1
fi

# Extract mnemonic keeping spaces, strip leading var name and any surrounding quotes
DEPLOYER_MNEMONIC=$(echo "$MNEMONIC_LINE" | sed 's/^DEPLOYER_MNEMONIC=//' | sed 's/^\"\?//; s/\"\?$//')

# Count words in mnemonic
WORD_COUNT=$(echo "$DEPLOYER_MNEMONIC" | wc -w | tr -d ' ')
if [ "$WORD_COUNT" -ne 24 ]; then
    echo "⚠️  Warning: Mnemonic should be 24 words, got $WORD_COUNT words"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Environment variables loaded"
echo ""

# Update Mainnet.toml with mnemonic from .env
echo "📝 Updating Mainnet.toml with mnemonic..."

cat > settings/Mainnet.toml << EOF
[network]
name = "mainnet"
stacks_node_rpc_address = "https://api.hiro.so"
deployment_fee_rate = ${DEPLOYMENT_FEE_RATE:-10}

[accounts.deployer]
mnemonic = "${DEPLOYER_MNEMONIC}"
EOF

echo "✅ Mainnet settings updated"

echo "🔍 Checking contracts syntax..."
clarinet check

echo "🛠️ Generating mainnet deployment plan (low cost)..."
clarinet deployments generate --mainnet --low-cost << ANSWERS
y
ANSWERS

echo "🚀 Applying mainnet deployment plan..."
clarinet deployments apply --mainnet

echo "✅ Deployment complete"
