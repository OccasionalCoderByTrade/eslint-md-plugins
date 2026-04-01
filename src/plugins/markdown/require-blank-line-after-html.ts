import type { Rule } from "eslint";

import { FencedCodeBlockTracker, getFrontmatterEndLine } from "./utils.js";

/**
 * Check if a line contains a markdown construct that requires blank line after HTML
 */
function isProblematicMarkdownConstruct(line: string): boolean {
  const trimmed = line.trim();

  if (!trimmed) return false;

  // Headings (# through ###### followed by space)
  if (/^#{1,6}\s/.test(trimmed)) return true;

  // Blockquote (> followed by space)
  if (/^>\s/.test(trimmed)) return true;

  // List (-, *, +) followed by space
  if (/^[-*+]\s/.test(trimmed)) return true;

  // Image
  if (/^!\[/.test(trimmed)) return true;

  // Link (starts with [ and has matching ])
  if (/^\[/.test(trimmed) && /\]/.test(trimmed)) return true;

  // Inline code (starts with backtick)
  if (/^`/.test(trimmed)) return true;

  // Bold/Strong (**, __)
  if (/^\*\*/.test(trimmed) || /^__/.test(trimmed)) return true;

  // Strikethrough (~~)
  if (/^~~/.test(trimmed)) return true;

  // Emphasis (*, _) - but not list markers
  if (/^\*[^\s*]/.test(trimmed) || /^_[^\s_]/.test(trimmed)) return true;

  // Table (starts with |)
  if (/^\|/.test(trimmed)) return true;

  return false;
}

/**
 * Check if a line is an HTML element/tag (but not comments or blank lines)
 */
function isHtmlLine(line: string): boolean {
  const trimmed = line.trim();
  // HTML tags start with < but exclude comments
  if (!trimmed.startsWith("<")) return false;
  if (trimmed.startsWith("<!--")) return false; // Exclude comments
  return true;
}

export const requireBlankLineAfterHtml: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Require blank line after HTML blocks when followed by markdown constructs",
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

        // Track the last HTML line seen
        let lastHtmlLine = -1;

        for (let i = frontmatterEndLine; i < lines.length; i++) {
          if (codeBlockTracker.isLineInFencedCodeBlock(i)) {
            continue;
          }

          const line = lines[i];
          const trimmed = line.trim();

          // Update last HTML line if this is HTML
          if (isHtmlLine(line)) {
            lastHtmlLine = i;
            continue;
          }

          // If this is an empty line, reset tracking (blank line is good separator)
          if (!trimmed) {
            lastHtmlLine = -1;
            continue;
          }

          // We have a non-empty, non-HTML line
          // Check if it follows HTML without blank line
          if (lastHtmlLine >= 0 && i === lastHtmlLine + 1) {
            // Direct next line after HTML block
            if (isProblematicMarkdownConstruct(line)) {
              context.report({
                loc: { line: i + 1, column: 0 },
                message: "Blank line required after HTML block when followed by markdown construct",
              });
            }
          }
          // Reset tracking - we've seen non-HTML, non-blank content
          lastHtmlLine = -1;
        }
      },
    };
  },
};
