"use client";

import type { StatsResponse } from "@/lib/types";

interface Props {
  stats: StatsResponse | null;
}

export default function StatsBar({ stats }: Props) {
  const items = [
    {
      label: "Total Generations",
      value: stats?.total_transactions ?? 0,
      color: "text-[#f7d060]",
    },
    {
      label: "USDC Volume",
      value: stats ? `$${parseFloat(stats.total_usdc_volume).toFixed(6)}` : "$0.000000",
      color: "text-[#f7d060]",
    },
    {
      label: "Price / Image",
      value: stats ? `$${stats.price_per_generation_usdc.toFixed(3)}` : "$0.001",
      color: "text-[#f7d060]",
    },
    {
      label: "Unique Payers",
      value: stats?.unique_payers ?? 0,
      color: "text-[#7c6af7]",
    },
    {
      label: "Gas Cost",
      value: "$0.000",
      color: "text-[#4ade80]",
    },
    {
      label: "Model",
      value: "Nano Banana 2",
      color: "text-[#6e6e8a]",
    },
  ];

  return (
    <div className="flex gap-6 px-6 py-3 bg-[#13131a] border-b border-[#1e1e2e] overflow-x-auto">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col whitespace-nowrap">
          <span className="text-[0.65rem] uppercase tracking-widest text-[#6e6e8a]">
            {item.label}
          </span>
          <span className={`text-base font-bold ${item.color}`}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}
