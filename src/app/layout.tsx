import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { CartProvider } from '@/context/CartContext';
import { Analytics } from '@vercel/analytics/react';
import Background from "@/components/Background";
import { InfiniteMovingText } from "@/components/ui/InfiniteMovingText";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "M&M Store",
  description: "M&M Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col mx-auto min-h-screen w-screen items-center`}
      >
        <Background />
        <div className="w-full sm:w-5xl">
          <CartProvider>
            <Header />
            <div className="flex flex-col antialiased items-center justify-center relative overflow-hidden">
              <InfiniteMovingText
                items={[
                  { id: "1", name: "Pants", handle: "pants" },
                  { id: "2", name: "Shoes", handle: "shoes" },
                  { id: "3", name: "T-Shirts", handle: "t-shirts" },
                  { id: "4", name: "Electronics", handle: "electronics" },
                  { id: "5", name: "Toys", handle: "toys" },
                  { id: "6", name: "Books", handle: "books" },
                  { id: "7", name: "Home Decor", handle: "home-decor" },
                  { id: "8", name: "Sports", handle: "sports" },
                ]}
                direction="left"
                speed="normal"
                pauseOnHover={false}
                className="py-2"
              />
            </div>
            <main>
              {children}
            </main>
          </CartProvider>
          <Analytics />
        </div>
      </body>
    </html>
  );
}
