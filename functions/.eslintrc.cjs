module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  parserOptions: {
    ecmaVersion: 2021,
  },
  rules: {
    "quotes": ["error", "double"],
    "max-len": ["error", { "code": 120 }],
    "object-curly-spacing": ["error", "always"],
    "indent": ["error", 2],
  },
  // This rule ensures ESLint only ignores the node_modules folder
  ignorePatterns: ["node_modules/"],
};