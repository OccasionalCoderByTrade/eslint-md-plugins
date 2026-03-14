import type { Rule } from "eslint";

import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit, SKIP } from "unist-util-visit";
import type { Node as UnistNode } from "unist";
import type { Text } from "mdast";

/**
 * Validate that LaTeX delimiters ($...$) and ($$...$$) are balanced.
 * Catches broken math rendering from mismatched or unclosed delimiters.
 * Uses remark AST parsing to correctly handle code blocks and frontmatter.
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

        // Parse markdown into AST
        const processor = unified().use(remarkParse);
        const ast = processor.parse(text);

        // Track unclosed delimiters
        let inlineDelimiterCount = 0; // $ count
        let displayDelimiterCount = 0; // $$ count
        let inlineStartLine = -1;
        let displayStartLine = -1;

        // Visit all text nodes, automatically skipping code blocks
        visit(
          ast,
          (nodeToVisit: UnistNode) => {
            // Skip code blocks and inline code
            if (
              nodeToVisit.type === "code" ||
              nodeToVisit.type === "inlineCode" ||
              nodeToVisit.type === "codeBlock"
            ) {
              return SKIP;
            }

            // Process text nodes only
            if (nodeToVisit.type === "text") {
              const textNode = nodeToVisit as Text;
              const textContent = textNode.value;

              // Remove escaped dollar signs (\$)
              const unescaped = textContent.replace(/\\\$/g, "");

              // Count $$ first (to avoid counting them as two $)
              const displayMatches = unescaped.match(/\$\$/g);
              if (displayMatches) {
                displayDelimiterCount += displayMatches.length;
                if (displayDelimiterCount % 2 === 1 && displayStartLine === -1) {
                  // Find the line number from position
                  const precedingText = text.slice(0, textNode.position?.start.offset ?? 0);
                  displayStartLine = precedingText.split("\n").length - 1;
                } else if (displayDelimiterCount % 2 === 0) {
                  displayStartLine = -1;
                }
              }

              // Count remaining $ (after removing $$)
              const withoutDisplay = unescaped.replace(/\$\$/g, "");
              const inlineMatches = withoutDisplay.match(/\$/g);
              if (inlineMatches) {
                inlineDelimiterCount += inlineMatches.length;
                if (inlineDelimiterCount % 2 === 1 && inlineStartLine === -1) {
                  // Find the line number from position
                  const precedingText = text.slice(0, textNode.position?.start.offset ?? 0);
                  inlineStartLine = precedingText.split("\n").length - 1;
                } else if (inlineDelimiterCount % 2 === 0) {
                  inlineStartLine = -1;
                }
              }
            }
          },
          true
        );

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
