import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Sora } from "next/font/google";
// @ts-ignore Next.js processes this stylesheet import at build time.
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const jet = JetBrains_Mono({
  variable: "--font-jet",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const SITE = "https://streakment.vercel.app";
const DESCRIPTION =
  "Streakment is a free streak tracker for building self-discipline. Start a commitment, watch the day count climb through ten milestones from Begin to Legend, journal what triggers a relapse, and see your whole history on a heatmap.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Streakment — Keep the commitment alive",
    template: "%s · Streakment",
  },
  description: DESCRIPTION,
  applicationName: "Streakment",
  keywords: [
    "streak tracker",
    "habit tracker",
    "self discipline app",
    "commitment tracker",
    "sobriety counter",
    "day counter",
    "quit habit tracker",
    "discipline streak",
    "milestone tracker",
    "relapse tracker",
    "free habit app",
  ],
  authors: [{ name: "Arnab Saha", url: "https://arnabsaha.vercel.app" }],
  creator: "Arnab Saha",
  publisher: "Arnab Saha",
  manifest: "/manifest.webmanifest",
  alternates: { canonical: SITE },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "Streakment",
    title: "Streakment — Keep the commitment alive",
    description: DESCRIPTION,
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: "Streakment" }],
  },
  twitter: {
    card: "summary",
    title: "Streakment — Keep the commitment alive",
    description: DESCRIPTION,
    images: ["/icons/icon-512.png"],
  },
  icons: { apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Streakment" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#14110E",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** Answer-engine / rich-result structured data. Gives Google and AI
 *  assistants an explicit machine-readable description of what the app
 *  is, that it's free, and who built it. */
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Streakment",
  url: SITE,
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Any (web, installable PWA)",
  description: DESCRIPTION,
  slogan: "Keep the commitment alive",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Ascent streaks with ten milestones from Begin to Legend",
    "Fixed-length Sprint challenges",
    "Per-streak journal for tracking triggers and relapse patterns",
    "Monthly heatmap of every day held and broken",
    "Milestone notifications by email",
    "AI pattern insight from your own notes",
    "Embeddable live streak image",
    "Installable offline-capable PWA",
  ],
  author: {
    "@type": "Person",
    name: "Arnab Saha",
    url: "https://arnabsaha.vercel.app",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${jet.variable} h-full`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body className="min-h-full bg-ash text-paper font-sans antialiased">{children}</body>
    </html>
  );
}
