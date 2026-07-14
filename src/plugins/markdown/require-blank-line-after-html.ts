import type { Rule } from "eslint";

import { FencedCodeBlockTracker, getFrontmatterEndLine } from "./utils.js";

/**
 * Check if a line is an HTML element/tag or comment
 */
function isHtmlLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith("<");
}

/**
 * Check if a line is an HTML comment (e.g. an eslint rule modifier annotation)
 */
function isHtmlComment(line: string): boolean {
  return line.trim().startsWith("<!--");
}

export const requireBlankLineAfterHtml: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Require blank line after HTML blocks when followed by any non-HTML content",
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

        // Line number of the most recent real HTML tag (excluding comments)
        // that has not yet been separated from subsequent content by a blank line.
        let lastHtmlTagLine = -1;
        // Whether the immediately preceding non-blank line was HTML (tag or comment),
        // used to detect adjacency across comment "annotation" lines.
        let previousLineWasHtml = false;
        // Whether we're in the middle of a multi-line HTML tag's attribute list
        // (e.g. `<iframe\n  src="..."\n  ...>`), so continuation lines that don't
        // themselves start with `<` are still treated as part of the HTML block.
        let insideOpenTag = false;

        for (let i = frontmatterEndLine; i < lines.length; i++) {
          if (codeBlockTracker.isLineInFencedCodeBlock(i)) {
            continue;
          }

          const line = lines[i];
          const trimmed = line.trim();

          if (insideOpenTag) {
            if (line.includes(">")) {
              insideOpenTag = false;
            }
            previousLineWasHtml = true;
            continue;
          }

          if (isHtmlLine(line)) {
            // Comments don't count as a triggering HTML line, since they're
            // often used as annotations sitting directly above the structure
            // they describe, but they still count as HTML so they don't get
            // flagged themselves and don't break adjacency to a prior tag.
            if (!isHtmlComment(line)) {
              lastHtmlTagLine = i;
            }
            if (!line.includes(">")) {
              insideOpenTag = true;
            }
            previousLineWasHtml = true;
            continue;
          }

          // If this is an empty line, reset tracking (blank line is good separator)
          if (!trimmed) {
            lastHtmlTagLine = -1;
            previousLineWasHtml = false;
            continue;
          }

          // We have a non-empty, non-HTML line
          // Check if it directly follows an HTML tag (possibly through comment lines)
          if (lastHtmlTagLine >= 0 && previousLineWasHtml) {
            context.report({
              loc: { line: i + 1, column: 0 },
              message: "Blank line required after HTML block when followed by non-HTML content",
            });
          }
          // Reset tracking - we've seen non-HTML, non-blank content
          lastHtmlTagLine = -1;
          previousLineWasHtml = false;
        }
      },
    };
  },
};
