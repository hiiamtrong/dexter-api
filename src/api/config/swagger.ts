import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "VyFinance Swap API",
      version: "1.0.0",
      description:
        "REST API for estimating and building swaps on VyFinance DEX using Dexter SDK",
      contact: {
        name: "API Support",
        url: "https://github.com/IndigoProtocol/dexter",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://api.yourdomain.com",
        description: "Production server",
      },
    ],
    tags: [
      {
        name: "Health",
        description: "Health check endpoints",
      },
      {
        name: "Swap",
        description: "Swap estimation and transaction building",
      },
      {
        name: "Pools",
        description: "Liquidity pool information",
      },
      {
        name: "DEX Info",
        description: "VyFinance DEX information",
      },
    ],
    components: {
      schemas: {
        HealthResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "ok",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              example: "2025-10-20T12:00:00.000Z",
            },
            uptime: {
              type: "number",
              example: 123.45,
            },
          },
        },
        EstimateSwapRequest: {
          type: "object",
          required: ["swapInAsset", "swapInAmount", "swapOutAsset"],
          properties: {
            swapInAsset: {
              type: "string",
              description:
                'Asset to swap from. Use "lovelace" for ADA or policyId.assetName format',
              example: "lovelace",
            },
            swapInAmount: {
              type: "string",
              description: "Amount to swap in smallest unit (e.g., lovelaces)",
              example: "1000000",
            },
            swapOutAsset: {
              type: "string",
              description: "Asset to swap to",
              example:
                "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d",
            },
            decimalsIn: {
              type: "number",
              description: "Decimals for input asset",
              example: 6,
              default: 6,
            },
            decimalsOut: {
              type: "number",
              description: "Decimals for output asset",
              example: 6,
              default: 6,
            },
          },
        },
        EstimateSwapResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            data: {
              type: "object",
              properties: {
                pool: {
                  type: "object",
                  properties: {
                    address: {
                      type: "string",
                      example: "addr1...",
                    },
                    dex: {
                      type: "string",
                      example: "VyFinance",
                    },
                    assetA: {
                      type: "string",
                      example: "lovelace",
                    },
                    assetB: {
                      type: "string",
                      example:
                        "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d",
                    },
                  },
                },
                swap: {
                  type: "object",
                  properties: {
                    swapInAsset: {
                      type: "string",
                      example: "lovelace",
                    },
                    swapInAmount: {
                      type: "string",
                      example: "1000000",
                    },
                    swapOutAsset: {
                      type: "string",
                      example:
                        "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d",
                    },
                    estimatedReceive: {
                      type: "string",
                      description: "Estimated amount to receive",
                      example: "95000",
                    },
                    priceImpactPercent: {
                      type: "number",
                      description: "Price impact percentage",
                      example: 0.5,
                    },
                    pricePerUnit: {
                      type: "string",
                      description: "Price per unit of input asset",
                      example: "95",
                    },
                  },
                },
              },
            },
          },
        },
        BuildSwapRequest: {
          type: "object",
          required: [
            "swapInAsset",
            "swapInAmount",
            "swapOutAsset",
            "walletAddress",
          ],
          properties: {
            swapInAsset: {
              type: "string",
              description: "Asset to swap from",
              example: "lovelace",
            },
            swapInAmount: {
              type: "string",
              description: "Amount to swap",
              example: "1000000",
            },
            swapOutAsset: {
              type: "string",
              description: "Asset to swap to",
              example:
                "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d",
            },
            walletAddress: {
              type: "string",
              description: "User's wallet address",
              example: "addr1...",
            },
            slippagePercent: {
              type: "number",
              description: "Maximum slippage tolerance",
              example: 1.0,
              default: 1.0,
            },
            decimalsIn: {
              type: "number",
              example: 6,
              default: 6,
            },
            decimalsOut: {
              type: "number",
              example: 6,
              default: 6,
            },
          },
        },
        PoolsResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            data: {
              type: "object",
              properties: {
                count: {
                  type: "number",
                  example: 2,
                },
                pools: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      address: {
                        type: "string",
                        example: "addr1...",
                      },
                      dex: {
                        type: "string",
                        example: "VyFinance",
                      },
                      assetA: {
                        type: "object",
                        properties: {
                          identifier: {
                            type: "string",
                            example: "lovelace",
                          },
                          name: {
                            type: "string",
                            example: "ADA",
                          },
                        },
                      },
                      assetB: {
                        type: "object",
                        properties: {
                          identifier: {
                            type: "string",
                            example:
                              "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d",
                          },
                          name: {
                            type: "string",
                            example: "USSDM",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        DexInfoResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            data: {
              type: "object",
              properties: {
                dex: {
                  type: "string",
                  example: "VyFinance",
                },
                swapFees: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                        example: "processFee",
                      },
                      title: {
                        type: "string",
                        example: "Process Fee",
                      },
                      description: {
                        type: "string",
                        example:
                          "Fee paid to the off-chain processor fulfilling order.",
                      },
                      value: {
                        type: "string",
                        example: "1900000",
                      },
                      isReturned: {
                        type: "boolean",
                        example: false,
                      },
                    },
                  },
                },
                dataProvider: {
                  type: "string",
                  example: "Blockfrost",
                  enum: ["Blockfrost", "Kupo"],
                },
              },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            error: {
              type: "string",
              example: "Bad Request",
            },
            message: {
              type: "string",
              example: "Missing required fields",
            },
          },
        },
      },
    },
  },
  apis: ["./src/api/routes/*.ts"], // Path to API routes
};

export const swaggerSpec = swaggerJsdoc(options);
