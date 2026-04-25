import { Router, Request, Response } from "express";
import { getDCWClient, drip } from "../services/circle";

const router = Router();

// GET /api/wallet/balance?address=0x...
router.get("/balance", async (req: Request, res: Response) => {
  const walletId = req.query.walletId as string | undefined;

  if (!walletId) {
    res.status(400).json({ error: "walletId query param required" });
    return;
  }

  try {
    const client = getDCWClient();
    const response = await client.getWalletTokenBalance({ id: walletId });
    const balances = response.data?.tokenBalances ?? [];
    res.json({ walletId, balances });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/wallet/drip — request testnet USDC from Circle faucet
router.post("/drip", async (req: Request, res: Response) => {
  const { address } = req.body as { address?: string };

  if (!address) {
    res.status(400).json({ error: "address is required" });
    return;
  }

  try {
    await drip(address);
    res.json({ success: true, message: "USDC drip requested — check balance in ~30s" });
  } catch (err: any) {
    res.status(500).json({
      error: err?.response?.data?.message ?? err.message,
    });
  }
});

// GET /api/wallet/merchant — returns the merchant wallet address
router.get("/merchant", (_req: Request, res: Response) => {
  res.json({
    address: process.env.MERCHANT_WALLET_ADDRESS ?? "not configured",
    chain: "ARC Testnet",
    chain_id: 5042002,
    usdc_contract: process.env.USDC_CONTRACT_ADDRESS,
  });
});

export default router;
