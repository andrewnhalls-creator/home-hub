import type { NextConfig } from "next";

// Content Security Policy: self + Supabase (REST/Auth/Realtime websockets).
// 'unsafe-inline' for styles is required by Tailwind's inline style attributes;
// Next.js script bootstrapping needs 'unsafe-inline' scripts unless a nonce
// pipeline is added (documented trade-off for this private 2-person app).
const SUPABASE_ORIGIN = "https://xzkavpjwvadqldauaabm.supabase.co";
const csp = [
  "default-src 'self'",
  `connect-src 'self' ${SUPABASE_ORIGIN} wss://xzkavpjwvadqldauaabm.supabase.co`,
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "manifest-src 'self'",
  "worker-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
