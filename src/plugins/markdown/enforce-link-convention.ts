import type { Rule } from "eslint";

import { FencedCodeBlockTracker, getFrontmatterEndLine, isValidLinkFormat, slugify } from "./utils.js";

/**
 * Enforce link convention: all lowercase and no offending characters.
 * Suggests slugified version as the proper convention.
 */
export const enforceLinkConvention: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce that links are all lowercase and contain only valid characters (no spaces, special chars, etc.)",
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

          if (codeBlockTracker.isLineInFencedCodeBlock(i)) {
            continue;
          }

          // Match markdown links: [text](link) and [text]: link
          // Use negative lookbehind to avoid matching escaped brackets like \[text\]
          const inlineLinksRegex = /(?<!\\)\[([^\]]+)\]\(([^)]+)\)/g;
          const referenceLinkRegex = /^\s*\[([^\]]+)\]:\s*(.+?)(?:\s+"[^"]*")?$/;

          // Check inline links [text](link)
          let inlineMatch;
          while ((inlineMatch = inlineLinksRegex.exec(line)) !== null) {
            const link = inlineMatch[2];
            // Calculate column position: find the opening ( and start from the first char after it
            const fullMatch = inlineMatch[0];
            const openParenIndex = fullMatch.indexOf("(");
            const linkColumn = inlineMatch.index + openParenIndex + 1;
            checkLink(link, i, linkColumn, context);
          }

          // Check reference links [text]: link
          const refMatch = line.match(referenceLinkRegex);
          if (refMatch) {
            const link = refMatch[2].trim();
            // Calculate exact column position where the link starts
            const linkPosition = line.indexOf(link);
            checkLink(link, i, linkPosition, context);
          }
        }

        function slugifyPath(path: string): string {
          // Split by slash and slugify each component separately to preserve directory structure
          const parts = path.split("/");
          return parts
            .map((part) => {
              // Don't slugify empty parts or special directory references
              if (part === "" || part === "." || part === "..") {
                return part;
              }
              return slugify(part);
            })
            .join("/");
        }

        function extractExtension(path: string): { basename: string; extension: string } {
          // Find the last slash to separate directory from filename
          const lastSlashIndex = path.lastIndexOf("/");
          const filename = path.substring(lastSlashIndex + 1);

          // Find the last dot in the filename
          const lastDotIndex = filename.lastIndexOf(".");

          // Only extract extension if dot is not at the start (e.g., not ".gitignore")
          if (lastDotIndex > 0) {
            const basename = filename.substring(0, lastDotIndex);
            const extension = filename.substring(lastDotIndex);
            const dirPart = lastSlashIndex >= 0 ? path.substring(0, lastSlashIndex + 1) : "";
            return {
              basename: dirPart + basename,
              extension: extension,
            };
          }

          return { basename: path, extension: "" };
        }

        function checkLink(
          link: string,
          lineIndex: number,
          columnIndex: number,
          ctx: Rule.RuleContext
        ): void {
          // Skip external links (any valid URL) and anchors
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            new ((globalThis as any).URL)(link);
            return; // Valid external URL, skip it
          } catch {
            // Not a valid URL - could be a relative path or anchor
            if (link.startsWith("#")) {
              return; // It's an anchor, skip it
            }
          }

          // Check if link is valid format
          if (!isValidLinkFormat(link)) {
            // Separate basename and extension to preserve the extension
            const { basename, extension } = extractExtension(link);
            const suggestion = slugifyPath(basename) + extension;

            // Only flag if the link doesn't match the suggested slug
            if (link !== suggestion) {
              ctx.report({
                loc: {
                  start: { line: lineIndex + 1, column: columnIndex },
                  end: { line: lineIndex + 1, column: columnIndex + link.length },
                },
                message: `Link contains invalid characters or uppercase letters. Links should be lowercase and contain only alphanumeric characters, hyphens, underscores, slashes, and dots. Suggested format: "${suggestion}"`,
              });
            }
          }
        }
      },
    };
  },
};
