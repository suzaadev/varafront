"use client";
import "./globals.css";
import { DM_Sans, DM_Mono } from "next/font/google";
import { WalletContextProvider } from "@/components/WalletProvider";
import { QueryProvider } from "@/components/QueryProvider";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm-mono" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable}`}>
      <body className="bg-bg text-text-primary font-sans antialiased">
        <QueryProvider>
          <WalletContextProvider>
            {children}
          </WalletContextProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
