import { Router, Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { generateImage, GenerationRequest } from "../services/nanoBanana";
import { gatewayMiddleware } from "../services/circle";

const router = Router();

export interface Generation {
  id: string;
  prompt: string;
  image_data_url: string;   // base64 data URL (data:image/png;base64,...)
  mime_type: string;
  model: string;
  payer: string;
  amount_usdc: number;
  timestamp: number;
  generation_id: string;
}

// In-memory store (replace with a DB for production)
export const gallery: Generation[] = [];

const pricePerGen = process.env.PRICE_PER_GENERATION ?? "0.001";

// POST /api/generate
// Protected by Circle Nanopayments via @circle-fin/x402-batching
//
// Flow:
//   1. No payment → middleware returns HTTP 402 with payment instructions
//   2. Agent deposits USDC to Circle Gateway (one-time), then retries with PAYMENT-SIGNATURE header
//   3. Middleware validates via Circle Gateway, attaches req.payment
//   4. Handler calls Nano Banana 2 (Gemini) and returns the image
router.post(
  "/",
  gatewayMiddleware.require(`$${pricePerGen}`) as unknown as (req: Request, res: Response, next: NextFunction) => void,
  async (req: Request, res: Response) => {
    const payment = (req as any).payment as {
      payer: string;
      amount: string;
      network: string;
    };

    const { prompt, aspect_ratio, resolution, output_format } =
      req.body as GenerationRequest & { prompt?: string };

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      res.status(400).json({ error: "prompt is required" });
      return;
    }

    let result;
    try {
      result = await generateImage({ prompt, aspect_ratio, resolution, output_format });
    } catch (err: any) {
      console.error("Nano Banana 2 error:", err?.message);
      res.status(502).json({ error: "Image generation failed", details: err.message });
      return;
    }

    const entry: Generation = {
      id: uuidv4(),
      prompt,
      image_data_url: result.image_data_url,
      mime_type: result.mime_type,
      model: result.model,
      payer: payment?.payer ?? "unknown",
      amount_usdc: parseFloat(pricePerGen),
      timestamp: Date.now(),
      generation_id: result.generation_id,
    };
    gallery.push(entry);

    res.json({ success: true, generation: entry });
  }
);

export default router;
