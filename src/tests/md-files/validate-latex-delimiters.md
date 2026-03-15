---
title: LaTeX Delimiters Validation Test
---

## VALID: Balanced inline math

The equation $x = 2$ is properly balanced.

## VALID: Multiple balanced expressions

First equation $a + b = c$ is fine.

And second one $x = y$ is also balanced.

## VALID: Escaped dollar signs should not be counted as math delimiters, as these are intended to represent literal dollar signs in text rather than math delimiters.

The price of this item normally \$100 but has a \$50 discount.

I should be able to represent two literal dollar signs in a row like this: \$\$100 (which should not be considered math delimiters).

## INVALID: Unclosed inline math

This line has an unclosed $x = 2 delimiter.

## VALID: Balanced display math

$$
2 + 2 = 4
$$

## VALID: Math in code blocks

```text
$ unpaired $ delimiters in code are fine
```
