import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // アローサル・テクノロジー ブランドカラー
        brand: {
          main: "#00146E",      // メインカラー - 見出し、重要要素
          sub: "#01B3EF",       // サブカラー - 視認性を高めたい時
          support: "#0F2356",   // サポートカラー - 補完
          "support-light": "#CCD4EA",  // サポートカラー（淡）- 背景、控えめな要素
          gold: "#C6AF80",      // サポートカラー（ゴールド）- 図形、ライン
          accent: "#ED2F4F",    // アクセントカラー - 注目、限定的使用
        },
        // グレースケール
        gray: {
          main: "#333333",      // メイン - 本文テキスト
          secondary: "#7F7F7F", // セカンダリ - サブテキスト
          line: "#B2B2B2",      // ライン、無効要素
          light: "#E5E5E5",     // 背景
        },
      },
    },
  },
  plugins: [],
};
export default config;
