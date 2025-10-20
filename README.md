# Spidex Dexter Integration

A TypeScript project integrating [Dexter](https://github.com/IndigoProtocol/dexter), a customizable SDK for interacting with Cardano DEXs.

## Features

- **DexterService**: A clean service wrapper around the Dexter SDK
- **Liquidity Pool Management**: Fetch and monitor pools across multiple DEXs
- **Wallet Integration**: Support for CIP-30 wallets via Lucid
- **TypeScript**: Full type safety with ES modules
- **Examples**: Comprehensive usage examples

## Installation

```bash
# Install dependencies
yarn install

# Or with npm
npm install
```

## Setup

### 1. Configure Blockfrost

To fetch real data from Cardano DEXs, you need a Blockfrost API key:

1. Go to [https://blockfrost.io](https://blockfrost.io) and sign up for a free account
2. Create a new project (Mainnet or Testnet)
3. Copy your project ID
4. Create a `.env` file in the project root:

```bash
cp .env.example .env
```

5. Edit `.env` and add your Blockfrost credentials:

```env
BLOCKFROST_PROJECT_ID=your_actual_project_id_here
BLOCKFROST_URL=https://cardano-mainnet.blockfrost.io/api/v0
```

**Note**: The `.env` file is already in `.gitignore` to protect your credentials.

## Usage

### Running the Examples

```bash
# Run the main script
yarn start

# Run in development mode with watch (auto-reload on changes)
yarn dev

# Build TypeScript to JavaScript
yarn build

# Run the compiled JavaScript
yarn start:prod
```

### Quick Start

```typescript
import { DexterService } from './services/dexter.service.js';
import dotenv from 'dotenv';

dotenv.config();

// Create a Dexter service instance
const dexterService = new DexterService();

// Configure Blockfrost provider (required for real data)
dexterService.withBlockfrostProvider({
    url: process.env.BLOCKFROST_URL!,
    projectId: process.env.BLOCKFROST_PROJECT_ID!
});

// Fetch all liquidity pools from all DEXs
const pools = await dexterService.getAllLiquidityPools();
console.log(`Found ${pools.length} pools`);

// Fetch from specific DEXs
const minswapPools = await dexterService.getLiquidityPoolsFromDexs(['Minswap', 'SundaeSwap']);
```

### Custom Configuration

```typescript
const dexterService = new DexterService(
    {
        shouldFetchMetadata: true,      // Fetch asset metadata
        shouldFallbackToApi: true,      // Fallback to DEX API on failure
        shouldSubmitOrders: false,      // Don't auto-submit orders
        metadataMsgBranding: 'MyApp',   // Custom branding
    },
    {
        timeout: 10000,                 // Request timeout (ms)
        proxyUrl: '',                   // CORS proxy URL
        retries: 5,                     // Retry attempts
    }
);
```

### Wallet Integration

```typescript
import { LucidProvider } from '@indigo-labs/dexter';

const lucidProvider = new LucidProvider();

// Load wallet with CIP-30 interface (e.g., Nami, Eternl, etc.)
const walletProvider = await lucidProvider.loadWallet(
    window.cardano.nami,  // CIP-30 wallet interface
    {
        url: 'https://cardano-mainnet.blockfrost.io/api/v0',
        projectId: 'your-blockfrost-project-id'
    }
);

// Attach wallet to service
dexterService.withWalletProvider(walletProvider);

// Now you can create swap requests
const swapRequest = dexterService.newSwapRequest();
```

## API Reference

### DexterService

#### Methods

- `getAllLiquidityPools()`: Fetch pools from all DEXs
- `getLiquidityPoolsFromDexs(dexNames)`: Fetch from specific DEXs
- `getLiquidityPoolsForTokens(tokens, dexNames?)`: Filter pools by tokens
- `getLiquidityPoolsForTokenPairs(tokenPairs, dexNames?)`: Filter by token pairs
- `getLiquidityPoolState(pool)`: Get current pool state
- `getLiquidityPoolHistory(pool)`: Get historical states
- `withWalletProvider(provider)`: Attach wallet provider
- `newFetchRequest()`: Access fetch request builder
- `newSwapRequest()`: Create swap request (requires wallet)
- `getDexterInstance()`: Get underlying Dexter instance

## Project Structure

```
spidex-dexter/
├── src/
│   ├── main.ts                    # Example usage and entry point
│   └── services/
│       └── dexter.service.ts      # DexterService wrapper class
├── dist/                          # Compiled JavaScript (after build)
├── package.json                   # Project dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
└── README.md                      # This file
```

## Development

### Prerequisites

- Node.js 18+ or higher
- Yarn or npm

### Scripts

- `yarn start` - Run the main.ts file
- `yarn dev` - Run in watch mode (auto-reload)
- `yarn build` - Compile TypeScript to JavaScript
- `yarn build:watch` - Build in watch mode
- `yarn start:prod` - Run compiled JavaScript

### Example Scenarios

The [main.ts](src/main.ts) file includes several examples:

1. **Basic Pool Fetching**: Get all liquidity pools
2. **DEX-Specific Queries**: Query specific DEXs
3. **Custom Configuration**: Use custom timeouts and settings
4. **Wallet Provider**: Connect a wallet for swaps
5. **Advanced Queries**: Complex fetch requests
6. **Pool State & History**: Monitor pool changes

## Dependencies

- `@indigo-labs/dexter` - Cardano DEX aggregator SDK
- `typescript` - TypeScript compiler
- `tsx` - TypeScript execution engine

## Resources

- [Dexter GitHub](https://github.com/IndigoProtocol/dexter)
- [Dexter Documentation](https://docs.indigoprotocol.io/dexter)
- [Cardano Developer Portal](https://developers.cardano.org/)

## License

MIT
