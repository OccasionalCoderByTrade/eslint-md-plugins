#!/usr/bin/env python3
"""Test script for ESLint plugin markdown files.

Parses markdown test files for expect-flagged comments and validates that
eslint produces errors at the expected lines with no unexpected errors.
"""

import re
import subprocess
import json
from pathlib import Path


def parse_expected_flags(file_path: Path) -> dict[int, str]:
    """Parse a markdown file to find lines that expect to be flagged.

    Returns a dict mapping line numbers (1-indexed) to rule names.
    Looks for expect-flagged comments on the same line or next line.
    """
    expected: dict[int, str] = {}

    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    for i, line in enumerate(lines, start=1):
        # Look for expect-flagged comments on current line
        match = re.search(r"<!-- expect-flagged: ([\w/-]+) -->", line)
        if match:
            rule_name = match.group(1)
            # Comment on same line means previous line should be flagged
            if line.strip().startswith("<!--"):
                # This is a standalone comment line, so it refers to the previous line
                expected[i - 1] = rule_name
            else:
                # Comment is on same line as content
                expected[i] = rule_name

    return expected


def run_eslint(file_path: Path) -> list[dict]:
    """Run eslint on a markdown file and return parsed results.

    Returns a list of error objects with 'line' and 'ruleId' fields.
    """
    try:
        result = subprocess.run(
            ["npx", "eslint", str(file_path), "--format", "json"],
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent,
        )

        # Parse JSON output
        output = json.loads(result.stdout)

        if not output:
            return []

        # Extract errors from first file result
        errors: list[dict] = []
        for message in output[0].get("messages", []):
            errors.append({
                "line": message["line"],
                "ruleId": message["ruleId"],
                "message": message["message"],
            })

        return errors
    except (subprocess.CalledProcessError, json.JSONDecodeError) as e:
        print(f"Error running eslint on {file_path}: {e}")
        return []


def validate_file(file_path: Path) -> tuple[bool, str]:
    """Validate a single markdown test file.

    Returns (success, message) tuple.
    """
    expected = parse_expected_flags(file_path)
    errors = run_eslint(file_path)

    # Convert errors to line-based format (only cannoli/* rules)
    actual_errors: dict[int, str] = {}
    for error in errors:
        if error["ruleId"] and error["ruleId"].startswith("cannoli/"):
            actual_errors[error["line"]] = error["ruleId"]

    # Check for missing expected flags
    missing: list[tuple[int, str]] = []
    for line, rule in expected.items():
        if line not in actual_errors:
            missing.append((line, rule))
        elif actual_errors[line] != rule:
            missing.append((line, f"{rule} (got {actual_errors[line]})"))

    # Check for unexpected flags
    unexpected: list[tuple[int, str]] = []
    for line, rule in actual_errors.items():
        if line not in expected:
            unexpected.append((line, rule))

    # Build result message
    all_passed = not missing and not unexpected
    details: list[str] = []

    if missing:
        details.append(f"Missing expected flags at lines: {missing}")

    if unexpected:
        details.append(f"Unexpected flags at lines: {unexpected}")

    message = f"{file_path.name}: "
    if all_passed:
        message += "✅ PASS"
    else:
        message += f"❌ FAIL - {'; '.join(details)}"

    return all_passed, message


def main() -> None:
    """Run tests on all markdown test files."""
    test_dir = Path(__file__).parent / "src" / "tests" / "md-files"

    if not test_dir.exists():
        print(f"Test directory not found: {test_dir}")
        return

    md_files = sorted(test_dir.glob("*.md"))
    results: list[tuple[str, bool]] = []

    for file_path in md_files:
        success, message = validate_file(file_path)
        results.append((file_path.name, success))
        print(message)

    # Summary
    print("\n" + "=" * 60)
    passed_count = sum(1 for _, success in results if success)
    total_count = len(results)
    print(f"Results: {passed_count}/{total_count} tests passed")

    # Exit with error code if any test failed
    if passed_count < total_count:
        exit(1)


if __name__ == "__main__":
    main()
