import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import AuthProvider from "@/components/AuthProvider";
import { DM_Sans, DM_Mono, Playfair_Display } from "next/font/google";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", weight: ["300", "400", "500"] });
const dmMono = DM_Mono({ subsets: ["latin"], variable: "--font-dm-mono", weight: ["400", "500"] });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", weight: ["400", "700", "900"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "BarPriser — Aarhus",
  description: "Community drink price research across Aarhus bars",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da" className={`${dmSans.variable} ${dmMono.variable} ${playfair.variable}`}>
      <body>
        <AuthProvider>
          <MobileNav />
          <div className="flex min-h-screen">
            <div className="hidden md:block">
              <Sidebar />
            </div>
            <main className="flex-1 min-w-0 pb-20 md:pb-0">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
