# ruff: noqa: S101  # noqa: INP001

"""
Test runner for custom ESLint markdown rules.
Validates that:
1. Expected errors are flagged
2. No unexpected errors are flagged
Focuses on: validate-latex-delimiters and enforce-link-convention
"""

import json
import subprocess
import sys
from collections import defaultdict
from typing import Any


def run_tests() -> int:  # noqa: PLR0915
    """Run eslint and validate rule behavior."""
    # Run eslint and get JSON output
    result: subprocess.CompletedProcess[str] = subprocess.run(
        ["npx", "eslint", "eslint-configs/tests/test-rule.md", "--format", "json"],  # noqa: S607
        capture_output=True,
        text=True,
        cwd="/home/mauri/documents-ubuntu/github-cannoli/qccs-stuff",
        check=False,
    )

    results: list[Any] = json.loads(result.stdout)
    messages: list[dict[str, Any]] = results[0].get("messages", []) if results else []

    # Filter to only our custom rules
    custom_rule_messages: list[dict[str, Any]] = [
        msg
        for msg in messages
        if msg["ruleId"] in ["custom/validate-latex-delimiters", "custom/enforce-link-convention"]
    ]

    print("\n📋 Running rule validation tests...\n")
    print(f"Total custom rule violations found: {len(custom_rule_messages)}\n")

    # Group messages by line
    messages_by_line: defaultdict[int, list[dict[str, Any]]] = defaultdict(list)
    for msg in custom_rule_messages:
        messages_by_line[msg["line"]].append(msg)

    tests_passed: int = 0

    # Test Suite 1: Validate-LaTeX-Delimiters
    print("Test Suite 1: Validate-LaTeX-Delimiters (Dollar Symbols)\n")

    # Test 1.1: Unclosed inline math
    print("  ✓ Test 1.1: Line 206 - Unclosed inline math delimiter ($x = 2)")
    line_206_msgs: list[dict[str, Any]] = messages_by_line.get(206, [])
    line_206_delimiter_errors: list[dict[str, Any]] = [
        m for m in line_206_msgs if m["ruleId"] == "custom/validate-latex-delimiters"
    ]
    assert len(line_206_delimiter_errors) == 1, (
        f"Expected 1 delimiter error on line 206, got {len(line_206_delimiter_errors)}"
    )
    tests_passed += 1

    # Test 1.2: Escaped dollar signs (\$) ignored
    print("  ✓ Test 1.2: Escaped dollar signs (\\$) ignored")
    lines_218_234_msgs: list[dict[str, Any]] = []
    for i in range(218, 235):
        lines_218_234_msgs.extend(messages_by_line.get(i, []))
    escaped_delimiter_errors: list[dict[str, Any]] = [
        m for m in lines_218_234_msgs if m["ruleId"] == "custom/validate-latex-delimiters"
    ]
    assert len(escaped_delimiter_errors) == 0, (
        f"Escaped dollar signs should not trigger errors, got {len(escaped_delimiter_errors)}"
    )
    tests_passed += 1

    # Test 1.3: Valid balanced math
    print("  ✓ Test 1.3: Valid balanced inline and display math")
    valid_math_lines: list[dict[str, Any]] = []
    for i in range(188, 203):
        valid_math_lines.extend(messages_by_line.get(i, []))
    valid_math_errors: list[dict[str, Any]] = [
        m for m in valid_math_lines if m["ruleId"] == "custom/validate-latex-delimiters"
    ]
    assert len(valid_math_errors) == 0, (
        f"Valid balanced math should not trigger errors, got {len(valid_math_errors)}"
    )
    tests_passed += 1

    # Test Suite 2: Enforce-Link-Convention
    print("\nTest Suite 2: Enforce-Link-Convention\n")

    # Test uppercase in links (line numbers adjusted for added test cases)
    uppercase_link_tests: list[tuple[int, str]] = [
        (263, "./My-Document.pdf"),
        (265, "./Path/To/File.pdf"),
        (269, "./Docs/API-Guide.pdf"),
        (271, "./Path_With_MixedCase/File.md"),
        (275, "./AnotherMixedCaseTitle.pdf"),
    ]

    for idx, (line, desc) in enumerate(uppercase_link_tests, 1):
        print(f"  ✓ Test 2.{idx}: Line {line} - Uppercase in link ({desc})")
        msgs: list[dict[str, Any]] = messages_by_line.get(line, [])
        link_errors: list[dict[str, Any]] = [
            m for m in msgs if m["ruleId"] == "custom/enforce-link-convention"
        ]
        assert len(link_errors) == 1, (
            f"Expected 1 link error on line {line}, got {len(link_errors)}"
        )
        tests_passed += 1

    # Test spaces and special characters
    special_char_tests: list[tuple[int, str]] = [
        (269, "Spaces in path (./my awesome guide.pdf)"),
        (271, "Special chars (@, #) in filename"),
        (275, "@ symbol in filename"),
        (277, "& symbol in path"),
    ]

    for idx, (line, desc) in enumerate(special_char_tests, len(uppercase_link_tests) + 1):
        print(f"  ✓ Test 2.{idx}: Line {line} - {desc}")
        msgs = messages_by_line.get(line, [])
        link_errors: list[dict[str, Any]] = [
            m for m in msgs if m["ruleId"] == "custom/enforce-link-convention"
        ]
        # Some lines may have multiple errors, so check >= 1
        assert len(link_errors) >= 1, (
            f"Expected at least 1 link error on line {line}, got {len(link_errors)}"
        )
        tests_passed += 1

    # Test Suite 3: Valid Cases (Should Not Be Flagged)
    print("\nTest Suite 3: Valid Cases (Should Not Be Flagged)\n")

    # Test valid links (external links and properly formatted local links)
    print("  ✓ Test 3.1: Valid lowercase links with proper format")
    valid_link_lines: list[int] = [251, 253, 257, 281, 283, 287]
    unexpected_link_errors: int = 0
    for line in valid_link_lines:
        msgs = messages_by_line.get(line, [])
        link_errors: list[dict[str, Any]] = [
            m for m in msgs if m["ruleId"] == "custom/enforce-link-convention"
        ]
        unexpected_link_errors += len(link_errors)
    assert unexpected_link_errors == 0, (
        f"No errors expected for valid links, but found {unexpected_link_errors}"
    )
    tests_passed += 1

    # Test escaped dollars (lines with \$)
    print("  ✓ Test 3.2: Escaped dollar signs (\\$) in monetary amounts")
    escaped_dollar_lines: range = range(218, 235)
    unexpected_escaped_errors: int = 0
    for line in escaped_dollar_lines:
        msgs = messages_by_line.get(line, [])
        delimiter_errors: list[dict[str, Any]] = [
            m for m in msgs if m["ruleId"] == "custom/validate-latex-delimiters"
        ]
        unexpected_escaped_errors += len(delimiter_errors)
    assert unexpected_escaped_errors == 0, "Escaped dollars should not trigger delimiter errors"
    tests_passed += 1

    # Test external and anchor links
    print("  ✓ Test 3.3: External links and anchors (ignored by rule)")
    external_link_lines: list[int] = [281, 283, 287]
    unexpected_external_errors: int = 0
    for line in external_link_lines:
        msgs = messages_by_line.get(line, [])
        link_errors: list[dict[str, Any]] = [
            m for m in msgs if m["ruleId"] == "custom/enforce-link-convention"
        ]
        unexpected_external_errors += len(link_errors)
    assert unexpected_external_errors == 0, "External and anchor links should not be flagged"
    tests_passed += 1

    # Summary
    print("\n" + "=" * 60)
    print(f"✅ All {tests_passed} tests passed!\n")
    print("Summary:")
    print("  - validate-latex-delimiters: Properly flags unclosed delimiters and ignores escaped $")
    print("  - enforce-link-convention: Properly validates local file links")
    print("  - Valid cases: Correctly not flagged\n")

    return 0


if __name__ == "__main__":
    try:
        sys.exit(run_tests())
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}\n")
        sys.exit(1)
    except Exception as e:  # noqa: BLE001
        print(f"\n❌ Error: {e}\n")
        sys.exit(1)
