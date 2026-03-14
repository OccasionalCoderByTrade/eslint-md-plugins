---
description: Test suite for ESLint markdown rules
---

## Test: Require empty line after closing html tag

### Test 1: PASS

<details>
<summary>Test content</summary>

Hello World!

</details>

### Test 2: FAIL

<details>
<summary>Test content</summary>
Hello World!
</details>

## Additional Markdown Linting Test Cases

This section contains various markdown violations for testing @eslint/markdown default rules.

### Hard Tabs Test

This line contains a	tab character (should use spaces).

### Multiple consecutive blank lines

This paragraph has two blank lines after it.


And before this one (one blank line should be enough).

### Heading without blank line before it

Some text here right before heading

#Bad Header

```

# Header In Code block

```

Text continues here.

### Inconsistent heading style

# ATX heading style

Heading 2 Underline Style
=========================

Some text here

### Another ATX Heading

More text

Mixed Style Underline
---------------------

### Missing spaces in headings

#NoSpaceAfterHash
###Also bad

### List items with inconsistent spacing

- Item 1
- Item 2
  -Item 3 (inconsistent spacing)

* Item 4 (mixed list markers)
* Item 5

### Line too long

This is a very long line that exceeds the typical line length limitation and should trigger a linting error for being too verbose and not respecting the maximum line width standard that most linters enforce.

Another long line here that is deliberately written to be longer than the standard line width limit to test if the linter catches this violation.

### Multiple inline code spans

Use `code1` and `code2` and `code3` and `code4` and `code5` for these examples.

### Blockquote without proper spacing

>This blockquote has no space after the marker
>Neither does this one
> This one has proper spacing

### Hard line breaks with trailing spaces

Invisible trailing spaces on the line above lead to hard breaks  
This continues on next line with hard break  
And another with trailing spaces

### Emphasis and strong inconsistency

_Single underscores_ for emphasis
_Single asterisks_ for emphasis
**Double underscores** for strong
**Double asterisks** for strong

_Mixed *emphasis* styles_ should be consistent

### Improper link syntax

This is a [link](not properly formatted url)
This is an [unclosed link](http://example.com

### Code fence indentation

```javascript
// Indented code fence
const x = 1;
```

### Rule 5: Opening and closing HTML tags without blank line after it (exception: another html tag can immediately follow without blank line)

Opening/closing HTML tags require a blank line before and after it to separate it from a markdown construct, otherwise it can cause rendering issues. The exception is when the preceding/following construct is a normal text line or another HTML tag, in which case a blank line is not required.

#### Example 1: Ok

<div>
  <p>Some content here</p>
  <p>More content here</p>
</div>
<div>
  <p>Some content here</p><p>More content here</p>
</div>

#### Example 2: Should be flagged

<div>
  <p>Some content here</p>
  > This is a markdown blockquote immediately following a closing html tag without a blank line in between, which should trigger a linting error.
</div>

#### Example 3: Ok

<div>
  <p>Some content here</p>
  
  > This is a markdown blockquote immediately following a closing html tag but with a blank line in between, which should be fine.

</div>

#### Example 4: Should be flagged

<div>
  <p>Some content here</p>
  > This is a markdown blockquote immediately following a closing html tag but with a blank line in between, which should be fine.

</div>

<!-- this should fail because the closing tag doesnt have a blank line that separates it from the markdown construct -->
<div>
  <p>Some content here</p>
  
  ![](image.png)
</div>

<div>
  <p>Some content here</p>
  **Some intended bolded text**
</div>

### HTML Inside fenced code block should not trigger the rule

- fenced code block inside a list item
  ```html
  <div>
    <p>Some content here</p>
  </div>
  ```

## Rule 6: Validate LaTeX Delimiters

### Test 1: PASS - Balanced inline math

The equation $x = 2$ is simple.

And another one: $a + b = c$

### Test 2: PASS - Balanced display math

$$
x^2 + y^2 = z^2
$$

More text after the display equation.

$$
\frac{a}{b} = c
$$

### Test 3: FAIL - Unclosed inline math delimiter

This equation $x = 2 is missing the closing dollar sign and there's no matching one elsewhere.

### Test 4: FAIL - Unclosed display math delimiter

$$
x^2 + y^2 = z^2

This display math is never closed because there's no matching \$\$ after this point.

This is normal text after the unclosed display math. The \$\$ above should have been closed.

### Test 5: PASS - LaTeX in code block (should be ignored)

```latex
$This is inside a code block and should not be checked$
```

### Test 6: PASS - Escaped dollar signs (literal money symbols, should be ignored)

The item costs \$5.99 and the second item costs \$12.50.

For \$1.00, you get 100 pennies in return.

This subscription is \$9.99/month or \$99/year.

The total is \$150 plus tax.

### Test 7: PASS - Mixed escaped and LaTeX delimiters

The formula $x = y + z$ costs \$50 per use.

Each equation like $a + b = c$ is worth \$25, but display math like:

$$
E = mc^2
$$

### Test 7: FAIL - Dollar symbol inside inline code block

MIPS Data Hazard: `sub` needs `$s1` before it is updated by the load.

is worth \$100. You can escape a dollar sign with backslash: \$.

## Rule 7: Enforce Link Convention

### Test 1: PASS - Lowercase links with valid characters

Check out [my document](./my-awesome-document.pdf) for more info.

See the [API documentation](/api-reference/v1/endpoints) for details.

Reference link: [example][docs-link]

[docs-link]: ./proper-docs-link

### Test 2: FAIL - Uppercase in link

This [bad link](./My-Document.pdf) has uppercase letters.

Another [bad](./Path/To/File.pdf) example.

### Test 3: FAIL - Spaces in link (should use hyphens)

Check [this guide](./my awesome guide.pdf) for info.

Link with [special chars](./file@name#wrong.pdf).

### Test 4: FAIL - Special characters in link

This [broken link](./file-with-@-symbol.pdf) has invalid chars.

Another [bad one](./path&more/file.pdf) with ampersand.

### Test 5: PASS - External links (ignored by rule)

Visit [Google](https://google.com) for search.

Contact [my email](mailto:example@example.com) for help.

### Test 6: PASS - Anchor links (ignored by rule)

Jump to [section](#my-section) below.

### Test 7: FAIL - Mixed case in link paths

Reference the [docs](./Docs/API-Guide.pdf) for help.

[broken-ref]: ./Path_With_MixedCase/File.md

[temp](./AnotherMixedCaseTitle.pdf)

### Test 8: PASS - Valid link with hyphens and underscores

See [code examples](./code_examples/helper-functions.pdf).

Check out [the guide](./the-definitive-guide/part-1.pdf).
