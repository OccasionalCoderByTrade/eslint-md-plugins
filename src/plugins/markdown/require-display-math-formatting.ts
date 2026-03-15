import type { Rule } from "eslint";

import { FencedCodeBlockTracker, getFrontmatterEndLine } from "./utils.js";

/**
 * Check if a line contains display math ($$) that's not properly formatted.
 * Display math should have $$ on its own line, not inline with the expression.
 *
 * Bad:  $$2+2$$
 * Good: $$
 *       2+2
 *       $$
 */
export const requireDisplayMathFormatting: Rule.RuleModule = {
  meta: {
    type: "problem",
    fixable: "code",
    docs: {
      description:
        "Require display math ($$) to be on separate lines from the expression",
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
        const frontmatterEndLine = getFrontmatterEndLine(text);
        const codeBlockTracker = new FencedCodeBlockTracker(text);

        for (let i = frontmatterEndLine; i < lines.length; i++) {
          const line = lines[i];

          // Skip lines inside fenced code blocks
          if (codeBlockTracker.isLineInFencedCodeBlock(i)) {
            continue;
          }

          const trimmed = line.trim();

          // Remove inline code (backtick-enclosed content) before checking for $$
          const withoutInlineCode = trimmed.replace(/`[^`]*`/g, "");

          // Check for display math markers
          if (!withoutInlineCode.includes("$$")) {
            continue;
          }

          // Count $$ occurrences in the line (excluding those in inline code)
          const dollarCount = (withoutInlineCode.match(/\$\$/g) || []).length;

          // If there's only one $$, it might be an opening or closing on its own line (good)
          if (dollarCount === 1) {
            // Check if the line is ONLY $$ (possibly with whitespace)
            const isOnlyDollarSigns = /^\$\$\s*$/.test(withoutInlineCode);
            if (isOnlyDollarSigns) {
              // Good: $$ is on its own line
              continue;
            }

            // If there's content on the same line as $$, that's bad
            // Example: "$$2+2" or "expression$$"
            if (withoutInlineCode !== "$$") {
              context.report({
                loc: { line: i + 1, column: 0 },
                message:
                  "Display math ($$) should be on its own line, separate from the expression",
              });
            }
          } else if (dollarCount === 2) {
            // Two $$ on the same line
            // Check if they form a complete math block on one line: $$expression$$
            const doubleRegex = /^(\s*)\$\$(.*?)\$\$\s*$/;
            const match = withoutInlineCode.match(doubleRegex);
            if (match) {
              // The entire line is $$something$$, which is bad
              const indent = match[1];
              const expression = match[2];
              context.report({
                loc: { line: i + 1, column: 0 },
                message:
                  'Display math delimiters ($$) must be on separate lines. Use:\n$$\nexpression\n$$',
                fix(fixer) {
                  // Build the replacement text - just the three lines without trailing newline
                  // The line itself will have its trailing newline preserved by ESLint
                  const replacement = `${indent}$$\n${indent}${expression}\n${indent}$$`;

                  // Get the start of the line and the end (before the newline)
                  const lineStart = sourceCode.getIndexFromLoc({ line: i + 1, column: 1 });
                  const lineEnd = sourceCode.getIndexFromLoc({ line: i + 1, column: line.length + 1 });

                  return fixer.replaceTextRange([lineStart, lineEnd], replacement);
                },
              });
            } else {
              // Two $$ but not in the expected format - could be overlapping or weird
              context.report({
                loc: { line: i + 1, column: 0 },
                message:
                  "Malformed display math notation. Display math ($$) should be on separate lines",
              });
            }
          } else if (dollarCount > 2) {
            // Multiple $$ pairs on the same line - likely multiple math expressions or malformed
            context.report({
              loc: { line: i + 1, column: 0 },
              message:
                "Multiple display math expressions ($$) found on same line. Each should be on separate lines",
            });
          }
        }
      },
    };
  },
};
