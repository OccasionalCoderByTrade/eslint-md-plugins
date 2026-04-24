---
title: "Example Title"
---

## Overview

This rule validates that frontmatter fields are present and match configured patterns.
Keys use `__` to denote nesting, values are glob strings (minimatch) or RegExp objects.

## Example configuration

```js
"cannoli/enforce-frontmatter-schema": ["error", {
  title: "{csci,math}*",
  "course__code": /^[A-Z]{4}-\d{3}$/i
}]
```

## VALID: Frontmatter satisfying the above schema

```yaml
---
title: csci-316-notes
course:
  code: CSCI-316
---
```

```yaml
---
title: math-analysis
course:
  code: MATH-201
---
```

## INVALID: Title does not match `{csci,math}*`

```yaml
---
title: biology-notes
course:
  code: BIOL-101
---
```

## INVALID: Missing required nested field `course.code`

```yaml
---
title: csci-101
course:
  name: Intro to CS
---
```

## INVALID: Missing field entirely

```yaml
---
title: csci-101
---
```

## INVALID: Regex pattern mismatch for `course.code`

```yaml
---
title: csci-101
course:
  code: cs101
---
```
