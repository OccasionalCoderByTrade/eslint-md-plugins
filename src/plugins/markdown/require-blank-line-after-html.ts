import type { Rule } from "eslint";

import { FencedCodeBlockTracker, getFrontmatterEndLine } from "./utils.js";

/**
 * Check if a line contains a problematic markdown construct that requires a blank line before/after HTML.
 * Block-level constructs like headings are excluded since they don't interfere with HTML rendering.
 */
function isProblematicMarkdownConstruct(line: string): boolean {
  const trimmed = line.trim();

  // Blockquote (> followed by space)
  if (/^>\s/.test(trimmed)) return true;

  // List (-, *, +)
  if (/^[-*+]\s/.test(trimmed)) return true;

  // Image
  if (/^!\[/.test(trimmed)) return true;

  // Link (starts with [)
  if (/^\[/.test(trimmed)) return true;

  // Inline code (starts with backtick)
  if (/^`/.test(trimmed)) return true;

  // Bold/Strong (**, __)
  if (/^\*\*/.test(trimmed) || /^__/.test(trimmed)) return true;

  // Strikethrough (~~)
  if (/^~~/.test(trimmed)) return true;

  // Emphasis (*, _) - but not list markers (those are checked above with space)
  if (/^\*[^\s*]/.test(trimmed) || /^_[^\s_]/.test(trimmed)) return true;

  // Do NOT include headings - they're block-level structural elements
  // Do NOT include normal text - it's not problematic
  // Do NOT flag HTML tags here - they're handled separately

  return false;
}

export const requireBlankLineAfterHtml: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Require blank line after closing HTML tags unless followed by another HTML tag",
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

          // Check if current line is a problematic markdown construct
          if (isProblematicMarkdownConstruct(line)) {
            // Look back to find previous non-empty line
            let prevNonEmptyLine = null;
            let prevNonEmptyLineNum = -1;

            for (let j = i - 1; j >= frontmatterEndLine; j--) {
              if (lines[j].trim()) {
                prevNonEmptyLine = lines[j];
                prevNonEmptyLineNum = j;
                break;
              }
            }

            // If previous line is directly before (no blank line)
            if (prevNonEmptyLine && prevNonEmptyLineNum === i - 1) {
              // Check if previous line is an HTML closing tag
              const prevIsHtmlClosingTag = /<\/\w+>\s*$/.test(prevNonEmptyLine.trim());

              if (prevIsHtmlClosingTag) {
                context.report({
                  loc: { line: i + 1, column: 0 },
                  message: `Blank line required before markdown construct when preceded by closing HTML tag`,
                });
              }
            }
          }

          // Check for HTML tags (opening or closing)
          const htmlTagMatch = line.match(/^(.*)(<\/?(\w+)>)(.*)$/);

          if (htmlTagMatch) {
            const beforeTag = htmlTagMatch[1];
            const htmlTag = htmlTagMatch[2];
            const afterTag = htmlTagMatch[4];

            // If there's content before the tag on the same line, it's inline - check after
            if (beforeTag.trim()) {
              continue;
            }

            // If there's content after the tag on the same line, no check needed
            if (afterTag.trim()) {
              continue;
            }

            // Look backward to find the previous non-empty line
            let prevNonEmptyLine = null;
            let prevNonEmptyLineNum = -1;

            for (let j = i - 1; j >= frontmatterEndLine; j--) {
              if (lines[j].trim()) {
                prevNonEmptyLine = lines[j];
                prevNonEmptyLineNum = j;
                break;
              }
            }

            // Check if previous line is a problematic markdown construct (not headings)
            if (prevNonEmptyLine && prevNonEmptyLineNum === i - 1) {
              // Previous line is directly before (no blank line)
              const prevIsProblematicConstruct = isProblematicMarkdownConstruct(prevNonEmptyLine);

              if (prevIsProblematicConstruct) {
                context.report({
                  loc: { line: i + 1, column: 0 },
                  message: `Blank line required before HTML tag "${htmlTag}" when preceded by markdown construct`,
                });
                // Continue to next iteration to avoid reporting multiple errors
                continue;
              }
            }

            // Look ahead to find the next non-empty line (for closing tags)
            let nextNonEmptyLine = null;
            let nextNonEmptyLineNum = -1;

            for (let j = i + 1; j < lines.length; j++) {
              if (lines[j].trim()) {
                nextNonEmptyLine = lines[j];
                nextNonEmptyLineNum = j;
                break;
              }
            }

            // If no next line found, no error
            if (!nextNonEmptyLine) {
              continue;
            }

            // Only check blank line after for closing tags
            if (/<\//.test(htmlTag)) {
              // Check if the next line is another HTML tag
              const isNextLineHtmlTag = /^<[a-zA-Z/]/.test(nextNonEmptyLine.trim());

              // If next line is an HTML tag, blank line is optional (exception)
              if (isNextLineHtmlTag) {
                continue;
              }

              // If there are blank lines between closing tag and next content, no error
              if (nextNonEmptyLineNum > i + 1) {
                continue;
              }

              // Check if the next line is a problematic markdown construct that requires blank line
              const nextIsProblematicConstruct = isProblematicMarkdownConstruct(nextNonEmptyLine);

              // If next line is a problematic markdown construct, require blank line (report error)
              if (nextIsProblematicConstruct) {
                context.report({
                  loc: { line: i + 1, column: 0 },
                  message: `Blank line required after closing HTML tag "${htmlTag}" when followed by markdown construct`,
                });
              }
            }
          }
        }
      },
    };
  },
};
