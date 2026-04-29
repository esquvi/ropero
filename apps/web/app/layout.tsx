import type { Metadata } from "next";
import { Jost } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ropero — Your Smart Wardrobe",
  description: "Manage your wardrobe, build outfits, log what you wear, and pack smart for trips.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jost.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
