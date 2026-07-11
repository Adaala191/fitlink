import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "FitLink",
  description:
    "Create a clean trainer page, showcase coaching packages, and receive client requests in one dashboard.",
  openGraph: {
    title: "FitLink",
    description:
      "Create a clean trainer page, showcase coaching packages, and receive client requests in one dashboard.",
    url: "https://www.fitlink.space",
    siteName: "FitLink",
    images: [
      {
        url: "https://www.fitlink.space/fitlink-og.png",
        width: 1200,
        height: 630,
        alt: "FitLink preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FitLink",
    description:
      "Create a clean trainer page, showcase coaching packages, and receive client requests in one dashboard.",
    images: ["https://www.fitlink.space/fitlink-og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
