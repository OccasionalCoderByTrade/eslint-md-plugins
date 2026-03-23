import type { Rule } from "eslint";

import { FencedCodeBlockTracker, getFrontmatterEndLine } from "./utils.js";

/**
 * Check if a line contains display math ($$) that's not properly formatted.
 * Display math is allowed inline with other content.
 * Only enforce the separate line pattern ($$\n...\n$$) when the math block is alone on its line.
 *
 * Bad:  $$2+2$$          (alone on line)
 * Good: $$
 *       2+2
 *       $$
 * Also Good: Some text $$2+2$$ more text (inline is allowed)
 */
export const requireDisplayMathFormatting: Rule.RuleModule = {
  meta: {
    type: "problem",
    fixable: "code",
    docs: {
      description:
        "Require display math ($$) blocks alone on a line to use the multi-line format ($$\\n...\\n$$)",
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

          // Remove inline code (backtick-enclosed content) and HTML comments before checking for $$
          let withoutInlineCode = trimmed.replace(/`[^`]*`/g, "");
          withoutInlineCode = withoutInlineCode.replace(/<!--.*?-->/g, "").trim();

          // Check for display math markers
          if (!withoutInlineCode.includes("$$")) {
            continue;
          }

          // Count $$ occurrences in the line (excluding those in inline code and comments)
          const dollarCount = (withoutInlineCode.match(/\$\$/g) || []).length;

          // If there's only one $$, it's an opening or closing delimiter (allowed)
          if (dollarCount === 1) {
            // Single $$ on a line is allowed - it's part of multi-line $$...$$
            continue;
          } else if (dollarCount === 2) {
            // Two $$ on the same line
            // Only enforce separate lines if the ENTIRE line is just the math block
            const doubleRegex = /^(\s*)\$\$(.*?)\$\$\s*$/;
            const match = withoutInlineCode.match(doubleRegex);
            if (match) {
              // The entire line is $$something$$, which requires separate lines
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
            }
            // If match is null, the $$ is inline with other content, which is allowed - skip
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
