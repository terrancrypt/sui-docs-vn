// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Tài liệu Sui tiếng Việt",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/MystenLabs/sui",
        },
        { icon: "discord", label: "Discord", href: "https://discord.gg/sui" },
        {
          icon: "twitter",
          label: "Twitter",
          href: "https://twitter.com/SuiNetwork",
        },
      ],
      sidebar: [
        {
          label: "Sui Blockchain",
          items: [
            { label: "Tổng quan", slug: "sui-blockchain/overview" },
            {
              label: "Bắt đầu với Sui",
              slug: "sui-blockchain/getting-started",
            },
            { label: "Sui Objects", slug: "sui-blockchain/sui-objects" },
          ],
        },
        {
          label: "Move Language",
          items: [
            { label: "Tổng quan Move", slug: "move-lang/overview" },
            { label: "Move Programming Cơ bản", slug: "move-lang/move-basics" },
          ],
        },
        {
          label: "Frontend trên Sui",
          items: [
            { label: "Tổng quan Frontend", slug: "frontend-on-sui/overview" },
            {
              label: "Phát triển DApp",
              slug: "frontend-on-sui/dapp-development",
            },
            { label: "TypeScript SDK", slug: "frontend-on-sui/typescript-sdk" },
            { label: "Sui Indexer", slug: "frontend-on-sui/indexer" },
          ],
        },
        {
          label: "Walrus",
          items: [{ label: "Tổng quan Walrus", slug: "walrus/overview" }],
        },
        {
          label: "Resources",
          items: [
            { label: "Showcase", slug: "resources/showcase" },
            { label: "Cộng đồng", slug: "resources/community" },
          ],
        },
      ],
    }),
  ],
});
