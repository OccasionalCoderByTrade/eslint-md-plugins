import markdown from "@eslint/markdown";

import { defineConfig } from "eslint/config";

import cannoli from "./src/index";

export default defineConfig([
  {
    ignores: ["dist/", ".astro/"],
  },
  {
    files: [
      "src/**/*.md",
      //
    ],
    plugins: {
      // @ts-expect-error - Type 'typeof plugin' is not assignable to type 'Plugin'.
      markdown,
      cannoli,
    },
    language: "markdown/gfm",
    languageOptions: {
      parser: "@eslint/markdown",
      frontmatter: "yaml",
    },
    extends: ["markdown/recommended"],
    rules: {
      "cannoli/require-frontmatter": "error",
      "cannoli/no-h1-headers": "error",
      "cannoli/require-blank-line-after-html": "error",
      "cannoli/require-display-math-formatting": "error",
      "cannoli/inline-math-alone-on-line": "warn",
      "cannoli/validate-latex-delimiters": "error",
      "cannoli/enforce-link-convention": "warn",
      "markdown/no-missing-label-refs": "off",
      "markdown/require-alt-text": "off",
      // "markdown/no-duplicate-headings": "error",
    },
  },
]);
