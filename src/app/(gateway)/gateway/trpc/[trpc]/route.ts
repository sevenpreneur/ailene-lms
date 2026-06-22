import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { NextRequest, NextResponse } from "next/server";

const isOriginAllowed = (origin: string | null) => {
  if (!origin) {
    return false;
  }

  if (process.env.DOMAIN_MODE === "local") {
    // Accept example.com:3000 and any of its subdomains (www., ailene., api.).
    try {
      const host = new URL(origin).host;
      return host === "example.com:3000" || host.endsWith(".example.com:3000")
        ? origin
        : false;
    } catch {
      return false;
    }
  }

  const allowedOrigins = [
    "https://ailene.sevenpreneur.com",
    "https://gateway.sevenpreneur.com",
  ];
  if (allowedOrigins.includes(origin)) {
    return origin;
  }
  return false;
};

// Separate function for OPTIONS method (first connect from client)
export async function OPTIONS(req: NextRequest) {
  const isAllowed = isOriginAllowed(req.headers.get("origin"));
  if (!isAllowed) {
    return new NextResponse(null, {
      status: 404, // Not Found
    });
  }

  return new NextResponse(null, {
    status: 204, // No Content
    headers: {
      "Access-Control-Allow-Origin": isAllowed,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

const handler = (req: Request) => {
  const isAllowed = isOriginAllowed(req.headers.get("origin"));
  if (!isAllowed) {
    return new NextResponse(null, {
      status: 404, // Not Found
    });
  }

  return fetchRequestHandler({
    endpoint: "/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext(undefined),
    responseMeta({}) {
      return {
        headers: {
          "Access-Control-Allow-Origin": isAllowed,
        },
      };
    },
  });
};

export { handler as GET, handler as POST };
