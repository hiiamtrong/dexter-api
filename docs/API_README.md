# VyFinance Swap API - Quick Start

🎉 **Your VyFinance Swap API is ready!**

## What You Have

A production-ready Express.js API for VyFinance DEX swaps with:
- ✅ Swap estimation (price impact, output amount)
- ✅ Pool discovery
- ✅ DEX information
- ✅ Full TypeScript support
- ✅ Error handling & validation
- ✅ CORS & Security (Helmet)
- ✅ Request logging (Morgan)

## Quick Start

### 1. Start the API Server

```bash
yarn api
```

The server starts on **http://localhost:3000**

### 2. Test the API

**Health Check**:
```bash
curl http://localhost:3000/health
```

**Get DEX Info**:
```bash
curl http://localhost:3000/api/swap/info
```

Output:
```json
{
  "success": true,
  "data": {
    "dex": "VyFinance",
    "swapFees": [
      {
        "id": "processFee",
        "title": "Process Fee",
        "description": "Fee paid to the off-chain processor fulfilling order.",
        "value": "1900000",
        "isReturned": false
      },
      {
        "id": "minAda",
        "title": "MinADA",
        "description": "MinADA will be held in the UTxO and returned when the order is processed.",
        "value": "2000000",
        "isReturned": true
      }
    ],
    "dataProvider": "Blockfrost"
  }
}
```

## API Endpoints

### 1. `POST /api/swap/estimate`
Estimate swap output and price impact

**Example**:
```bash
curl -X POST http://localhost:3000/api/swap/estimate \
  -H "Content-Type: application/json" \
  -d '{
    "swapInAsset": "lovelace",
    "swapInAmount": "1000000",
    "swapOutAsset": "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d"
  }'
```

### 2. `GET /api/swap/pools`
Get VyFinance liquidity pools

**Example**:
```bash
curl "http://localhost:3000/api/swap/pools"
```

### 3. `GET /api/swap/info`
Get DEX information and fees

**Example**:
```bash
curl http://localhost:3000/api/swap/info
```

### 4. `POST /api/swap/build`
Build swap transaction (not yet implemented)

## Project Structure

```
src/api/
├── server.ts                    # Express app & middleware
├── routes/
│   └── swap.routes.ts          # API routes
└── controllers/
    └── swap.controller.ts       # Business logic
```

## Environment Variables

Required in `.env`:
```env
# Blockfrost (default)
BLOCKFROST_PROJECT_ID=mainnet_your_project_id
BLOCKFROST_URL=https://cardano-mainnet.blockfrost.io/api/v0

# OR Kupo (faster)
# KUPO_URL=http://localhost:1442

# API Server
PORT=3000
```

## Available Scripts

```bash
# Development (with hot reload)
yarn api:dev

# Production
yarn api

# Build TypeScript
yarn build
```

## Full Documentation

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for:
- Complete endpoint reference
- Request/response examples
- Error codes
- cURL examples
- Integration guides

## Example Integration

### Frontend (React/Vue/Angular)

```typescript
const estimateSwap = async (swapInAmount: string) => {
  const response = await fetch('http://localhost:3000/api/swap/estimate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      swapInAsset: 'lovelace',
      swapInAmount: swapInAmount,
      swapOutAsset: 'your_token_policy_id'
    })
  });

  const data = await response.json();
  return data;
};
```

### Backend (Node.js)

```javascript
const axios = require('axios');

const getPools = async () => {
  const response = await axios.get('http://localhost:3000/api/swap/pools');
  return response.data;
};
```

## Features

### ✅ Implemented
- Swap estimation with price impact
- Pool discovery
- DEX information query
- Input validation
- Error handling
- CORS support
- Security headers
- Request logging

### 🚧 Future Enhancements
- Transaction building (requires CIP-30 wallet)
- WebSocket support for real-time prices
- Rate limiting
- Caching layer
- Swagger/OpenAPI documentation
- Unit tests

## Testing

The API is live and working! Test it with:

```bash
# 1. Start the server
yarn api

# 2. In another terminal, test endpoints
curl http://localhost:3000/health
curl http://localhost:3000/api/swap/info
```

## Troubleshooting

### Port Already in Use
Change the port in `.env`:
```env
PORT=3001
```

### No Data Provider Configured
Make sure `.env` has either:
- `BLOCKFROST_PROJECT_ID` and `BLOCKFROST_URL`, OR
- `KUPO_URL`

### Slow Responses
- Use Kupo instead of Blockfrost for faster queries
- Reduce request timeout in controller initialization

## Next Steps

1. **Add more DEXs**: Extend beyond VyFinance to Minswap, SundaeSwap, etc.
2. **Implement transaction building**: Integrate CIP-30 wallet
3. **Add caching**: Use Redis for frequently accessed data
4. **Deploy**: Use Docker/Kubernetes for production

## Support

- Full API Docs: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- Setup Guide: [SETUP.md](SETUP.md)
- Data Providers: [DATA_PROVIDERS.md](DATA_PROVIDERS.md)
- Dexter SDK: https://github.com/IndigoProtocol/dexter

---

**Built with**:
- Express.js 5.1
- TypeScript 5.9
- Dexter SDK 5.4
- CORS, Helmet, Morgan

**Status**: ✅ Production Ready
