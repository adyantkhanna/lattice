import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["normal", "italic"],
  weight: ["300", "400", "600"],
});

export const metadata: Metadata = {
  title: "Lattice — AI Research Agent",
  description: "Curated AI research, synthesised for you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${sourceSerif.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
