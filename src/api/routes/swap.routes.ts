import { Router } from "express";
import * as swapController from "../controllers/swap.controller.js";

const router = Router();

/**
 * @swagger
 * /api/swap/estimate:
 *   post:
 *     summary: Estimate swap output and price impact
 *     tags: [Swap]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EstimateSwapRequest'
 *     responses:
 *       200:
 *         description: Swap estimation successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EstimateSwapResponse'
 *       400:
 *         description: Bad request - missing or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Pool not found for the given asset pair
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/estimate", swapController.estimateSwap);

/**
 * @swagger
 * /api/swap/build:
 *   post:
 *     summary: Build a swap transaction (not yet implemented)
 *     tags: [Swap]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BuildSwapRequest'
 *     responses:
 *       501:
 *         description: Not implemented - requires wallet integration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/build", swapController.buildSwap);

/**
 * @swagger
 * /api/swap/pools:
 *   get:
 *     summary: Get available VyFinance liquidity pools
 *     tags: [Pools]
 *     parameters:
 *       - in: query
 *         name: assetA
 *         schema:
 *           type: string
 *         description: Filter by first asset (e.g., "lovelace")
 *       - in: query
 *         name: assetB
 *         schema:
 *           type: string
 *         description: Filter by second asset
 *       - in: query
 *         name: decimalsA
 *         schema:
 *           type: string
 *           default: "6"
 *         description: Decimals for assetA
 *       - in: query
 *         name: decimalsB
 *         schema:
 *           type: string
 *           default: "6"
 *         description: Decimals for assetB
 *     responses:
 *       200:
 *         description: Successfully retrieved pools
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PoolsResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/pools", swapController.getVyFinancePools);

/**
 * @swagger
 * /api/swap/info:
 *   get:
 *     summary: Get VyFinance DEX information and fees
 *     tags: [DEX Info]
 *     responses:
 *       200:
 *         description: Successfully retrieved DEX information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DexInfoResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/info", swapController.getDexInfo);

export default router;
