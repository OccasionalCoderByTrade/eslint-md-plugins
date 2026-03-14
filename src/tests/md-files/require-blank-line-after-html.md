---
title: HTML Blank Line Test
---

## ✅ VALID: HTML with blank line after

<div style="color: red;">HTML content here</div>

Text after HTML block (with blank line before it).

## ❌ INVALID: HTML without blank line after.

### Plain text text and other content immediately following HTML block are ok, but markdown constructs should be separated by a blank line from HTML elements.

<div>Content in div</div>
> This text immediately follows (should be flagged).

## ✅ VALID: HTML comment with blank line

<!-- This is a comment -->

Text after comment with blank line.
