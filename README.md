# NanaBanana Commerce — Agentic Image Marketplace on ARC

An autonomous AI commerce platform built for the **Lablab AI "Agentic Economy on ARC" Hackathon (April 20–26, 2026)**.

An AI Agent autonomously generates creative image prompts via Gemini, pays $0.001 USDC per image using Circle Nanopayments (EIP-3009) on ARC Testnet, and serves generated images through a real-time Next.js gallery — all without user wallet interaction.

---

## Architecture

```
Browser (Next.js UI)
    |
    | POST /api/agent/trigger {prompt}
    v
Express Server (port 4000)
    |
    |-- Agent Route --> purchaseGeneration()
    |                       |
    |                       |-- Gemini gemini-2.0-flash (creative prompt)
    |                       |-- GatewayClient.pay() --> POST /api/generate
    |                                                       |
    |                                        gatewayMiddleware.require("$0.001")
    |                                                       |
    |                                        Gemini gemini-3.1-flash-image-preview
    |                                        (Nano Banana 2 image generation)
    |                                                       |
    |                                        Response: base64 image + generation record
    |
    |-- Gallery Route --> GET /api/gallery (polled every 3s by frontend)
```

**Tech Stack:**
- **Nano Banana 2** — `gemini-3.1-flash-image-preview` via `@google/genai`
- **Circle Nanopayments** — `@circle-fin/x402-batching` (EIP-3009 / x402 protocol)
- **Circle Developer-Controlled Wallets** — `@circle-fin/developer-controlled-wallets` (merchant wallet)
- **ARC Testnet** — Chain ID `5042002`, RPC `https://rpc.testnet.arc.network`
- **Express + TypeScript** — Backend API server
- **Next.js 14 (App Router) + Tailwind CSS** — Frontend
- **viem** — EOA key generation for agent wallet

---

## Prerequisites

