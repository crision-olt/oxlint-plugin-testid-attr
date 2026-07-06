import { validTestIdAttributeRule } from "./rules/valid-testid-attribute.js";

const plugin = {
  meta: {
    name: "oxlint-plugin-testid-attr",
  },
  rules: {
    "valid-testid-attribute": validTestIdAttributeRule,
  },
};

export { validTestIdAttributeRule };
export default plugin;

