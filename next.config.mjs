/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // Server Actions são usadas nos formulários do painel e no upload de fotos.
    serverActions: {
      bodySizeLimit: "16mb",
    },
  },
  // Fotos/documentos são servidos same-origin por /uploads/[...path]
  // (ver lib/storage/local.ts) — o otimizador de imagem não precisa de remotePatterns.

  // Headers de segurança básicos, sem depender do proxy de produção estar
  // configurado corretamente. Não inclui Content-Security-Policy: o site usa
  // JSON-LD inline (dangerouslySetInnerHTML) e tiles do Leaflet/OpenStreetMap,
  // e uma CSP estrita precisa ser testada num navegador de verdade pra não
  // quebrar isso silenciosamente — fica como próximo passo, não algo pra
  // adivinhar aqui.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
