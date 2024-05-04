/** @type {import("eslint").Linter.Config} */
const config = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    "project": "./tsconfig.json",
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:eslint-comments/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    'plugin:@next/next/recommended',
    "plugin:react/recommended",
    "plugin:react/jsx-runtime"
  ],
  "rules": {
    "quotes": [
      "error",
      "single",
      {
        "allowTemplateLiterals": true,
        "avoidEscape": true
      }
    ],
    "jsx-quotes": [
      "error",
      "prefer-double"
    ],
    "max-len": [2, 140],
    "object-curly-newline": "off",
    "no-confusing-arrow": "off",
    "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 1 }],
    "operator-linebreak": [
      "error",
      "after", {
        "overrides": {
          "?": "before",
          ":": "before"
        }
      }
    ],
    "keyword-spacing": ["error", { "before": true }],
    "react/display-name": "off",
    "react/jsx-props-no-spreading": "off",
    "react/jsx-closing-tag-location": "error",
    "react/jsx-uses-react": "off",
    "react/jsx-closing-bracket-location": [2, "tag-aligned"],
    "react/jsx-max-props-per-line": [2, { "when": "multiline" }],
    "react/jsx-first-prop-new-line": [2, "multiline"],
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/button-has-type": "off",
    "import/no-cycle": "off",
    "import/no-named-as-default": "off",
    "import/no-named-as-default-member": "off",
    "import/no-extraneous-dependencies": "off",
    "import/prefer-default-export": "off",
    "import/order": ["error", {
      "newlines-between": "always",
      "groups": [
        ["builtin", "external"],
        ["parent", "sibling", "internal", "index"]
      ]
    }],
    "@typescript-eslint/consistent-type-imports": "warn",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unused-vars": ["warn", {
      "varsIgnorePattern": "^_",
      "argsIgnorePattern": "^_",
      "caughtErrorsIgnorePattern": "^_",
      "destructuredArrayIgnorePattern": "^_",
    }],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/member-delimiter-style": "error",
    "eslint-comments/disable-enable-pair": ["error", {"allowWholeFile": true}],
    "indent": ["error", 2, { "SwitchCase": 1 }]
  },
  "settings": {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"]
    },
    "import/resolver": {
      "typescript": {
        "project": "./"
      }
    },
    "react": {
      "createClass": "createReactClass", // Regex for Component Factory to use,
                                         // default to "createReactClass"
      "pragma": "React",  // Pragma to use, default to "React"
      "fragment": "Fragment",  // Fragment to use (may be a property of <pragma>), default to "Fragment"
      "version": "detect", // React version. "detect" automatically picks the version you have installed.
                           // You can also use `16.0`, `16.3`, etc, if you want to override the detected value.
                           // It will default to "latest" and warn if missing, and to "detect" in the future
      "flowVersion": "0.53" // Flow version
    },
  }
};

module.exports = config;
