import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  compress: true,
  poweredByHeader: false,
  serverExternalPackages: ["@prisma/client", ".prisma/client", "sharp"],
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    loader: "custom",
    loaderFile: "./src/lib/imageLoader.ts",
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    serverActions: { bodySizeLimit: "10mb" },
  },
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "Link", value: "<https://t.me>; rel=dns-prefetch" },
      ],
    },
    {
      source: "/",
      headers: [
        { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        { key: "Link", value: "</logo-preloader.png>; rel=preload; as=image; fetchpriority=high, </logo.png>; rel=preload; as=image" },
      ],
    },
    {
      source: "/events/:path*",
      headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }],
    },
    {
      source: "/_next/static/:path*",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    },
    {
      source: "/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif|mp4|webm|woff2|woff)",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    },
  ],
};

export default nextConfig;
