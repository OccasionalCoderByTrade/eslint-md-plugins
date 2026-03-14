---
title: Display Math Formatting Test
---

## ✅ VALID: Properly formatted display math

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

This is the quadratic formula with proper formatting.

## ❌ INVALID: Display math on same line

$$E = mc^2$$

This should be flagged - \$\$ delimiters should be on their own lines.

## ✅ VALID: Inline math (not display)

The equation $x = 2$ appears inline in text.

This is different from display math.
