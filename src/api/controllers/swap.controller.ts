import { Request, Response } from "express";
import { DexterService } from "../../services/dexter.service.js";
import { Asset, LiquidityPool, VyFinance } from "@indigo-labs/dexter";

// Helper to convert BigInt to string for JSON serialization
const bigIntToString = (obj: any): any => {
  if (typeof obj === "bigint") {
    return obj.toString();
  } else if (Array.isArray(obj)) {
    return obj.map(bigIntToString);
  } else if (obj !== null && typeof obj === "object") {
    const result: any = {};
    for (const key in obj) {
      result[key] = bigIntToString(obj[key]);
    }
    return result;
  }
  return obj;
};

// Singleton instance of DexterService
let dexterServiceInstance: DexterService | null = null;
let initializationError: Error | null = null;

/**
 * Initialize and return singleton DexterService instance
 */
const getDexterService = (): DexterService => {
  // Return cached instance if available
  if (dexterServiceInstance) {
    return dexterServiceInstance;
  }

  // If initialization previously failed, throw the same error
  if (initializationError) {
    throw initializationError;
  }

  try {
    console.log("Initializing DexterService singleton...");

    const dexterService = new DexterService(
      {
        shouldFallbackToApi: true,
        shouldFetchMetadata: true,
      },
      {
        timeout: 30000,
        retries: 3,
      }
    );

    // Configure data provider (Blockfrost or Kupo)
    if (process.env.KUPO_URL) {
      console.log("Configuring Kupo provider...");
      dexterService.withKupoProvider({ url: process.env.KUPO_URL });
    } else if (process.env.BLOCKFROST_PROJECT_ID && process.env.BLOCKFROST_URL) {
      console.log("Configuring Blockfrost provider...");
      dexterService.withBlockfrostProvider({
        projectId: process.env.BLOCKFROST_PROJECT_ID,
        url: process.env.BLOCKFROST_URL,
      });
    } else {
      const error = new Error(
        "No data provider configured. Set KUPO_URL or BLOCKFROST credentials in .env"
      );
      initializationError = error;
      throw error;
    }

    // Cache the instance
    dexterServiceInstance = dexterService;
    console.log("DexterService singleton initialized successfully");

    return dexterService;
  } catch (error) {
    initializationError = error instanceof Error ? error : new Error(String(error));
    throw initializationError;
  }
};

/**
 * Get VyFinance DEX instance from Dexter
 * Throws error if VyFinance is not available
 */
const getVyFinanceDex = (): VyFinance => {
  const dexterService = getDexterService();
  const dexter = dexterService.getDexterInstance();
  const vyFinance = dexter.dexByName("VyFinance");

  if (!vyFinance) {
    throw new Error("VyFinance DEX not available in Dexter instance");
  }

  return vyFinance as VyFinance;
};

/**
 * Parse asset from string identifier or "lovelace"
 */
const parseAsset = (
  assetStr: string,
  decimals: number = 6
): Asset | "lovelace" => {
  if (
    assetStr.toLowerCase() === "lovelace" ||
    assetStr.toLowerCase() === "ada"
  ) {
    return "lovelace";
  }

  // Expected format: policyId.assetName or policyId
  return Asset.fromIdentifier(assetStr, decimals);
};

/**
 * Find VyFinance pool for given asset pair
 */
const findVyFinancePool = async (
  dexterService: DexterService,
  assetA: Asset | "lovelace",
  assetB: Asset | "lovelace"
): Promise<LiquidityPool | null> => {
  try {
    const pools = await dexterService.getLiquidityPoolsForTokenPairs(
      [[assetA, assetB]],
      "VyFinance"
    );

    return pools.length > 0 ? pools[0] : null;
  } catch (error) {
    console.error("Error finding VyFinance pool:", error);
    return null;
  }
};

/**
 * POST /api/swap/estimate
 * Estimate swap output, price, and price impact
 */
