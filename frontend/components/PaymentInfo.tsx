"use client";

import type { MerchantResponse } from "@/lib/types";

interface Props {
  merchant: MerchantResponse | null;
}

export default function PaymentInfo({ merchant }: Props) {
  return (
    <div className="bg-[#13131a] border border-[#1e1e2e] rounded-xl p-5 text-sm">
      <p className="text-[0.65rem] uppercase tracking-widest text-[#6e6e8a] mb-3">
        Payment Details
      </p>

      <div className="flex flex-col gap-2 text-xs">
        <Row label="Protocol" value="Circle Nanopayments" valueClass="text-[#e8e8f0]" />
        <Row label="Standard" value="EIP-3009 (TransferWithAuthorization)" valueClass="text-[#7c6af7]" />
        <Row label="Settlement" value="ARC Testnet (5042002)" valueClass="text-[#e8e8f0]" />
        <Row label="Token" value="USDC (0x3600...0000)" valueClass="text-[#e8e8f0]" />
        <Row label="Gas cost" value="$0.000 (covered by Circle)" valueClass="text-[#4ade80]" />

        {merchant && (
          <div className="mt-1">
            <p className="text-[#6e6e8a]">Merchant wallet</p>
            <p className="font-mono text-[0.68rem] text-[#7c6af7] break-all mt-0.5">
              {merchant.address}
            </p>
          </div>
        )}

        <div className="mt-3 p-3 rounded-lg bg-[rgba(247,208,96,0.05)] border border-[rgba(247,208,96,0.12)]">
          <p className="text-[#f7d060] text-[0.7rem] font-medium mb-1">Why Nanopayments?</p>
          <p className="text-[#6e6e8a] leading-relaxed">
            Traditional gas: <span className="text-[#f87171]">$0.05–$2.00</span> per tx.
            Our price: <span className="text-[#4ade80]">$0.001</span> per image.
            Gas alone would be <span className="text-[#f87171]">50–2000×</span> the service price —
            making this model impossible without nanopayments.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass: string;
}) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-[#6e6e8a]">{label}</span>
      <span className={`font-medium text-right ${valueClass}`}>{value}</span>
    </div>
  );
}
