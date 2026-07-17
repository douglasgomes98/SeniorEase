/**
 * Preset ESLint compartilhado.
 * Regras alinhadas a Clean Code e seguranca de frontend (OWASP A03 - XSS):
 * - proibido dangerouslySetInnerHTML (react/no-danger)
 * - proibido eval e afins
 */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  env: { es2021: true, browser: true, node: true },
  plugins: ["@typescript-eslint", "react"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
  ],
  settings: { react: { version: "detect" } },
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/no-danger": "error",
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-restricted-properties": [
      "error",
      {
        object: "document",
        property: "write",
        message: "document.write e proibido por seguranca (OWASP A03).",
      },
    ],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      },
    ],
  },
  ignorePatterns: ["dist/", "build/", ".next/", ".expo/", "node_modules/"],
};
