import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NanaBanana Commerce — AI Images on ARC",
  description:
    "Agentic image marketplace powered by Nano Banana 2 (Gemini) + Circle Nanopayments on ARC Testnet",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0f] text-[#e8e8f0]">{children}</body>
    </html>
  );
}
