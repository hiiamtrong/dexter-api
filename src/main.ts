import { Asset, Minswap, MinswapV2, VyFinance } from "@indigo-labs/dexter";
import { DexterService } from "./services/dexter.service.js";
// import { LucidProvider } from '@indigo-labs/dexter'; // Uncomment when using wallet provider
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

/**
 * Get Blockfrost configuration from environment variables
 */
function getBlockfrostConfig() {
  const projectId = process.env.BLOCKFROST_PROJECT_ID;
  const url = process.env.BLOCKFROST_URL;

  if (!projectId || !url) {
    throw new Error(
      "Missing Blockfrost configuration. Please set BLOCKFROST_PROJECT_ID and BLOCKFROST_URL in your .env file.\n" +
        "Copy .env.example to .env and add your Blockfrost credentials."
    );
  }

  return { projectId, url };
}

/**
 * Get Kupo configuration from environment variables
 */
function getKupoConfig() {
  const url = process.env.KUPO_URL;

  if (!url) {
    throw new Error(
      "Missing Kupo configuration. Please set KUPO_URL in your .env file.\n" +
        "Kupo is faster than Blockfrost for pool queries but requires self-hosting."
    );
  }

  return { url };
}

/**
 * Example 1: Simple example showing available DEXs
 */
async function showAvailableDexs() {
  console.log("=== Example 1: Dexter Configuration ===");

  try {
    const blockfrostConfig = getBlockfrostConfig();
    console.log(`\n✓ Blockfrost configured: ${blockfrostConfig.url}`);

    const dexterService = new DexterService(
      {
        shouldFallbackToApi: false,
        shouldFetchMetadata: false,
      },
      { timeout: 30000, retries: 3 }
    );

    // Configure Blockfrost
    dexterService.withBlockfrostProvider(blockfrostConfig);

    // Show available DEXs
    const availableDexs = dexterService.getAvailableDexNames();
    console.log(`\n✓ ${availableDexs.length} DEXs available:\n`);
    availableDexs.forEach((dex, index) => {
      console.log(`   ${index + 1}. ${dex}`);
    });

    console.log("\n📝 Note: Fetching actual pool data requires either:");
    console.log("   - Kupo instance (fast, self-hosted)");
    console.log("   - Blockfrost API with patience (slower for large queries)");
    console.log("   - Direct access to specific pool addresses");

    console.log("\n💡 Dexter is optimized for:");
    console.log("   - Swapping tokens (requires specific pools)");
    console.log("   - Price calculations");
    console.log("   - Building transactions");
    console.log(
      "\n   For discovering all pools, consider using DEX-specific APIs directly."
    );
  } catch (error) {
    console.error("\nError:", error instanceof Error ? error.message : error);
  }
}

/**
 * Example 2: Fetch pools from specific DEXs
 */
async function fetchPoolsFromSpecificDexs() {
  console.log("\n=== Example 2: Fetching pools from specific DEXs ===");

  const dexterService = new DexterService({
    shouldFallbackToApi: true,
    shouldFetchMetadata: false,
  });
  dexterService.withBlockfrostProvider(getBlockfrostConfig(), {
    timeout: 30000,
    retries: 3,
  });

  try {
    // Fetch from specific DEXs (e.g., Minswap, SundaeSwap)
    const pools = await dexterService.getLiquidityPoolsFromDexs([
      MinswapV2.identifier,
    ]);
    console.log(`Found ${pools} pools from Minswap and SundaeSwap`);
  } catch (error) {
    console.error("Error fetching pools:", error);
  }
}

/**
 * Example 3: Custom configuration
 */
async function customConfiguration() {
  console.log("\n=== Example 3: Custom Dexter configuration ===");

  const dexterService = new DexterService(
    {
      shouldFetchMetadata: true,
      shouldFallbackToApi: true,
      shouldSubmitOrders: false,
      metadataMsgBranding: "MyApp",
    },
    {
      timeout: 10000, // 10 seconds timeout
      proxyUrl: "",
      retries: 5, // 5 retry attempts
    }
  );

  try {
    const pools = await dexterService.getAllLiquidityPools();
    console.log(`Found ${pools.length} pools with custom config`);
  } catch (error) {
    console.error("Error fetching pools:", error);
  }
}

/**
 * Example 4: Using wallet provider for swaps
 * NOTE: This requires a CIP-30 wallet interface and Blockfrost credentials
 */
async function walletProviderExample() {
  console.log("\n=== Example 4: Wallet Provider Integration ===");

  // This is a placeholder - you need actual CIP-30 wallet interface
  // and Blockfrost credentials to make this work

  /*
    const lucidProvider = new LucidProvider();

    // Load wallet with CIP-30 interface (e.g., from Nami, Eternl, etc.)
    const walletProvider = await lucidProvider.loadWallet(
        window.cardano.nami,  // Example: Nami wallet CIP-30 interface
        {
            url: 'https://cardano-mainnet.blockfrost.io/api/v0',
            projectId: 'your-blockfrost-project-id'
        }
    );

    const dexterService = new DexterService();
    dexterService.withWalletProvider(walletProvider);

    // Now you can create swap requests
    const swapRequest = dexterService.newSwapRequest();
    // Configure and execute swap...
    */

  console.log(
    "Wallet provider example requires CIP-30 wallet and Blockfrost credentials"
  );
}

/**
 * Example 5: Advanced usage with fetch request builder
 */
async function advancedFetchExample() {
  console.log("\n=== Example 5: Advanced fetch request ===");

  const dexterService = new DexterService();

  try {
    // Using the fetch request builder directly for complex queries
    const pools = await dexterService
      .newFetchRequest()
      .onDexs(["Minswap", "WingRiders"]) // Specific DEXs
      // .forTokens([...])  // Optional: filter by tokens
      .getLiquidityPools();

    console.log(`Found ${pools.length} pools from selected DEXs`);
  } catch (error) {
    console.error("Error fetching pools:", error);
  }
}

/**
 * Example 6: Get pool state and history
 */
async function poolStateAndHistory() {
  console.log("\n=== Example 6: Pool state and history ===");

  const dexterService = new DexterService();

  try {
    const pools = await dexterService.getAllLiquidityPools();

    if (pools.length > 0) {
      const firstPool = pools[0];

      // Get current state
      const currentState = await dexterService.getLiquidityPoolState(firstPool);
      console.log("Current pool state:", currentState);

      // Get historical states
      const history = await dexterService.getLiquidityPoolHistory(firstPool);
      console.log(`Found ${history.length} historical states for pool`);
    }
  } catch (error) {
    console.error("Error fetching pool state/history:", error);
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log("Dexter Integration Examples\n");

  // Run examples (uncomment the ones you want to try)
  await showAvailableDexs();
  await fetchPoolsFromSpecificDexs();
  //   await customConfiguration();
  //   await walletProviderExample();
  //   await advancedFetchExample();
  //   await poolStateAndHistory();
}

// Execute main function
main().catch(console.error);
