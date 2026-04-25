/**
 * NanaBanana Autonomous Buyer Agent
 *
 * Uses the OFFICIAL Circle Nanopayments SDK:
 *   - @circle-fin/x402-batching  →  GatewayClient for EIP-3009 payments
 *   - @google/genai              →  Gemini for creative prompt generation
 *
 * Payment flow (per Circle docs):
 *   1. One-time: deposit USDC into Circle Gateway (onchain tx)
 *   2. Per purchase: client.pay(url) handles the 402 → sign → retry loop
 *
 * Docs: https://developers.circle.com/gateway/nanopayments/quickstarts/buyer
 */

import { GatewayClient } from "@circle-fin/x402-batching/client";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const SERVER_URL = `http://localhost:${process.env.PORT ?? 4000}`;
const GENERATE_URL = `${SERVER_URL}/api/generate`;

// ── Circle Gateway Client (buyer side) ────────────────────────────────────────
// Uses a regular EOA private key — GatewayClient signs EIP-3009 authorizations
// internally. No custom signing code needed.
function getGatewayClient(): GatewayClient {
  const privateKey = process.env.AGENT_PRIVATE_KEY;
  if (!privateKey) throw new Error("AGENT_PRIVATE_KEY not set in .env");

  return new GatewayClient({
    chain: "arcTestnet",
    privateKey: privateKey as `0x${string}`,
  });
}

// ── Gemini (prompt generation) ────────────────────────────────────────────────
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

async function generatePrompt(): Promise<string> {
  const result = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents:
      "Create a vivid, creative, detailed AI image generation prompt. Be specific about style, lighting, and mood. Output ONLY the prompt text, nothing else. Max 100 words.",
  });
  return (
    result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ??
    "a futuristic digital landscape with glowing USDC tokens"
  );
}

// ── Purchase logic ────────────────────────────────────────────────────────────

export interface PurchaseResult {
  success: boolean;
  prompt: string;
  image_data_url?: string;
  generation_id?: string;
  payer: string;
  amount_usdc: number;
  tx_time_ms: number;
  error?: string;
}

export async function purchaseGeneration(
  depositFirst = false,
  prompt?: string
): Promise<PurchaseResult> {
  const start = Date.now();
  const client = getGatewayClient();
  const payer = process.env.AGENT_WALLET_ADDRESS ?? "unknown";

  // Optional: deposit USDC into Circle Gateway (only needed once)
  if (depositFirst) {
    console.log("Depositing USDC into Circle Gateway...");
    const deposit = await client.deposit("1"); // deposit 1 USDC
    console.log(`Deposit tx: ${deposit.depositTxHash}`);
  }

  // Generate prompt via Gemini if not provided
  const resolvedPrompt = prompt ?? (await generatePrompt());

  // client.pay() handles the full x402 flow:
  //   POST /api/generate → 402 response → sign EIP-3009 → retry with PAYMENT-SIGNATURE header → 200
  try {
    const { data, status } = await client.pay(GENERATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: resolvedPrompt,
        aspect_ratio: "1:1",
        resolution: "1K",
      }),
    });

    if (status !== 200) {
      return {
        success: false,
        prompt: resolvedPrompt,
        payer,
        amount_usdc: parseFloat(process.env.PRICE_PER_GENERATION ?? "0.001"),
        tx_time_ms: Date.now() - start,
        error: `Unexpected status ${status}`,
      };
    }

    const gen = (data as any).generation;
    return {
      success: true,
      prompt: resolvedPrompt,
      image_data_url: gen.image_data_url,
      generation_id: gen.generation_id,
      payer,
      amount_usdc: gen.amount_usdc,
      tx_time_ms: Date.now() - start,
    };
  } catch (err: any) {
    return {
      success: false,
      prompt: resolvedPrompt,
      payer,
      amount_usdc: parseFloat(process.env.PRICE_PER_GENERATION ?? "0.001"),
      tx_time_ms: Date.now() - start,
      error: err?.message ?? "Unknown error",
    };
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  if (!process.env.AGENT_PRIVATE_KEY) {
    console.error("AGENT_PRIVATE_KEY must be set in .env\nRun: npm run setup-wallet");
    process.exit(1);
  }

  // Pass depositFirst=true on the very first run to fund the Gateway account
  const depositFirst = process.argv.includes("--deposit");

  console.log("NanaBanana Agent — generating prompt via Gemini...");
  const result = await purchaseGeneration(depositFirst);

  if (result.success) {
    console.log("\nPurchase successful!");
    console.log(`  Prompt:    ${result.prompt}`);
    console.log(`  Payer:     ${result.payer}`);
    console.log(`  Amount:    $${result.amount_usdc} USDC`);
    console.log(`  Time:      ${result.tx_time_ms}ms`);
    console.log(`  Image:     [base64 data URL, ${result.image_data_url?.length ?? 0} chars]`);
  } else {
    console.error(`\nPurchase failed: ${result.error}`);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
