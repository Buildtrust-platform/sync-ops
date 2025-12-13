import { Inter, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import ConfigureAmplify from "./amplify-config";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastProvider } from "./components/Toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SyncOps - Production Management Platform",
    template: "%s | SyncOps",
  },
  description: "Professional media production management platform. Streamline your creative workflow from development to distribution.",
  keywords: ["production management", "media", "video production", "creative workflow", "asset management"],
  authors: [{ name: "SyncOps" }],
  creator: "SyncOps",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "SyncOps",
    title: "SyncOps - Production Management Platform",
    description: "Professional media production management platform. Streamline your creative workflow from development to distribution.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SyncOps - Production Management Platform",
    description: "Professional media production management platform.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <ToastProvider>
            <ConfigureAmplify>{children}</ConfigureAmplify>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
