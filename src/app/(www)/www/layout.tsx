import "@/app/globals.css";
import AppPageState from "@/components/states/AppPageState";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { TRPCProvider } from "@/trpc/client";
import { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

const appBaseURL = "https://sevenpreneur.net";

export const metadata: Metadata = {
  title: {
    template: "%s | Ailene Sevenpreneur",
    default: "Ailene Sevenpreneur",
  },
  description: "Platform pelatihan AI internal Sevenpreneur",
  metadataBase: new URL(appBaseURL),
  alternates: { canonical: "/" },
  openGraph: {
    images: [
      {
        url: "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/sevenpreneur/meta-og-image-sevenpreneur-2.webp",
        width: 800,
        height: 600,
      },
    ],
  },
};

let baseURL = "https://api.sevenpreneur.net/trpc";
if (process.env.DOMAIN_MODE === "local")
  baseURL = "https://api.example.com:3000/trpc";

// Shell only. Authentication is enforced per-section (champion/student/sponsor
// layouts + the root page redirect), so that the public /auth/login page can
// render under this same layout without being gated.
export default function AileneLayout(
  props: Readonly<{ children: React.ReactNode }>
) {
  return (
    <TRPCProvider baseURL={baseURL}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        storageKey="ailene-theme"
      >
        <SidebarProvider>
          <div className="font-geist-sans min-h-screen bg-dashboard-bg dark:bg-black">
            {props.children}
            <div className="lg:hidden">
              <AppPageState variant="ONLY_MOBILE" />
            </div>
            <Toaster richColors position="top-center" />
          </div>
        </SidebarProvider>
      </ThemeProvider>
    </TRPCProvider>
  );
}
