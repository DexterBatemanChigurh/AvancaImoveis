/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // Server Actions são usadas nos formulários do painel.
    serverActions: {
      bodySizeLimit: "8mb", // upload de fotos passa por aqui na Fase 1
    },
  },
  images: {
    // O bucket público do R2 é servido por um domínio próprio/of dev.
    // Ajuste o hostname em R2_PUBLIC_HOST (.env) e replique aqui.
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
    ],
  },
};

export default nextConfig;
