import type { Metadata } from "next";
import { Poppins, Inter, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import Navbar from "../components/shared/Navbar";
import { AuthModalProvider } from "../lib/AuthModalContext";
import { SITE_URL } from "../lib/siteConfig";
import { getServerSession } from "../lib/getServerSession";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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

// Landing-page-only display accent (hero headline, section titles). Scoped
// via the `font-display` utility in globals.css rather than overriding
// `--font-heading` -- Poppins stays the sitewide heading font everywhere
// else (navbar, other pages), per explicit decision to keep this change
// contained to the landing page redesign.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  // `axes` requires a variable-weight font -- combining it with an explicit
  // weight array/string throws "Axes can only be defined for variable fonts
  // when the weight property is nonexistent...". Per Next.js's own axes
  // example (Inter + axes: ['slnt']), weight is simply omitted so the full
  // variable weight range loads; font-weight in CSS still works normally
  // against it.
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await getServerSession();

  return (
    <html
      lang="en"
      className={poppins.variable + ' ' + inter.variable + ' ' + geistMono.variable + ' ' + fraunces.variable + ' h-full antialiased'}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthModalProvider>
          {!user && <Navbar />}
          {children}
        </AuthModalProvider>
      </body>
    </html>
  );
}