import { Router, Request, Response } from "express";
import { purchaseGeneration } from "../../agent/index";

const router = Router();

// POST /api/agent/trigger
// Proxies the browser's form submission to the local autonomous agent script
// which will use the Agent's specific wallet private key to pay for the UI request.
router.post("/trigger", async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    res.status(400).json({ error: "prompt is required" });
    return;
  }

  try {
    // We execute the purchase on behalf of the UI by running the agent logic inline
    // This connects to the Gateway API, signs the request via EIP-3009, and submits to /api/generate
    const result = await purchaseGeneration(false, prompt);

    if (result.success) {
      res.json({ success: true, generation: result });
    } else {
      res.status(502).json({ error: "Agent Purchase Failed", details: result.error });
    }
  } catch (err: any) {
    res.status(502).json({ error: "Agent Failed To Boot", details: err.message });
  }
});

export default router;
