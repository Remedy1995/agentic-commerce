/**
 * Circle service — two distinct responsibilities:
 *
 * 1. MERCHANT WALLET  — uses @circle-fin/developer-controlled-wallets
 *    to create and inspect the merchant's address (receives nanopayments).
 *
 * 2. NANOPAYMENTS     — uses @circle-fin/x402-batching (official Circle SDK)
 *    createGatewayMiddleware()  →  seller-side Express middleware
 *    GatewayClient              →  buyer-side payment client (in agent)
 *
 * Official docs:
 *   https://developers.circle.com/gateway/nanopayments/quickstarts/seller
 *   https://developers.circle.com/gateway/nanopayments/quickstarts/buyer
 */

import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { createGatewayMiddleware } from "@circle-fin/x402-batching/server";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY!;
const ARC_CHAIN = "ARC-TESTNET";

// ── Merchant wallet (Circle Developer-Controlled Wallets) ─────────────────────

export function getDCWClient() {
  return initiateDeveloperControlledWalletsClient({
    apiKey: CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET ?? "",
  });
}

export async function createMerchantWallet(): Promise<{
  walletId: string;
  address: string;
}> {
  const client = getDCWClient();
  const response = await client.createWallets({
    accountType: "EOA",
    blockchains: [ARC_CHAIN],
    count: 1,
    walletSetId: process.env.CIRCLE_WALLET_SET_ID!,
    metadata: [{ name: "NanaBanana Merchant", refId: "merchant" }],
  });

  const wallet = response.data?.wallets?.[0];
  if (!wallet) throw new Error("Failed to create merchant wallet");
  return { walletId: wallet.id, address: wallet.address! };
}

export async function getMerchantBalance(): Promise<string> {
  const client = getDCWClient();
  const response = await client.getWalletTokenBalance({
    id: process.env.MERCHANT_WALLET_ID ?? "",
  });
  const usdc = response.data?.tokenBalances?.find(
    (b) => b.token?.symbol === "USDC"
  );
  return usdc?.amount ?? "0";
}

export async function drip(address: string): Promise<void> {
  await axios.post(
    "https://api.circle.com/v1/faucet/drips",
    { address, blockchain: ARC_CHAIN, usdc: true },
    {
      headers: {
        Authorization: `Bearer ${CIRCLE_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
}

// ── Nanopayments gateway middleware (seller side) ─────────────────────────────
// Use this on any Express route that requires a nanopayment before serving.
//
// Usage:
//   import { gatewayMiddleware } from "./services/circle";
//   app.post("/api/generate", gatewayMiddleware.require("$0.001"), handler);
//
// The middleware:
//   • Returns HTTP 402 with payment instructions if no payment header present
//   • Validates the EIP-3009 signature via Circle Gateway
//   • On success, attaches req.payment = { payer, amount, network }

export const gatewayMiddleware = createGatewayMiddleware({
  sellerAddress: process.env.MERCHANT_WALLET_ADDRESS as `0x${string}`,
});
