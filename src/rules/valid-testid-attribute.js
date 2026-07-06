const VALID_TEST_ID_ATTRIBUTE = "data-testid";
const NORMALIZED_TEST_ID_ATTRIBUTE = "datatestid";
const SEPARATOR_CHARACTERS = new Set(["-", "_", ":"]);
const ATTRIBUTE_CANDIDATE_PATTERN = /\b([A-Za-z_][\w:-]*test[\w:-]*id)\b(?=\s*=)/gi;
const MARKUP_TAG_PATTERN = /<[A-Za-z][^<>]*>/gs;

function isNormalizedTestId(attributeName) {
  let normalizedIndex = 0;

  for (const char of attributeName) {
    if (SEPARATOR_CHARACTERS.has(char)) {
      continue;
    }

    if (normalizedIndex >= NORMALIZED_TEST_ID_ATTRIBUTE.length) {
      return false;
    }

    if (char.toLowerCase() !== NORMALIZED_TEST_ID_ATTRIBUTE[normalizedIndex]) {
      return false;
    }

    normalizedIndex += 1;
  }

  return normalizedIndex === NORMALIZED_TEST_ID_ATTRIBUTE.length;
}

export function isInvalidTestIdAttribute(attributeName) {
  if (typeof attributeName !== "string" || attributeName.length === 0) {
    return false;
  }

  return isNormalizedTestId(attributeName) && attributeName !== VALID_TEST_ID_ATTRIBUTE;
}

function getJsxAttributeName(node) {
  const jsxName = node?.name;
  if (!jsxName) {
    return null;
  }

  if (jsxName.type === "JSXIdentifier") {
    return jsxName.name;
  }

  if (jsxName.type === "JSXNamespacedName") {
    return `${jsxName.namespace.name}:${jsxName.name.name}`;
  }

  return typeof jsxName.name === "string" ? jsxName.name : null;
}

function createMessage(attributeName) {
  return `Invalid test id attribute '${attributeName}'. Use '${VALID_TEST_ID_ATTRIBUTE}'.`;
}

export function createReplaceWithValidTestIdFix(attributeNode) {
  const attributeNameNode = attributeNode?.name;
  if (!attributeNameNode) {
    return null;
  }

  return (fixer) => fixer.replaceText(attributeNameNode, VALID_TEST_ID_ATTRIBUTE);
}

function getRangeKey(range) {
  return Array.isArray(range) && range.length === 2 ? `${range[0]}:${range[1]}` : null;
}

function reportWithOptionalFix(context, nodeOrLoc, attributeName, range, reportedRanges) {
  const rangeKey = getRangeKey(range);
  if (rangeKey && reportedRanges.has(rangeKey)) {
    return;
  }

  const diagnostic = {
    node: nodeOrLoc,
    message: createMessage(attributeName),
  };

  if (Array.isArray(range) && range.length === 2) {
    diagnostic.fix = (fixer) => fixer.replaceTextRange(range, VALID_TEST_ID_ATTRIBUTE);
  }

  if (rangeKey) {
    reportedRanges.add(rangeKey);
  }

  context.report(diagnostic);
}

export function findInvalidTestIdAttributesInMarkup(sourceText) {
  if (typeof sourceText !== "string" || sourceText.length === 0) {
    return [];
  }

  const invalidAttributes = [];

  for (const tagMatch of sourceText.matchAll(MARKUP_TAG_PATTERN)) {
    const tagText = tagMatch[0];
    const tagStartIndex = tagMatch.index ?? 0;

    for (const candidateMatch of tagText.matchAll(ATTRIBUTE_CANDIDATE_PATTERN)) {
      const attributeName = candidateMatch[1];
      if (!isInvalidTestIdAttribute(attributeName)) {
        continue;
      }

      const relativeStart = candidateMatch.index ?? 0;
      const start = tagStartIndex + relativeStart;
      const end = start + attributeName.length;

      invalidAttributes.push({
        name: attributeName,
        range: [start, end],
      });
    }
  }

  return invalidAttributes;
}

export const validTestIdAttributeRule = {
  meta: {
    fixable: "code",
    docs: {
      description:
        "Enforce the exact data-testid attribute spelling across Oxlint-supported markup styles.",
    },
  },
  create(context) {
    const reportedRanges = new Set();

    return {
      JSXAttribute(node) {
        const attributeName = getJsxAttributeName(node);
        if (!isInvalidTestIdAttribute(attributeName)) {
          return;
        }

        const attributeNameNode = node?.name;
        const range = attributeNameNode?.range ?? node?.range;
        const rangeKey = getRangeKey(range);
        if (rangeKey) {
          reportedRanges.add(rangeKey);
        }

        context.report({
          node,
          message: createMessage(attributeName),
          fix: createReplaceWithValidTestIdFix(node),
        });
      },

      Program(node) {
        const sourceText = context.sourceCode?.text ?? context.getSourceCode().text;
        for (const invalidAttribute of findInvalidTestIdAttributesInMarkup(sourceText)) {
          reportWithOptionalFix(
            context,
            node,
            invalidAttribute.name,
            invalidAttribute.range,
            reportedRanges,
          );
        }
      },
    };
  },
};
