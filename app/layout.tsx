import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Home Hub",
  description: "Organiza tu casa, tus tareas y tus finanzas en un solo lugar.",
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
        {children}
      </body>
    </html>
  );
}
