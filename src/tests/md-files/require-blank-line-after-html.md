---
title: HTML Blank Line Test
---

## ✅ VALID: HTML with blank line after

<div style="color: red;">HTML content here</div>

Text after HTML block (with blank line before it).

## ❌ INVALID: HTML without blank line after.

### Plain text text and other content immediately following HTML block are ok, but markdown constructs should be separated by a blank line from HTML elements.

<div>Content in div</div>
> This text immediately follows (should be flagged).			<!-- expect-flagged: cannoli/require-blank-line-after-html -->

## ✅ VALID: HTML comment with blank line

<!-- This is a comment -->

Text after comment with blank line.

## Valid: Fenced code block with HTML content should not trigger the rule

```html
<div>
  <p>Some content here</p>
</div>
```

## Valid: HTML closing block is followed by another HTML block, the rule should not apply

<div style="max-width: 900px; margin: 0 auto;" class="my-3">
  <iframe
    style="width: 100% !important; height: 350px !important;"
    src="https://www.youtube.com/embed/videoseries?list=PL3i6InCQ0J3-P65BA2Xgw11L5TSXifVvy"
    title="CSCI 328 - Algorithms for Big Data - Mayank Goswami (Spring 2026)"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
  ></iframe>
</div>

## Invalid. Embed image link without blank line after HTML block

<details>
  <summary>Click to expand</summary>
  ![alt text](./image.png)      <!-- expect-flagged: cannoli/require-blank-line-after-html -->

</details>

## ✅ VALID: Normal text after HTML (no blank line needed)

<div>HTML content</div>
This is just normal text following HTML, which doesn't require a blank line.

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

## ❌ INVALID: HTML tag before blockquote

<div>Content</div>
> **Blockquote** without blank line before HTML		<!-- expect-flagged: cannoli/require-blank-line-after-html -->

## ✅ VALID: HTML tag before blockquote with blank line

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
[link-ref]: https://example.com
<!-- expect-flagged: cannoli/require-blank-line-after-html -->

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
