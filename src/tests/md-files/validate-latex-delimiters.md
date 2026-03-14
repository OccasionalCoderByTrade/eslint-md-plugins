---
title: LaTeX Delimiters Validation Test
---

## ✅ VALID: Balanced inline math

The equation $x = 2$ is balanced.

And $a + b = c$ also balanced.

## ✅ VALID: Escaped dollar signs

The price is \$100 and costs \$50.

Escaped delimiters are ignored by the rule.

## ❌ INVALID: Unclosed inline math

This is an incomplete expression $x = 2

Missing closing $ (should be flagged).

## ❌ INVALID: Odd number of delimiters

Text with $ single $ delimiter $ that's not balanced.

Should be flagged for imbalance.

## ✅ VALID: Math in code blocks (ignored)

```tex
$ unpaired delimiter in code is fine
```

Code blocks are handled specially.
