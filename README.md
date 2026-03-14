# ESLint Markdown Cannoli Plugins

A collection of ESLint plugins for linting Markdown files with custom rules.

## Installation

```bash
npm install --save-dev eslint-md-cannoli-plugins @eslint/markdown eslint
```

## Usage

Add the plugins to your ESLint configuration (`eslint.config.js` or `eslint.config.ts`):

```javascript
import markdown from "@eslint/markdown";
import {
  enforceLinkConvention,
  inlineMathAloneOnLine,
  noH1Headers,
  requireBlankLineAfterHtml,
  requireDisplayMathFormatting,
  requireFrontmatter,
  validateLatexDelimiters,
} from "eslint-md-cannoli-plugins";

export default [
  {
    files: ["**/*.md"],
    plugins: {
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
    },
  },
];
```

## Available Rules

- **require-frontmatter** - Ensure markdown files have frontmatter
- **no-h1-headers** - Disallow H1 headers (use frontmatter title instead)
- **require-blank-line-after-html** - Require blank lines after HTML blocks
- **require-display-math-formatting** - Enforce proper display math formatting
- **inline-math-alone-on-line** - Ensure inline math equations are on their own line
- **validate-latex-delimiters** - Validate LaTeX delimiter usage
- **enforce-link-convention** - Enforce link naming conventions

## License

ISC
