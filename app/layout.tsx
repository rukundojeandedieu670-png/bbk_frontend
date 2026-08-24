import type { Metadata } from "next";
import { Barlow_Condensed, Bebas_Neue, Fraunces, Inter, Manrope, Sora, Work_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const sora = Sora({
  variable: "--font-space-loaded",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const barlow = Barlow_Condensed({ variable: "--font-barlow", subsets: ["latin"], weight: "400", display: "swap" });
const bebas = Bebas_Neue({ variable: "--font-bebas", subsets: ["latin"], weight: "400", display: "swap" });
const inter = Inter({ variable: "--font-inter-loaded", subsets: ["latin"], display: "swap" });
const workSans = Work_Sans({ variable: "--font-work-sans", subsets: ["latin"], display: "swap" });

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
    <html lang="en" className={`${sora.variable} ${manrope.variable} ${barlow.variable} ${bebas.variable} ${inter.variable} ${workSans.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col"><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  );
}
