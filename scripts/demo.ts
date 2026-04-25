/**
 * scripts/demo.ts
 *
 * Hackathon demo — 55 autonomous image purchases via Circle Nanopayments on ARC.
 * Satisfies the judging requirement: 50+ onchain transactions.
 *
 * Prerequisites:
 *   1. npm run dev         (server running on port 4000)
 *   2. .env configured with AGENT_PRIVATE_KEY
 *   3. npm run agent -- --deposit  (deposit USDC to Gateway, one-time)
 *
 * Run: npm run demo
 */

import dotenv from "dotenv";
dotenv.config();

import { purchaseGeneration } from "../src/agent/index";

const TOTAL_PURCHASES = 55;
const CONCURRENT = 3;
const DELAY_MS = 500;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runDemo() {
  if (!process.env.AGENT_PRIVATE_KEY) {
    console.error("AGENT_PRIVATE_KEY not set. Run: npm run setup-wallet");
    process.exit(1);
  }

  const price = parseFloat(process.env.PRICE_PER_GENERATION ?? "0.001");

  console.log("╔═══════════════════════════════���══════════════════════╗");
  console.log("║      NanaBanana Commerce — Hackathon Demo            ║");
  console.log("║   Circle Nanopayments + ARC Testnet + Nano Banana 2  ║");
  console.log("╠═══════════════════════��════════════════════════════���═╣");
  console.log(`║  Target:      ${TOTAL_PURCHASES} purchases                             ║`);
  console.log(`║  Price:       $${price.toFixed(3)} USDC / image                  ║`);
  console.log(`║  Total cost:  $${(TOTAL_PURCHASES * price).toFixed(3)} USDC                         ║`);
  console.log(`║  Payment SDK: @circle-fin/x402-batching               ║`);
  console.log(`║  Image model: gemini-3.1-flash-image-preview          ║`);
  console.log("╚═════════════════════���═════════════════════════════���══╝\n");

  const results: Awaited<ReturnType<typeof purchaseGeneration>>[] = [];
  let completed = 0;
  let failed = 0;

  const batches = Math.ceil(TOTAL_PURCHASES / CONCURRENT);

  for (let batch = 0; batch < batches; batch++) {
    const batchSize = Math.min(CONCURRENT, TOTAL_PURCHASES - batch * CONCURRENT);
    const batchPromises = Array.from({ length: batchSize }, () =>
      purchaseGeneration(false)
    );

    const batchResults = await Promise.allSettled(batchPromises);

    for (const r of batchResults) {
      if (r.status === "fulfilled") {
        const result = r.value;
        results.push(result);
        if (result.success) {
          completed++;
          console.log(
            `[${String(completed).padStart(3)}/${TOTAL_PURCHASES}] ✓  ` +
            `$${result.amount_usdc.toFixed(3)} · ${result.tx_time_ms}ms · ` +
            `"${result.prompt.slice(0, 52)}..."`
          );
        } else {
          failed++;
          console.log(`[FAIL] ${result.error}`);
        }
      } else {
        failed++;
        console.log(`[ERR ] ${r.reason}`);
      }
    }

    if (batch < batches - 1) await sleep(DELAY_MS);
  }

  const totalUsdc = results
    .filter((r) => r.success)
    .reduce((s, r) => s + r.amount_usdc, 0);

  const avgMs =
    results.filter((r) => r.success).reduce((s, r) => s + r.tx_time_ms, 0) /
    (completed || 1);

  console.log("\n╔══════════════════════════════════���═══════════════════╗");
  console.log("║                    Demo Summary                      ║");
  console.log("╠══════════════════════════════════════════════════════╣");
  console.log(`║  Successful:        ${String(completed).padEnd(33)}║`);
  console.log(`║  Failed:            ${String(failed).padEnd(33)}║`);
  console.log(`║  USDC spent:        $${totalUsdc.toFixed(6).padEnd(32)}║`);
  console.log(`║  Avg time/tx:       ${Math.round(avgMs)}ms${" ".repeat(31 - String(Math.round(avgMs)).length)}║`);
  console.log("╠════════════════════��════════════════════════════���════╣");
  console.log("║  Why Nanopayments?                                   ║");
  console.log("║  Traditional gas/tx:   $0.05 – $2.00                ║");
  console.log(`║  Our price/image:      $${price.toFixed(3).padEnd(29)}║`);
  console.log("║  Nanopayment gas:      $0.000 (Circle covers it)    ║");
  console.log("║  Gas vs price ratio:   50–2000x — impossible w/o NP ║");
  console.log("╚════════════════���══════════════════════════════���══════╝");
  console.log(`\nView gallery:  http://localhost:3000`);
  console.log(`API stats:     http://localhost:4000/api/gallery/stats`);
  console.log(`Explorer:      https://testnet.arcscan.app`);
}

runDemo().catch(console.error);
