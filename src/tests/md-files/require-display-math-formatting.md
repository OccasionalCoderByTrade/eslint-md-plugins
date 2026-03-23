---
title: Display Math Formatting Test
---

## ✅ VALID: Properly formatted display math

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

This is the quadratic formula with proper formatting.

## ❌ INVALID: Display math on same line

$$E = mc^2$$			<!-- expect-flagged: cannoli/require-display-math-formatting -->

This should be flagged - double-dollar delimiters should be on separate lines.

## ✅ VALID: Inline math (not display)

The equation $x = 2$ appears inline in text.

This is different from display math.

## ✅ VALID: Display math delimiters inline with other content

You can write display math like $$E = mc^2$$ within a sentence of text.

Or use it at the end: Some description $$a^2 + b^2 = c^2$$.

And at the beginning: $$x = \frac{1}{2}$$ is half.
