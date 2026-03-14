import markdown from "@eslint/markdown";

import { defineConfig } from "eslint/config";

import { enforceLinkConvention } from "./src/plugins/markdown/enforce-link-convention";
import { inlineMathAloneOnLine } from "./src/plugins/markdown/inline-math-alone-on-line";
import { noH1Headers } from "./src/plugins/markdown/no-h1-headers";
import { requireBlankLineAfterHtml } from "./src/plugins/markdown/require-blank-line-after-html";
import { requireDisplayMathFormatting } from "./src/plugins/markdown/require-display-math-formatting";
import { requireFrontmatter } from "./src/plugins/markdown/require-frontmatter";
import { validateLatexDelimiters } from "./src/plugins/markdown/validate-latex-delimiters";

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
      custom: {
        rules: {
          "require-frontmatter": requireFrontmatter,
          "no-h1-headers": noH1Headers,
          "require-blank-line-after-html": requireBlankLineAfterHtml,
          "require-display-math-formatting": requireDisplayMathFormatting,
          "inline-math-alone-on-line": inlineMathAloneOnLine,
          "validate-latex-delimiters": validateLatexDelimiters,
          "enforce-link-convention": enforceLinkConvention,
        },
      },
    },
    language: "markdown/gfm",
    languageOptions: {
      parser: "@eslint/markdown",
      frontmatter: "yaml",
    },
    extends: ["markdown/recommended"],
    rules: {
      "custom/require-frontmatter": "error",
      "custom/no-h1-headers": "error",
      "custom/require-blank-line-after-html": "error",
      "custom/require-display-math-formatting": "error",
      "custom/inline-math-alone-on-line": "warn",
      "custom/validate-latex-delimiters": "error",
      "custom/enforce-link-convention": "warn",
      "markdown/no-missing-label-refs": "off",
      "markdown/require-alt-text": "off",
      // "markdown/no-duplicate-headings": "error",
    },
  },
]);
