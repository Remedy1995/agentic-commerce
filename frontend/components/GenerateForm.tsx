"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { Generation } from "@/lib/types";

interface Props {
  onGenerated: (g: Generation) => void;
}

export default function GenerateForm({ onGenerated }: Props) {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [resolution, setResolution] = useState("1K");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ msg: string; type: "success" | "error" | null }>({
    msg: "",
    type: null,
  });

  async function handleGenerate() {
    if (!prompt.trim()) {
      setStatus({ msg: "Please enter a prompt first.", type: "error" });
      return;
    }

    setLoading(true);
    setStatus({ msg: "Waking Wallet Agent & Sending Prompt...", type: null });

    try {
      // Use the actual autonomous agent trigger
      const data = await api.triggerAgent({
        prompt: prompt.trim()
      });
      setPrompt("");
      setStatus({ msg: "Agent purchased image successfully!", type: "success" });
      onGenerated(data.generation);
    } catch (err: any) {
      setStatus({ msg: err.message ?? "Agent execution failed", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="premium-card rounded-xl p-5 relative overflow-hidden group">
      {/* Subtle animated background glow */}
      <div className="absolute -inset-2 bg-gradient-to-r from-[rgba(124,106,247,0.1)] to-[rgba(247,208,96,0.05)] rounded-xl blur-xl transition-all duration-700 opacity-50 group-hover:opacity-100" />
      
      <div className="relative">
        <p className="text-[0.65rem] uppercase tracking-widest text-[#8e8ea6] mb-3 flex items-center justify-between">
          <span>Agent Command Center</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7c6af7] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7c6af7]"></span>
          </span>
        </p>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Command the AI Agent e.g. 'A cyberpunk banana city at night, neon lights, cinematic'"
          rows={4}
          disabled={loading}
          className="w-full bg-[#0a0a0f]/80 backdrop-blur-md border border-[rgba(124,106,247,0.2)] rounded-lg text-sm text-[#e8e8f0] placeholder-[#8e8ea6] p-3 resize-none outline-none focus:border-[#7c6af7] focus:shadow-[0_0_10px_rgba(124,106,247,0.2)] transition-all disabled:opacity-50"
        />

        <div className="grid grid-cols-2 gap-2 mt-3 opacity-50 cursor-not-allowed" title="Resolution fixed for demo mode">
          <div>
            <label className="text-[0.65rem] text-[#8e8ea6] uppercase tracking-wider">Aspect Ratio</label>
            <select disabled className="w-full mt-1 bg-[#0a0a0f]/50 border border-[rgba(124,106,247,0.1)] rounded-lg text-sm text-[#e8e8f0] p-2 outline-none">
              <option value="1:1">1:1 Square</option>
            </select>
          </div>
          <div>
            <label className="text-[0.65rem] text-[#8e8ea6] uppercase tracking-wider">Resolution</label>
            <select disabled className="w-full mt-1 bg-[#0a0a0f]/50 border border-[rgba(124,106,247,0.1)] rounded-lg text-sm text-[#e8e8f0] p-2 outline-none">
              <option value="1K">1K Fixed Native</option>
            </select>
          </div>
        </div>

        {/* Price tag */}
        <div className="flex items-center justify-between mt-3 px-3 py-2 rounded-lg bg-[rgba(247,208,96,0.06)] border border-[rgba(247,208,96,0.15)] text-sm shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
          <span className="text-[#8e8ea6]">Agent Payment</span>
          <span className="font-bold text-[#f7d060] drop-shadow-[0_0_8px_rgba(247,208,96,0.6)]">$0.001 USDC</span>
        </div>

        {/* Payment method */}
        <div className="flex items-center justify-between mt-2 px-3 py-2 rounded-lg bg-[rgba(124,106,247,0.06)] border border-[rgba(124,106,247,0.15)] text-xs text-[#8e8ea6]">
          <span>Protocol</span>
          <span className="text-[#7c6af7] font-medium drop-shadow-[0_0_5px_rgba(124,106,247,0.3)]">Circle Gateway · EIP-3009</span>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full mt-4 py-3 rounded-lg bg-gradient-to-r from-[#7c6af7] to-[#5a4fd6] text-white font-semibold text-sm transition-all hover:opacity-90 hover:shadow-[0_0_20px_rgba(124,106,247,0.5)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
        >
          {loading ? (
            <span className="flex flex-col items-center justify-center gap-1">
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Executing Smart Contract...
              </span>
            </span>
          ) : (
            "Trigger Autonomous Agent"
          )}
        </button>

        {status.type && (
          <div
            className={`mt-4 px-3 py-2.5 rounded-lg text-xs backdrop-blur-md ${
              status.type === "success"
                ? "bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.3)] text-[#4ade80]"
                : "bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.3)] text-[#f87171]"
            }`}
          >
            {status.msg}
          </div>
        )}
      </div>
    </div>
  );
}
