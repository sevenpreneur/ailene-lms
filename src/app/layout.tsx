import "@/app/globals.css";
import AppPageState from "@/components/states/AppPageState";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { TRPCProvider } from "@/trpc/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { JetBrains_Mono, Manrope } from "next/font/google";
import { Toaster } from "sonner";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | AI LMS Sevenpreneur",
    default: "AI LMS Sevenpreneur",
  },
  description: "Platform pelatihan AI Sevenpreneur",
  metadataBase: "https://sevenpreneur.net",
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
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
};

let baseURL = "https://api.sevenpreneur.net/trpc";
if (process.env.DOMAIN_MODE === "local")
  baseURL = "https://api.example.com:3000/trpc";

export default function RootLayout(
  props: Readonly<{ children: React.ReactNode }>
) {
  const googleOauthId = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ID;

  return (
    <html
      lang="en"
      className={`scroll-smooth ${manrope.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-manrope" suppressHydrationWarning>
        <GoogleOAuthProvider clientId={googleOauthId!}>
          <TRPCProvider baseURL={baseURL}>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              storageKey="ailene-theme"
            >
              <SidebarProvider>
                <div className="min-h-screen bg-dashboard-bg dark:bg-black">
                  {props.children}
                  <div className="lg:hidden">
                    <AppPageState variant="ONLY_MOBILE" />
                  </div>
                  <Toaster richColors position="top-center" />
                </div>
              </SidebarProvider>
            </ThemeProvider>
          </TRPCProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
