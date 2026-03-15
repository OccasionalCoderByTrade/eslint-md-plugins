---
title: Link Convention Test
---

## ✅ VALID: Lowercase links with proper format

[guide](./guides/my-guide.md)

[documentation](./docs/api-reference.md)

## ✅ VALID: Links with hyphens and underscores

[my_document](./my_document.md)

[kebab-case](./kebab-case-file.md)

## ✅ VALID: External links are not checked

[Google](https://google.com)

[GitHub](https://github.com)

## ✅ VALID: Link's href has violating characters, but it is allowed to pass because it matches suggested slug

[2025-11-17](all-announcements/csci-316-2025-11-17-asn-5-solutions+quickcheck) - Asn 5--Solutions+QUICKCHECK [(original)](all-announcements/csci-316-2025-11-17-asn-5-solutions+quickcheck.txt)

## ✅ VALID: Link with underscores

[my_document](./my_document.md)

## ✅ VALID: Link with hyphens

[kebab-case](./kebab-case-file.md)

## ✅ VALID: Link with numbers

[version 2.0](./version-2.0.md)

## ✅ VALID: Link with mixed lowercase and numbers

[release v1.2](./release-v1.2.md)

## ✅ VALID: Link with multiple hyphens and underscores

[complex-link_name-123](./complex-link_name-123.md)

## ✅ VALID: Violating rule with eslint-disable-next-line comment

<!-- eslint-disable-next-line cannoli/enforce-link-convention -->
[README](./README.md)

## ✅ VALID: Page link with no violating characters

[Page Link](./some-dir/page-link)

## ❌ INVALID: Page link with violating characters

[Page Link](./someDir/SomeLink)          <!-- expect-flagged: cannoli/enforce-link-convention -->

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


