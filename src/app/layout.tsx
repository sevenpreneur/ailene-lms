import "@/app/globals.css";
import AppPageState from "@/components/states/AppPageState";
import { QueryProvider } from "@/contexts/QueryProvider";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
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
      lang="en"
      className={`scroll-smooth ${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-space-grotesk" suppressHydrationWarning>
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
                  <div className="lg:hidden">
                    <AppPageState variant="ONLY_MOBILE" />
                  </div>
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
