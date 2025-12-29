import type { Metadata } from "next";
import localFont from "next/font/local";
import { Cinzel, Playfair_Display, Noto_Serif_SC } from "next/font/google";
import "./globals.css";
import { GrainOverlay } from "@/components/ui/grain-overlay";
import { LanguageInit } from "@/components/LanguageInit";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-serif",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-serif-sc",
  preload: false, // Preloading subsets for SC might be heavy, load on demand
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Lumin Tarot | Mystic Insights",
    template: "%s | Lumin Tarot"
  },
  description: "Experience the ancient wisdom of Tarot through a serene, digital sanctuary. Daily readings, spread analysis, and spiritual clarity.",
  keywords: ["Tarot", "Horoscope", "Spiritual", "Mindfulness", "Divination", "塔罗", "占卜", "星座"],
  authors: [{ name: "Lumin Team" }],
  creator: "Lumin Team",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://lumin-tarot.com",
    title: "Lumin Tarot | Mystic Insights",
    description: "Experience the ancient wisdom of Tarot through a serene, digital sanctuary.",
    siteName: "Lumin Tarot",
    images: [
      {
        url: "/og-image.jpg", // We should create this
        width: 1200,
        height: 630,
        alt: "Lumin Tarot - Minimalist Spiritual Guidance",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumin Tarot | Mystic Insights",
    description: "Experience the ancient wisdom of Tarot through a serene, digital sanctuary.",
    images: ["/og-image.jpg"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false, // App-like feel
  },
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} ${playfair.variable} ${notoSerifSC.variable} antialiased font-sans relative overflow-x-hidden bg-[#faf9f6]`}
      >
        <LanguageInit />
        <GrainOverlay />
        <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-200/40 via-[#faf9f6] to-[#faf9f6]" />
        
        {/* Subtle animated gradient mesh */}
        <div 
          className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-300/10 blur-[100px] animate-pulse" 
          style={{ animationDuration: '8s' }}
        />
        <div 
          className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-rose-300/10 blur-[100px] animate-pulse" 
          style={{ animationDuration: '10s', animationDelay: '1s' }}
        />

        {children}
      </body>
    </html>
  );
}
