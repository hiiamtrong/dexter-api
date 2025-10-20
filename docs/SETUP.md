# Setup Guide

## Getting Started with Blockfrost

Follow these steps to get your project running with real Cardano DEX data:

### Step 1: Get Blockfrost API Credentials

1. Visit [https://blockfrost.io](https://blockfrost.io)
2. Click "Sign Up" and create a free account
3. After logging in, click "Add Project"
4. Choose your network:
   - **Mainnet** - Real Cardano network (production data)
   - **Preprod** - Testnet for development
   - **Preview** - Another testnet option
5. Copy your **Project ID** (it looks like `mainnet1234567890abcdef`)

### Step 2: Configure Your Environment

1. In your project directory, copy the example env file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in your editor and replace the placeholder values:
   ```env
   # For Mainnet
   BLOCKFROST_PROJECT_ID=mainnet1234567890abcdef
   BLOCKFROST_URL=https://cardano-mainnet.blockfrost.io/api/v0

   # For Preprod Testnet (comment out mainnet and uncomment these)
   # BLOCKFROST_PROJECT_ID=preprod1234567890abcdef
   # BLOCKFROST_URL=https://cardano-preprod.blockfrost.io/api/v0
   ```

3. Save the file

### Step 3: Run the Examples

```bash
# Install dependencies (if you haven't already)
yarn install

# Run the main script
yarn start
```

You should see output like:
```
=== Example 1: Fetching all liquidity pools with Blockfrost ===
Connected to: https://cardano-mainnet.blockfrost.io/api/v0

Found 1234 liquidity pools

First 3 pools:

1. Minswap Pool:
   Address: addr1...
   Assets: ADA / MIN

2. SundaeSwap Pool:
   Address: addr1...
   Assets: ADA / SUNDAE

3. WingRiders Pool:
   Address: addr1...
   Assets: ADA / WRT
```

## Troubleshooting

### "Missing Blockfrost configuration" Error

This means your `.env` file is missing or the variables aren't set correctly.

**Solution:**
1. Make sure `.env` exists in the project root
2. Check that `BLOCKFROST_PROJECT_ID` and `BLOCKFROST_URL` are set
3. Remove any quotes around the values
4. Make sure there are no extra spaces

### "Invalid project ID" or API Errors

This usually means your Blockfrost project ID is incorrect or expired.

**Solution:**
1. Go to [blockfrost.io](https://blockfrost.io) and check your project
2. Make sure you're using the correct network (mainnet vs testnet)
3. Verify your project ID is copied correctly
4. Check if you've exceeded the free tier limits

### No Pools Found (returns 0 pools)

If you're getting 0 pools but no errors:

**Solution:**
1. Make sure you're connected to Blockfrost (not running without a data provider)
2. Check that the network has active DEX pools
3. Try a different DEX or use `.onAllDexs()` to query all DEXs

## Network Information

### Mainnet
- **URL**: `https://cardano-mainnet.blockfrost.io/api/v0`
- **Use for**: Production, real data, actual pools with liquidity
- **Project ID prefix**: `mainnet`

### Preprod Testnet
- **URL**: `https://cardano-preprod.blockfrost.io/api/v0`
- **Use for**: Development and testing
- **Project ID prefix**: `preprod`
- **Note**: May have fewer pools than mainnet

### Preview Testnet
- **URL**: `https://cardano-preview.blockfrost.io/api/v0`
- **Use for**: Early testing of new features
- **Project ID prefix**: `preview`

## Free Tier Limits

Blockfrost free tier includes:
- 50,000 requests per day
- Rate limited to prevent abuse
- Perfect for development and small projects

If you need more, check [Blockfrost pricing](https://blockfrost.io/#pricing).

## Next Steps

Once you have data flowing:
1. Explore the examples in [main.ts](src/main.ts)
2. Check the [README.md](README.md) for API documentation
3. Read about the [DexterService](src/services/dexter.service.ts) methods
4. Learn about wallet integration for swaps

Happy coding!
