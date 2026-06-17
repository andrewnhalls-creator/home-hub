import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Home Hub",
    short_name: "Home Hub",
    description: "Organiza tu casa, tus tareas y tus finanzas en un solo lugar.",
    start_url: "/dashboard",
    display: "standalone",
    orientation: "portrait",
    theme_color: "#c96b4b",
    background_color: "#f5ebe0",
    lang: "es-ES",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["lifestyle", "productivity"],
  };
}
