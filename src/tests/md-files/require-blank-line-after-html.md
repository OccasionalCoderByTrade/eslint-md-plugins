---
title: HTML Blank Line Test
---

## Rule Info

"Breathing Space" is defined as having blank line above and below the structure in question.

## ✅ VALID: HTML with blank line after

<div style="color: red;">HTML content here</div>

Text after HTML block (with blank line before it).

## ❌ INVALID. Reason: Closing div has no breathing space below it

<div>Content in div</div>
This text immediately follows the HTML block.				<!-- expect-flagged: cannoli/require-blank-line-after-html -->

## ❌ INVALID. Reason: closing div has no breathing space below it

<div>Content in div</div>
> This text immediately follows (should be flagged).			<!-- expect-flagged: cannoli/require-blank-line-after-html -->

## ✅ VALID: HTML comments don't need breathing space even though they count as html tags

<!-- This is a comment -->
Text after comment with blank line.

## Valid: Fenced code block with HTML content should not trigger the rule

```html
<div>
  <p>Some content here</p>
  Hello there
</div>
```

## ✅ VALID: HTML tags can follow other HTML tags in the next line

<div style="max-width: 900px; margin: 0 auto;" class="my-3">
  <iframe
    style="width: 100% !important; height: 350px !important;"
    src="https://www.youtube.com/embed/videoseries?list=PL3i6InCQ0J3-P65BA2Xgw11L5TSXifVvy"
    title="CSCI 328 - Algorithms for Big Data - Mayank Goswami (Spring 2026)"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
  ></iframe>
</div>

## ❌ INVALID: Embed image link without blank line after HTML block

<details>
  <summary>Click to expand</summary>
  ![alt text](./image.png)      <!-- expect-flagged: cannoli/require-blank-line-after-html -->

</details>

## ❌ INVALID: Normal text after HTML (no blank line)

<div>HTML content</div>
This is just normal text following HTML.				<!-- expect-flagged: cannoli/require-blank-line-after-html -->

## ✅ VALID: Normal text after HTML with blank line

<div>HTML content</div>

This is normal text following HTML, separated by a blank line.

## ❌ INVALID: Unordered list after HTML

<div>HTML content</div>
- List item follows HTML without blank line			<!-- expect-flagged: cannoli/require-blank-line-after-html -->

## ✅ VALID: Unordered list after HTML with blank line

<div>HTML content</div>

- List item follows HTML with blank line

## ❌ INVALID: Inline link after HTML

<section>Section content</section>
[Link text](https://example.com)				<!-- expect-flagged: cannoli/require-blank-line-after-html -->

## ✅ VALID: Inline link after HTML with blank line

<section>Section content</section>

[Link text](https://example.com)

## ❌ INVALID: Inline code after HTML

<p>Paragraph</p>
`some code` follows HTML						<!-- expect-flagged: cannoli/require-blank-line-after-html -->

## ✅ VALID: Inline code after HTML with blank line

<p>Paragraph</p>

`some code` follows HTML

## ❌ INVALID: Bold text after HTML

<article>Content</article>
**Bold text** without blank line				<!-- expect-flagged: cannoli/require-blank-line-after-html -->

## ✅ VALID: Bold text after HTML with blank line

<article>Content</article>

**Bold text** with blank line

## ❌ INVALID: Emphasis after HTML

<aside>Side note</aside>
_Emphasized text_ without blank line				<!-- expect-flagged: cannoli/require-blank-line-after-html -->

## ✅ VALID: Emphasis after HTML with blank line

<aside>Side note</aside>

*Emphasized text* with blank line

## ❌ INVALID. Error: Blank line required after HTML block when followed by non-HTML content

<div>Content</div>
> **Blockquote** without blank line before HTML		<!-- expect-flagged: cannoli/require-blank-line-after-html -->

## ✅ VALID. Reason: HTML tags have breathing space.

<div>Content</div>

> Blockquote with blank line before HTML

## ✅ VALID: Multiple HTML tags in sequence (no blank line needed between them)

<div>First div</div>
<span>Second span</span>
<p>Third paragraph</p>

Text after multiple HTML tags.

## ✅ VALID: HTML with nested content and proper spacing

<div>
  <p>Nested content</p>
  <span>More nested</span>
</div>

Following paragraph with blank line.

## ❌ INVALID: List with image items after HTML

<nav>Navigation</nav>
- ![icon](./icon.png) Menu item					<!-- expect-flagged: cannoli/require-blank-line-after-html -->

## ❌ INVALID: Task list after HTML

<main>Main content</main>
- [ ] Incomplete task without blank line				<!-- expect-flagged: cannoli/require-blank-line-after-html -->

## ✅ VALID: Task list after HTML with blank line

<main>Main content</main>

- [x] Completed task with blank line

## ❌ INVALID: Reference-style link definition after HTML

<footer>Footer</footer>
[link-ref]: https://example.com					<!-- expect-flagged: cannoli/require-blank-line-after-html -->

Here is a reference to a link: [Example][link-ref].

## ✅ VALID: Reference-style link definition after HTML with blank line

<footer>Footer</footer>

[another-ref]: https://example.com

Here is a reference to a link: [Example][another-ref].

## ❌ INVALID: Strikethrough text after HTML

<header>Header</header>
~~Deleted text~~ without blank line				<!-- expect-flagged: cannoli/require-blank-line-after-html -->

## ✅ VALID: Strikethrough text after HTML with blank line

<header>Header</header>

~~Deleted text~~ with blank line

## ❌ INVALID: Blockquote with multiple markdown elements after HTML

<section>Content</section>
> **Bold** and _italic_ in blockquote				<!-- expect-flagged: cannoli/require-blank-line-after-html -->

## ✅ VALID: Normal paragraph then list after HTML

<div>Content</div>

This is normal text, which doesn't need blank line.

- But this list item does need a blank line before it

## ❌ INVALID: Multiple markdown constructs stacked

<article>Article</article>
> A blockquote						<!-- expect-flagged: cannoli/require-blank-line-after-html -->
- A list
- Another item

## ✅ VALID: Mixed HTML and markdown with proper spacing

<section>Section one</section>

Some text here.

<section>Section two</section>

- A list with spacing

## ❌ INVALID: Heading immediately after HTML block

<div class="note-to-self" data-is-note="true">
## Homework (Spring 2026)						<!-- expect-flagged: cannoli/require-blank-line-after-html -->

</div>

## ✅ VALID: HTML comment used as an annotation directly above a structure

<!-- note: this list is intentionally short -->
- List item annotated by a comment modifier, not flagged

## ✅ VALID: HTML comment annotation above a heading

<!-- some-tool: ignore -->
### Annotated heading

## ❌ INVALID: HTML tag directly followed by comment then content with no blank line

<div>Content</div>
<!-- annotation comment right after a real HTML tag -->
This text still directly abuts the HTML block above.			<!-- expect-flagged: cannoli/require-blank-line-after-html -->

## ✅ VALID: HTML tag, comment, then blank line, then content

<div>Content</div>
<!-- annotation comment -->

This text is properly separated by a blank line.
