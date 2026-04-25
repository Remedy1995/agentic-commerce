"use client";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-[#1e1e2e] bg-[rgba(10,10,15,0.92)] backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="text-xl">🍌</span>
        <span className="text-lg font-bold tracking-tight">
          <span className="text-[#f7d060]">NanaBanana</span> Commerce
        </span>
        <span className="ml-1 text-xs text-[#6e6e8a] uppercase tracking-widest font-normal">
          on ARC
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Model badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#6e6e8a] border border-[#1e1e2e] rounded-full px-3 py-1.5">
          <span className="text-[#7c6af7]">◆</span>
          gemini-3.1-flash-image-preview
        </div>

        {/* Chain badge */}
        <div className="flex items-center gap-1.5 text-xs text-[#6e6e8a] border border-[#1e1e2e] rounded-full px-3 py-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
          ARC Testnet · 5042002
        </div>
      </div>
    </header>
  );
}
