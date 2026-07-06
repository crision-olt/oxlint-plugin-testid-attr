const VALID_TEST_ID_ATTRIBUTE = "data-testid";
const NORMALIZED_TEST_ID_ATTRIBUTE = "datatestid";
const SEPARATOR_CHARACTERS = new Set(["-", "_", ":"]);

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

export const validTestIdAttributeRule = {
  meta: {
    fixable: "code",
    docs: {
      description:
        "Enforce the exact data-testid attribute spelling in HTML/JSX markup.",
    },
  },
  create(context) {
    return {
      JSXAttribute(node) {
        const attributeName = getJsxAttributeName(node);
        if (!isInvalidTestIdAttribute(attributeName)) {
          return;
        }

        const diagnostic = {
          node,
          message: createMessage(attributeName),
        };

        const fix = createReplaceWithValidTestIdFix(node);
        if (fix) {
          diagnostic.fix = fix;
        }

        context.report(diagnostic);
      },
    };
  },
};
