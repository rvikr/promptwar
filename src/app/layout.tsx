import type { Metadata, Viewport } from "next";
import Navbar from "@/components/Navbar";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "VoteSmart | Election Education",
  description: "A non-partisan platform to educate citizens on the election process.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VoteSmart",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0f19",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <LanguageProvider>
          <div className="app-container">
            <Navbar />
            <main style={{ padding: "0 16px", maxWidth: "1200px", margin: "0 auto" }}>
              {children}
            </main>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
