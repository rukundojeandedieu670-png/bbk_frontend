import type { Metadata } from "next";
import { Fraunces, Manrope, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-space",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bridging Borders Kigali | Sport, Culture & Peace",
  description: "A national Rwandan movement using sport, culture and entertainment to build peace across communities.",
  icons: {
    icon: "/bbk-logo.png",
    shortcut: "/bbk-logo.png",
    apple: "/bbk-logo.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sora.variable} ${manrope.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
