import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import PetalBackdrop from "@/components/PetalBackdrop";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fariz & Lia — Ucapan Suara",
  description: "Titipkan ucapan suara untuk pernikahan Fariz & Lia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${cormorant.variable} ${manrope.variable} font-body`}>
        <PetalBackdrop />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
