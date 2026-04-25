export interface Generation {
  id: string;
  prompt: string;
  image_data_url: string;
  mime_type: string;
  model: string;
  payer: string;
  amount_usdc: number;
  timestamp: number;
  generation_id: string;
}

export interface GalleryResponse {
  total: number;
  generations: Generation[];
}

export interface StatsResponse {
  total_transactions: number;
  total_usdc_volume: string;
  unique_payers: number;
  price_per_generation_usdc: number;
  chain: string;
  chain_id: number;
  explorer: string;
  why_nanopayments: {
    traditional_gas_cost_usd: string;
    nanopayment_price_usd: number;
    gas_cost_would_exceed_price: boolean;
    nanopayments_gas_cost: number;
    explanation: string;
  };
}

export interface MerchantResponse {
  address: string;
  chain: string;
  chain_id: number;
  usdc_contract: string;
}
