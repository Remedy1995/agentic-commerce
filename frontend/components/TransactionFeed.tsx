"use client";

import type { Generation } from "@/lib/types";

interface Props {
  generations: Generation[];
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

function shortAddr(addr: string): string {
  if (!addr || addr === "demo-browser") return "browser";
  if (addr === "unknown") return "unknown";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function TransactionFeed({ generations }: Props) {
  return (
    <div className="bg-[#13131a] border border-[#1e1e2e] rounded-xl p-5 flex-1">
      <p className="text-[0.65rem] uppercase tracking-widest text-[#6e6e8a] mb-3">
        Live Transactions
      </p>

      <div className="flex flex-col gap-1.5 max-h-[240px] overflow-y-auto pr-1">
        {generations.length === 0 ? (
          <p className="text-xs text-[#6e6e8a]">No transactions yet...</p>
        ) : (
          generations.slice(0, 20).map((g) => (
            <div
              key={g.id}
              className="flex items-center gap-2 text-xs px-2 py-2 bg-[#0a0a0f] rounded-lg animate-[slideIn_0.3s_ease]"
            >
              <span>🍌</span>
              <span className="flex-1 text-[#6e6e8a] overflow-hidden text-ellipsis whitespace-nowrap">
                {g.prompt}
              </span>
              <span className="font-bold text-[#f7d060] whitespace-nowrap">
                ${g.amount_usdc.toFixed(3)}
              </span>
              <span className="text-[#6e6e8a] whitespace-nowrap">{timeAgo(g.timestamp)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
