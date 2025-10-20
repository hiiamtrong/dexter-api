# Data Provider Guide

Dexter supports two main data providers for querying Cardano blockchain data. Choose the one that best fits your needs.

## Quick Comparison

| Feature | Blockfrost | Kupo |
|---------|-----------|------|
| **Setup Difficulty** | Easy (cloud service) | Medium (self-hosted) |
| **Speed** | Slower for pool queries | Much faster |
| **Cost** | Free tier available | Free (self-hosted) |
| **Reliability** | High | Depends on your setup |
| **Best For** | Quick start, prototyping | Production, high performance |

## Option 1: Blockfrost (Recommended for Getting Started)

### Pros:
- ✅ Easy to set up (just sign up and get API key)
- ✅ No infrastructure to manage
- ✅ Free tier includes 50,000 requests/day
- ✅ Reliable uptime

### Cons:
- ❌ Slower for fetching large pool lists
- ❌ Rate limited on free tier
- ❌ May timeout when fetching all pools from all DEXs

### Setup:

1. Go to [https://blockfrost.io](https://blockfrost.io)
2. Create a free account
3. Create a new project (Mainnet or Preprod)
4. Copy your project ID
5. Add to `.env`:
   ```env
   BLOCKFROST_PROJECT_ID=mainnet_your_project_id_here
   BLOCKFROST_URL=https://cardano-mainnet.blockfrost.io/api/v0
   ```

### Usage:

```typescript
import { DexterService } from './services/dexter.service.js';

const dexterService = new DexterService();

// Configure Blockfrost
dexterService.withBlockfrostProvider({
    url: process.env.BLOCKFROST_URL!,
    projectId: process.env.BLOCKFROST_PROJECT_ID!
});

// Fetch pools (works but may be slow)
const pools = await dexterService.getLiquidityPoolsFromDexs('Minswap');
```

## Option 2: Kupo (Recommended for Production)

### Pros:
- ✅ Much faster for pool queries
- ✅ No rate limits (self-hosted)
- ✅ Direct access to UTxO data
- ✅ Free (if you host it yourself)

### Cons:
- ❌ Requires running your own Kupo instance
- ❌ Needs Cardano node sync
- ❌ More complex infrastructure
- ❌ You're responsible for uptime

### What is Kupo?

Kupo is a lightweight chain-follower for Cardano. It indexes UTxOs and makes them queryable via a REST API. It's specifically designed for DEX and DeFi applications.

- **GitHub**: [https://github.com/CardanoSolutions/kupo](https://github.com/CardanoSolutions/kupo)
- **Docs**: [https://cardanosolutions.github.io/kupo/](https://cardanosolutions.github.io/kupo/)

### Setup Options:

#### A. Self-Host with Docker (Recommended)

```bash
# 1. Run Cardano Node (required)
docker run -d \
  --name cardano-node \
  -v cardano-node-data:/data \
  inputoutput/cardano-node:latest

# 2. Run Kupo
docker run -d \
  --name kupo \
  --link cardano-node \
  -p 1442:1442 \
  cardanosolutions/kupo:latest \
  --node-socket /path/to/node.socket \
  --node-config /path/to/config.json \
  --since origin \
  --match "*" \
  --workdir /data
```

#### B. Use a Public Kupo Instance

Some community members run public Kupo instances:
- Check Cardano developer Discord
- Use with caution (may have rate limits)

#### C. Cloud Hosting (Demeter.run)

[Demeter.run](https://demeter.run) provides managed Cardano infrastructure including Kupo.

### Configuration:

Add to `.env`:
```env
KUPO_URL=http://localhost:1442  # Or your Kupo instance URL
```

### Usage:

```typescript
import { DexterService } from './services/dexter.service.js';

const dexterService = new DexterService();

// Configure Kupo (much faster than Blockfrost)
dexterService.withKupoProvider({
    url: process.env.KUPO_URL!
});

// Fetch pools (much faster!)
const pools = await dexterService.getLiquidityPoolsFromDexs('Minswap');
```

## Performance Comparison

### Fetching Minswap Pools:

| Provider | Time | Notes |
|----------|------|-------|
| Blockfrost | 30-60s | May timeout on free tier |
| Kupo | 2-5s | Direct UTxO access |
| DEX API Fallback | 5-10s | Limited pool data |

## Recommendations by Use Case

### 🚀 Quick Prototyping
**Use**: Blockfrost
- Fast setup
- No infrastructure
- Perfect for testing

### 🏗️ Development
**Use**: Blockfrost or Local Kupo
- Blockfrost for simplicity
- Local Kupo for realistic performance testing

### 🎯 Production
**Use**: Kupo
- Much faster queries
- No rate limits
- Better user experience

### 📊 High Volume
**Use**: Kupo + Backup Blockfrost
- Primary: Kupo for speed
- Fallback: Blockfrost for reliability

## Hybrid Approach

You can configure both and switch between them:

```typescript
const dexterService = new DexterService({
    shouldFallbackToApi: true  // Fallback to DEX APIs if provider fails
});

// Try Kupo first
if (process.env.KUPO_URL) {
    dexterService.withKupoProvider({ url: process.env.KUPO_URL });
} else {
    // Fall back to Blockfrost
    dexterService.withBlockfrostProvider({
        url: process.env.BLOCKFROST_URL!,
        projectId: process.env.BLOCKFROST_PROJECT_ID!
    });
}
```

## Current Status

With your current setup:
- ✅ You have a valid Blockfrost API key configured
- ❌ Kupo is not configured (requires setup)
- ⚠️ Fetching all pools is slow/timing out with Blockfrost

## Next Steps

### For Immediate Testing:
1. Keep using Blockfrost
2. Query specific DEXs instead of all at once
3. Use `shouldFallbackToApi: true` to use DEX public APIs

### For Production:
1. Set up Kupo instance
2. Configure `KUPO_URL` in `.env`
3. Switch to Kupo provider for fast queries

## Troubleshooting

### Blockfrost Issues:
- **Slow queries**: Normal for large pool lists
- **Rate limits**: Upgrade plan or add delays
- **Timeouts**: Fetch fewer pools at once

### Kupo Issues:
- **Connection refused**: Check Kupo is running
- **Empty results**: Wait for full sync
- **Outdated data**: Check sync status

## Resources

- [Blockfrost Documentation](https://docs.blockfrost.io/)
- [Kupo GitHub](https://github.com/CardanoSolutions/kupo)
- [Dexter Documentation](https://github.com/IndigoProtocol/dexter)
- [Demeter.run](https://demeter.run) - Managed Cardano infrastructure
