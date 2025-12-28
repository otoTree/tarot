import type { Metadata } from "next";
import localFont from "next/font/local";
import { Cinzel } from "next/font/google";
import { LanguageInit } from "@/components/LanguageInit";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-serif",
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
  title: "Lumin Tarot",
  description: "Mystic insights through the veil of digital consciousness",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} antialiased font-sans`}
      >
        <LanguageInit />
        {children}
      </body>
    </html>
  );
}
