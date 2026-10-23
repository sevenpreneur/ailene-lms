import "@/app/globals.css";
import { QueryProvider } from "@/contexts/QueryProvider";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import localFont from "next/font/local";
import { Toaster } from "sonner";

// Keep fonts local so builds do not depend on Google Fonts responses.
const stackSansText = localFont({
  src: "./fonts/stack-sans-text/StackSansText.ttf",
  variable: "--font-stack-text",
  weight: "300 500",
  style: "normal",
  display: "swap",
});
const stackSansHeadline = localFont({
  src: "./fonts/stack-sans-headline/StackSansHeadline.ttf",
  variable: "--font-stack-headline",
  weight: "400 500",
  style: "normal",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Ailene AI Learn",
    default: "Ailene AI Learn",
  },
  description: "Platform pembelajaran dan penerapan AI Ailene",
  metadataBase: new URL("https://lms.ailene.id"),
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

export default function RootLayout(
  props: Readonly<{ children: React.ReactNode }>
) {
  const googleOauthId = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ID;

  return (
    <html
      lang="id"
      className={`scroll-smooth ${stackSansText.variable} ${stackSansHeadline.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans" suppressHydrationWarning>
        <GoogleOAuthProvider clientId={googleOauthId!}>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              storageKey="ailene-theme"
            >
              <SidebarProvider>
                <div className="min-h-screen bg-background">
                  {props.children}
                  <Toaster richColors position="top-center" />
                </div>
              </SidebarProvider>
            </ThemeProvider>
          </QueryProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
