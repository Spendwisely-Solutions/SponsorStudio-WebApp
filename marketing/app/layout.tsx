import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import NavBar from "../components/NavBar";
import ScrollReset from "../components/ScrollReset";
import Footer from "../components/Footer";
import FloatingContact from "../components/FloatingContact";
import { Toaster } from "react-hot-toast";
import MotionProvider from "../components/motion/MotionProvider";
import { IntroProvider, introScript } from "../components/motion/Intro";
import { SITE_URL } from "../lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Editorial serif for headings; italics are used for one emphasis phrase.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

// Small labels, eyebrows and figures.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Sponsor Studio",
  title: {
    default: "Sponsor Studio | The sponsorship marketplace for brands and events",
    template: "%s | Sponsor Studio",
  },
  description:
    "Sponsor Studio connects brands with verified sponsorship opportunities across events, influencers and outdoor advertising, from discovery to signed deal.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    siteName: "Sponsor Studio",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The head script sets data-intro before hydration, hence suppressHydrationWarning.
    // data-scroll-behavior lets Next.js jump instantly to the top on page changes while
    // in-page anchor links keep the smooth scroll set in globals.css.
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${fraunces.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {/* Decides before first paint whether the launch screen should be skipped. */}
        <Script id="intro-check" strategy="beforeInteractive">
          {introScript}
        </Script>
        <MotionProvider>
          <IntroProvider>
            <ScrollReset />
            <NavBar />
            <main className="flex-1">{children}</main>
            <Footer />
            <FloatingContact />
          </IntroProvider>
        </MotionProvider>
        <Toaster
          position="bottom-center"
          toastOptions={{
            className: "!rounded-[10px] !border !border-border !text-sm !text-text-primary !shadow-pop",
          }}
        />
      </body>
    </html>
  );
}
