"use client";

import type { Generation } from "@/lib/types";

interface Props {
  generations: Generation[];
}

function shortAddr(addr: string): string {
  if (!addr || addr === "demo-browser") return "browser";
  if (addr === "unknown") return "unknown";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function ImageGallery({ generations }: Props) {
  if (generations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-72 text-center text-[#8e8ea6]">
        <span className="text-4xl mb-4 opacity-70">🚀</span>
        <h3 className="text-lg font-medium mb-1 drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">Awaiting Agent Actions</h3>
        <p className="text-sm">Trigger the Autonomous Agent from the command center to generate art!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {generations.map((g) => (
        <ImageCard key={g.id} generation={g} />
      ))}
    </div>
  );
}

function ImageCard({ generation: g }: { generation: Generation }) {
  function handleClick() {
    // Open image in new tab as a data URL
    const win = window.open();
    if (win) {
      win.document.write(`<body style="margin:0;background:#050508;display:flex;justify-content:center;align-items:center;min-height:100vh;"><img src="${g.image_data_url}" style="max-width:100%;max-height:100vh;box-shadow:0 0 50px rgba(124,106,247,0.3);" /></body>`);
    }
  }

  return (
    <div
      onClick={handleClick}
      className="gallery-item-enter group premium-card rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:border-[#7c6af7] hover:shadow-[0_12px_40px_rgba(124,106,247,0.3)]"
    >
      {/* Image */}
      <div className="relative w-full aspect-square bg-[#0a0a0f] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={g.image_data_url}
          alt={g.prompt}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <span className="text-white text-sm font-semibold tracking-wider uppercase drop-shadow-md">
            Enlarge Output
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 bg-[#0a0a0f]/40 backdrop-blur-sm border-t border-[rgba(124,106,247,0.1)]">
        <p className="text-xs text-[#e8e8f0] line-clamp-2 mb-3 leading-relaxed drop-shadow-sm">{g.prompt}</p>

        <div className="flex items-center justify-between">
          <span className="font-mono text-[0.68rem] text-[#7c6af7] bg-[rgba(124,106,247,0.1)] px-2 py-0.5 rounded-md border border-[rgba(124,106,247,0.2)] shadow-[0_0_5px_rgba(124,106,247,0.1)]">
            {shortAddr(g.payer)}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[0.65rem] text-[#8e8ea6]">
              {new Date(g.timestamp).toLocaleTimeString()}
            </span>
            <span className="font-bold text-xs text-[#f7d060] drop-shadow-[0_0_8px_rgba(247,208,96,0.5)]">
              ${g.amount_usdc.toFixed(3)}
            </span>
          </div>
        </div>

        {/* Model badge */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[0.6rem] uppercase tracking-wider text-[#7c6af7] border border-[rgba(124,106,247,0.3)] rounded-full px-2 py-0.5 shadow-[0_0_8px_rgba(124,106,247,0.2)]">
            Nano Banana 2
          </span>
          <span className="text-[0.6rem] uppercase tracking-wider text-[#4ade80] border border-[rgba(74,222,128,0.3)] rounded-full px-2 py-0.5 shadow-[0_0_8px_rgba(74,222,128,0.2)]">
            ARC Testnet
          </span>
        </div>
      </div>
    </div>
  );
}
