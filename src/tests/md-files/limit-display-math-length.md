---
title: Limit Display Math Length
description: Examples of display math block with per-line length limits for mobile view
---

## Valid Cases

Multi-line display math with all lines under 60 characters:

$$
x = y
$$

$$
a + b \\
& + c + d
$$

Short single-line display math:

$$
x = y + z + a + b + c + d + e + f + g + h + i
$$

## Invalid Cases

Multi-line display math with one line exceeding 60 characters:

$$
x = short
<!-- expect-flagged[1]: cannoli/limit-display-math-length -->
a + b + c + d + e + f + g + h + i + j + k + l + m + n + o + p + q
y = z
$$

Another math block with multiple long lines:

$$
<!-- expect-flagged[1]: cannoli/limit-display-math-length -->
very long expression that is definitely more than sixty characters long for sure
<!-- expect-flagged[1]: cannoli/limit-display-math-length -->
another very long line that also exceeds the maximum character limit
$$

Properly formatted long math block using line continuations:

$$
a + b + c + d + e + f + g \\
<!-- expect-flagged[1]: cannoli/limit-display-math-length -->
& + h + i + j + k + l + m + n + o + p + q + r + s + t + u + v + w
$$

## Code Block Cases (should be ignored)

```markdown
$$
very long expression that is definitely more than sixty characters long for sure
another very long line that also exceeds the maximum character limit
$$
```

~~~text
$$
a + b + c + d + e + f + g + h + i + j + k + l + m + n + o + p + q
$$
~~~
