import "~/styles/globals.css";

import { type Metadata, type Viewport } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "LingoEase",
  description: "LingoEase",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export function generateViewport(): Viewport {
  return {
    width: "device-width",
    userScalable: false,
    initialScale: 1,
    maximumScale: 1,
    minimumScale: 1,
  };
}

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
