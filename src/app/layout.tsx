import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Coastal Safety Hub",
  description: "Real-time coastal hazard reporting and safety communication platform",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: [
    "coastal safety",
    "hazard reporting", 
    "ocean safety",
    "emergency alerts",
    "weather warnings"
  ],
  authors: [
    {
      name: "Coastal Safety Team",
    },
  ],
  icons: {
    icon: "/icons/icon-192x192.png",
    shortcut: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport = {
  themeColor: "#fbbf24",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/icons/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#fbbf24" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CoastalSafe" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body
        className={`${inter.variable} antialiased bg-black text-gray-100`}
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {children}
      </body>
    </html>
  );
}
