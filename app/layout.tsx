import type { Metadata } from "next";
import { Russo_One, Nunito } from "next/font/google";
import "./globals.css";

const russoOne = Russo_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-russo",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LINGO - Multiplayer Word Game",
  description: "A real-time multiplayer word-guessing game inspired by the TV show Lingo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${russoOne.variable} ${nunito.variable}`}>
      <body style={{ margin: 0, padding: 0, background: "#0b0e1a" }}>
        {children}
      </body>
    </html>
  );
}
