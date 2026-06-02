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
            value: "www.(sevenpreneur.(com|net)|example.com).*",
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
    return [
      // Unauthenticated visitors are bounced to /auth/login by the gated
      // dashboard layout: src/app/(www)/www/(dashboard)/layout.tsx.
      // Logged-in users who land on an auth page are sent to the dashboard.
      {
        source: "/auth(.*)",
        has: [
          {
            type: "header",
            key: "host",
            value: "(www.)?(sevenpreneur.net|example.com).*",
          },
          {
            type: "cookie",
            key: "session_token",
            value: undefined,
          },
        ],
        destination: "/",
        permanent: false,
      },
    ];
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
          source: "/(api|www)",
          destination: "/_not-found/page",
        },
      ],
      afterFiles: [
        // Apex domain + www subdomain → the app (served from the www group).
        {
          source: "/:path*",
          has: [
            {
              type: "header",
              key: "host",
              value: "(www.)?(sevenpreneur.net|example.com).*",
            },
          ],
          destination: "/www/:path*",
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
          destination: "/www/:path*",
        },
        // tRPC lives under the api subdomain.
        {
          source: "/:path*",
          has: [
            {
              type: "header",
              key: "host",
              value: "api.(sevenpreneur.net|example.com).*",
            },
          ],
          destination: "/api/:path*",
        },
        // ngrok tunnel (local dev) → api.
        {
          source: "/:path*",
          has: [
            {
              type: "header",
              key: "host",
              value: ngrokDomain + ".*",
            },
          ],
          destination: "/api/:path*",
        },
      ],
    };
  },
  allowedDevOrigins: ["www.example.com", "*.example.com"],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "sevenpreneur.net",
        "*.sevenpreneur.net",
        "example.com",
        "*.example.com",
        process.env.NGROK_DOMAIN,
      ],
    },
  },
};

export default nextConfig;
