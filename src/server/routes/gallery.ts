import { Router, Request, Response } from "express";
import { gallery } from "./generate";

const router = Router();

// GET /api/gallery — returns all generated images, newest first
router.get("/", (_req: Request, res: Response) => {
  res.json({
    total: gallery.length,
    generations: [...gallery].reverse(),
  });
});

// GET /api/gallery/stats — transaction stats for the demo/judging
router.get("/stats", (_req: Request, res: Response) => {
  const totalUsdc = gallery.reduce((sum, g) => sum + g.amount_usdc, 0);
  const uniquePayers = new Set(gallery.map((g) => g.payer)).size;

  res.json({
    total_transactions: gallery.length,
    total_usdc_volume: totalUsdc.toFixed(6),
    unique_payers: uniquePayers,
    price_per_generation_usdc: parseFloat(process.env.PRICE_PER_GENERATION ?? "0.001"),
    chain: "ARC Testnet",
    chain_id: 5042002,
    explorer: "https://testnet.arcscan.app",
    why_nanopayments: {
      traditional_gas_cost_usd: "0.05 – 2.00",
      nanopayment_price_usd: 0.001,
      gas_cost_would_exceed_price: true,
      nanopayments_gas_cost: 0,
      explanation:
        "At $0.001 per image, a traditional onchain tx fee ($0.05–$2.00) would cost 50–2000x more than the service itself — making this model completely unviable without nanopayments. Circle Nanopayments bundles thousands of transfers into a single onchain settlement, dropping the per-transfer gas cost to effectively zero.",
    },
  });
});

export default router;
