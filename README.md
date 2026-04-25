# NanaBanana Commerce — Agentic Image Marketplace

**NanaBanana Commerce** is an autonomous web3 marketplace built for the Lablab AI Hackathon. It demonstrates true **Agentic Commerce** by allowing an AI Agent acting as a buyer to interact with a smart contract payment protocol to securely generate state-of-the-art images.

### 🌟 Project Highlights

- **Nano Banana 2 (Gemini 3.1 Flash Image Preview)**: Cutting-edge, fast image generation via `@google/genai`.
- **EIP-3009 Circle Nanopayments**: Gasless USDC transfers via the official `@circle-fin/x402-batching` SDK and `GatewayClient`.
- **Full Autonomous Agent Flow**: The backend features an endpoint `/api/agent/trigger` that boots an autonomous agent. The agent signs Circle payment requests mathematically using its own EOA via standard cryptography, bypassing classic browser extensions entirely!
- **Premium Interface**: A deeply customized Next.js frontend built with TailwindCSS, featuring glassmorphism, dynamic glowing vectors, and dark space aesthetics.

---

## 🛠 Architecture

1. **Next.js UI (`frontend/`)**: Modern React interface deployed as a static build served by Express.
2. **Express Gateway (`src/server/`)**: Rejects requests without the `PAYMENT-SIGNATURE` headers validated by the Circle SDK middleware.
3. **Wallet Agent (`src/agent/`)**: An autonomous script holding a private key. It communicates with the UI, signs the $0.001 USDC payment payload intelligently without user intervention, and fetches the generation.

---

## 🚀 Setup & Execution

### 1. Requirements

Ensure you have Node.js 20+ installed. To install all dependencies for both the agent backend and frontend UI, run:

```bash
npm run install:all
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and fill in:
- `CIRCLE_API_KEY`, `CIRCLE_ENTITY_SECRET`, `CIRCLE_WALLET_SET_ID` — From your Circle Web3 console.
- `AGENT_PRIVATE_KEY`, `AGENT_WALLET_ADDRESS` — The bot's signing wallet.
- `GEMINI_API_KEY` — Your Google Gen AI key to access Gemini models (like Nano Banana).

### 3. Build & Run

We compile the TypeScript server and statically export the Next.js UI using a single unified command:

```bash
# Builds the production assets
npm run build

# Start the full ecosystem on port 4000
npm start
```

*For local development instead, you can run `npm run dev:frontend` and `npm run dev` in separate terminals.*

---

## 🍌 Usage

Open [http://localhost:4000](http://localhost:4000) in your browser. 
1. Use the **Agent Command Center**.
2. Input a creative prompt (e.g. "A cyberpunk banana cityscape, cinematic neon lighting").
3. Click **Trigger Autonomous Agent**.
4. The backend securely executes the agent which processes a cryptographic Circle SDK payment of $0.001 USDC. The image appears automatically!

---

## ☁️ Deployment Guides

### Deploying to Railway (Recommended)
Railway works perfectly for this project since it runs a continuous Express node process.
1. Connect your GitHub repository to [Railway](https://railway.app/).
2. Railway will automatically detect the `package.json`.
3. Add the environment variables from your `.env.example` directly in the Railway Variables UI.
4. Railway uses the `start` script out of the box. Ensure the build command runs `npm run build`.

### Deploying to Vercel (Frontend Only vs Full API)
Because Vercel is optimized for serverless functions, deploying the Express + Node Agent architecture requires a customized `vercel.json` if relying fully on Vercel.
For the absolute simplest deployment on Vercel, deploy *only* the Next.js `frontend/` directory to Vercel, and configure its API proxy (`NEXT_PUBLIC_API_URL`) to point to the backend deployed on Railway/Render.
To deploy just the frontend:
1. Import the project on Vercel.
2. In the setup wizard, set the Root Directory to `frontend`.
3. Vercel will auto-detect Next.js and build it correctly!
