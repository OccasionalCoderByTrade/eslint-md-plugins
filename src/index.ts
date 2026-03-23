import { enforceLinkConvention } from "./plugins/markdown/enforce-link-convention.js";
import { inlineMathAloneOnLine } from "./plugins/markdown/inline-math-alone-on-line.js";
import { limitDisplayMathLength } from "./plugins/markdown/limit-display-math-length.js";
import { noEscapeLatexDelimiters } from "./plugins/markdown/no-escape-latex-delimiters.js";
import { noH1Headers } from "./plugins/markdown/no-h1-headers.js";
import { requireBlankLineAfterHtml } from "./plugins/markdown/require-blank-line-after-html.js";
import { requireDisplayMathFormatting } from "./plugins/markdown/require-display-math-formatting.js";
import { requireFrontmatter } from "./plugins/markdown/require-frontmatter.js";
import { validateLatexDelimiters } from "./plugins/markdown/validate-latex-delimiters.js";

export default {
  rules: {
    "require-frontmatter": requireFrontmatter,
    "no-h1-headers": noH1Headers,
    "require-blank-line-after-html": requireBlankLineAfterHtml,
    "require-display-math-formatting": requireDisplayMathFormatting,
    "inline-math-alone-on-line": inlineMathAloneOnLine,
    "validate-latex-delimiters": validateLatexDelimiters,
    "no-escape-latex-delimiters": noEscapeLatexDelimiters,
    "enforce-link-convention": enforceLinkConvention,
    "limit-display-math-length": limitDisplayMathLength,
  },
};
