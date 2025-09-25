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
    "max-len": ["error", { "code": 120 }], // Tillåt lite längre rader
    "object-curly-spacing": ["error", "always"],
    "indent": ["error", 2],
  },
  // Denna regel talar om att BARA ignorera node_modules
  ignorePatterns: ["node_modules/"],
};