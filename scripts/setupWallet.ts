/**
 * scripts/setupWallet.ts
 *
 * One-time setup:
 *   1. Creates the MERCHANT wallet via Circle Developer-Controlled Wallets
 *      (the address that RECEIVES nanopayments on ARC Testnet)
 *   2. Generates a regular EOA private key for the AGENT
 *      (used by GatewayClient to sign EIP-3009 nanopayments)
 *   3. Requests USDC from Circle faucet for the agent wallet
 *
 * Run: npm run setup-wallet
 * Then copy the printed values into your .env file.
 */

import dotenv from "dotenv";
dotenv.config();

import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import axios from "axios";

const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY!;
// ARC Testnet is not yet in Circle's Blockchain enum — cast as any
const ARC_CHAIN = "ARC-TESTNET" as any;

async function main() {
  if (!CIRCLE_API_KEY || !process.env.CIRCLE_WALLET_SET_ID) {
    console.error(
      "Missing CIRCLE_API_KEY or CIRCLE_WALLET_SET_ID in .env\n" +
        "Get them from https://console.circle.com"
    );
    process.exit(1);
  }

  // 1. Create merchant wallet via Circle DCW
  console.log("Creating merchant wallet via Circle Developer-Controlled Wallets...");
  const dcwClient = initiateDeveloperControlledWalletsClient({
    apiKey: CIRCLE_API_KEY,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET ?? "",
  });

  const merchantResp = await dcwClient.createWallets({
    accountType: "EOA",
    blockchains: [ARC_CHAIN],
    count: 1,
    walletSetId: process.env.CIRCLE_WALLET_SET_ID!,
    metadata: [{ name: "NanaBanana Merchant", refId: "merchant" }],
  });

  const merchant = merchantResp.data?.wallets?.[0];
  if (!merchant) throw new Error("Failed to create merchant wallet");

  // 2. Generate agent EOA private key (regular wallet — used by GatewayClient)
  console.log("Generating agent EOA wallet...");
  const agentPrivateKey = generatePrivateKey();
  const agentAccount = privateKeyToAccount(agentPrivateKey);

  // 3. Request USDC from Circle faucet for the agent
  console.log(`Requesting USDC from faucet for agent: ${agentAccount.address}`);
  try {
    await axios.post(
      "https://api.circle.com/v1/faucet/drips",
      { address: agentAccount.address, blockchain: ARC_CHAIN, usdc: true },
      {
        headers: {
          Authorization: `Bearer ${CIRCLE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Faucet USDC requested. Wait ~30s then check balance.\n");
  } catch (err: any) {
    console.warn(
      "Faucet request failed (try manually at https://faucet.circle.com):",
      err?.response?.data ?? err.message
    );
  }

  // 4. Print values to copy into .env
  console.log("=".repeat(60));
  console.log("Add these to your .env file:");
  console.log("=".repeat(60));
  console.log(`MERCHANT_WALLET_ADDRESS=${merchant.address}`);
  console.log(`AGENT_PRIVATE_KEY=${agentPrivateKey}`);
  console.log(`AGENT_WALLET_ADDRESS=${agentAccount.address}`);
  console.log("=".repeat(60));
  console.log("\nIMPORTANT: Keep AGENT_PRIVATE_KEY secret. Never commit it to git.");
  console.log("\nNext steps:");
  console.log("  1. Copy the values above into your .env file");
  console.log("  2. Run: npm run dev          (start the server)");
  console.log("  3. Run: npm run agent -- --deposit   (first run: deposit USDC to Gateway)");
  console.log("  4. Run: npm run agent        (subsequent runs: just pay)");
  console.log("  5. Run: npm run demo         (55-purchase demo)");
  console.log(`\n  Explorer: https://testnet.arcscan.app/address/${agentAccount.address}`);
}

main().catch(console.error);
