import type { Metadata } from "next";
import { DM_Serif_Display, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/shared/Navbar";
import { AuthModalProvider } from "../lib/AuthModalContext";
import { SITE_URL } from "../lib/siteConfig";

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
});

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BLumi | Where Stories Bloom",
    template: "%s | BLumi",
  },
  description:
    "Discover, curate, and track your next favorite BL series, movies, and anime — handpicked with love.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={dmSerifDisplay.variable + ' ' + inter.variable + ' ' + geistMono.variable + ' h-full antialiased'}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthModalProvider>
          <Navbar />
          {children}
        </AuthModalProvider>
      </body>
    </html>
  );
}