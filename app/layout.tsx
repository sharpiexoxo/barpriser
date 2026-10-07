import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import AuthProvider from "@/components/AuthProvider";
import { LocaleProvider } from "@/components/LocaleProvider";
import { DM_Sans, DM_Mono, Montserrat } from "next/font/google";

const dmSans      = DM_Sans({    subsets: ["latin"], variable: "--font-dm-sans",   weight: ["300","400","500"] });
const dmMono      = DM_Mono({    subsets: ["latin"], variable: "--font-dm-mono",   weight: ["400","500"] });
const montserrat  = Montserrat({ subsets: ["latin"], variable: "--font-playfair",  weight: ["500","600","700","800","900"] });

export const metadata: Metadata = {
  title: "BarPriser — Danmark",
  description: "Fælles drikkevarepriser i Danmark",
  icons: {
    icon: [
      { url: "/favicon.ico",  sizes: "any" },
      { url: "/icon.svg",     type: "image/svg+xml" },
      { url: "/icon.png",     type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180" },
    ],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da" className={`${dmSans.variable} ${dmMono.variable} ${montserrat.variable}`}>
      <body>
        <AuthProvider>
          <LocaleProvider>
            <MobileNav />
            <div className="flex min-h-screen">
              <div className="hidden md:block"><Sidebar /></div>
              <main className="flex-1 min-w-0 pb-20 md:pb-0">{children}</main>
            </div>
          </LocaleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
