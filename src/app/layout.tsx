import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lexicon Engine",
  description: "C2 Corporate English Mastery & Optimization",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lexicon",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents annoying zoom on double-tap
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-corporate-dark text-corporate-light">
        {/* We restrict the width to simulate a phone screen, even on desktop */}
        <main className="max-w-md mx-auto min-h-screen border-x border-zinc-900 bg-black relative flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
