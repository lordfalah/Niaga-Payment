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
    "An open source e-commerce skateshop build with everything new in Next.js.",
  url: "https://skateshop.sadmn.com",
  ogImage: "https://skateshop.sadmn.com/opengraph-image.png",
  links,
  mainNav: [
    {
      title: "Lobby",
      items: [
        {
          title: "History Invoice",
          href: "/history",
          description: "Build your own custom skateboard.",
          items: [],
        },
      ],
    },
  ] satisfies MainNavItem[],
};
