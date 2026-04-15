import type { Metadata } from "next";
import { Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "ChronoClass",
  description: "Intelligent college timetable management system",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {process.env.NODE_ENV === "development" ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function () {
                  if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(function (registrations) {
                      registrations.forEach(function (registration) { registration.unregister(); });
                    });
                  }
                  if ('caches' in window) {
                    caches.keys().then(function (keys) {
                      keys.forEach(function (key) { caches.delete(key); });
                    });
                  }
                })();
              `,
            }}
          />
        ) : null}
      </head>
      <body className={`${manrope.variable} ${mono.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}