module.exports = {
  extends: [
    "classdojo/node",
    "plugin:react/recommended",
    "plugin:security/recommended",
    "plugin:eslint-comments/recommended",
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    "import/extensions": [".js", ".ts"],
    "import/parsers": {
      "typescript-eslint-parser": [".ts"],
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".json", ".ts"],
      },
      "eslint-import-resolver-typescript": true,
    },
    "react": {
      "version": "15.1",
    },
  },
  plugins: ["react", "security", "eslint-comments"],
  globals: {
    "describe": false,
    "it": false,
    "xdescribe": false,
    "xit": false,
    "before": false,
    "after": false,
    "beforeEach": false,
    "afterEach": false,
    "expect": false
  },
  rules: {
    "no-unused-vars": [2],
    "prefer-arrow-callback": 1,
    "max-len": 0,
    indent: 0,
    "security/detect-object-injection": 0,
    "security/detect-non-literal-fs-filename": 0,
    "security/detect-non-literal-regexp": 0,
    "no-multi-spaces": 0,
    eqeqeq: ["error", "always", { null: "ignore" }],
    complexity: ["warn", 10],
    "import/no-unresolved": [2, { commonjs: true }],
    "space-before-function-paren": [0, { anonymous: "always", named: "always", asyncArrow: "never" }],
  },
};