export const estimateSwap = async (req: Request, res: Response) => {
  try {
    const {
      swapInAsset,
      swapInAmount,
      swapOutAsset,
      decimalsIn = 6,
      decimalsOut = 6,
    } = req.body;

    // Validation
    if (!swapInAsset || !swapInAmount || !swapOutAsset) {
      return res.status(400).json({
        error: "Bad Request",
        message:
          "Missing required fields: swapInAsset, swapInAmount, swapOutAsset",
      });
    }

    const dexterService = getDexterService();

    // Parse assets
    const assetIn = parseAsset(swapInAsset, decimalsIn);
    const assetOut = parseAsset(swapOutAsset, decimalsOut);

    // Find VyFinance pool
    const pool = await findVyFinancePool(dexterService, assetIn, assetOut);

    if (!pool) {
      return res.status(404).json({
        error: "Pool Not Found",
        message: `No VyFinance pool found for ${swapInAsset} / ${swapOutAsset}`,
      });
    }

    // Get VyFinance DEX instance for calculations
    const vyFinance = getVyFinanceDex();

    // Calculate estimates
    const swapInAmountBigInt = BigInt(swapInAmount);
    const estimatedReceive = vyFinance.estimatedReceive(
      pool,
      assetIn,
      swapInAmountBigInt
    );
    const priceImpact = vyFinance.priceImpactPercent(
      pool,
      assetIn,
      swapInAmountBigInt
    );

    // Calculate price (how much of assetOut per 1 assetIn)
    const oneUnit = BigInt(Math.pow(10, decimalsIn));
    const pricePerUnit = vyFinance.estimatedReceive(pool, assetIn, oneUnit);

    res.json({
      success: true,
      data: {
        pool: {
          address: pool.address,
          dex: pool.dex,
          assetA: pool.assetA === "lovelace" ? "ADA" : pool.assetA.identifier(),
          assetB: pool.assetB === "lovelace" ? "ADA" : pool.assetB.identifier(),
        },
        swap: {
          swapInAsset: swapInAsset,
          swapInAmount: swapInAmount.toString(),
          swapOutAsset: swapOutAsset,
          estimatedReceive: estimatedReceive.toString(),
          priceImpactPercent: priceImpact,
          pricePerUnit: pricePerUnit.toString(),
        },
      },
    });
  } catch (error) {
    console.error("Error estimating swap:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * POST /api/swap/build
 * Build a swap transaction (requires wallet address)
 */
export const buildSwap = async (req: Request, res: Response) => {
  try {
    const {
      swapInAsset,
      swapInAmount,
      swapOutAsset,
      walletAddress,
      slippagePercent = 1.0,
      decimalsIn = 6,
      decimalsOut = 6,
    } = req.body;

    // Validation
    if (!swapInAsset || !swapInAmount || !swapOutAsset || !walletAddress) {
      return res.status(400).json({
        error: "Bad Request",
        message:
          "Missing required fields: swapInAsset, swapInAmount, swapOutAsset, walletAddress",
      });
    }

    return res.status(501).json({
      error: "Not Implemented",
      message:
        "Building swap transactions requires wallet provider integration. " +
        "This would need CIP-30 wallet connection in a frontend application. " +
        "For now, use the /estimate endpoint to calculate swap details.",
      suggestion:
        "To build transactions: 1) Use estimate endpoint, 2) Connect wallet via CIP-30, 3) Use Dexter's buildSwapOrder method",
    });
  } catch (error) {
    console.error("Error building swap:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/swap/pools
 * Get available VyFinance liquidity pools
 */
export const getVyFinancePools = async (req: Request, res: Response) => {
  try {
    const { assetA, assetB, decimalsA = "6", decimalsB = "6" } = req.query;

    const dexterService = getDexterService();

    let pools: LiquidityPool[];

    if (assetA && assetB) {
      // Filter by specific pair
      const parsedAssetA = parseAsset(
        assetA as string,
        parseInt(decimalsA as string)
      );
      const parsedAssetB = parseAsset(
        assetB as string,
        parseInt(decimalsB as string)
      );
      pools = await dexterService.getLiquidityPoolsForTokenPairs(
        [[parsedAssetA, parsedAssetB]],
        "VyFinance"
      );
    } else {
      // Get all VyFinance pools
      pools = await dexterService.getLiquidityPoolsFromDexs("VyFinance");
    }

    const formattedPools = pools.map((pool) => ({
      address: pool.address,
      dex: pool.dex,
      assetA: {
        identifier:
          pool.assetA === "lovelace" ? "lovelace" : pool.assetA.identifier(),
        name: pool.assetA === "lovelace" ? "ADA" : pool.assetA.assetName,
      },
      assetB: {
        identifier:
          pool.assetB === "lovelace" ? "lovelace" : pool.assetB.identifier(),
        name: pool.assetB === "lovelace" ? "ADA" : pool.assetB.assetName,
      },
    }));

    res.json({
      success: true,
      data: {
        count: formattedPools.length,
        pools: formattedPools,
      },
    });
  } catch (error) {
    console.error("Error fetching VyFinance pools:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/swap/info
 * Get VyFinance DEX information
 */
export const getDexInfo = async (req: Request, res: Response) => {
  try {
    const vyFinance = getVyFinanceDex();
    const swapFees = bigIntToString(vyFinance.swapOrderFees());

    res.json({
      success: true,
      data: {
        dex: "VyFinance",
        swapFees: swapFees,
        dataProvider: process.env.KUPO_URL ? "Kupo" : "Blockfrost",
      },
    });
  } catch (error) {
    console.error("Error getting DEX info:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
