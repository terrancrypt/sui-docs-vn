// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightThemeNova from "starlight-theme-nova";
import mermaid from "astro-mermaid";

// https://astro.build/config
export default defineConfig({
  integrations: [
    mermaid({
      theme: "forest",
      autoTheme: true,
    }),
    starlight({
      plugins: [starlightThemeNova()],
      title: "",
      logo: {
        light: "./src/assets/Sui_Logo_Ocean.svg",
        dark: "./src/assets/Sui_Logo_White.svg",
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/terrancrypt/sui-docs-vn",
        },
        {
          icon: "discord",
          label: "Discord",
          href: "https://discord.gg/DBRhkYcHeP",
        },
        {
          icon: "twitter",
          label: "Twitter",
          href: "https://x.com/SuiHubAPAC",
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
            { label: "ZK Login", slug: "frontend-on-sui/zk-login" },
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
