import type { Rule } from "eslint";
import * as jsYaml from "js-yaml";
import { isMatch } from "matcher";

import { extractFrontmatter } from "./utils.js";

type FieldPattern = string | RegExp;
type FieldPatterns = FieldPattern | FieldPattern[];

function getNestedValue(obj: unknown, path: string[]): unknown {
  let current: unknown = obj;
  for (const key of path) {
    if (current === null || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function matchesPattern(value: unknown, pattern: FieldPattern): boolean {
  const strValue = String(value);
  if (pattern instanceof RegExp) {
    return pattern.test(strValue);
  }
  return isMatch(strValue, pattern);
}

function matchesAny(value: unknown, patterns: FieldPatterns): boolean {
  const list = Array.isArray(patterns) ? patterns : [patterns];
  return list.some((p) => matchesPattern(value, p));
}

function describePatterns(patterns: FieldPatterns): string {
  const list = Array.isArray(patterns) ? patterns : [patterns];
  const descs = list.map((p) => (p instanceof RegExp ? p.toString() : `"${p}"`));
  return descs.length === 1 ? descs[0] : `[${descs.join(", ")}]`;
}

export const enforceFrontmatterSchema: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce frontmatter field presence and value patterns. Keys use __ to denote nesting (e.g. course__code checks course.code). Values are glob strings (matched with minimatch) or RegExp, or arrays of either.",
    },
    schema: [{}],
  } as const,
  create(context: Rule.RuleContext): Rule.RuleListener {
    let alreadyProcessed = false;

    return {
      "*": (node: Rule.Node) => {
        if (alreadyProcessed || (node as unknown as { type: string }).type !== "root") return;
        alreadyProcessed = true;

        const options = context.options[0] as Record<string, FieldPatterns> | undefined;
        if (!options || Object.keys(options).length === 0) return;

        const sourceCode = context.sourceCode;
        if (!sourceCode) return;

        const text = sourceCode.getText();
        const frontmatterText = extractFrontmatter(text);

        if (frontmatterText === null) {
          context.report({
            loc: { line: 1, column: 0 },
            message: "Missing frontmatter",
          });
          return;
        }

        const requiredFields = Object.keys(options)
          .map((k) => k.split("__").join("."))
          .join(", ");

        if (frontmatterText.trim() === "") {
          context.report({
            loc: { line: 1, column: 0 },
            message: `Frontmatter is empty. Required fields: ${requiredFields}`,
          });
          return;
        }

        let parsed: unknown;
        try {
          parsed = jsYaml.load(frontmatterText);
        } catch (e) {
          context.report({
            loc: { line: 1, column: 0 },
            message: `Syntax error in frontmatter YAML declaration`,
          });
          return;
        }

        for (const [key, patterns] of Object.entries(options)) {
          const path = key.split("__");
          const value = getNestedValue(parsed, path);
          const fieldLabel = path.join(".");

          if (value === undefined || value === null) {
            context.report({
              loc: { line: 1, column: 0 },
              message: `Required frontmatter field '${fieldLabel}' is missing or uninitialized`,
            });
            continue;
          }

          if (!matchesAny(value, patterns)) {
            context.report({
              loc: { line: 1, column: 0 },
              message: `Frontmatter field '${fieldLabel}' has invalid value "${value}". It must match any pattern in: ${describePatterns(patterns)}`,
            });
          }
        }
      },
    };
  },
};
