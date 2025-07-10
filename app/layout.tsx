import type React from "react";
import { Inter, Archivo, Dynalight } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth-provider";
import { ClientLayout } from "./client-layout";
import { ThirdwebProvider } from "thirdweb/react";

const inter = Inter({ subsets: ["latin"] });
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
});
const dynalight = Dynalight({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dynalight",
});

export const metadata = {
  title: "Smartjects",
  description: "Discover and implement innovations for your business",
  generator: "v0.dev",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    other: [
      {
        rel: "icon",
        type: "image/svg+xml",
        url: "/favicon.svg",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        url: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        url: "/favicon-16x16.png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} ${archivo.variable} ${dynalight.variable}`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          <ThirdwebProvider>
            <AuthProvider>
              <ClientLayout>{children}</ClientLayout>
              <Toaster />
            </AuthProvider>
          </ThirdwebProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
