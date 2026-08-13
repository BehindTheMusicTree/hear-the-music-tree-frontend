import { Analytics } from "@vercel/analytics/next";
import { Inter } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { APP_NAME } from "@constants/app";
import hearTheMusicTreeFavicon from "@behindthemusictree/brand/favicons/hear-the-music-tree/favicon.svg";
import "./globals.css";
import "@behindthemusictree/brand/tokens/theme.css";
import "@behindthemusictree/brand/styles/icon-links.css";
import "@behindthemusictree/genre-tree-view/styles.css";

const faviconUrl = typeof hearTheMusicTreeFavicon === "string" ? hearTheMusicTreeFavicon : hearTheMusicTreeFavicon.src;

export const metadata: Metadata = {
  title: APP_NAME,
  description: "A cloud-based audio file manager for collectors, DJs, curators, and listeners",
  icons: {
    icon: [{ url: faviconUrl, type: "image/svg+xml" }],
    shortcut: faviconUrl,
    apple: faviconUrl,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  fallback: ["system-ui", "sans-serif"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
