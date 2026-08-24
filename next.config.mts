import type { NextConfig } from "next";

const SESSION_COOKIE_NAME = "session_token_ailene_lms";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
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
        hostname: "lh3.googleusercontent.com",
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
            value:
              "(lms.ailene.id|(lms.)?example.com|ailene-lms(-[^.]+).vercel.app).*",
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
      // No session cookie on a protected path -> send to /auth/login.
      {
        source:
          "/:path((?!auth/login|api/auth/callback/google|_next/static|_next/image|favicon\\.ico|.*\\..*).*)",
        has: [
          {
            type: "header",
            key: "host",
            value:
              "(lms.ailene.id|(lms.)?example.com|ailene-lms(-[^.]+).vercel.app).*",
          },
        ],
        missing: [{ type: "cookie", key: SESSION_COOKIE_NAME }],
        destination: "/auth/login",
        permanent: false,
      },
      // Already signed in -> don't show the login page again.
      {
        source: "/auth(.*)",
        has: [
          {
            type: "header",
            key: "host",
            value:
              "(lms.ailene.id|(lms.)?example.com|ailene-lms(-[^.]+).vercel.app).*",
          },
          { type: "cookie", key: SESSION_COOKIE_NAME, value: undefined },
        ],
        destination: "/",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/(gateway|lms)",
          destination: "/_not-found/page",
        },
      ],
      afterFiles: [
        // Apex domain + lms subdomain → the app (served from the lms group).
        {
          source: "/:path*",
          has: [
            {
              type: "header",
              key: "host",
              value: "(lms.ailene.id|(lms.)?example.com).*",
            },
          ],
          destination: "/lms/:path*",
        },
        // Vercel preview deployments → the app.
        {
          source: "/:path*",
          has: [
            {
              type: "header",
              key: "host",
              value: "ailene-lms(-[^.]+).vercel.app.*",
            },
          ],
          destination: "/lms/:path*",
        },
        // Gateway subdomain — currently empty pending ailene-lms-backend endpoints.
        {
          source: "/:path*",
          has: [
            {
              type: "header",
              key: "host",
              value: "(gateway.ailene.id|gateway.example.com).*",
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
        "ailene.id",
        "*.ailene.id",
        "example.com",
        "*.example.com",
      ],
    },
  },
};

export default nextConfig;
