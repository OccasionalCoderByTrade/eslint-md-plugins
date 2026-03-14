import type { Rule } from "eslint";

import { FencedCodeBlockTracker, getFrontmatterEndLine } from "./utils";

/**
 * Detect inline math expressions ($...$) that exist alone on their own line.
 * This usually indicates the expression was meant to be display/block math ($$...$$).
 *
 * Bad:  $x = 2$
 * Good: $$x = 2$$  OR  inline text $x = 2$ more text
 */
export const inlineMathAloneOnLine: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    fixable: "code",
    docs: {
      description:
        "Detect inline math expressions that exist alone on their own line (likely meant to be display math)",
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

          // Skip empty lines
          if (!trimmed) {
            continue;
          }

          // Check for display math ($$) - not what we're looking for
          if (trimmed.includes("$$")) {
            continue;
          }

          // Check for inline math ($...$)
          const singleDollarRegex = /^\$[^$]+\$\s*$/;
          const match = trimmed.match(singleDollarRegex);

          if (match) {
            // Found inline math alone on a line
            const indent = line.match(/^(\s*)/)?.[1] ?? "";
            const expression = trimmed.slice(1, -1); // Remove the $...$

            context.report({
              loc: { line: i + 1, column: 0 },
              message:
                "Inline math expression found alone on its own line. Did you mean to use display math ($$...$$) instead?",
              fix(fixer) {
                // Convert from $...$ to $$...$$
                const replacement = `${indent}$$${expression}$$`;

                const lineStart = sourceCode.getIndexFromLoc({ line: i + 1, column: 1 });
                const lineEnd = sourceCode.getIndexFromLoc({ line: i + 1, column: line.length + 1 });

                return fixer.replaceTextRange([lineStart, lineEnd], replacement);
              },
            });
          }
        }
      },
    };
  },
};