- Node.js 20+
- npm 10+
- A [Google AI Studio](https://aistudio.google.com) account (free Gemini API key)
- A [Circle Developer Console](https://console.circle.com) account (free — use Testnet)

---

## Step 1 — Get Your API Keys

### Google Gemini API Key
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click **Get API Key** → **Create API key**
3. Copy the key — this is your `GEMINI_API_KEY`

### Circle Developer API
1. Go to [console.circle.com](https://console.circle.com) and sign up
2. Create a new project (select **Testnet**)
3. From the dashboard, copy:
   - **API Key** → `CIRCLE_API_KEY`
   - **Entity Secret** (Settings → Entity Secret) → `CIRCLE_ENTITY_SECRET`
4. Go to **Wallets → Wallet Sets** → Create a Wallet Set
   - Copy the **Wallet Set ID** → `CIRCLE_WALLET_SET_ID`

---

## Step 2 — Install Dependencies

```bash
git clone https://github.com/Remedy1995/agentic-commerce.git
cd agentic-commerce
npm run install:all
```

This installs both backend and frontend (`frontend/`) dependencies.

---

## Step 3 — Configure Environment

```bash
cp .env.example .env
```

Open `.env` and fill in the values from Step 1:

```env
GEMINI_API_KEY=your_gemini_api_key_here
CIRCLE_API_KEY=your_circle_api_key_here
CIRCLE_ENTITY_SECRET=your_entity_secret_here
CIRCLE_WALLET_SET_ID=your_wallet_set_id_here

# Leave these blank for now — filled in Step 4
MERCHANT_WALLET_ADDRESS=
AGENT_PRIVATE_KEY=
AGENT_WALLET_ADDRESS=

PORT=4000
NODE_ENV=development
ARC_RPC_URL=https://rpc.testnet.arc.network
ARC_CHAIN_ID=5042002
USDC_CONTRACT_ADDRESS=0x3600000000000000000000000000000000000000
PRICE_PER_GENERATION=0.001
```

---

## Step 4 — Generate Wallets

```bash
npm run setup-wallet
```

This script will:
1. Create the **merchant wallet** via Circle DCW (receives nanopayments)
2. Generate an **agent EOA wallet** (signs EIP-3009 payment authorizations)
3. Request testnet USDC from Circle faucet for the agent

Output example:
```
============================================================
Add these to your .env file:
============================================================
MERCHANT_WALLET_ADDRESS=0xABC...
AGENT_PRIVATE_KEY=0xDEF...
AGENT_WALLET_ADDRESS=0x123...
============================================================
```

Paste those three values into your `.env` file.

> If the faucet request fails, go to [faucet.circle.com](https://faucet.circle.com), select **ARC Testnet**, and paste your `AGENT_WALLET_ADDRESS` to get free testnet USDC.

---

## Step 5 — Run Locally (Development)

Open two terminals:

**Terminal 1 — Backend server:**
```bash
npm run dev
# Server starts on http://localhost:4000
```

**Terminal 2 — Frontend:**
```bash
npm run dev:frontend
# Next.js starts on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Step 6 — First Agent Run (deposit)

The very first time the agent runs, it needs to deposit USDC into the Circle Gateway:

```bash
npm run agent -- --deposit
```

Subsequent runs (no deposit needed):
```bash
npm run agent
```

---

## Step 7 — Run the Demo (55 transactions)

To satisfy the hackathon requirement of 50+ onchain transactions:

```bash
npm run demo
```

This runs 55 autonomous purchases in batches of 3, each paying $0.001 USDC via EIP-3009 on ARC Testnet. Watch the live gallery update in the browser.

---

## Using the UI

1. Open the app at [http://localhost:3000](http://localhost:3000) (dev) or [http://localhost:4000](http://localhost:4000) (prod)
2. In the **Agent Command Center**, type a creative image prompt
3. Click **Trigger Autonomous Agent**
4. The agent signs a $0.001 USDC EIP-3009 payment, calls the Nano Banana 2 model, and returns the generated image
5. The gallery updates in real-time every 3 seconds

---

## Deploying the Entire System on Railway (Recommended)

Railway runs the Express server which also serves the statically-exported Next.js frontend from `frontend/out/`. This means **one Railway service = full stack** — no Vercel needed.

### Why it works as a single service

- `npm run build` does two things in sequence:
  - `tsc` — compiles TypeScript to `dist/`
  - `cd frontend && npm run build` — exports Next.js as static HTML/CSS/JS to `frontend/out/`
- `npm start` runs the Express server, which:
  - Serves the Next.js static files from `frontend/out/` at `/`
  - Serves all API routes at `/api/*`
  - Everything on one port, one public URL

### Deploy steps

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select `Remedy1995/agentic-commerce`
4. Railway auto-detects `package.json`. In **Settings**, confirm:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
5. Go to **Variables** and add all your environment variables:
   ```
   GEMINI_API_KEY=...
   CIRCLE_API_KEY=...
   CIRCLE_ENTITY_SECRET=...
   CIRCLE_WALLET_SET_ID=...
   MERCHANT_WALLET_ADDRESS=...
   AGENT_PRIVATE_KEY=...
   AGENT_WALLET_ADDRESS=...
   PRICE_PER_GENERATION=0.001
   ARC_RPC_URL=https://rpc.testnet.arc.network
   ARC_CHAIN_ID=5042002
   USDC_CONTRACT_ADDRESS=0x3600000000000000000000000000000000000000
   ```
   > Do NOT set `PORT` — Railway injects it automatically.
6. Click **Deploy**

Railway generates a public URL like `https://your-app.up.railway.app` — use this as your hackathon submission URL. Both the UI and API are served from it.

---

## Deploying Frontend to Vercel + Backend to Railway

Use this split approach if you want the frontend on Vercel's CDN edge network.

### Backend on Railway
Follow the Railway steps above but skip the frontend build — or keep the full build and just use the Railway URL as your API.

### Frontend on Vercel

1. The frontend is in `frontend/` — it's a standalone Next.js app
2. Change `next.config.ts` output mode from `"export"` back to default (remove the `output` line) so Vercel can use its serverless renderer
3. In `frontend/lib/api.ts`, update `BASE_URL` to point to your Railway backend URL:
   ```ts
   const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://your-app.up.railway.app";
   ```
4. Add `NEXT_PUBLIC_API_URL=https://your-app.up.railway.app` as an environment variable in Vercel
5. Go to [vercel.com](https://vercel.com) → **New Project** → Import `Remedy1995/agentic-commerce`
6. In the setup wizard:
   - **Root Directory:** `frontend`
   - **Framework:** Next.js (auto-detected)
   - Add the `NEXT_PUBLIC_API_URL` environment variable
7. Click **Deploy**

---

## Pushing to GitHub

```bash
# Stage all changes (never stage .env)
git add tsconfig.json package.json package-lock.json \
        src/server/services/circle.ts \
        src/server/routes/wallet.ts \
        scripts/setupWallet.ts \
        README.md

git commit -m "Fix TypeScript compilation and update README"

git push origin main
```

> `.env` is in `.gitignore` — never commit it. Set secrets directly in Railway/Vercel dashboards.

---

## Environment Variables Reference

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `GEMINI_API_KEY` | Google Gemini API key | [aistudio.google.com](https://aistudio.google.com) |
| `CIRCLE_API_KEY` | Circle Developer API key | [console.circle.com](https://console.circle.com) |
| `CIRCLE_ENTITY_SECRET` | Circle entity secret | Circle console → Settings |
| `CIRCLE_WALLET_SET_ID` | Circle wallet set ID | Circle console → Wallets |
| `MERCHANT_WALLET_ADDRESS` | Merchant EOA address (receives USDC) | `npm run setup-wallet` |
| `AGENT_PRIVATE_KEY` | Agent EOA private key (signs payments) | `npm run setup-wallet` |
| `AGENT_WALLET_ADDRESS` | Agent EOA address | `npm run setup-wallet` |
| `PORT` | Server port (default: 4000) | Set to `4000` locally |
| `ARC_RPC_URL` | ARC Testnet RPC | `https://rpc.testnet.arc.network` |
| `ARC_CHAIN_ID` | ARC Testnet Chain ID | `5042002` |
| `USDC_CONTRACT_ADDRESS` | USDC on ARC Testnet | `0x3600000000000000000000000000000000000000` |
| `PRICE_PER_GENERATION` | Price per image in USD | `0.001` (must be ≤ $0.01) |

---

## Project Structure

```
agentic-commerce/
├── src/
│   ├── server/
│   │   ├── index.ts              # Express app entry point
│   │   ├── routes/
│   │   │   ├── agent.ts          # POST /api/agent/trigger
│   │   │   ├── generate.ts       # POST /api/generate (payment-gated)
│   │   │   ├── gallery.ts        # GET /api/gallery
│   │   │   └── wallet.ts         # GET /api/wallet/balance, /merchant
│   │   └── services/
│   │       ├── circle.ts         # DCW client + gateway middleware
│   │       └── nanoBanana.ts     # Gemini image generation (Nano Banana 2)
│   └── agent/
│       └── index.ts              # Autonomous buyer agent (GatewayClient)
├── scripts/
│   ├── setupWallet.ts            # One-time wallet generation
│   └── demo.ts                   # 55-purchase demo script
├── frontend/                     # Next.js 14 App Router
│   ├── app/
│   │   ├── page.tsx              # Main page (polls gallery every 3s)
│   │   └── layout.tsx
│   ├── components/
│   │   ├── GenerateForm.tsx      # Agent Command Center
│   │   ├── ImageGallery.tsx      # Live image grid
│   │   ├── StatsBar.tsx          # Live stats (tx count, volume, speed)
│   │   └── TransactionFeed.tsx   # Live tx feed
│   └── lib/
│       ├── api.ts                # API client
│       └── types.ts              # Shared TypeScript types
├── .env.example                  # Environment template
├── package.json
└── tsconfig.json
```

---

## Hackathon Tracks

This project targets both tracks of the **Agentic Economy on ARC** hackathon:

- **API & Data Services** — Nano Banana 2 (`gemini-3.1-flash-image-preview`) as a paid API service, accessed autonomously by an agent via HTTP
- **Revenue Model & X402** — Circle Nanopayments (x402 protocol) for sub-cent, gas-free USDC payments gating access to the image generation API on ARC Testnet

**Judging criteria met:**
- Payment ≤ $0.01 per action (`$0.001`)
- 50+ onchain transactions (demo script runs 55)
- Autonomous agent (no human wallet interaction)
- ARC Testnet deployment
