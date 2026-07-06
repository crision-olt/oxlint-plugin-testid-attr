# oxlint-plugin-testid-attr

Oxlint JS plugin that enforces only the exact `data-testid` attribute spelling.

The plugin reports misspellings such as:

- `data-testId`
- `data-test-id`
- `dataTestId`
- `data-TestId`

It also supports **autofix** and rewrites these to `data-testid` when you run Oxlint with `--fix`.

## Install

```bash
npm install oxlint-plugin-testid-attr
```

## Usage

Configure Oxlint with `jsPlugins` and enable the rule:

```json
{
  "jsPlugins": [
    {
      "name": "testid-attr",
      "path": "oxlint-plugin-testid-attr"
    }
  ],
  "rules": {
    "testid-attr/valid-testid-attribute": "error"
  }
}
```

## Rule

- `testid-attr/valid-testid-attribute`
