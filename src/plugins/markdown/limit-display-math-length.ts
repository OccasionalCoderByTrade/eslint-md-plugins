import type { Rule } from "eslint";

import { FencedCodeBlockTracker, getFrontmatterEndLine } from "./utils.js";

/**
 * Limit display math block lengths to 60 characters for mobile view.
 * Long math expressions should be split across multiple lines using \\ and & for alignment.
 *
 * Bad:  $$ x = y + z + a + b + c + d + e + f + g + h + i + j $$
 * Good: $$
 *       x = y + z + a + b \\
 *       & + c + d + e + f
 *       $$
 */
export const limitDisplayMathLength: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Limit display math ($$) block lengths to 60 characters for better mobile view",
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
          // Skip already processed lines
          if (processedLines.has(i)) {
            continue;
          }

          const line = lines[i];

          // Skip lines inside fenced code blocks
          if (codeBlockTracker.isLineInFencedCodeBlock(i)) {
            continue;
          }

          const trimmed = line.trim();

          // Skip if line doesn't contain $$ or is empty
          if (!trimmed.includes("$$")) {
            continue;
          }

          // Check for single-line display math: $$ content $$
          const singleLineMatch = trimmed.match(/^(\s*)\$\$(.*?)\$\$\s*$/);
          if (singleLineMatch) {
            const content = singleLineMatch[2];
            if (content.length > 60) {
              processedLines.add(i);
              const lineContent = line.trimEnd();
              const lineStart = sourceCode.getIndexFromLoc({
                line: i + 1,
                column: 1,
              });
              const lineEnd = sourceCode.getIndexFromLoc({
                line: i + 1,
                column: lineContent.length + 1,
              });
              context.report({
                loc: { line: i + 1, column: 1 },
                range: [lineStart, lineEnd],
                message: `Display math block is ${content.length} characters. Consider splitting into multiple lines using \\\\ as line delimiter and & for alignment to keep it under 60 characters for better mobile view.`,
              } as any);
            }
            continue;
          }

          // Check for multi-line display math: opening $$
          if (trimmed === "$$") {
            // Find matching closing $$
            let closingLine = -1;
            const contentLineIndices: number[] = [];

            for (let j = i + 1; j < lines.length; j++) {
              if (codeBlockTracker.isLineInFencedCodeBlock(j)) {
                continue;
              }

              const currentLine = lines[j];
              const currentTrimmed = currentLine.trim();

              if (currentTrimmed === "$$") {
                closingLine = j;
                break;
              }

              contentLineIndices.push(j);
            }

            if (closingLine !== -1) {
              processedLines.add(i);
              processedLines.add(closingLine);

              // Check each content line individually for length
              for (const lineIndex of contentLineIndices) {
                const contentLine = lines[lineIndex];
                const contentTrimmed = contentLine.trim();
                const contentLength = contentTrimmed.length;

                // Skip empty lines and comment lines
                if (!contentTrimmed || contentTrimmed.startsWith("<!--")) {
                  continue;
                }

                if (contentLength > 60) {
                  const contentLineText = lines[lineIndex];
                  const contentLineTrimmed = contentLineText.trimEnd();
                  const contentLineStart = sourceCode.getIndexFromLoc({
                    line: lineIndex + 1,
                    column: 1,
                  });
                  const contentLineEnd = sourceCode.getIndexFromLoc({
                    line: lineIndex + 1,
                    column: contentLineTrimmed.length + 1,
                  });
                  context.report({
                    loc: { line: lineIndex + 1, column: 1 },
                    range: [contentLineStart, contentLineEnd],
                    message: `Display math line is ${contentLength} characters, exceeds 60 character limit which is ideal for mobile viewing. Consider splitting using \\\\ as line delimiter with potentially & for alignment.`,
                  } as any);
                  processedLines.add(lineIndex);
                }
              }
            }
          }
        }
      },
    };
  },
};
