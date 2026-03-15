import type { Rule } from "eslint";

import { removeEscapedDelimiters } from "./utils.js";
import { FencedCodeBlockTracker } from "./utils.js";

/**
 * Validate that LaTeX delimiters ($...$) and ($$...$$) are balanced.
 * Catches broken math rendering from mismatched or unclosed delimiters.
 * Works with the original source text to properly handle escaped sequences.
 */
export const validateLatexDelimiters: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Validate that LaTeX delimiters ($...$ and $$...$$) are balanced and properly paired",
    },
  } as const,
  create(context: Rule.RuleContext): Rule.RuleListener {
    let alreadyProcessed = false;

    return {
      "*": (node: Rule.Node) => {
        if (alreadyProcessed || (node as unknown as { type: string }).type !== "root") return;

        alreadyProcessed = true;

        const sourceCode = context.sourceCode;
        if (!sourceCode) return;

        const text = sourceCode.getText();
        const lines = text.split("\n");
        const codeBlockTracker = new FencedCodeBlockTracker(text);

        // Track unclosed delimiters
        let inlineDelimiterCount = 0;
        let displayDelimiterCount = 0;
        let inlineStartLine = -1;
        let displayStartLine = -1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          // Skip lines inside fenced code blocks
          if (codeBlockTracker.isLineInFencedCodeBlock(i)) {
            continue;
          }

          // Remove escaped dollar signs before counting
          const withoutEscaped = removeEscapedDelimiters(line);

          // Count $$ first (to avoid counting them as two $)
          const displayMatches = withoutEscaped.match(/\$\$/g);
          if (displayMatches) {
            displayDelimiterCount += displayMatches.length;
            if (displayDelimiterCount % 2 === 1 && displayStartLine === -1) {
              displayStartLine = i;
            } else if (displayDelimiterCount % 2 === 0) {
              displayStartLine = -1;
            }
          }

          // Count remaining $ (after removing $$)
          const withoutDisplay = withoutEscaped.replace(/\$\$/g, "");
          const inlineMatches = withoutDisplay.match(/\$/g);
          if (inlineMatches) {
            inlineDelimiterCount += inlineMatches.length;
            if (inlineDelimiterCount % 2 === 1 && inlineStartLine === -1) {
              inlineStartLine = i;
            } else if (inlineDelimiterCount % 2 === 0) {
              inlineStartLine = -1;
            }
          }
        }

        // Report unclosed display math
        if (displayDelimiterCount % 2 !== 0) {
          context.report({
            loc: { line: displayStartLine + 1, column: 0 },
            message: `Unclosed display math delimiter ($$). Expected closing $$ to match the opening on line ${displayStartLine + 1}.`,
          });
        }

        // Report unclosed inline math
        if (inlineDelimiterCount % 2 !== 0) {
          context.report({
            loc: { line: inlineStartLine + 1, column: 0 },
            message: `Unclosed inline math delimiter ($). Expected closing $ to match the opening on line ${inlineStartLine + 1}.`,
          });
        }
      },
    };
  },
};
