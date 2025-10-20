# VyFinance Swap API Documentation

REST API for estimating and building swaps on VyFinance DEX using Dexter SDK.

## Base URL

```
http://localhost:3000/api/swap
```

## Authentication

No authentication required for estimation endpoints. Transaction building would require wallet integration.

## Endpoints

### 1. Health Check

Check if the API server is running.

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-10-20T12:00:00.000Z",
  "uptime": 123.45
}
```

---

### 2. Estimate Swap

Calculate estimated output, price impact, and price for a swap on VyFinance.

**Endpoint**: `POST /api/swap/estimate`

**Request Body**:
```json
{
  "swapInAsset": "lovelace",
  "swapInAmount": "1000000",
  "swapOutAsset": "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d",
  "decimalsIn": 6,
  "decimalsOut": 6
}
```

**Parameters**:
- `swapInAsset` (string, required): Asset to swap from. Use `"lovelace"` for ADA or policyId.assetName format
- `swapInAmount` (string, required): Amount to swap in (in smallest unit, e.g., lovelaces)
- `swapOutAsset` (string, required): Asset to swap to
- `decimalsIn` (number, optional): Decimals for input asset (default: 6)
- `decimalsOut` (number, optional): Decimals for output asset (default: 6)

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "pool": {
      "address": "addr1...",
      "dex": "VyFinance",
      "assetA": "lovelace",
      "assetB": "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d"
    },
    "swap": {
      "swapInAsset": "lovelace",
      "swapInAmount": "1000000",
      "swapOutAsset": "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d",
      "estimatedReceive": "95000",
      "priceImpactPercent": 0.5,
      "pricePerUnit": "95"
    }
  }
}
```

**Error Responses**:

400 Bad Request:
```json
{
  "error": "Bad Request",
  "message": "Missing required fields: swapInAsset, swapInAmount, swapOutAsset"
}
```

404 Not Found:
```json
{
  "error": "Pool Not Found",
  "message": "No VyFinance pool found for lovelace / c48cbb..."
}
```

---

### 3. Build Swap Transaction

Build a swap transaction (currently returns 501 - requires wallet integration).

**Endpoint**: `POST /api/swap/build`

**Request Body**:
```json
{
  "swapInAsset": "lovelace",
  "swapInAmount": "1000000",
  "swapOutAsset": "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d",
  "walletAddress": "addr1...",
  "slippagePercent": 1.0,
  "decimalsIn": 6,
  "decimalsOut": 6
}
```

**Parameters**:
- `swapInAsset` (string, required): Asset to swap from
- `swapInAmount` (string, required): Amount to swap
- `swapOutAsset` (string, required): Asset to swap to
- `walletAddress` (string, required): User's wallet address
- `slippagePercent` (number, optional): Max slippage tolerance (default: 1.0)
- `decimalsIn` (number, optional): Decimals for input asset
- `decimalsOut` (number, optional): Decimals for output asset

**Response** (501 Not Implemented):
```json
{
  "error": "Not Implemented",
  "message": "Building swap transactions requires wallet provider integration...",
  "suggestion": "To build transactions: 1) Use estimate endpoint, 2) Connect wallet via CIP-30, 3) Use Dexter's buildSwapOrder method"
}
```

---

### 4. Get VyFinance Pools

Fetch available liquidity pools on VyFinance.

**Endpoint**: `GET /api/swap/pools`

**Query Parameters**:
- `assetA` (string, optional): Filter by first asset
- `assetB` (string, optional): Filter by second asset
- `decimalsA` (string, optional): Decimals for assetA (default: "6")
- `decimalsB` (string, optional): Decimals for assetB (default: "6")

**Examples**:

Get all VyFinance pools:
```
GET /api/swap/pools
```

