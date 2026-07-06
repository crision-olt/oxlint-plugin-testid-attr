import test from "node:test";
import assert from "node:assert/strict";

import {
  createReplaceWithValidTestIdFix,
  isInvalidTestIdAttribute,
} from "../src/rules/valid-testid-attribute.js";

test("accepts only exact data-testid spelling", () => {
  assert.equal(isInvalidTestIdAttribute("data-testid"), false);
});

test("rejects common data-testid misspellings", () => {
  assert.equal(isInvalidTestIdAttribute("data-testId"), true);
  assert.equal(isInvalidTestIdAttribute("data-test-id"), true);
  assert.equal(isInvalidTestIdAttribute("dataTestId"), true);
  assert.equal(isInvalidTestIdAttribute("data-TestId"), true);
  assert.equal(isInvalidTestIdAttribute("datatestid"), true);
});

test("ignores unrelated attribute names", () => {
  assert.equal(isInvalidTestIdAttribute("id"), false);
  assert.equal(isInvalidTestIdAttribute("data-test"), false);
  assert.equal(isInvalidTestIdAttribute("data-testid-extra"), false);
  assert.equal(isInvalidTestIdAttribute("x-data-testid"), false);
});

test("creates autofix that rewrites attribute name to data-testid", () => {
  const fix = createReplaceWithValidTestIdFix({
    name: { type: "JSXIdentifier", name: "data-testId", range: [5, 16] },
  });

  assert.equal(typeof fix, "function");

  const replaceCalls = [];
  const mockFixer = {
    replaceText(node, text) {
      replaceCalls.push({ node, text });
      return { range: node.range, text };
    },
  };

  const result = fix(mockFixer);

  assert.deepEqual(replaceCalls, [
    {
      node: { type: "JSXIdentifier", name: "data-testId", range: [5, 16] },
      text: "data-testid",
    },
  ]);
  assert.deepEqual(result, { range: [5, 16], text: "data-testid" });
});
