import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Niaga Order",
    short_name: "Niaga",
    description: "A Progressive Web App built with Next.js",
    start_url: "/",
    display: "standalone",
    theme_color: "#ffffff",
    background_color: "#4d4d4d",

    icons: [
      {
        src: "/icon/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },

      {
        src: "/favicon/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
