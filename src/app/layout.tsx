import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ascend — English B1 → C2",
  description:
    "A grammar-led, spaced-repetition course that takes your English from B1 to C2 — one rewarding daily session at a time.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ascend",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbf7f0",
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
      <body className="antialiased min-h-screen bg-cream text-ink">
        <main className="max-w-md mx-auto min-h-screen bg-aurora relative flex flex-col shadow-soft">
          {children}
        </main>
      </body>
    </html>
  );
}
