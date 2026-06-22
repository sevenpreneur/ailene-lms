/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yt3.googleusercontent.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "tskubmriuclmbcfmaiur.supabase.co",
        port: "",
      },
      {
        protocol: "https",
        hostname: "www.hutamakarya.com",
        port: "",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:all*",
        has: [
          {
            type: "header",
            key: "host",
            value: "(ailene.sevenpreneur.com|(www.|ailene.)?example.com).*",
          },
        ],
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
  async redirects() {
    // Auth (login) is handled by a separate repo, so there are no /auth pages
    // to guard here anymore. Gating redirects to the external LOGIN_URL from the
    // section layouts (src/lib/config.ts).
    return [];
  },
  async rewrites() {
    let ngrokDomain = "ngrok-no-domain.ngrok-free.app";
    if (process.env.DOMAIN_MODE === "local") {
      const ngrokDomainEnv = process.env.NGROK_DOMAIN;
      if (ngrokDomainEnv !== undefined && ngrokDomainEnv !== "") {
        ngrokDomain = ngrokDomainEnv;
      }
    }
    return {
      beforeFiles: [
        {
          source: "/(gateway|ailene)",
          destination: "/_not-found/page",
        },
      ],
      afterFiles: [
        // Apex domain + www/ailene subdomain → the app (served from the ailene group).
        {
          source: "/:path*",
          has: [
            {
              type: "header",
              key: "host",
              value: "(ailene.sevenpreneur.com|(www.|ailene.)?example.com).*",
            },
          ],
          destination: "/ailene/:path*",
        },
        // Vercel preview deployments → the app.
        {
          source: "/:path*",
          has: [
            {
              type: "header",
              key: "host",
              value: "sevenpreneur(-[^.]+).vercel.app.*",
            },
          ],
          destination: "/ailene/:path*",
        },
        // tRPC + webhooks live under the gateway subdomain.
        {
          source: "/:path*",
          has: [
            {
              type: "header",
              key: "host",
              value:
                "(gateway.sevenpreneur.com|gateway.example.com).*",
            },
          ],
          destination: "/gateway/:path*",
        },
        // ngrok tunnel (local dev) → gateway.
        {
          source: "/:path*",
          has: [
            {
              type: "header",
              key: "host",
              value: ngrokDomain + ".*",
            },
          ],
          destination: "/gateway/:path*",
        },
      ],
    };
  },
  allowedDevOrigins: ["www.example.com", "*.example.com"],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "sevenpreneur.com",
        "*.sevenpreneur.com",
        "example.com",
        "*.example.com",
        process.env.NGROK_DOMAIN,
      ],
    },
  },
};

export default nextConfig;
