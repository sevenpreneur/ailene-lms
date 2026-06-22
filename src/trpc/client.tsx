"use client";

import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import { makeQueryClient } from "./query-client";
import type { AppRouter } from "./routers/_app";

export const trpc = createTRPCReact<AppRouter>();

let clientQueryClientSingleton: QueryClient;
function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= makeQueryClient());
}

let sessionToken: string = "";

export function setSessionToken(newToken: string) {
  sessionToken = newToken;
}

export function TRPCProvider(
  props: Readonly<{
    children: React.ReactNode;
    baseURL: string;
  }>
) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() => {
    // In the browser, resolve the tRPC endpoint from the current host so the
    // app works on both the legacy (sevenpreneur.net → api.sevenpreneur.net)
    // and new (ailene.sevenpreneur.com → api.sevenpreneur.com) domains, keeping
    // the request same-site so the session cookie is sent. Falls back to the
    // server-provided baseURL (SSR, previews, local dev).
    let url = props.baseURL;
    if (typeof window !== "undefined") {
      const host = window.location.host.toLowerCase();
      if (host.endsWith("sevenpreneur.com")) {
        url = "https://api.sevenpreneur.com/trpc";
      } else if (host.endsWith("sevenpreneur.net")) {
        url = "https://api.sevenpreneur.net/trpc";
      }
    }
    return trpc.createClient({
      links: [
        httpBatchLink({
          url,
          headers() {
            if (sessionToken.trim().length > 0) {
              return {
                Authorization: `Bearer ${sessionToken}`,
              };
            }
            return {};
          },
        }),
      ],
    });
  });
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
