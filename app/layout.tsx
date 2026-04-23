"use client";
import "./globals.css";
import { DM_Sans, DM_Mono } from "next/font/google";
import { WalletContextProvider } from "@/components/WalletProvider";
import { QueryProvider } from "@/components/QueryProvider";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", weight: ["300","400","500","600","700"] });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400","500"], variable: "--font-dm-mono" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable}`}>
      <head>
        <title>Oravara · Recurring Payments on Solana</title>
        <meta name="description" content="Wallet-native recurring payments on Solana" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <QueryProvider>
          <WalletContextProvider>
            {children}
          </WalletContextProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
