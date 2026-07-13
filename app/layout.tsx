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

export const metadata: Metadata = {
  metadataBase: new URL("https://www.fitlink.space"),

  title: {
    default: "FitLink",
    template: "%s | FitLink",
  },

  description:
    "FitLink helps independent fitness coaches create a professional profile, showcase coaching packages, and receive organized client inquiries.",

  keywords: [
    "FitLink",
    "personal trainer website",
    "fitness coach profile",
    "online coaching packages",
    "trainer client requests",
    "fitness business software",
  ],

  applicationName: "FitLink",

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  openGraph: {
    title: "FitLink",
    description:
      "Create your coaching profile, show your packages, and turn client interest into organized inquiries.",
    url: "https://www.fitlink.space",
    siteName: "FitLink",
    images: [
      {
        url: "/fitlink-og.png",
        width: 1200,
        height: 630,
        alt: "FitLink - Train. Connect. Grow.",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "FitLink",
    description:
      "Create your coaching profile, show your packages, and turn client interest into organized inquiries.",
    images: ["/fitlink-og.png"],
  },

  robots: {
    index: true,
    follow: true,
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
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}