Get pools for specific pair:
```
GET /api/swap/pools?assetA=lovelace&assetB=c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "count": 2,
    "pools": [
      {
        "address": "addr1...",
        "dex": "VyFinance",
        "assetA": {
          "identifier": "lovelace",
          "name": "ADA"
        },
        "assetB": {
          "identifier": "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d",
          "name": "USSDM"
        }
      }
    ]
  }
}
```

---

### 5. Get DEX Information

Get information about VyFinance DEX and configured data provider.

**Endpoint**: `GET /api/swap/info`

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "dex": "VyFinance",
    "swapFees": [
      {
        "asset": "lovelace",
        "amount": "2000000"
      }
    ],
    "dataProvider": "Blockfrost"
  }
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

**Common HTTP Status Codes**:
- `200` - Success
- `400` - Bad Request (invalid input)
- `404` - Not Found (pool doesn't exist)
- `500` - Internal Server Error
- `501` - Not Implemented (feature not available yet)

---

## Examples

### Using cURL

**Estimate a swap**:
```bash
curl -X POST http://localhost:3000/api/swap/estimate \
  -H "Content-Type: application/json" \
  -d '{
    "swapInAsset": "lovelace",
    "swapInAmount": "1000000",
    "swapOutAsset": "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d"
  }'
```

**Get all pools**:
```bash
curl http://localhost:3000/api/swap/pools
```

**Get DEX info**:
```bash
curl http://localhost:3000/api/swap/info
```

### Using JavaScript/Fetch

```javascript
// Estimate swap
const response = await fetch('http://localhost:3000/api/swap/estimate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    swapInAsset: 'lovelace',
    swapInAmount: '1000000',
    swapOutAsset: 'c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d',
  }),
});

const data = await response.json();
console.log(data);
```

### Using Python/Requests

```python
import requests

# Estimate swap
response = requests.post('http://localhost:3000/api/swap/estimate', json={
    'swapInAsset': 'lovelace',
    'swapInAmount': '1000000',
    'swapOutAsset': 'c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d'
})

data = response.json()
print(data)
```

---

## Asset Identifiers

### ADA (Lovelace)
Use the string `"lovelace"` or `"ada"` (case-insensitive).

### Native Tokens
Format: `policyId.assetName` or just `policyId`

Example:
```
c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d
```

---

## Data Providers

The API supports two data providers:

### Blockfrost (Default)
- Easier setup
- Slower for large queries
- Configure via:
  ```env
  BLOCKFROST_PROJECT_ID=your_project_id
  BLOCKFROST_URL=https://cardano-mainnet.blockfrost.io/api/v0
  ```

### Kupo (Recommended)
- Much faster
- Requires self-hosting
- Configure via:
  ```env
  KUPO_URL=http://localhost:1442
  ```

---

## Running the API

### Development Mode
```bash
yarn api:dev
```

### Production Mode
```bash
yarn build
yarn api
```

### Environment Variables

Create a `.env` file:
```env
# Data Provider (choose one)
BLOCKFROST_PROJECT_ID=mainnet_your_project_id
BLOCKFROST_URL=https://cardano-mainnet.blockfrost.io/api/v0

# OR use Kupo (faster)
# KUPO_URL=http://localhost:1442

# API Server
PORT=3000
```

---

## Notes

1. **Transaction Building**: The `/build` endpoint is not fully implemented as it requires CIP-30 wallet integration, which is typically done in a frontend application.

2. **Pool Discovery**: Fetching all pools may be slow with Blockfrost. Consider using Kupo for better performance.

3. **Amount Format**: All amounts should be in the smallest unit (e.g., lovelaces for ADA, not ADA).

4. **Decimals**: Most Cardano native tokens use 6 decimals, but verify for each specific token.

5. **Price Impact**: A price impact > 5% is generally considered high and may indicate low liquidity.

---

## Support

For issues or questions:
- Check [DATA_PROVIDERS.md](DATA_PROVIDERS.md) for setup help
- Review [SETUP.md](SETUP.md) for troubleshooting
- See [Dexter documentation](https://github.com/IndigoProtocol/dexter)
