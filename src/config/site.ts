import type { MainNavItem } from "@/types/index.type";
export type SiteConfig = typeof siteConfig;

const links = {
  x: "https://x.com/IrfinF19505",
  github: "https://github.com/lordfalah/wasshoes",
  githubAccount: "https://github.com/lordfalah",
  discord: "https://discord.com/users/falhhalla",
  instagram: "https://www.instagram.com/cleaningwasshoes/",
};

export const siteConfig = {
  name: "Niaga",
  description:
    "A modern, open-source application for creating and managing daily customer orders easily.",
  url: `${process.env.NEXT_PUBLIC_APP_URL!}`,
  ogImage: "https://skateshop.sadmn.com/opengraph-image.png",
  links,
  mainNav: [
    {
      title: "Lobby",
      items: [
        {
          title: "Riwayat Pesanan",
          href: "/history",
          description:
            "Telusuri pesanan berdasarkan pelanggan, status, atau tanggal.",
          items: [],
        },
      ],
    },
  ] satisfies MainNavItem[],
};
