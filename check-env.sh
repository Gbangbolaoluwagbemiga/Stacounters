#!/bin/bash
source .env
if [ -z "$DEPLOYER_SECRET_KEY" ] || [ "$DEPLOYER_SECRET_KEY" = "" ]; then
    echo "❌ DEPLOYER_SECRET_KEY is empty"
    exit 1
fi
if [ ${#DEPLOYER_SECRET_KEY} -eq 64 ]; then
    echo "✅ Secret key format is correct (64 characters)"
elif [ ${#DEPLOYER_SECRET_KEY} -eq 66 ] && [[ "$DEPLOYER_SECRET_KEY" == 0x* ]]; then
    echo "⚠️  Secret key has 0x prefix, will be handled"
    echo "✅ Secret key format is correct (66 characters with 0x)"
else
    echo "⚠️  Secret key length is ${#DEPLOYER_SECRET_KEY}, expected 64 (or 66 with 0x)"
fi
