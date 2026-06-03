import "@/app/globals.css";
import AppPageState from "@/components/states/AppPageState";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { TRPCProvider } from "@/trpc/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import {
  Cormorant_Garamond,
  Fraunces,
  Geist,
  Geist_Mono,
  Inter,
  JetBrains_Mono,
  Mona_Sans,
  Plus_Jakarta_Sans,
} from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "sonner";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const openSauceOne = localFont({
  variable: "--font-open-sauce-one",
  display: "swap",
  src: [
    {
      path: "././fonts/OpenSauceOne-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "././fonts/OpenSauceOne-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "././fonts/OpenSauceOne-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "././fonts/OpenSauceOne-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "././fonts/OpenSauceOne-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "././fonts/OpenSauceOne-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "././fonts/OpenSauceOne-Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
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
      className={`scroll-smooth ${monaSans.variable} ${plusJakartaSans.variable} ${openSauceOne.variable} ${inter.variable} ${fraunces.variable} ${cormorantGaramond.variable} ${jetbrainsMono.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <GoogleOAuthProvider clientId={googleOauthId!}>
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
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
