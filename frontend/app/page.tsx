"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import StatsBar from "@/components/StatsBar";
import GenerateForm from "@/components/GenerateForm";
import PaymentInfo from "@/components/PaymentInfo";
import TransactionFeed from "@/components/TransactionFeed";
import ImageGallery from "@/components/ImageGallery";
import { api } from "@/lib/api";
import type { Generation, StatsResponse, MerchantResponse } from "@/lib/types";

export default function Home() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [merchant, setMerchant] = useState<MerchantResponse | null>(null);

  // Load static merchant info once
  useEffect(() => {
    api.merchant().then(setMerchant).catch(() => {});
  }, []);

  // Poll gallery + stats every 3 seconds
  const refresh = useCallback(async () => {
    try {
      const [galleryData, statsData] = await Promise.all([api.gallery(), api.stats()]);
      setGenerations(galleryData.generations);
      setStats(statsData);
    } catch {
      // server may not be up yet
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

  function handleGenerated(g: Generation) {
    setGenerations((prev) => [g, ...prev]);
    refresh();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <StatsBar stats={stats} />

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ── */}
        <aside className="w-[380px] shrink-0 flex flex-col gap-4 p-5 border-r border-[#1e1e2e] overflow-y-auto">
          <GenerateForm onGenerated={handleGenerated} />
          <PaymentInfo merchant={merchant} />
          <TransactionFeed generations={generations} />
        </aside>

        {/* ── Gallery ── */}
        <main className="flex-1 p-5 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[0.65rem] uppercase tracking-widest text-[#6e6e8a]">
              Image Gallery
            </p>
            <span className="text-xs text-[#6e6e8a]">
              {generations.length} image{generations.length !== 1 ? "s" : ""}
            </span>
          </div>

          <ImageGallery generations={generations} />
        </main>
      </div>
    </div>
  );
}
