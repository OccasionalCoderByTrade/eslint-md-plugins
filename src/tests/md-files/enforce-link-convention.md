---
title: Link Convention Test
---

## ✅ VALID: Lowercase links with proper format

[guide](./guides/my-guide.md)

[documentation](./docs/api-reference.md)

## ✅ VALID: Links with hyphens and underscores

[my_document](./my_document.md)

[kebab-case](./kebab-case-file.md)

## ✅ VALID: External links

[Google](https://google.com)

[GitHub](https://github.com)

## VALID: Link matches suggested slug (Suggested slug has a greater subset of allowed characters/substrings)

[2025-11-17](all-announcements/csci-316-2025-11-17-asn-5-solutions+quickcheck) - Asn 5--Solutions+QUICKCHECK [(original)](all-announcements/csci-316-2025-11-17-asn-5-solutions+quickcheck.txt)

## ❌ INVALID: Uppercase in path

[Guide](./My-Guide.md)          <!-- expect-flagged: cannoli/enforce-link-convention -->

Capital M should be flagged.

## ❌ INVALID: CamelCase

[Document](./MyDocument.md)			<!-- expect-flagged: cannoli/enforce-link-convention -->

Multiple capitals (should be flagged).

## ❌ INVALID: Spaces in path

[guide](./my guide.md)			<!-- expect-flagged: cannoli/enforce-link-convention -->

Spaces are not allowed (should be flagged).

## ❌ INVALID: Special characters

[file](./my-doc@2.0.md)			<!-- expect-flagged: cannoli/enforce-link-convention -->

@ symbol not allowed in local file links (should be flagged).
