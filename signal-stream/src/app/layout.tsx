import type { Metadata } from "next";
import { Inter, Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OneStream | Intelligence Platform",
  description: "Track tweets, blogs, company updates, and breaking news from sources that matter to you. All distilled into one cinematic workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${manrope.variable} ${spaceGrotesk.variable} antialiased overflow-x-hidden`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
