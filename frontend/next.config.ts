import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    // Allow data URLs for Gemini base64 images
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    unoptimized: true,
  },
};

export default nextConfig;
