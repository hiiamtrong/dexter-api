import {
  Dexter,
  DexterConfig,
  RequestConfig,
  LiquidityPool,
  BaseWalletProvider,
  Token,
  BlockfrostProvider,
  BlockfrostConfig,
  KupoProvider,
  KupoConfig,
  Asset,
} from "@indigo-labs/dexter";

/**
 * Service class for managing Dexter DEX aggregator interactions
 */
export class DexterService {
  private dexter: Dexter;
  private walletProvider?: BaseWalletProvider;
  private blockfrostProvider?: BlockfrostProvider;
  private kupoProvider?: KupoProvider;

  constructor(
    dexterConfig?: Partial<DexterConfig>,
    requestConfig?: Partial<RequestConfig>
  ) {
    // Default Dexter configuration
    const defaultDexterConfig: DexterConfig = {
      shouldFetchMetadata: true, // Fetch asset metadata for accurate pool info
      shouldFallbackToApi: true, // Fallback to DEX API on failure (for Blockfrost/Kupo)
      shouldSubmitOrders: false, // Don't submit orders automatically (useful during development)
      metadataMsgBranding: "Dexter", // Branding name in Tx message
      ...dexterConfig,
    };

    // Default request configuration
    const defaultRequestConfig: RequestConfig = {
      timeout: 5000, // Request timeout in milliseconds
      proxyUrl: "", // URL to prepend to all outside URLs (for CORS)
      retries: 3, // Number of retry attempts for failed requests
      ...requestConfig,
    };

    this.dexter = new Dexter(defaultDexterConfig, defaultRequestConfig);
  }

  /**
   * Configure Blockfrost data provider
   * @param config - Blockfrost configuration with url and projectId
   * @param requestConfig - Optional request configuration
   * @returns The DexterService instance for chaining
   */
  withBlockfrostProvider(
    config: BlockfrostConfig,
    requestConfig?: RequestConfig
  ): this {
    this.blockfrostProvider = new BlockfrostProvider(config, requestConfig);
    this.dexter = this.dexter.withDataProvider(this.blockfrostProvider);
    console.log("Blockfrost provider configured.");
    return this;
  }

  /**
   * Configure Kupo data provider (faster than Blockfrost for pool queries)
   * @param config - Kupo configuration with url
   * @param requestConfig - Optional request configuration
   * @returns The DexterService instance for chaining
   */
  withKupoProvider(config: KupoConfig, requestConfig?: RequestConfig): this {
    this.kupoProvider = new KupoProvider(config, requestConfig);
    this.dexter = this.dexter.withDataProvider(this.kupoProvider);
    return this;
  }

  /**
   * Load and attach a wallet provider to Dexter instance
   * @param walletProvider - The wallet provider instance to attach
   * @returns The DexterService instance for chaining
   */
  withWalletProvider(walletProvider: BaseWalletProvider): this {
    this.walletProvider = walletProvider;
    this.dexter = this.dexter.withWalletProvider(walletProvider);
    return this;
  }

  /**
   * Get the current wallet provider
   * @returns The attached wallet provider or undefined
   */
  getWalletProvider(): BaseWalletProvider | undefined {
    return this.walletProvider;
  }

  /**
   * Fetch liquidity pools from all DEXs
   * @returns Promise resolving to array of liquidity pools
   */
  async getAllLiquidityPools(): Promise<LiquidityPool[]> {
    return this.dexter
      .newFetchRequest()
      .onAllDexs()
      .getLiquidityPools()
      .then((pools: LiquidityPool[]) => {
        console.log(pools);
        return pools;
      });
  }

  /**
   * Fetch liquidity pools from specific DEXs
   * @param dexNames - Array of DEX names to query (or single DEX name)
   * @returns Promise resolving to array of liquidity pools
   */
  async getLiquidityPoolsFromDexs(
    dexNames: string | string[]
  ): Promise<LiquidityPool[]> {
    let liquidityPools = await this.dexter
      .newFetchRequest()
      .onDexs(dexNames)
      .getLiquidityPools();

    return liquidityPools;
  }

  /**
   * Fetch liquidity pools containing specific tokens
   * @param tokens - Array of tokens to filter by
   * @param dexNames - Optional: specific DEXs to query
   * @returns Promise resolving to array of liquidity pools
   */
  async getLiquidityPoolsForTokens(
    tokens: Token[],
    dexNames?: string | string[]
  ): Promise<LiquidityPool[]> {
    const request = this.dexter.newFetchRequest();

    if (dexNames) {
      request.onDexs(dexNames);
    } else {
      request.onAllDexs();
    }

    return request.forTokens(tokens).getLiquidityPools();
  }

  /**
   * Fetch liquidity pools for specific token pairs
   * @param tokenPairs - Array of token pair arrays
   * @param dexNames - Optional: specific DEXs to query
   * @returns Promise resolving to array of liquidity pools
   */
  async getLiquidityPoolsForTokenPairs(
    tokenPairs: Array<Token[]>,
    dexNames?: string | string[]
  ): Promise<LiquidityPool[]> {
    const request = this.dexter.newFetchRequest();

    if (dexNames) {
      request.onDexs(dexNames);
    } else {
      request.onAllDexs();
    }

    return request.forTokenPairs(tokenPairs).getLiquidityPools();
  }

  /**
   * Fetch the latest state for a specific liquidity pool
   * @param liquidityPool - The liquidity pool to fetch state for
   * @returns Promise resolving to the updated liquidity pool
   */
  async getLiquidityPoolState(
    liquidityPool: LiquidityPool
  ): Promise<LiquidityPool> {
    return this.dexter.newFetchRequest().getLiquidityPoolState(liquidityPool);
  }

  /**
   * Fetch historic states for a liquidity pool
   * @param liquidityPool - The liquidity pool to fetch history for
   * @returns Promise resolving to array of historic pool states
   */
  async getLiquidityPoolHistory(
    liquidityPool: LiquidityPool
  ): Promise<LiquidityPool[]> {
    return this.dexter.newFetchRequest().getLiquidityPoolHistory(liquidityPool);
  }

  /**
   * Get list of available DEX names
   * @returns Array of DEX names that can be used with onDexs()
   */
  getAvailableDexNames(): string[] {
    return Object.keys(this.dexter.availableDexs);
  }

  /**
   * Get the underlying Dexter instance for advanced usage
   * @returns The Dexter instance
   */
  getDexterInstance(): Dexter {
    return this.dexter;
  }

  /**
   * Create a new fetch request builder
   * This allows for more complex query building
   * @returns A new fetch request builder
   */
  newFetchRequest() {
    return this.dexter.newFetchRequest();
  }

  /**
   * Create a new swap request builder (requires wallet provider)
   * @returns A new swap request builder
   * @throws Error if wallet provider is not loaded
   */
  newSwapRequest() {
    if (!this.walletProvider) {
      throw new Error(
        "Wallet provider must be loaded before creating swap requests. Use withWalletProvider() first."
      );
    }
    return this.dexter.newSwapRequest();
  }
}
