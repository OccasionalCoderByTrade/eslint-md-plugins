---
title: No Escape LaTeX Delimiters
description: Examples of valid and invalid escaped LaTeX delimiters (\[ and \]) usage
---

## Valid Cases

Escaped delimiters as part of inline content:

Some text with \[nested delimiters\] in the middle.

Multiple \[ delimiters \] on the same \[ line \] are fine.

LaTeX: \[x = \frac{1}{2}\]

## Invalid Cases

\[
<!-- expect-flagged: cannoli/no-escape-latex-delimiters -->

\]

Content before delimiter:
\[
<!-- expect-flagged: cannoli/no-escape-latex-delimiters -->

\]
After the delimiter

## Code Block Cases (should be ignored)

```markdown
\[
\]
```

~~~text
\[
\]
~~~
