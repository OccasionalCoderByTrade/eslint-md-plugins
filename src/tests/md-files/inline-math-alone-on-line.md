---
title: Inline Math Alone on Line Test
---

## ✅ VALID: Inline math in text

The value $x = 2$ is important for this equation.

This is correct - the math is not alone on the line.

## ❌ INVALID: Inline math alone on line

$x = 2$
<!-- expect-flagged: cannoli/inline-math-alone-on-line -->

This appears alone on its own line and should be flagged.

## ✅ VALID: Display math (proper format)

$$
x = \frac{1}{2}
$$

Display math uses double-dollar delimiters which is different from inline math.
