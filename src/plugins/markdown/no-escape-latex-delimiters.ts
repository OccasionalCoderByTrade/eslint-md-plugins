import type { Rule } from "eslint";

import { FencedCodeBlockTracker, getFrontmatterEndLine } from "./utils.js";

/**
 * Detect escaped LaTeX delimiters (\[ and \]) that exist alone on their own line.
 * When these delimiters appear alone, use $$...$$ (double dollar) display math syntax instead.
 *
 * Bad:  \[
 * Bad:  \]
 * Good: $$x = y$$
 */
export const noEscapeLatexDelimiters: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    fixable: "code",
    docs: {
      description:
        "Detect escaped LaTeX delimiters (\\[ and \\]) that exist alone on their own line",
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

        // Track which lines we've already processed to avoid duplicate reports
        const processedLines = new Set<number>();

        for (let i = frontmatterEndLine; i < lines.length; i++) {
          const line = lines[i];

          // Skip already processed lines
          if (processedLines.has(i)) {
            continue;
          }

          // Skip lines inside fenced code blocks
          if (codeBlockTracker.isLineInFencedCodeBlock(i)) {
            continue;
          }

          const trimmed = line.trim();

          // Skip empty lines
          if (!trimmed) {
            continue;
          }

          // Check for \[ alone on the line
          if (trimmed === "\\[") {
            // Find matching \] delimiter
            let closingDelimiterLine = -1;
            for (let j = i + 1; j < lines.length; j++) {
              if (codeBlockTracker.isLineInFencedCodeBlock(j)) {
                continue;
              }
              const jTrimmed = lines[j].trim();
              if (jTrimmed === "\\]") {
                closingDelimiterLine = j;
                break;
              }
            }

            if (closingDelimiterLine !== -1) {
              processedLines.add(i);
              processedLines.add(closingDelimiterLine);

              const openingIndent = line.match(/^(\s*)/)?.[1] ?? "";
              const closingLine = lines[closingDelimiterLine];
              const closingIndent = closingLine.match(/^(\s*)/)?.[1] ?? "";

              context.report({
                loc: { line: i + 1, column: 0 },
                message: `LaTeX delimiters \\[ and \\] found. Use $$...$$ (double dollar) syntax for display math instead.`,
                fix(fixer) {
                  const openingReplacement = `${openingIndent}$$`;
                  const closingReplacement = `${closingIndent}$$`;

                  const openingStart = sourceCode.getIndexFromLoc({
                    line: i + 1,
                    column: 1,
                  });
                  const openingEnd = sourceCode.getIndexFromLoc({
                    line: i + 1,
                    column: line.length + 1,
                  });

                  const closingStart = sourceCode.getIndexFromLoc({
                    line: closingDelimiterLine + 1,
                    column: 1,
                  });
                  const closingEnd = sourceCode.getIndexFromLoc({
                    line: closingDelimiterLine + 1,
                    column: closingLine.length + 1,
                  });

                  return [
                    fixer.replaceTextRange([openingStart, openingEnd], openingReplacement),
                    fixer.replaceTextRange([closingStart, closingEnd], closingReplacement),
                  ];
                },
              });
            }
          }
        }
      },
    };
  },
};
