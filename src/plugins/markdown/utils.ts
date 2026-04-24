/**
 * Returns the frontmatter string (without the --- delimiters) if it exists
 */
export function extractFrontmatter(text: string): string | null {
  const frontmatterMatch = text.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---/);
  return frontmatterMatch ? frontmatterMatch[1] : null;
}

/**
 * Find the line number where frontmatter ends after the closing --- delimiter
 */
export function getFrontmatterEndLine(text: string): number {
  const lines = text.split("\n");

  if (lines[0] !== "---") {
    return 0;
  }

  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === "---") {
      return i + 1;
    }
  }

  return 0; // no closing --- found
}

/**
 * Find all fenced code block ranges in the text
 * Returns an array of [startLine, endLine] pairs (0-indexed)
 * Correctly handles indented code blocks (e.g., nested under list items)
 * because fence delimiters are detected anywhere on the line after trimming
 */
function getFencedCodeBlockRanges(text: string): Array<[number, number]> {
  const lines = text.split("\n");
  const ranges: Array<[number, number]> = [];

  let inCodeBlock = false;
  let blockStartLine = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for fence delimiter regardless of indentation level
    if (/^(```|~~~)/.test(trimmed)) {
      if (inCodeBlock) {
        // End of code block
        ranges.push([blockStartLine, i]);
        inCodeBlock = false;
      } else {
        // Start of code block
        inCodeBlock = true;
        blockStartLine = i;
      }
    }
  }

  // If there's an unclosed code block at EOF, still track it
  if (inCodeBlock) {
    ranges.push([blockStartLine, lines.length - 1]);
  }

  return ranges;
}

export class FencedCodeBlockTracker {
  private ranges: Array<[number, number]>;
  private currentRangeIndex: number = 0;

  constructor(text: string) {
    this.ranges = getFencedCodeBlockRanges(text);
  }

  /**
   * Check if a given line index falls within any fenced code block range.
   */
  isLineInFencedCodeBlock(lineIndex: number): boolean {
    if (this.ranges.length === 0) {
      return false;
    }

    while (this.currentRangeIndex < this.ranges.length) {
      const [start, end] = this.ranges[this.currentRangeIndex];

      if (lineIndex < start) {
        return false;
      }

      if (lineIndex >= start && lineIndex <= end) {
        return true;
      }

      if (lineIndex > end) {
        this.currentRangeIndex++;
        continue;
      }
    }

    // lineIndex is past all ranges
    return false;
  }
}

/**
 * Remove escaped LaTeX delimiters from text before counting
 * Handles both inline ($) and display ($$) math delimiters
 */
export function removeEscapedDelimiters(text: string): string {
  // Remove escaped dollar signs (\$) before counting delimiters
  return text.replace(/\\\$/g, "");
}

/**
 * Count occurrences of a delimiter in text (after removing escaped versions)
 * Returns the count and tracks the line where the count becomes odd
 */
export interface DelimiterCount {
  count: number;
  firstUnclosedLine: number; // 0-indexed line number, or -1 if balanced
}

/**
 * Slugify a filename by converting to lowercase, replacing spaces/underscores/slashes with hyphens,
 * removing special characters, and normalizing diacritics to ASCII.
 * Ported from Python: scripts/organizer/util/__init__.py
 */
export function slugify(name: string): string {
  let slug = name;

  // replace C++ with 'cpp'
  slug = slug.replace(/(_+)?c\+\+/gi, "$1cpp");
  slug = slug.replace("---", "___");

  // Replace & with ' and '
  slug = slug.replace(/&/g, " and ");

  // Replace spaces, underscores, and forward slashes with hyphens
  slug = slug.replace(/ /g, "-").replace(/\//g, "-");

  // Normalize Unicode (decompose diacritics)
  slug = slug
    .normalize("NFKD")
    .split("")
    .filter((char) => char.charCodeAt(0) < 128)
    .join("");

  // Replace non-alphanumeric characters (except hyphen, underscore, plus) with hyphens
  slug = slug.replace(/[^-+_a-zA-Z0-9]/g, "-");

  // Collapse multiple consecutive hyphens into a single hyphen
  slug = slug.replace(/-+/g, "-");
  slug = slug.replace(/-*(_+)-*/g, "$1");

  slug = normalizeCamelPascalCase(slug);

  // Strip leading/trailing hyphens and lowercase
  return slug.replace(/^-+|-+$/g, "").toLowerCase();
}

/**
 * Check if a string contains only valid local file link characters (lowercase, alphanumeric, hyphens, underscores, slashes, dots)
 */
export function isValidLinkFormat(link: string): boolean {
  // Allow: lowercase alphanumeric, hyphens, underscores, slashes, dots, hash, question mark
  // For local files, we don't allow & or = (those are query params for external URLs)
  return /^[a-z0-9\-_/.#?]+$/.test(link);
}

/**
 * Insert dashes at camelCase transitions for preparation before slugifying.
 * Ported from Python: scripts/organizer/util/__init__.py
 */
function normalizeCamelPascalCase(text: string): string {
  if (text.length < 2) {
    return text;
  }

  // Handle PascalCase starting with single uppercase letter
  if (text[0] === text[0].toUpperCase() && text[1] === text[1].toLowerCase()) {
    text = text[0].toLowerCase() + text.slice(1);
  }

  const r1 = /([a-z0-9]+)([A-Z]+[a-z0-9]*)/;
  const r2 = /([A-Z]+)([A-Z][a-z])/;

  const m1 = text.match(r1);
  const m2 = text.match(r2);

  if (!m1 && !m2) {
    return text;
  }

  let result = "";
  if (m1) {
    const [left, right] = splitBetweenTwoGroups(m1, text);
    const part1 = normalizeCamelPascalCase(left);
    const part2 = normalizeCamelPascalCase(right);
    result = part1 + "-" + part2;
  } else if (m2) {
    const [left, right] = splitBetweenTwoGroups(m2, text);
    const part1 = normalizeCamelPascalCase(left);
    const part2 = normalizeCamelPascalCase(right);
    result = part1 + "-" + part2;
  }

  if (result === "") {
    throw new Error("Result string should not be empty");
  }

  return result;
}

/**
 * Split original regex match string into (left, right) at the boundary between 2 adjacent capture groups.
 * Ported from Python: scripts/organizer/util/__init__.py
 */
function splitBetweenTwoGroups(match: RegExpMatchArray, originalString: string): [string, string] {
  if (match.index === undefined) {
    throw new Error("Match index is undefined");
  }

  // Find the boundary between the two groups
  const firstGroupLength = match[1].length;
  const boundary = match.index + firstGroupLength;

  return [originalString.slice(0, boundary), originalString.slice(boundary)];
}
