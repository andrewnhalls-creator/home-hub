import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Home Hub",
  description: "Organiza tu casa, tus tareas y tus finanzas en un solo lugar.",
  appleWebApp: {
    capable: true,
    title: "Home Hub",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#c96b4b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-ES" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-cream text-brown font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
