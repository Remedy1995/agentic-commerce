import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

import generateRouter from "./routes/generate";
import galleryRouter from "./routes/gallery";
import walletRouter from "./routes/wallet";
import agentRouter from "./routes/agent";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT ?? "4000");

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve the frontend from frontend/out
app.use(express.static(path.join(__dirname, "../../frontend/out")));

// ── API Routes ────────────────────────────────────────────────
app.use("/api/agent", agentRouter);
app.use("/api/generate", generateRouter);
app.use("/api/gallery", galleryRouter);
app.use("/api/wallet", walletRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    project: "NanaBanana Commerce",
    chain: "ARC Testnet",
    chain_id: 5042002,
    price_per_generation: process.env.PRICE_PER_GENERATION ?? "0.001",
    merchant_address: process.env.MERCHANT_WALLET_ADDRESS ?? "not configured",
    timestamp: new Date().toISOString(),
  });
});

// Fallback — serve frontend for all non-API routes
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/out/index.html"));
});

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════╗
  ║         NanaBanana Commerce on ARC            ║
  ╠═══════════════════════════════════════════════╣
  ║  Server:   http://localhost:${PORT}              ║
  ║  Chain:    ARC Testnet (5042002)              ║
  ║  Price:    $${process.env.PRICE_PER_GENERATION ?? "0.001"} USDC / generation       ║
  ║  Payment:  Circle Nanopayments (EIP-3009)     ║
  ╚═══════════════════════════════════════════════╝
  `);
});

export default app;
